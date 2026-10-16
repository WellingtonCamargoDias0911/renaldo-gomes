# Landing — Porque todo mundo pode ser um milionário

React + TypeScript + Vite + Framer Motion. Site estático (sem backend).

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # produção (dist/)
npm run preview  # testa o build localmente
```

## Publicar no Render (Static Site)

1. Suba **esta pasta (`landing/`) como raiz de um repositório** no GitHub (a pasta `originais/` já está no `.gitignore`).
2. No Render: **New → Blueprint** e selecione o repositório. O `render.yaml` configura build, cache, cabeçalhos de segurança e redirecionamento.
   (Alternativa manual: *New → Static Site*, build `npm ci --include=dev && npm run build`, publish directory `dist`.)
3. Em **Environment**, ajuste `VITE_SITE_URL` para a URL final (ex.: `https://livro.seudominio.com.br`). Ela alimenta canonical, WhatsApp/Open Graph, sitemap e dados estruturados. **Faça novo deploy após trocar.**
4. Domínio próprio: *Settings → Custom Domains* (HTTPS automático).

## Antes de divulgar (checklist)
- [ ] `src/config.ts` → **preço** (`priceCents`) e link do checkout.
- [ ] `VITE_SITE_URL` com o domínio real.
- [ ] Rastreamento: preencha `VITE_GTM_ID` **ou** `VITE_GA4_ID`, e `VITE_META_PIXEL_ID` (opcional). Só carregam depois que o visitante aceita o aviso de cookies (LGPD).
- [ ] Google Search Console: adicione o site e envie `/sitemap.xml`.
- [ ] Teste o cartão de compartilhamento: <https://developers.facebook.com/tools/debug/> (também limpa o cache do WhatsApp).
- [ ] Se for usar `/convidados`: confirme `VITE_RSVP_ENDPOINT` (seção abaixo) e preencha `src/data/event.ts`.

## Lista de convidados (RSVP) — `/convidados`

Página separada (mesmo tema e efeitos do site) com um formulário de **nome + WhatsApp**
para confirmar presença no lançamento. Ao confirmar, o navegador da pessoa envia os dados
direto para o webhook **"Receber convidados da landing page"** do ERP da Grafo Capital — o
mesmo sistema que já recebe a compra do livro. É lá que a lista fica guardada e é lá que
vocês acompanham quem confirmou (o próprio webhook já evita duplicata pelo telefone).

### O que o site envia
**`POST` para `VITE_RSVP_ENDPOINT`**, corpo como **formulário** (`application/x-www-form-urlencoded`,
igual um `<form>` comum — não é JSON), com estes campos:

```
nome=Maria+Silva&telefone=41988887777&name=Maria+Silva&whatsapp=41988887777
&event=Lan%C3%A7amento+do+livro&confirmedAt=2026-10-16T22%3A14%3A03.000Z
&source=landing-convidados&utm_source=whatsapp&utm_medium=share
```

`nome`/`telefone` (e os apelidos `name`/`whatsapp`, que o webhook também aceita) são os
campos obrigatórios; `telefone`/`whatsapp` já vêm só com dígitos (DDD + número, sem
máscara). Os demais campos (`event`, `confirmedAt`, `utm_source`...) são contexto extra —
se o webhook não usar, ele simplesmente ignora.

**Por que formulário e não JSON:** o webhook responde ao `POST` com o cabeçalho de CORS
certo, mas não tem uma rota para `OPTIONS` — e o navegador manda um `OPTIONS` (chamado de
"preflight") antes de qualquer `POST` com corpo em JSON, pra perguntar se pode enviar.
Sem resposta ao `OPTIONS`, o navegador bloqueia e o `POST` nem sai. Formulário
(`x-www-form-urlencoded`) é tratado pelo navegador como "requisição simples" e pula essa
etapa — funciona sem precisar mexer no backend. Se um dia o webhook ganhar uma rota
`OPTIONS` que devolva `Access-Control-Allow-Origin`/`-Methods`/`-Headers`, dá pra voltar a
enviar em JSON — me avisem que eu ajusto.

