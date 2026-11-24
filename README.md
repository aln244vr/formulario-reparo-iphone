# Yūsō Shūri — Formulário de reparo de iPhone por correio

Site estático (HTML + CSS + JS puro), bilíngue japonês/português.

| Página | O que é |
|---|---|
| `index.html` | Formulário de pedido de reparo |
| `confirmacao.html` | Página exibida depois do envio |
| `guia.html` | Como enviar o iPhone, FAQ e tabela de preços |
| `assets/config.js` | **Único arquivo para editar no dia a dia**: preços, serviços, prazo, garantia, endereço |
| `assets/style.css` | Visual compartilhado |

## Como mudar preços
Abra `assets/config.js` e preencha `PRECOS`, por exemplo:

```js
window.PRECOS = {
  "iPhone 12 Pro Max": { tela: 19800, bateria: 8800, camera: 14800 },
};
```

O nome do modelo precisa ser igual ao da lista do formulário. Com pelo menos um preço preenchido,
a estimativa aparece no formulário e a tabela aparece em `guia.html`.

## Envio dos pedidos
Os pedidos chegam por e-mail através do [FormSubmit](https://formsubmit.co).
No primeiro envio, o FormSubmit manda um e-mail de ativação — é preciso clicar no link para começar a receber.
