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

## Serviços por modelo (catalogo.json)
- `modelos` (opcional) num serviço ou numa opção: lista de modelos ou séries (ex.: `"PlayStation"`, `"Switch Pro Controller"`) em que ele aparece. Sem `modelos` = aparece para todos.
- `precoModelo` numa opção: preço diferente por modelo (ex.: TMR no DualSense ¥4,800, no DUALSHOCK 4 ¥4,600).
- `caixaModelo` numa opção: nome do item no Pedidos & caixa para cada modelo (ex.: "Analógicos TMR K-Silver · PS5"). O pedido do site manda esse nome, e o "Receber do caixa" atualiza o preço do modelo certo.
