# Prompt Mestre de Execução — Ecossistema Anova MM Tech

> Cole este texto inteiro para o Claude quando quiser começar. Ele roda uma fase por vez. No fim de cada fase, ele para, mostra o resultado e espera o seu "pode seguir".

---

## 0. Papel e contexto

Você é o arquiteto de produto (UX/UI) e o engenheiro full-stack da **Anova MM Tech**: assistência técnica de iPhone, consoles e controles em Nishio-shi, Aichi, Japão. A loja atende por correio e em mãos, cobra em **iene (¥, sem centavos)** e tem clientes brasileiros e japoneses. O dono usa tudo **pelo iPhone, com uma mão**.

O ecossistema tem 4 partes:

| # | Parte | Onde está | Quem usa |
|---|---|---|---|
| A | **Pedidos & Caixa** (painel interno) | Artifact privado `https://claude.ai/artifact/SFXUE7ASEvkjSzQ78AntJ8` (banco `db`: orders, prices, stock, expenses, compras, lixeira, profile, brasil) | Só o dono |
| B | **Formulário de pedido** | `index.html` + `assets/form.js` + `assets/style.css` (GitHub Pages) | Cliente |
| C | **Painel do catálogo** | `admin.html` → grava `assets/catalogo.json` no `main` via token do GitHub | Dono |
| D | **Como enviar · FAQ** | `guia.html` (+ `confirmacao.html`) | Cliente |

Repositório: `aln244vr/formulario-reparo-iphone`. Branch de trabalho: `claude/oi-3f29mi`. Só abra PR quando o dono pedir ou ao fim de cada fase. A mudança só entra no ar depois do merge.

---

## 1. Decisões já tomadas (não reabrir)

1. **A marca é uma só: "Anova MM Tech".** ✅ Feito no PR #13 (antes o site dizia "Yūsō Shūri"). Troque o nome em todos os títulos, cabeçalhos, rodapés, e-mails e `config.js`. "郵送修理 · Reparo por correio" passa a ser só a descrição do serviço.
2. **Idiomas:**
   - Páginas do cliente: japonês e português, com o mesmo seletor que existe hoje.
   - Painel interno e painel do catálogo: só português.
3. **Moeda:** ¥ com separador de milhar (`¥12,000`). Preço sem valor aparece como "お見積り · Sob orçamento", nunca "¥0".
4. **Datas:** dd/mm/aaaa para o dono; 2026年11月25日 no texto em japonês.
5. **Nada de dado sensível no site público:** sem senha de aparelho e sem token. O endereço de envio só aparece se `LOJA.enderecoEnvio` estiver preenchido.
6. **A fonte única de serviços e preços para o cliente é `assets/catalogo.json`.** O caixa só *envia* para ele (Enviar para o site → painel aplica sozinho → Salvar).

### Decisões a confirmar com o dono antes da Fase 2 (pergunte uma vez, com estes padrões)

- **Canal de contato:**
  - Padrão: botão LINE + WhatsApp no formulário e no guia.
  - O dono informa o ID do LINE e o número do WhatsApp.
- **Garantia padrão:** 90 dias. Aparece no guia e no recibo.
- **Endereço de envio publicado no guia:**
  - Padrão: não publicar. Ele vai só no e-mail de resposta.
- **Serviços duplicados:**
  - O problema: "Analógicos TMR K-Silver · PS5/PS4/Xbox" existem como serviços soltos **e** como a opção TMR de "Analógico (drift)".
  - Padrão: manter só a opção dentro de "Analógico (drift)". O preço varia pelo modelo do controle (tabela `precos` por modelo).

---

## 2. Arquitetura e fluxo ideal

```
          CLIENTE                                      DONO
 ┌──────────────────────┐                 ┌────────────────────────────┐
 │ D  Guia / FAQ        │◄── link ────────│ A  Pedidos & Caixa         │
 │ B  Formulário        │                 │   Pedidos ← cola e-mail    │
 │   (lê catalogo.json) │── e-mail ──────►│   Caixa / Estoque / Preços │
 └─────────▲────────────┘  (ANOVA1)       │   Preços → "Enviar p/ site"│
           │                               └─────────────┬──────────────┘
           │ catalogo.json                               │ admin.html#ANOVACAT1:…
           │                               ┌─────────────▼──────────────┐
           └───────────────────────────────│ C  Painel do catálogo      │
                                           │   aplica → 💾 Salvar (main)│
                                           └────────────────────────────┘
```

