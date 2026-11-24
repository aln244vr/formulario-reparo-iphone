/*
 * ============================================================
 *  CONFIGURAÇÃO DA LOJA — edite só este arquivo
 * ============================================================
 *  - Preços em ienes (número, sem vírgula). Ex.: 12800
 *  - null = "sob orçamento" (要見積り). O cliente não vê valor.
 *  - Para adicionar um serviço novo, inclua uma linha em SERVICOS
 *    e uma coluna correspondente em PRECOS.
 */
window.LOJA = {
  nome: "Yūsō Shūri",
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
  servico: "formsubmit",
  web3formsChave: "",
  emailLoja: "aln244vr@gmail.com", // usado no botão "enviar por e-mail" se o serviço falhar
};

// Serviços: id interno -> nome exibido
window.SERVICOS = [
  { id: "tela",     jp: "画面交換",           pt: "Troca de Tela (Display)" },
  { id: "bateria",  jp: "バッテリー交換",     pt: "Troca de Bateria" },
  { id: "traseira", jp: "背面ガラス交換",     pt: "Troca de Vidro Traseiro" },
  { id: "camera",   jp: "背面カメラ修理",     pt: "Reparo da Câmera Traseira" },
  { id: "faceid",   jp: "Face ID修理",        pt: "Reparo do Face ID" },
  { id: "conector", jp: "充電口修理",         pt: "Conector de Carga" },
  { id: "agua",     jp: "水没復旧",           pt: "Dano por Água" },
  { id: "outro",    jp: "診断・その他",       pt: "Diagnóstico / Outro" },
];

/*
 * Tabela de preços por modelo.
 * Ordem das colunas = ordem de SERVICOS acima.
 * Enquanto tudo estiver null, a tabela de preços fica escondida
 * e o formulário mostra "お見積り後にご連絡 (orçamento por e-mail)".
 *
 * Exemplo preenchido:
 *   "iPhone 12 Pro Max": { tela: 19800, bateria: 8800, camera: 14800 },
 */
window.PRECOS = {
  // "iPhone 12 Pro Max": { tela: null, bateria: null, camera: null },
};

/* ============================================================
 *  CONSOLES E CONTROLES (consoles.html)
 *  tipo: "console" ou "controle" — o formulário mostra só os
 *  serviços que combinam com o aparelho escolhido.
 * ============================================================ */
window.CONSOLE_SERVICOS = [
  { id: "hdmi",      tipo: "console",  jp: "HDMI端子修理",           pt: "Porta HDMI" },
  { id: "limpeza",   tipo: "console",  jp: "内部清掃・グリス交換",   pt: "Limpeza interna e pasta térmica" },
  { id: "disco",     tipo: "console",  jp: "ディスクドライブ修理",   pt: "Leitor de disco" },
  { id: "energia",   tipo: "console",  jp: "電源修理",               pt: "Fonte / não liga" },
  { id: "armazen",   tipo: "console",  jp: "HDD・SSD交換",           pt: "Troca de HD / SSD" },
  { id: "drift",     tipo: "controle", jp: "スティック修理",         pt: "Analógico (drift)" },
  { id: "botoes",    tipo: "controle", jp: "ボタン修理",             pt: "Botões" },
  { id: "gatilhos",  tipo: "controle", jp: "トリガー修理",           pt: "Gatilhos (L2/R2 · LT/RT)" },
  { id: "bateriac",  tipo: "controle", jp: "バッテリー交換",         pt: "Bateria do controle" },
  { id: "conectorc", tipo: "controle", jp: "充電端子修理",           pt: "Conector de carga" },
  { id: "outro",                       jp: "診断・その他",           pt: "Diagnóstico / Outro" },
];

// Mesmo formato de PRECOS. O nome do modelo precisa ser igual ao da lista em consoles.html.
// Ex.: "PS5 (CFI-1000〜1200) ディスク · com disco": { hdmi: 9800, limpeza: 6800 },
//      "DualSense (PS5)": { drift: 3800 },
window.CONSOLE_PRECOS = {
};
