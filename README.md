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
| `assets/config.js` | Dados da loja e serviço de envio (Web3Forms) |
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
