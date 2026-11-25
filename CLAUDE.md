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
