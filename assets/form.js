/*
 * Lógica compartilhada dos formulários (iPhone e consoles).
 * Cada página define window.FORM antes de carregar este arquivo:
 *   FORM.models    { "Grupo": ["Modelo", ...] }       (ou { tipo, itens })
 *   FORM.services  [{ id, jp, pt, tipo? }]             tipo filtra pelo grupo
 *   FORM.symptoms  ["texto", ...]
 *   FORM.prices    { "Modelo": { idServico: 12345 } }
 *   FORM.draftKey  chave do rascunho no aparelho
 */
(function () {
  "use strict";
  const F = window.FORM || {};
  const $ = (id) => document.getElementById(id);

  // ---------- Modelos ----------
  const OUTRO = "その他・わからない · Outro / Não sei";
  const groups = {};
  Object.entries(F.models || {}).forEach(([g, v]) => {
    groups[g] = Array.isArray(v) ? { tipo: null, itens: v } : v;
  });
  groups[OUTRO] = { tipo: null, itens: [OUTRO] };

  const series = $("series-select"), model = $("model-select");
  Object.keys(groups).forEach((s) => series.add(new Option(s, s)));

  function fillModels() {
    const list = (groups[series.value] || {}).itens || [];
    model.innerHTML = "";
    model.add(new Option("選択してください · Selecione", ""));
    model.options[0].disabled = true;
    list.forEach((m) => model.add(new Option(m, m)));
    model.disabled = !list.length;
    model.value = list.length === 1 ? list[0] : "";
    filterServices();
    onModelChange();
  }
  function onModelChange() {
    const other = model.value === OUTRO;
    $("other-model-wrap").classList.toggle("hidden", !other);
    $("other-model").required = other;
    updateEstimate();
  }
  series.addEventListener("change", fillModels);
  model.addEventListener("change", onModelChange);

  // ---------- Serviços e sintomas (chips) ----------
  const SERVICOS = F.services || [];
  const PRECOS = F.prices || {};

  function chips(containerId, items, valueOf, labelOf, tipoOf) {
    const box = $(containerId);
    items.forEach((it) => {
      const l = document.createElement("label");
      const c = document.createElement("input");
      c.type = "checkbox"; c.value = valueOf(it);
      if (tipoOf && tipoOf(it)) l.dataset.tipo = tipoOf(it);
      l.append(c, document.createTextNode(labelOf(it)));
      box.appendChild(l);
    });
    box.addEventListener("change", () => { syncHidden(); updateEstimate(); saveDraft(); });
  }
  chips("services", SERVICOS, (s) => s.id, (s) => s.jp + " · " + s.pt, (s) => s.tipo);
  chips("symptoms", F.symptoms || [], (s) => s, (s) => s);

  // Mostra só os serviços do tipo do grupo escolhido (ex.: console x controle)
  function filterServices() {
    const tipo = (groups[series.value] || {}).tipo;
    $("services").querySelectorAll("label").forEach((l) => {
      const show = !tipo || !l.dataset.tipo || l.dataset.tipo === tipo;
      l.classList.toggle("hidden", !show);
      if (!show) l.querySelector("input").checked = false;
    });
    syncHidden();
  }

  const checked = (id) => [...$(id).querySelectorAll("input:checked")].map((c) => c.value);
  const serviceName = (id) => { const s = SERVICOS.find((x) => x.id === id); return s ? s.pt + " (" + s.jp + ")" : id; };

  function syncHidden() {
    $("h-servicos").value = checked("services").map(serviceName).join(", ");
    $("h-sintomas").value = checked("symptoms").join(", ");
    if (checked("services").length) $("services-msg").classList.add("hidden");
  }

  // ---------- Estimativa ----------
  const yen = (n) => "¥" + n.toLocaleString("ja-JP");
  const hasPrices = Object.values(PRECOS).some((m) => Object.values(m).some((v) => typeof v === "number"));
  if (hasPrices && $("nav-precos")) $("nav-precos").classList.remove("hidden");

  function updateEstimate() {
    const sel = checked("services");
    const box = $("estimate");
    if (!sel.length || !model.value) { box.classList.add("hidden"); $("h-estimativa").value = ""; return; }
    const table = PRECOS[model.value] || {};
    let total = 0, unknown = false;
    sel.forEach((id) => { const v = table[id]; if (typeof v === "number") total += v; else unknown = true; });
    let text;
    if (!hasPrices || total === 0) text = "お見積り後にご連絡 · Orçamento por e-mail";
    else if (unknown) text = yen(total) + " 〜 (+要見積り · + orçamento)";
    else text = yen(total);
    $("estimate-value").textContent = text;
    $("estimate-value").classList.toggle("as-text", !hasPrices || total === 0);
    $("estimate-note").classList.toggle("hidden", !hasPrices || total === 0);
    $("h-estimativa").value = text;
    box.classList.remove("hidden");
  }

  // ---------- Campos só com números ----------
  function toHalfWidth(s) { return s.replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xFEE0)); }
  document.querySelectorAll("[data-digits]").forEach((el) => el.addEventListener("input", () => {
    el.value = toHalfWidth(el.value).replace(/\D/g, "");
  }));

  // ---------- Sugestão de e-mail ----------
  const DOMAINS = ["gmail.com", "yahoo.co.jp", "docomo.ne.jp", "au.com", "ezweb.ne.jp", "softbank.ne.jp", "i.softbank.jp", "icloud.com", "outlook.com", "hotmail.com", "ymobile.ne.jp", "rakuten.jp"];
  $("email").addEventListener("input", (e) => {
    const v = e.target.value, at = v.indexOf("@"), out = $("email-suggest");
    out.innerHTML = "";
    if (at < 1) return;
    const typed = v.slice(at + 1).toLowerCase();
    DOMAINS.filter((d) => d.startsWith(typed) && d !== typed).slice(0, 4).forEach((d) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn btn-gray"; b.style.cssText = "padding:4px 10px;margin:4px 6px 0 0;font-size:.8rem;font-weight:600";
      b.textContent = "@" + d;
      b.onclick = () => { e.target.value = v.slice(0, at + 1) + d; out.innerHTML = ""; saveDraft(); };
      out.appendChild(b);
    });
  });

  // ---------- CEP -> endereço (zipcloud, JSONP) ----------
  const zip = $("zip"), zipMsg = $("zip-msg");
  let lastZip = "";
  zip.addEventListener("input", () => {
    const d = toHalfWidth(zip.value).replace(/\D/g, "").slice(0, 7);
    zip.value = d.length > 3 ? d.slice(0, 3) + "-" + d.slice(3) : d;
    if (d.length === 7 && d !== lastZip) lookupZip(d);
  });
  $("zip-btn").addEventListener("click", () => {
    const d = zip.value.replace(/\D/g, "");
    if (d.length !== 7) return setZipMsg("7桁で入力してください · Digite 7 números", true);
    lookupZip(d);
  });
  function setZipMsg(t, err) { zipMsg.textContent = t; zipMsg.className = "msg " + (err ? "err" : "ok"); }
  function lookupZip(d) {
    lastZip = d;
    setZipMsg("検索中… · Buscando…", false);
    const cb = "zipcb_" + Date.now();
    const s = document.createElement("script");
    const fail = () => { cleanup(); setZipMsg("検索できませんでした。手入力してください · Não deu para buscar, digite o endereço", true); };
    const timer = setTimeout(fail, 6000);
    function cleanup() { clearTimeout(timer); delete window[cb]; s.remove(); }
    window[cb] = (res) => {
      cleanup();
      const r = res && res.results && res.results[0];
      if (!r) return setZipMsg("見つかりませんでした · CEP não encontrado", true);
      $("address").value = r.address1 + r.address2 + r.address3;
      setZipMsg("✓ 住所を入力しました · Endereço preenchido", false);
      $("address2").focus();
      saveDraft();
    };
    s.src = "https://zipcloud.ibsnet.co.jp/api/search?zipcode=" + d + "&callback=" + cb;
    s.onerror = fail;
    document.body.appendChild(s);
  }

  // ---------- Fotos ----------
  const MAX_FILES = 3, MAX_MB = 5;
  $("photos").addEventListener("change", (e) => {
    const files = [...e.target.files], msg = $("photos-msg");
    if (files.length > MAX_FILES) {
      e.target.value = "";
      msg.textContent = `最大${MAX_FILES}枚まで · No máximo ${MAX_FILES} fotos`; msg.className = "msg err"; return;
    }
    if (files.some((f) => f.size > MAX_MB * 1024 * 1024)) {
      e.target.value = "";
      msg.textContent = `1枚${MAX_MB}MBまで · Cada foto até ${MAX_MB} MB`; msg.className = "msg err"; return;
    }
    msg.textContent = files.length ? `✓ ${files.length}枚選択 · ${files.length} foto(s)` : ""; msg.className = "msg ok";
  });

  // ---------- Rascunho (salvo só neste aparelho) ----------
  const form = $("repairForm");
  const DRAFT_KEY = F.draftKey || "yuso-shuri-rascunho";
  const draftFields = [...form.querySelectorAll("input[type=text], input[type=tel], input[type=email], textarea")]
    .filter((el) => el.id && el.name !== "_honey").map((el) => el.id);
  function saveDraft() {
    try {
      const d = {};
      draftFields.forEach((id) => (d[id] = $(id).value));
      d.series = series.value; d.model = model.value;
      d.services = checked("services"); d.symptoms = checked("symptoms");
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch (_) {}
  }
  function loadDraft() {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (!d) return;
      draftFields.forEach((id) => { if (d[id]) $(id).value = d[id]; });
      if (d.series && groups[d.series]) { series.value = d.series; fillModels(); if (d.model) model.value = d.model; }
      [["services", d.services], ["symptoms", d.symptoms]].forEach(([box, vals]) =>
        (vals || []).forEach((v) => { const c = $(box).querySelector(`input[value="${CSS.escape(v)}"]`); if (c) c.checked = true; }));
      if (d.zip) lastZip = d.zip.replace(/\D/g, "");
      filterServices(); onModelChange(); syncHidden();
    } catch (_) {}
  }
  form.addEventListener("input", saveDraft);
  form.addEventListener("change", saveDraft);
  loadDraft();

  // ---------- Envio ----------
  const next = new URL("confirmacao.html", location.href);
  if (F.draftKey) next.searchParams.set("r", F.draftKey);
  $("next-url").value = next.href;

  const submitBtn = $("submit-btn"), submitText = submitBtn.textContent;
  form.addEventListener("submit", (e) => {
    syncHidden();
    let ok = true, first = null;
    const flag = (el) => { ok = false; if (!first) first = el; };

    form.querySelectorAll("[required]").forEach((el) => {
      el.style.borderColor = "";
      if (el.type === "checkbox") return;
      if (!el.value.trim() || !el.checkValidity()) { el.style.borderColor = "var(--err)"; flag(el); }
    });
    const phone = $("phone").value;
    if (phone && (phone.length < 10 || phone.length > 11)) { $("phone").style.borderColor = "var(--err)"; flag($("phone")); }
    if (!checked("services").length) { $("services-msg").classList.remove("hidden"); flag($("services")); }
    const agreed = $("agree").checked;
    $("agree-msg").classList.toggle("hidden", agreed);
    if (!agreed) flag($("agree"));

    if (!ok) {
      e.preventDefault();
      $("form-msg").textContent = "赤い項目を確認してください · Confira os campos destacados";
      $("form-msg").classList.remove("hidden");
      first.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    $("form-msg").classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = "送信中… · Enviando…";
  });

  // Reativa o botão se o cliente voltar pelo "voltar" do navegador
  window.addEventListener("pageshow", () => { submitBtn.disabled = false; submitBtn.textContent = submitText; });
})();
