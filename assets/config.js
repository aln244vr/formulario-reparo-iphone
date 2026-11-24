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