O que entra e o que sai de cada parte:

| Parte | Entra | Sai |
|---|---|---|
| B Formulário | `catalogo.json` (tipos, modelos, serviços, opções, preços) | E-mail via Web3Forms com o resumo legível + código `ANOVA1:` (cliente, aparelho, serviços com o nome `caixa`, endereço) → vai para `confirmacao.html` |
| A Pedidos & Caixa | Código `ANOVA1` colado (ou mensagem/print pela IA); recibos de compra (prints/PDF) | Pedido com status, baixa no estoque, despesas, relatório, mensagens para o cliente; código `ANOVACAT1` para o catálogo |
| C Catálogo | `catalogo.json` do GitHub; `#ANOVACAT1:` no endereço | `catalogo.json` salvo no `main` (o site atualiza em 1–2 min) |
| D Guia/FAQ | `catalogo.json` (tabela de preços), `config.js` (garantia, endereço) | Link de volta para o formulário |

**Chave de ligação entre as partes:** o nome `caixa` de cada serviço ou opção no catálogo é **igual** ao nome do item na tabela de Preços do caixa. É essa chave que liga o pedido do site ao serviço, e o serviço às peças (receita) e ao estoque. Nunca renomeie um lado sem renomear o outro. Se precisar, crie um campo `caixa` no catálogo para guardar o nome antigo.

---

## 3. Especificação tela por tela

Regra de ouro: **por padrão aparece só o que se usa todo dia; o resto fica em "Mais ▾", "Editar" ou num bloco recolhido.**

### A. Pedidos & Caixa (painel interno)

**Topo fixo:** marca "ANOVA MM TECH", título "PEDIDOS & CAIXA", botão **+ Novo pedido** e abas **Pedidos · Caixa · Estoque · Preços · Mais**.

**A1. Pedidos**
- **Visível:**
  - 2 cartões grandes: **Faturado** e **Lucro líquido** (verde; vermelho se negativo).
  - Linha discreta: A receber (laranja se > 0) · Peças · Despesas · nº de pedidos e quantos em aberto.
  - **📥 Colar pedido**: fechado; abre ao tocar.
  - Busca e mês na mesma linha.
  - Chips de status com contagem, rolando na horizontal. Os chips sem pedido ficam ocultos, exceto o selecionado.
- **Card do pedido:**
  - Cliente, aparelho · serviço(s) e status (select colorido).
  - Valor cobrado · lucro · "falta ¥X" (só se > 0).
  - Botões: **Marcar como pago** (se falta), **Avisar no WhatsApp/LINE** (se Pronto) e **Editar**.
  - **Mais ▾**: nº AN-AAAA-NNNN, entrada, contato, qualidade, custo/pago/desconto, garantia, observações, 📦 Endereço de devolução, Orçamento, Recibo (領収書), Mensagens prontas e Apagar (dois toques).
- **Status:** Orçamento → Aprovado → Em reparo → Pronto → Entregue | Cancelado.
  - Ao virar Aprovado ou Em reparo: dá baixa nas peças da receita (`partDeducted`).
  - Ao Cancelar: devolve as peças.
  - Ao Entregar: grava `deliveredAt` e a garantia começa a contar.
- **Formulário do pedido:**
  - Visível: cliente, contato, aparelho, modelo, serviço (+ outro serviço), quantidade, valor e status.
  - Recolhido: peças extras, desconto, pagamentos, garantia, nº de série/IMEI e observação.
  - Validações:
    - nome obrigatório;
    - valor ≥ 0;
    - desconto ≤ valor;
    - aviso (sem bloquear) se o estoque da peça for menor que o necessário.

**A2. Caixa**
- **Visível:**
  - **+ Despesa** e o mês.
  - Atalhos de mês ("Este mês", "set/26 (2)", "Todos").
  - Linha "Despesas ¥X · compras de peças ¥Y".
  - Despesas numa linha cada, com a tag "fora do lucro" nas compras de peças e "N itens" recolhido.
- **Resumo do ano:** ano, Exportar CSV, Receita, Custo de peças, Despesas e Lucro líquido. "Ver detalhes do ano" guarda as categorias, o ticket médio e as compras.
  - Nota fixa: "確定申告: confira com um contador ou o 税務署."
