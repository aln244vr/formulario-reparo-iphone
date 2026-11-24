/*
 * Formulário único: iPhone, console e controle.
 * Preços e serviços ficam em assets/config.js.
 */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const lang = () => root.dataset.lang || "ja";
  const t = (ja, pt) => (lang() === "pt" ? pt : ja);

  // ---------- Catálogo (assets/catalogo.json, editado pelo admin.html) ----------
  let TIPOS = {};
  const OUTRO = "__outro__";
  let tipo = null;

  // ---------- Idioma ----------
  function applyLang() {
    document.querySelectorAll("[data-set-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang())));
    document.querySelectorAll("[data-ph-ja]").forEach((el) => (el.placeholder = t(el.dataset.phJa, el.dataset.phPt)));
    if (tipo) { const keep = model.value; fillModels(); model.value = keep; renderServices(checked()); }
  }
  document.querySelectorAll("[data-set-lang]").forEach((b) => b.addEventListener("click", () => {
    root.dataset.lang = root.lang = b.dataset.setLang;
    try { localStorage.setItem("yuso-shuri-lang", b.dataset.setLang); } catch (_) {}
    applyLang();
  }));

  // ---------- Tipo ----------
  const model = $("model");
  document.querySelectorAll("[data-tipo]").forEach((b) => b.addEventListener("click", () => selectTipo(b.dataset.tipo)));

  function selectTipo(id) {
    if (!TIPOS[id]) return;
    tipo = id;
    document.querySelectorAll("[data-tipo]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tipo === id)));
    $("tipo-msg").classList.add("hidden");
    $("detalhes").classList.remove("hidden");
    fillModels();
    renderServices([]);
    onModelChange();
    saveDraft();
  }

  function fillModels() {
    model.innerHTML = "";
    const ph = new Option(t("選択してください", "Selecione"), "");
    ph.disabled = true; ph.selected = true;
    model.add(ph);
    (TIPOS[tipo].modelos || []).forEach(({ grupo: g, itens }) => {
      const og = document.createElement("optgroup"); og.label = g;
      itens.forEach((m) => og.appendChild(new Option(m, m)));
      model.appendChild(og);
    });
    model.add(new Option(t("その他・わからない", "Outro / não sei"), OUTRO));
  }

  function onModelChange() {
    const other = model.value === OUTRO;
    $("other-model-wrap").classList.toggle("hidden", !other);
    $("other-model").required = other;
    updateEstimate();
  }
  model.addEventListener("change", () => { model.style.borderColor = ""; onModelChange(); saveDraft(); });

  // ---------- Serviços ----------
  const servicos = () => (tipo ? TIPOS[tipo].servicos || [] : []);
  const checked = () => [...$("services").querySelectorAll("input:checked")].map((c) => c.value);

  function chip(s, selected) {
    const l = document.createElement("label");
    const c = document.createElement("input");
    c.type = "checkbox"; c.value = s.id; c.checked = (selected || []).includes(s.id);
    l.append(c, document.createTextNode(t(s.jp, s.pt)));
    return l;
  }
  function renderServices(selected) {
    const box = $("services");
    box.innerHTML = "";
    const list = servicos();
    list.filter((s) => s.grupo !== "custom").forEach((s) => box.appendChild(chip(s, selected)));

    // Personalização: escondida atrás de um botão
    const custom = list.filter((s) => s.grupo === "custom");
    if (!custom.length) return;
    const open = custom.some((s) => (selected || []).includes(s.id));
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "custom-toggle";
    const panel = document.createElement("div");
    panel.className = "chips custom-panel" + (open ? "" : " hidden");
    custom.forEach((s) => panel.appendChild(chip(s, selected)));
    const label = () => {
      const n = panel.querySelectorAll("input:checked").length;
      btn.textContent = "🎨 " + t("カスタマイズ", "Personalização") + (n ? ` (${n})` : "") + (panel.classList.contains("hidden") ? " ▾" : " ▴");
    };
    btn.addEventListener("click", () => { panel.classList.toggle("hidden"); label(); });
    panel.addEventListener("change", label);
    label();
    box.append(btn, panel);
  }
  $("services").addEventListener("change", () => { $("services-msg").classList.add("hidden"); updateEstimate(); saveDraft(); });

  // ---------- Estimativa (só aparece se houver preço em config.js) ----------
  const yen = (n) => "¥" + n.toLocaleString("ja-JP");
  function updateEstimate() {
    const box = $("estimate"), sel = checked();
    const table = ((tipo && TIPOS[tipo].precos) || {})[model.value] || {};
    let total = 0, unknown = false;
    sel.forEach((id) => { const v = table[id]; if (typeof v === "number") total += v; else unknown = true; });
    if (!sel.length || !total) { box.classList.add("hidden"); return; }
    $("estimate-value").textContent = yen(total) + (unknown ? " 〜" : "");
    box.classList.remove("hidden");
  }
  const estimateText = () => ($("estimate").classList.contains("hidden") ? "Sob orçamento" : $("estimate-value").textContent);

  // ---------- Números ----------
  const toHalf = (s) => s.replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xFEE0));
  document.querySelectorAll("[data-digits]").forEach((el) => el.addEventListener("input", () => {
    el.value = toHalf(el.value).replace(/\D/g, "");
  }));

  // ---------- Sugestão de e-mail ----------
  const DOMAINS = ["gmail.com", "yahoo.co.jp", "icloud.com", "docomo.ne.jp", "au.com", "ezweb.ne.jp", "softbank.ne.jp", "i.softbank.jp", "outlook.com", "hotmail.com", "ymobile.ne.jp"];
  $("email").addEventListener("input", (e) => {
    const v = e.target.value, at = v.indexOf("@"), out = $("email-suggest");
    out.innerHTML = "";
    if (at < 1) return;
    const typed = v.slice(at + 1).toLowerCase();
    DOMAINS.filter((d) => d.startsWith(typed) && d !== typed).slice(0, 3).forEach((d) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn btn-gray";
      b.style.cssText = "padding:4px 10px;margin:4px 6px 0 0;font-size:.8rem;font-weight:600";
      b.textContent = "@" + d;
      b.onclick = () => { e.target.value = v.slice(0, at + 1) + d; out.innerHTML = ""; saveDraft(); };
      out.appendChild(b);
    });
  });

  // ---------- CEP -> endereço ----------
  // 1º zipcloud (JSONP); se falhar, jp-postal-code-api (GitHub Pages, com CORS)
  const zip = $("zip"), zipMsg = $("zip-msg");
  let searching = "";
  const zipDigits = () => toHalf(zip.value).replace(/\D/g, "").slice(0, 7);
  function onZip(force) {
    const d = zipDigits();
    zip.value = d.length > 3 ? d.slice(0, 3) + "-" + d.slice(3) : d;
    if (d.length === 7 && (force || d !== searching)) lookupZip(d);
  }
  zip.addEventListener("input", () => onZip(false));
  zip.addEventListener("change", () => onZip(false)); // preenchimento automático do Safari
  zip.addEventListener("blur", () => onZip(false));
  $("zip-btn").addEventListener("click", () => {
    if (zipDigits().length !== 7) return setZipMsg(t("郵便番号は7桁です", "O CEP tem 7 números"), true);
    onZip(true);
  });
  function setZipMsg(text, err) { zipMsg.textContent = text; zipMsg.className = "msg " + (err ? "err" : "ok"); }

  function zipcloud(d) {
    return new Promise((resolve, reject) => {
      const cb = "zipcb_" + Date.now(), s = document.createElement("script");
      const timer = setTimeout(() => done(reject, new Error("timeout")), 5000);
      function done(fn, v) { clearTimeout(timer); delete window[cb]; s.remove(); fn(v); }
      window[cb] = (res) => {
        const r = res && res.results && res.results[0];
        r ? done(resolve, { pref: r.address1, city: r.address2 + r.address3 }) : done(reject, new Error("notfound"));
      };
      s.onerror = () => done(reject, new Error("network"));
      s.src = "https://zipcloud.ibsnet.co.jp/api/search?zipcode=" + d + "&callback=" + cb;
      document.body.appendChild(s);
    });
  }
  async function postalApi(d) {
    const res = await fetch("https://jp-postal-code-api.ttskch.com/api/v1/" + d + ".json");
    if (!res.ok) throw new Error("notfound");
    const a = ((await res.json()).addresses || [])[0];
    if (!a || !a.ja) throw new Error("notfound");
    return { pref: a.ja.prefecture, city: (a.ja.address1 || "") + (a.ja.address2 || "") };
  }

  async function lookupZip(d) {
    searching = d;
    setZipMsg(t("検索中…", "Buscando…"), false);
    let r = null;
    try { r = await zipcloud(d); } catch (_) {
      try { r = await postalApi(d); } catch (_) {}
    }
    if (searching !== d) return; // o cliente já digitou outro CEP
    if (!r) { searching = ""; return setZipMsg(t("見つかりませんでした。住所を入力してください", "Não achamos o CEP. Digite o endereço"), true); }
    $("pref").value = r.pref;
    $("city").value = r.city;
    ["pref", "city"].forEach((id) => ($(id).style.borderColor = ""));
    setZipMsg(t("✓ 番地を入力してください", "✓ Agora coloque o número"), false);
    $("street").focus();
    saveDraft();
  }

  // ---------- Rascunho (só neste aparelho) ----------
  const DRAFT_KEY = "yuso-shuri-rascunho";
  const textIds = ["name", "phone", "email", "zip", "pref", "city", "street", "building", "problem", "other-model"];
  function saveDraft() {
    try {
      const d = { tipo, model: model.value, services: checked() };
      textIds.forEach((id) => (d[id] = $(id).value));
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch (_) {}
  }
  function loadDraft() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch (_) {}
    // Link direto: index.html?tipo=console (o antigo consoles.html usa isso)
    const fromUrl = new URLSearchParams(location.search).get("tipo");
    if (fromUrl && TIPOS[fromUrl] && (!d || d.tipo !== fromUrl)) d = Object.assign({}, d, { tipo: fromUrl, model: "", services: [] });
    if (!d) return;
    textIds.forEach((id) => { if (d[id]) $(id).value = d[id]; });
    if (d.tipo && TIPOS[d.tipo]) {
      selectTipo(d.tipo);
      if (d.model) model.value = d.model;
      renderServices(d.services);
      onModelChange();
    }
  }
  $("repairForm").addEventListener("input", (e) => {
    if (e.target.style) e.target.style.borderColor = ""; // tira o vermelho quando o cliente corrige
    if (e.target.id === "street" && /[0-9０-９一二三四五六七八九十]/.test(e.target.value)) $("street-msg").classList.add("hidden");
    saveDraft();
  });

  // ---------- Validação ----------
  const form = $("repairForm"), submitBtn = $("submit-btn");
  function validate() {
    let first = null;
    const bad = (el) => { if (!first) first = el; };
    if (!tipo) { $("tipo-msg").classList.remove("hidden"); bad($("tipo")); return first; }
    [model, $("other-model"), $("name"), $("phone"), $("email"), $("zip"), $("pref"), $("city"), $("street")].forEach((el) => {
      el.style.borderColor = "";
      if (el.required && (!el.value.trim() || !el.checkValidity())) { el.style.borderColor = "var(--err)"; bad(el); }
    });
    const p = $("phone").value;
    if (p && (p.length < 10 || p.length > 11)) { $("phone").style.borderColor = "var(--err)"; bad($("phone")); }
    if (zipDigits().length !== 7) { $("zip").style.borderColor = "var(--err)"; bad($("zip")); }
    const street = $("street").value;
    const noNumber = street.trim() && !/[0-9０-９一二三四五六七八九十]/.test(street);
    $("street-msg").classList.toggle("hidden", !noNumber);
    if (noNumber) { $("street").style.borderColor = "var(--err)"; bad($("street")); }
    if (!checked().length) { $("services-msg").classList.remove("hidden"); bad($("services")); }
    return first;
  }

  // ---------- Envio ----------
  const ENVIO = window.ENVIO || {};
  const svcName = (id) => { const s = servicos().find((x) => x.id === id); return s ? `${s.pt} (${s.jp})` : id; };

  function payload() {
    const modelo = model.value === OUTRO ? $("other-model").value.trim() + " (digitado)" : model.value;
    return {
      "Tipo": TIPOS[tipo].nome,
      "Modelo": modelo,
      "Servicos": checked().map(svcName).join(", "),
      "Estimativa": estimateText(),
      "Problema": $("problem").value.trim() || "-",
      "Nome": $("name").value.trim(),
      "Telefone": $("phone").value,
      "email": $("email").value.trim(),
      "Endereco": `〒${$("zip").value} ${$("pref").value.trim()}${$("city").value.trim()}${$("street").value.trim()} ${$("building").value.trim()}`.trim(),
      "Idioma do cliente": lang() === "pt" ? "Português" : "日本語",
    };
  }

  // Código com o pedido inteiro, para colar no sistema Pedidos & caixa (caixa "Colar pedido do cliente")
  function localDate() {
    const n = new Date(), p = (x) => String(x).padStart(2, "0");
    return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
  }
  function caixaCode(data) {
    const est = parseInt(String(data.Estimativa).replace(/[^\d]/g, ""), 10);
    const j = {
      v: 1, d: localDate(), t: tipo, m: data.Modelo,
      s: checked().map((id) => { const s = servicos().find((x) => x.id === id); return s ? s.pt : id; }),
      e: est > 0 ? est : null, p: data.Problema === "-" ? "" : data.Problema,
      n: data.Nome, tel: data.Telefone, mail: data.email, end: data.Endereco, l: lang(),
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(j)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return "ANOVA1:" + b64 + ".";
  }

  function request(data) {
    const subject = `${TIPOS[tipo].assunto}: ${data.Modelo} — ${data.Nome}`;
    const honey = form.elements._honey.value;
    if (ENVIO.servico === "web3forms" && ENVIO.web3formsChave) {
      return { url: "https://api.web3forms.com/submit", body: JSON.stringify(Object.assign({
        access_key: ENVIO.web3formsChave, subject, from_name: "Yūsō Shūri", botcheck: honey }, data)) };
    }
    return { url: "https://formsubmit.co/ajax/" + ENVIO.emailLoja, body: JSON.stringify(Object.assign({
      _subject: subject, _template: "table", _captcha: "false", _honey: honey }, data)) };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const first = validate();
    if (first) {
      $("form-msg").textContent = t("赤い項目を確認してください", "Confira os campos em vermelho");
      $("form-msg").classList.remove("hidden");
      first.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    $("form-msg").classList.add("hidden");
    $("fallback").classList.add("hidden");
    const label = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = t("送信中…", "Enviando…");

    const data = payload();
    data["Codigo para o caixa"] = caixaCode(data);
    const { url, body } = request(data);
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(url, { method: "POST", body, signal: ctrl.signal,
        headers: { "Content-Type": "application/json", Accept: "application/json" } });
      let out = {};
      try { out = await res.json(); } catch (_) {}
      if (!res.ok || !(out.success === true || out.success === "true")) throw new Error(out.message || "HTTP " + res.status);
      try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
      location.href = "confirmacao.html";
    } catch (err) {
      const why = err.name === "AbortError" ? t("時間切れ", "o serviço demorou demais")
        : err instanceof TypeError ? t("接続エラー", "sem conexão") : err.message;
      $("form-msg").textContent = t("送信できませんでした", "Não foi possível enviar") + " (" + why + ")";
      $("form-msg").classList.remove("hidden");
      showFallback(data);
      submitBtn.disabled = false;
      submitBtn.innerHTML = label;
    } finally {
      clearTimeout(timer);
    }
  });

  // Se o serviço falhar, o cliente manda o pedido pelo próprio e-mail
  function showFallback(data) {
    if (!ENVIO.emailLoja) return;
    const text = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
    $("fallback-link").href = "mailto:" + ENVIO.emailLoja +
      "?subject=" + encodeURIComponent(`${TIPOS[tipo].assunto}: ${data.Modelo}`) + "&body=" + encodeURIComponent(text);
    $("fallback").classList.remove("hidden");
  }

  // Carrega o catálogo e só então libera o formulário
  fetch("assets/catalogo.json", { cache: "no-cache" })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((cat) => { TIPOS = cat.tipos || {}; applyLang(); loadDraft(); })
    .catch(() => {
      $("tipo-msg").textContent = t("読み込みに失敗しました。ページを再読み込みしてください", "Erro ao carregar. Atualize a página.");
      $("tipo-msg").classList.remove("hidden");
    });
  applyLang();
})();
