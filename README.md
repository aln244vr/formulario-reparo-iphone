# Anova MM Tech — Formulário de reparo

Site estático (HTML + CSS + JS puro) publicado no GitHub Pages.

| Arquivo | O que é |
|---|---|
| `index.html` | Formulário único: iPhone, console e controle (japonês ou português) |
| `admin.html` | **Painel para editar modelos, serviços e preços pelo celular** |
| `guia.html` | Como enviar, FAQ e tabela de preços |
| `confirmacao.html` | Página exibida depois do envio |
| `consoles.html` | Redireciona para `index.html?tipo=console` (link antigo) |
| `assets/catalogo.json` | Modelos, serviços e preços (editado pelo painel) |
| `assets/config.js` | Dados da loja (garantia, LINE, WhatsApp) e serviço de envio (Web3Forms) |
| `assets/contato.js` | Botões LINE/WhatsApp (aparecem só se preenchidos em config.js) |
| `assets/form.js` | Lógica do formulário |
| `assets/style.css` | Visual |

## Editar o catálogo
Abra `https://aln244vr.github.io/formulario-reparo-iphone/admin.html`.
Na primeira vez, crie uma chave do GitHub (o passo a passo está no próprio painel)
com acesso só a este repositório e permissão **Contents: Read and write**.
Ao tocar em **Salvar**, o painel grava `assets/catalogo.json` no branch `main`
e o site atualiza em 1–2 minutos.

## Envio dos pedidos
Os pedidos vão pelo [Web3Forms](https://web3forms.com) para o e-mail da conta dona da chave
configurada em `assets/config.js`.

## Como as partes se ligam
- **Formulário → Pedidos & Caixa:** o e-mail do pedido traz o código `ANOVA1:`; cole em "Colar pedido" no caixa.
- **Pedidos & Caixa → Catálogo:** em Preços, "Enviar para o site" abre o `admin.html#ANOVACAT1:…`, que aplica sozinho; toque em 💾 Salvar.
- O nome `caixa` de cada serviço/opção no catálogo é igual ao nome do item na tabela de Preços do caixa. Renomeie os dois lados juntos.
- `ignorarDoCaixa` no catálogo lista nomes do caixa que no site já são uma opção de outro serviço (não viram serviço solto).