- **Recolhidos:** Últimos 6 meses (gráfico), O que mais sai e Exportar.
- Apagar despesa → vai para a **lixeira**, com "Desfazer" por 8 s e "🗑 Apagadas · restaurar".

**A3. Estoque**
- **Visível:** busca, **Nova peça**, 🛒 Lista de compras (fechada, com contador) e lista com uma linha por peça: nome · custo · mín, tag Repor/Acabou, − qtd +.
- **Lotes iguais** ("… (lote antigo)") viram uma linha só com o total. Ao tocar aparecem os lotes e o botão **Juntar lotes numa peça só**.
- **Ao tocar no nome:** fornecedor, "Anúncio e compras" (recolhido), "Avisar quando tiver até", Entrada de compra (cria despesa com itens), Editar e Apagar.
- **Alerta de estoque:** Repor quando qtd ≤ mín; Acabou quando qtd = 0. A Lista de compras sugere a quantidade pelo uso dos últimos 30 dias.

**A4. Preços**
- **Visível:**
  - busca, **Novo item**, **Enviar para o site** e Importar do site;
  - filtro **Com valor** (padrão) · Sem valor · Todos;
  - categorias (iPhone, Controle DualSense, Console, Outros) com linhas "nome ……… ¥valor".
- **Ao tocar:** valor cobrado, gasto (ou soma da receita de peças), margem, observação, descrição do site, combo, Editar e Apagar.
- **Editar:** nome, categoria, valor, gasto, garantia, combo, observação, ✨ IA (descrição em pt, nome e descrição em ja) e peças usadas (receita).
- **Margem** = valor − gasto. Mostre em vermelho se for negativa e em laranja se for menor que 30% do valor.

**A5. Mais**
- **Ferramentas** (cards 2×2): 📸 Ler prints (conversa, recibo, lista), 📈 Preços do mercado, 💬 Assistente e 👤 Sobre mim e mensagens.
- **Páginas para clientes:** Formulário (Copiar/Abrir), Painel do catálogo (Abrir), Como enviar · FAQ (Copiar/Abrir) e **Copiar mensagem com o link para o cliente**.
- **Zona de perigo** (recolhida, no fim): digitar APAGAR + dois toques.

**Leitor de recibos:** quantidade no recibo × peças por unidade = total no estoque. Custo por peça = preço × (total pago ÷ subtotal) × câmbio ÷ peças por unidade. Ao salvar, entra no estoque (custo médio ponderado), cria a despesa com a lista de itens e sugere o serviço.

### B. Formulário de pedido (cliente)

Assistente de 4 telas com pontos de progresso e **Voltar**:
1. **O que vai consertar?** iPhone · Console · Controle (botões grandes com ícone).
2. **Qual serviço?**
   - Cards com nome, descrição curta e preço ("a partir de ¥X" ou "Sob orçamento").
   - Opções aparecem só depois de marcar o serviço (ex.: Hall Effect padrão / TMR K-Silver).
   - Personalização fica atrás de 🎨.
   - Campo "O que aconteceu?" opcional.
3. **Qual modelo?** Botões dos modelos principais, "Outros modelos" recolhido e "Outro / não sei" com campo de texto.
4. **Seus dados:**
   - Resumo do pedido com estimativa no topo.
   - Nome, telefone (só dígitos, 10–11), e-mail (com sugestão de domínio).
   - 〒 com busca automática; província, cidade e bairro; **um** campo "番地・建物名・部屋番号".
   - Validação do 番地: precisa ter número; aceita 4-33, 4丁目33番地 e similares.
   - Botão **Enviar pedido**.
   - Rodapé: "Respondemos em até 24 h" + link do guia.

Estados obrigatórios:
- **carregando:** catálogo com esqueleto;
- **erro de envio:** mensagem + botão "Enviar por e-mail" (mailto com o mesmo conteúdo);
- **rascunho salvo** no aparelho (localStorage) e restaurado ao voltar;
- **sucesso:** `confirmacao.html` com "não envie ainda, espere nosso e-mail".

Integração: o e-mail leva `ANOVA1:` com os nomes `caixa`, para o painel interno reconhecer sem retrabalho.

### C. Painel do catálogo

- **Visível:**
  - "Conectado ao GitHub" (ou o passo a passo da chave, recolhido);
  - 📥 **Receber do caixa**, que aplica sozinho quando vem `#ANOVACAT1:`;
  - abas iPhone · Console · Controle;
  - Serviços: uma linha por serviço com o resumo das opções e preços;
  - Modelos e Preços por modelo, recolhidos.