### Experiência sem erro para quem confirma (pedido explícito)
A pessoa confirmando **nunca vê uma mensagem de erro técnico**. A tela de "Presença
confirmada!" aparece assim que o nome e o WhatsApp passam na validação do formulário; o
envio de verdade roda em segundo plano (`src/lib/rsvp.ts`):
1. Até duas tentativas automáticas (8s e 15s de tolerância — cobre o backend "acordando"
   no Render, que pode demorar no primeiro acesso).
2. Se as duas falharem (backend fora do ar, sem internet etc.), o envio fica guardado no
   navegador da pessoa e é reenviado sozinho, em silêncio, da próxima vez que ela abrir
   `/convidados` — sem perder o dado e sem incomodar ninguém.
3. Qualquer falha só aparece no console do navegador (`[rsvp] ...`), para quem for depurar.

### (Opcional) Mostrar "X confirmados" na página
Se o backend também expuser um **`GET`** que devolva `{"count": 42}` (com CORS liberado
para este domínio), preencha a URL dele em `VITE_GUEST_COUNT_URL` e o contador aparece
sozinho na página. Sem essa variável, o contador simplesmente não aparece — o resto
funciona normal.

### Limitações (honestas)
- A deduplicação é a do próprio webhook (por telefone) — a página não impede que a mesma
  pessoa envie de dois aparelhos diferentes, por exemplo.
- A página guarda no navegador da pessoa que ela já confirmou (não é à prova de reinstalar
  o navegador/trocar de aparelho), só para pré-preencher o formulário e evitar reenvio sem
  querer ao voltar na página.
- `/convidados` é marcada como privada (`noindex`, fora do `sitemap.xml`): só quem recebe
  o link direto acessa; não aparece em busca do Google.

### Dados do evento
Edite `src/data/event.ts` (data, local, endereço, traje, WhatsApp da organização). Com
`dateISO: null` a página mostra "Data a confirmar" e esconde o botão de Google Agenda —
preencha quando tiver a data fechada.

## UTMs e atribuição
- Qualquer link com `?utm_source=...&utm_medium=...&utm_campaign=...` (e `utm_term`, `utm_content`, `gclid`, `fbclid`, `ttclid`…) é lido ao abrir a página e guardado por 30 dias (primeiro e último toque).
- O botão **Finalizar compra** leva as UTMs para o checkout (`hub.grafocapital.com.br/...?utm_source=...`).
- Exemplo de link de campanha: `https://SEU-SITE/?utm_source=instagram&utm_medium=bio&utm_campaign=lancamento`
- Eventos enviados ao `dataLayer`/GA4/Meta: `ViewContent`, `AddToCart`, `InitiateCheckout`, `ScrollDepth` (25/50/75/100) e `Share`.

## SEO / compartilhamento
- `index.html`: title, description, canonical, robots, Open Graph (WhatsApp/Facebook/LinkedIn/Telegram) e Twitter Card.
- Gerados no build por `vite-plugins/seo.ts`: **JSON-LD** (Livro/Produto com preço, Autor, FAQ, WebSite), `sitemap.xml`, `robots.txt` e um bloco `<noscript>`.
- Imagem do cartão: `public/og.jpg` (1200×630). Para refazer: `npm run og`.
- `/convidados` tem seu próprio `convidados/index.html` (outro Open Graph, próprio cartão
  `public/og-convidados.jpg`, `noindex`) — é um site de **duas páginas**: `vite.config.ts`
  compila `index.html` e `convidados/index.html` separadamente, e `render.yaml` roteia cada
  uma para o arquivo certo. Para refazer o cartão: `npm run og:convidados`.

## Ajustes rápidos
- `src/config.ts` — preço, link do checkout, Instagram.
- `src/data/faq.ts` — perguntas frequentes (alimentam a página e o JSON-LD).
- `src/data/event.ts` — data, local e detalhes do lançamento (página `/convidados`).
- `npm run assets` — regera as imagens otimizadas a partir de `originais/` (requer a pasta localmente).
- `src/components/Hero.tsx` — linha do tempo da animação de abertura.
