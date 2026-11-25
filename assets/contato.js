/* Botões de contato da loja (LINE / WhatsApp). Só aparecem se estiverem em assets/config.js. */
(function () {
  var L = window.LOJA || {};
  var wa = String(L.whatsapp || "").replace(/\D/g, "");
  var line = /^https?:\/\//.test(L.line || "") ? L.line : "";
  if (!wa && !line) return;
  document.querySelectorAll("[data-contato]").forEach(function (box) {
    box.classList.add("contact");
    if (line) {
      var a = document.createElement("a");
      a.className = "btn btn-line"; a.href = line; a.target = "_blank"; a.rel = "noopener";
      a.textContent = "LINE"; box.appendChild(a);
    }
    if (wa) {
      var b = document.createElement("a");
      b.className = "btn btn-wa"; b.href = "https://wa.me/" + wa; b.target = "_blank"; b.rel = "noopener";
      b.textContent = "WhatsApp"; box.appendChild(b);
    }
    box.hidden = false;
  });
})();