- **Ao tocar num serviço:** nome pt/ja, descrição pt/ja, grupo (reparo/personalização), preço fixo ou opções (cada uma com pt, ja, preço e nome `caixa`), subir/descer e apagar.
- Barra fixa embaixo: "Sem alterações / N alterações" e **💾 Salvar**.
- Se o GitHub devolver conflito (sha), recarregue e reaplique.
- **Validações:**
  - id único;
  - nome pt obrigatório;
  - preço inteiro ≥ 0 ou vazio;
  - aviso quando um nome `caixa` não existe no caixa (só informativo).

### D. Como enviar · FAQ

- Passo a passo genérico para **iPhone, console e controle**. Hoje o guia fala só de iPhone.
  - Itens a tirar ou não mandar: capinha, chip e carregador; para console, cabos, disco e HD externo; para controle, cabo e grip.
  - Embalagem e rastreio.
- Tabela de preços lida do catálogo, com uma linha por opção. Sem valor → "Sob orçamento".
- FAQ recolhido (perguntas em ja e pt): dados, senha, Buscar iPhone, prazo, preço final, peça não original, garantia, aparelho molhado, **controle: drift volta?**, **console: perco os jogos/saves?**
- Rodapé: botão **Pedir reparo** e contato (LINE/WhatsApp).

---

## 4. Padrão visual e de interação (vale para os 4)

**Identidade**
- Marca "ANOVA MM TECH", em caixa alta e com espaçamento, acima do título.
- Uma cor de destaque: azul `#1456e6`. Os 4 sites usam os mesmos tokens.

**Tokens únicos** (`assets/tokens.css` no site; copiados igual no artifact):
- Cores:
  - `--bg #f2f5fa`, `--surface #fff`, `--fg #0d1424`, `--muted #586278`, `--line #d3dae7`;
  - `--accent #1456e6`, `--ok #1f7a3d`, `--warn #a85a00`, `--teal #0b7a6b`, `--bad #c3202d`
    (valores do painel Pedidos & Caixa, que é a referência);
  - modo escuro com os mesmos nomes.
- Fontes:
  - títulos: `Barlow Condensed 700` em caixa alta;
  - texto: `Barlow` (ou Inter) 400/600;
  - números e valores: `JetBrains Mono` com `tabular-nums`;
  - japonês: o sistema (Hiragino).
- Raio 12 px, borda 1 px `--line`, sombra só em barra fixa e em modal.
- Toque mínimo 44 px; texto mínimo 13 px; gutter 16 px; nada de rolagem horizontal na página (só dentro de chips).

**Hierarquia**
- Cada tela tem 1 ação principal (botão azul cheio).
- Ações secundárias: botão contorno.
- Ações perigosas: contorno vermelho + confirmação.

**Mensagens prontas** (perfil "Sobre mim"):
- Orçamento, aprovado, pronto para retirar/enviar, lembrete de pagamento e pós-venda/garantia.
- Saem em pt e em ja.
- Botões: WhatsApp (`wa.me`), LINE (`line.me/R/msg/text/?`) e Copiar.

**Estados**
- Vazio: 1 frase + 1 botão.
- Carregando: texto curto.
- Erro: o que aconteceu + o que fazer.
- Sucesso: confirmação curta que some.

**Prevenção de erros**
- Apagar pede dois toques; apagar tudo pede digitar APAGAR.
- Lixeira para despesas.
- Rascunho salvo nos formulários.
- Aviso antes de sair com alterações (painel do catálogo).

**Texto**
- Frases curtas, sem jargão.
- Sem textos explicativos longos fixos na tela; ajuda vai em "?" ou no estado vazio.

---

## 5. Plano de execução em fases

Em cada fase:
1. Leia os arquivos.
2. Faça mudanças pequenas e reversíveis.
3. Teste com Playwright em 390 px:
   - sem erro no console;
   - sem rolagem horizontal;
   - fluxos principais.
4. Mostre prints.
5. Publique o artifact ou abra o PR.
6. **Pare e espere o "pode seguir".**

