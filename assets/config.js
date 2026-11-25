/*
 * ============================================================
 *  CONFIGURAÇÃO DA LOJA
 * ============================================================
 *  Modelos, serviços e preços NÃO ficam aqui: ficam em
 *  assets/catalogo.json e são editados pelo painel admin.html.
 */
window.LOJA = {
  nome: "Anova MM Tech",
  // Texto mostrado na página de confirmação e no guia de envio.
  prazoResposta: "24時間以内 (em até 24 horas)",
  // Deixe vazio ("") enquanto não quiser publicar o endereço.
  // O endereço também pode ir só no e-mail de resposta.
  enderecoEnvio: "",
  garantia: "", // Ex.: "修理後90日間 (90 dias após o reparo)"
};

/*
 * Serviço que recebe os pedidos.
 *  - "formsubmit": usa o e-mail que está no action do formulário (padrão).
 *  - "web3forms":  crie uma chave grátis em https://web3forms.com
 *                  e cole em web3formsChave. (Plano grátis não envia fotos.)
 */
window.ENVIO = {
  servico: "web3forms",
  web3formsChave: "d254e50d-7509-4363-a0a7-d174db5bb23a", // chave pública (feita para ficar no site)
  emailLoja: "anovammtech@gmail.com", // usado no botão "enviar por e-mail" se o serviço falhar
};
