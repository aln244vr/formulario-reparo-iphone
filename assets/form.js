/*
 * Formulário de pedido em telas: 1 aparelho → 2 serviço (e opção) → 3 modelo → 4 dados.
 * Modelos, serviços, opções e preços vêm de assets/catalogo.json (editado pelo admin.html).
 */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const lang = () => root.dataset.lang || "ja";
  const t = (ja, pt) => (lang() === "pt" ? pt : ja);
  const yen = (n) => "¥" + n.toLocaleString("ja-JP");

  let TIPOS = {};
  const OUTRO = "__outro__";
  let tipo = null;
  let sel = {};   // serviços escolhidos: { idDoServiço: idDaOpção | true }
  let step = 1;

  // ---------- Telas ----------
  const form = $("repairForm");
  function go(n, noScroll) {
    step = n;
    document.querySelectorAll(".wz").forEach((s) => (s.hidden = +s.dataset.step !== n));
    $("wz-back").hidden = n === 1;
    document.querySelectorAll("#wz-dots i").forEach((d, i) => d.classList.toggle("on", i === n - 1));
    if (n === 4) renderSummary();
    updateEstimate();
    if (!noScroll) form.scrollIntoView({ behavior: "smooth", block: "start" });
    saveDraft();
  }
  $("wz-back").addEventListener("click", () => go(Math.max(1, step - 1)));
  form.addEventListener("click", (e) => {
    const b = e.target.closest("[data-next]");
    if (!b) return;
    const n = +b.dataset.next;
    if (n === 3 && !Object.keys(sel).length) { $("services-msg").classList.remove("hidden"); return; }
    if (n === 4 && !modelText()) { $("model-msg").classList.remove("hidden"); return; }
    go(n);
  });

  // ---------- Idioma ----------
  function applyLang() {
    document.querySelectorAll("[data-set-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang())));
    document.querySelectorAll("[data-ph-ja]").forEach((el) => (el.placeholder = t(el.dataset.phJa, el.dataset.phPt)));
    if (tipo) { renderServices(); renderModels(); if (step === 4) renderSummary(); updateEstimate(); }
  }
  document.querySelectorAll("[data-set-lang]").forEach((b) => b.addEventListener("click", () => {
    root.dataset.lang = root.lang = b.dataset.setLang;
    try { localStorage.setItem("yuso-shuri-lang", b.dataset.setLang); } catch (_) {}
    applyLang();
  }));

  // ---------- 1. Aparelho ----------
  document.querySelectorAll("[data-tipo]").forEach((b) => b.addEventListener("click", () => { selectTipo(b.dataset.tipo); go(2); }));
  function selectTipo(id) {
    if (!TIPOS[id]) return;
    if (tipo !== id) { sel = {}; $("model").value = ""; }
    tipo = id;
    document.querySelectorAll("[data-tipo]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tipo === id)));
    $("tipo-msg").classList.add("hidden");
    renderServices();
    renderModels();
  }

  // ---------- 2. Serviços e opções ----------
  const servicos = () => (tipo ? TIPOS[tipo].servicos || [] : []);
  const svcById = (id) => servicos().find((x) => x.id === id);
  const optOf = (s) => (s && Array.isArray(s.opcoes) && s.opcoes.length ? (s.opcoes.find((o) => o.id === sel[s.id]) || s.opcoes[0]) : null);
  const priceTxt = (v) => (typeof v === "number" ? yen(v) : "");

  function card(s) {
    const l = document.createElement("label");
    const c = document.createElement("input");
    c.type = "checkbox"; c.value = s.id; c.checked = !!sel[s.id];
    c.addEventListener("change", () => {
      if (c.checked) sel[s.id] = s.opcoes && s.opcoes.length ? s.opcoes[0].id : true; else delete sel[s.id];
      $("services-msg").classList.add("hidden");
      renderServices(); updateEstimate(); saveDraft();
    });
    const hasOpts = Array.isArray(s.opcoes) && s.opcoes.length;
    // preço por modelo (tabela precos) também conta: mostra "a partir de" o menor
    const porModelo = Object.values(TIPOS[tipo].precos || {}).map((v) => v && v[s.id]).filter((v) => typeof v === "number");
    const varia = hasOpts || porModelo.length > 0;
    const cands = (hasOpts ? s.opcoes.map((o) => o.preco) : [s.preco]).concat(porModelo).filter((v) => typeof v === "number");
    const precoMin = cands.length ? Math.min(...cands) : undefined;
    const precoTxt = typeof precoMin === "number" ? (varia && (cands.length > 1 || porModelo.length) ? t(yen(precoMin) + "〜", "a partir de " + yen(precoMin)) : yen(precoMin)) : (s.grupo === "custom" ? "" : t("お見積り", "sob orçamento"));
    const desc = [t(s.djp, s.dpt), precoTxt].filter(Boolean).join(" · ");
    if (desc) {
      l.className = "svc-card";
      const txt = document.createElement("span");
      const b = document.createElement("b"); b.textContent = t(s.jp, s.pt);
      const d = document.createElement("small"); d.textContent = desc;
      txt.append(b, d);
      l.append(c, txt);
    } else {
      l.append(c, document.createTextNode(t(s.jp, s.pt)));
    }
    const frag = [l];
    // Opções aparecem depois de marcar o serviço (ex.: Hall Effect padrão ou TMR)
    if (hasOpts && sel[s.id]) {
      const box = document.createElement("div");
      box.className = "svc-opts";
      s.opcoes.forEach((o) => {
        const ol = document.createElement("label"); ol.className = "opt";
        const r = document.createElement("input"); r.type = "radio"; r.name = "opt-" + s.id; r.checked = (optOf(s) || {}).id === o.id;
        r.addEventListener("change", () => { sel[s.id] = o.id; updateEstimate(); saveDraft(); });
        const sp = document.createElement("span");
        const ob = document.createElement("b"); ob.textContent = t(o.jp, o.pt) + (typeof o.preco === "number" ? " · " + yen(o.preco) : "");
        sp.append(ob);
        const od = t(o.djp, o.dpt); if (od) { const sm = document.createElement("small"); sm.textContent = od; sp.append(sm); }
        ol.append(r, sp); box.append(ol);
      });
      frag.push(box);
    }
    return frag;
  }
  function renderServices() {
    const box = $("services");
    box.innerHTML = "";
    const list = servicos();
    list.filter((s) => s.grupo !== "custom").forEach((s) => box.append(...card(s)));
    // Personalização: escondida atrás de um botão
    const custom = list.filter((s) => s.grupo === "custom");
    if (!custom.length) return;
    const open = custom.some((s) => sel[s.id]) || box.dataset.customOpen === "1";
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "custom-toggle";
    const panel = document.createElement("div");
    panel.className = "chips custom-panel" + (open ? "" : " hidden");
    custom.forEach((s) => panel.append(...card(s)));
    const label = () => {
      const n = custom.filter((s) => sel[s.id]).length;
      btn.textContent = "🎨 " + t("カスタマイズ", "Personalização") + (n ? ` (${n})` : "") + (panel.classList.contains("hidden") ? " ▾" : " ▴");
    };
    btn.addEventListener("click", () => { panel.classList.toggle("hidden"); box.dataset.customOpen = panel.classList.contains("hidden") ? "" : "1"; label(); });
    label();
    box.append(btn, panel);
  }

  // ---------- 3. Modelo (botões) ----------
  const model = $("model");
  const modelText = () => (model.value === OUTRO ? $("other-model").value.trim() : model.value);
  function renderModels() {
    const box = $("models");
    box.innerHTML = "";
    const grupos = (TIPOS[tipo] && TIPOS[tipo].modelos) || [];
    const mk = (g, parent) => {
      const w = document.createElement("div"); w.className = "mgrp";
      const h = document.createElement("h3"); h.textContent = g.grupo;
      const grid = document.createElement("div"); grid.className = "mgrid";
      (g.itens || []).forEach((m) => grid.append(modelBtn(m, m)));
      w.append(h, grid); parent.append(w);
    };
    // séries mais novas à vista; as antigas recolhidas
    grupos.slice(0, 4).forEach((g) => mk(g, box));
    if (grupos.length > 4) {
      const d = document.createElement("details"); d.className = "mgrp-more";
      const sm = document.createElement("summary"); sm.textContent = t("その他のモデル", "Outros modelos") + " (" + grupos.slice(4).reduce((a, g) => a + (g.itens || []).length, 0) + ")";
      d.append(sm);
      grupos.slice(4).forEach((g) => mk(g, d));
      if (grupos.slice(4).some((g) => (g.itens || []).includes(model.value))) d.open = true;
      box.append(d);
    }
    const other = modelBtn(OUTRO, t("その他・わからない", "Outro / não sei"));
    other.style.width = "100%";
    box.append(other);
    $("other-model-wrap").classList.toggle("hidden", model.value !== OUTRO);
  }
  function modelBtn(value, text) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = text;
    b.setAttribute("aria-pressed", String(model.value === value));
    b.addEventListener("click", () => {
      model.value = value;
      $("model-msg").classList.add("hidden");
      document.querySelectorAll("#models button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $("other-model-wrap").classList.toggle("hidden", value !== OUTRO);
      saveDraft();
      if (value === OUTRO) $("other-model").focus(); else go(4);
    });
    return b;
  }

  // ---------- Estimativa ----------
  function lineItems() {
    return Object.keys(sel).map((id) => {
      const s = svcById(id); if (!s) return null;
      const o = optOf(s);
      const table = ((TIPOS[tipo].precos || {})[model.value]) || {};
      let v = o ? o.preco : table[id];
      if (typeof v !== "number") v = typeof s.preco === "number" ? s.preco : undefined;
      return { s, o, v };
    }).filter(Boolean);
  }
  function updateEstimate() {
    const box = $("estimate"), L = tipo ? lineItems() : [];
    let total = 0, unknown = false;
    L.forEach((l) => { if (typeof l.v === "number") total += l.v; else unknown = true; });
    if (step < 2 || !L.length || !total) { box.classList.add("hidden"); return; }
    $("estimate-value").textContent = yen(total) + (unknown ? " 〜" : "");
    box.classList.remove("hidden");
  }
  const estimateText = () => ($("estimate").classList.contains("hidden") ? "Sob orçamento" : $("estimate-value").textContent);

  // ---------- 4. Resumo ----------
  function renderSummary() {
    const box = $("wz-sum"); box.innerHTML = "";
    const line = (label, value, back) => {
      const p = document.createElement("div");
      const b = document.createElement("b"); b.textContent = label + ": ";
      p.append(b, document.createTextNode(value));
      if (back) { const x = document.createElement("button"); x.type = "button"; x.textContent = t("変更", "alterar"); x.style.marginLeft = "8px"; x.onclick = () => go(back); p.append(x); }
      box.append(p);
    };
    line(t("修理内容", "Serviço"), lineItems().map((l) => t(l.s.jp, l.s.pt) + (l.o ? " (" + t(l.o.jp, l.o.pt) + ")" : "")).join(" + "), 2);
    line(t("機種", "Modelo"), modelText(), 3);
  }

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

  // ---------- 番地: precisa ter o número do endereço (ex.: 4-33), não só o do apartamento ----------
  function hasBanchi(v) {
    const z = toHalf(String(v || "")).replace(/[－‐ー−―]/g, "-").trim();
    if (!z) return false;
    if (/\d+\s*-\s*\d+/.test(z)) return true;                       // 4-33, 1-2-3
    if (/\d+\s*(番地|番|丁目)/.test(z)) return true;                   // 123番地, 4丁目
    if (/\d+\s*号(?!室)/.test(z)) return true;                        // 33号 (não 103号室)
    if (/[一二三四五六七八九十]+\s*(丁目|番)/.test(z)) return true;        // 四丁目
    if (/^\d+(\s|$)/.test(z)) return true;                           // 123 ou "123 ビル名"
    return false;                                                      // ex.: só "クリスタルオアシス103"
  }
  // o preenchimento automático do Safari pode repetir o bairro (ex.: cidade "西尾市田貫" e rua "田貫4-33…")
  function cleanStreet() {
    const st = $("street"), city = $("city").value.trim(), pref = $("pref").value.trim();
    let v = st.value.replace(/\s+/g, " ").trim();
    if (pref && v.startsWith(pref)) v = v.slice(pref.length).trim();
    if (city && v.startsWith(city)) v = v.slice(city.length).trim();
    for (let n = Math.min(city.length, v.length); n >= 2; n--) {
      if (city.endsWith(v.slice(0, n))) { v = v.slice(n).trim(); break; }
    }
    if (v !== st.value) st.value = v;
  }
  $("street").addEventListener("change", cleanStreet);
  $("street").addEventListener("blur", cleanStreet);

  // ---------- Rascunho (só neste aparelho) ----------
  const DRAFT_KEY = "yuso-shuri-rascunho";
  const textIds = ["name", "phone", "email", "zip", "pref", "city", "street", "problem", "other-model"];
  function saveDraft() {
    try {
      const d = { tipo, model: model.value, sel, step };
      textIds.forEach((id) => (d[id] = $(id).value));
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch (_) {}
  }
  function loadDraft() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch (_) {}
    // Link direto: index.html?tipo=console (o antigo consoles.html usa isso)
    const fromUrl = new URLSearchParams(location.search).get("tipo");
    if (fromUrl && TIPOS[fromUrl] && (!d || d.tipo !== fromUrl)) d = Object.assign({}, d, { tipo: fromUrl, model: "", sel: {}, step: 2 });
    if (!d) return go(1, true);
    textIds.forEach((id) => { if (d[id]) $(id).value = d[id]; });
    if (d.tipo && TIPOS[d.tipo]) {
      selectTipo(d.tipo);
      sel = d.sel && typeof d.sel === "object" ? d.sel : {};
      Object.keys(sel).forEach((id) => { if (!svcById(id)) delete sel[id]; });
      model.value = d.model || "";
      renderServices(); renderModels();
      let n = Math.min(Math.max(+d.step || 2, 2), 4);
      if (n >= 3 && !Object.keys(sel).length) n = 2;
      if (n === 4 && !modelText()) n = 3;
      go(n, true);
    } else go(1, true);
  }
  form.addEventListener("input", (e) => {
    if (e.target.style) e.target.style.borderColor = ""; // tira o vermelho quando o cliente corrige
    if (e.target.id === "street" && hasBanchi(e.target.value)) $("street-msg").classList.add("hidden");
    saveDraft();
  });

  // ---------- Validação ----------
  const submitBtn = $("submit-btn");
  function validate() {
    if (!tipo) { go(1); return $("tipo"); }
    if (!Object.keys(sel).length) { go(2); $("services-msg").classList.remove("hidden"); return $("services"); }
    if (!modelText()) { go(3); $("model-msg").classList.remove("hidden"); return $("models"); }
    let first = null;
    const bad = (el) => { if (!first) first = el; };
    [$("name"), $("phone"), $("email"), $("zip"), $("pref"), $("city"), $("street")].forEach((el) => {
      el.style.borderColor = "";
      if (el.required && (!el.value.trim() || !el.checkValidity())) { el.style.borderColor = "var(--err)"; bad(el); }
    });
    const p = $("phone").value;
    if (p && (p.length < 10 || p.length > 11)) { $("phone").style.borderColor = "var(--err)"; bad($("phone")); }
    if (zipDigits().length !== 7) { $("zip").style.borderColor = "var(--err)"; bad($("zip")); }
    cleanStreet();
    const street = $("street").value;
    const noNumber = street.trim() && !hasBanchi(street);
    $("street-msg").classList.toggle("hidden", !noNumber);
    if (noNumber) { $("street").style.borderColor = "var(--err)"; bad($("street")); }
    return first;
  }

  // ---------- Envio ----------
  const ENVIO = window.ENVIO || {};
  function payload() {
    const modelo = model.value === OUTRO ? $("other-model").value.trim() + " (digitado)" : model.value;
    return {
      "Tipo": TIPOS[tipo].nome,
      "Modelo": modelo,
      "Servicos": lineItems().map((l) => `${l.s.pt}${l.o ? " — " + l.o.pt : ""} (${l.s.jp}${l.o ? " " + l.o.jp : ""})`).join(", "),
      "Estimativa": estimateText(),
      "Problema": $("problem").value.trim() || "-",
      "Nome": $("name").value.trim(),
      "Telefone": $("phone").value,
      "email": $("email").value.trim(),
      "Endereco": `〒${$("zip").value} ${$("pref").value.trim()}${$("city").value.trim()}${$("street").value.trim()}`.trim(),
      "Idioma do cliente": lang() === "pt" ? "Português" : "日本語",
    };
  }

  // Código com o pedido inteiro, para colar no sistema Pedidos & caixa
  function localDate() {
    const n = new Date(), p = (x) => String(x).padStart(2, "0");
    return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
  }
  function caixaCode(data) {
    const est = parseInt(String(data.Estimativa).replace(/[^\d]/g, ""), 10);
    const j = {
      v: 1, d: localDate(), t: tipo, m: data.Modelo,
      // com opção, vai o nome do serviço do caixa (ex.: "Analógicos TMR K-Silver")
      s: lineItems().map((l) => (l.o ? l.o.caixa || `${l.s.pt} · ${l.o.pt}` : l.s.pt)),
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
        access_key: ENVIO.web3formsChave, subject, from_name: "Anova MM Tech", botcheck: honey }, data)) };
    }
    return { url: "https://formsubmit.co/ajax/" + ENVIO.emailLoja, body: JSON.stringify(Object.assign({
      _subject: subject, _template: "table", _captcha: "false", _honey: honey }, data)) };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const first = validate();
    if (first) {
      if (step === 4) {
        $("form-msg").textContent = t("赤い項目を確認してください", "Confira os campos em vermelho");
        $("form-msg").classList.remove("hidden");
        first.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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
  document.querySelectorAll("#tipo button").forEach((b) => { b.disabled = true; });
  $("tipo-msg").textContent = t("読み込み中…", "Carregando…"); $("tipo-msg").classList.remove("hidden", "err");
  fetch("assets/catalogo.json", { cache: "no-cache" })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((cat) => {
      TIPOS = cat.tipos || {};
      document.querySelectorAll("#tipo button").forEach((b) => { b.disabled = false; });
      $("tipo-msg").classList.add("hidden", "err");
      $("tipo-msg").innerHTML = '<span lang="ja">選んでください</span><span lang="pt">Escolha uma opção</span>';
      applyLang(); loadDraft();
    })
    .catch(() => {
      $("tipo-msg").textContent = t("読み込みに失敗しました。ページを再読み込みしてください", "Erro ao carregar. Atualize a página.");
      $("tipo-msg").classList.remove("hidden");
    });
  applyLang();
})();