**Fase 1 — Pedidos & Caixa (artifact)** ✅ concluída (v42)
1. Aplicar os tokens únicos (cores, fontes, raio) sem mudar o layout que já foi aprovado.
2. Conferir cada aba contra a seção 3A e corrigir as diferenças.
3. Mensagens prontas com LINE além do WhatsApp (se o dono confirmar o canal).
4. Margem em laranja abaixo de 30% na aba Preços.
5. Testes:
   - 3 pedidos de teste (entregue e pago, com sinal, cancelado);
   - conferir Faturado, Lucro e A receber pelas regras;
   - baixa e devolução de estoque;
   - lixeira;
   - juntar lotes;
   - apagar os testes depois.
6. Não mudar o formato dos dados. Se precisar, escrever migração que converte os registros antigos ao ler.

**Fase 2 — Formulário + Catálogo (PR no repositório)**
1. Marca "Anova MM Tech" em `config.js`, `index.html`, `admin.html`, `confirmacao.html` e README.
2. Criar `assets/tokens.css` e fazer `style.css` usar os tokens (mesma identidade do painel).
3. Formulário: preços "a partir de" / "Sob orçamento", contato LINE/WhatsApp e estado de carregamento.
4. Catálogo: aviso de alterações não salvas, conflito de sha e aviso de nome `caixa` desconhecido.
5. Resolver os serviços duplicados de TMR (só depois da confirmação do dono), sem quebrar pedidos antigos: manter o nome `caixa` das opções.
6. Testes:
   - formulário completo nos 3 tipos, em ja e pt;
   - envio simulado (Web3Forms mockado);
   - código `ANOVA1` lido pelo `parseSiteOrder` do caixa;
   - painel aplicando `#ANOVACAT1` e salvando (GitHub mockado).

**Fase 3 — Guia/FAQ e integração final (PR)**
1. Guia genérico para os 3 tipos, FAQ novo, tabela de preços por opção e contato.
2. `confirmacao.html` com o mesmo visual e o contato.
3. Ida e volta completa: catálogo → formulário → e-mail → caixa → estoque → relatório, e preços do caixa → site.
4. README atualizado com o mapa da seção 2.
5. Criar `CLAUDE.md` na raiz do repositório com a seção 6 abaixo.

---

## 6. Instruções permanentes (CLAUDE.md)

```markdown
# Anova MM Tech — regras de trabalho

## Produto
- 4 partes: Pedidos & Caixa (artifact privado SFXUE7ASEvkjSzQ78AntJ8), formulário (index.html),
  painel do catálogo (admin.html), guia/FAQ (guia.html). Marca: "Anova MM Tech".
- Dono usa só iPhone, uma mão. Mobile-first em 390 px; toque ≥ 44 px; sem rolagem horizontal.
- Moeda ¥ inteira (¥12,000). Páginas do cliente em ja + pt; painéis internos em pt.

## Dados e integração
- Fonte do catálogo do cliente: assets/catalogo.json (só o admin.html grava, no main).
- Nome `caixa` do catálogo = nome do item em Preços do caixa. Nunca renomear um lado só.
- Códigos: ANOVA1 (pedido do site → caixa), ANOVACAT1 (caixa → painel, via #hash).
- Nunca apagar nem mudar formato de dado salvo sem migração. Apagar = lixeira quando possível.
- Sem senha de aparelho, sem token, sem e-mail pessoal do dono em código público.

## Código
- HTML/CSS/JS puro, sem build. Funções pequenas; um bloco por aba/tela.
- Tokens de design únicos (cores, fontes, raio); nada de cor solta no código.
- Textos curtos; detalhes em "Mais ▾"/"Editar"/blocos recolhidos.
- Toda ação perigosa: confirmação (2 toques; apagar tudo: digitar APAGAR).
- Estados vazio/carregando/erro/sucesso em toda lista e todo envio.

## Fluxo de trabalho
- Ler antes de mudar; mudança pequena; testar com Playwright em 390 px
  (sem erro no console, sem overflow, fluxo principal), mostrar print.
- Artifact: editar e republicar o mesmo URL. Site: branch claude/oi-3f29mi → PR → dono faz merge.
- Pedidos de teste: criar, conferir números e apagar.
- Resposta ao dono: curta, em português, dizendo o que mudou e onde tocar.
```

---

## 7. Como começar

Responda só:

> **"Rodar Fase 1"**

Ao receber isso, o Claude:
1. lê o artifact e os arquivos;
2. lista em até 10 linhas o que vai mudar na Fase 1;
3. executa, testa, publica e mostra os prints;
4. pergunta se pode seguir para a Fase 2. Antes da Fase 2, faz as perguntas da seção 1 que ainda estiverem em aberto.
