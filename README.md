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
- [ ] Se for usar `/convidados`: suba o endpoint (seção abaixo), preencha `VITE_RSVP_ENDPOINT` e `src/data/event.ts`.

## Lista de convidados (RSVP) — `/convidados`

Página separada (mesmo tema e efeitos do site) com um formulário de **nome + WhatsApp**
para confirmar presença no lançamento. O site continua sendo só HTML/JS/CSS (sem backend
próprio) — ao confirmar, o navegador da pessoa faz uma requisição HTTP direto para o
**seu servidor** (o mesmo domínio que já recebe a compra do livro, `hub.grafocapital.com.br`,
ou qualquer outro que vocês controlem). É lá que a lista fica guardada e é lá que vocês
contam quantas pessoas confirmaram — este README descreve exatamente o que o site envia,
para o time implementar o endpoint que recebe.

### O que o site envia
**`POST` para a URL em `VITE_RSVP_ENDPOINT`**, corpo em JSON:

```json
{
  "name": "Maria Silva",
  "phone": "41988887777",
  "event": "Lançamento do livro",
  "confirmedAt": "2026-10-16T22:14:03.000Z",
  "source": "landing-convidados",
  "utm": { "utm_source": "whatsapp", "utm_medium": "share" }
}
```

- `phone` já vem só com dígitos (DDD + número, sem máscara).
- `confirmedAt` é a data/hora UTC do envio, em ISO 8601.
- `utm` traz a origem de quem clicou no link (campanha, rede social etc.) quando existir —
  pode vir como objeto vazio `{}`.
- O cabeçalho vai como `Content-Type: text/plain` **de propósito**, mesmo o corpo sendo
  JSON — isso faz o navegador pular o preflight (`OPTIONS`) do CORS, então o servidor só
  precisa tratar o `POST` em si. Ele pode (e deve) ignorar o Content-Type declarado e fazer
  `JSON.parse`/`json_decode` do corpo normalmente.

### O que o servidor precisa devolver
- **Sucesso:** qualquer status **2xx** (o corpo da resposta não é lido, pode ser vazio).
- **Falha:** qualquer outro status — a página mostra um aviso de erro para quem está
  confirmando.
- **CORS, obrigatório:** a resposta precisa incluir o cabeçalho
  `Access-Control-Allow-Origin: https://SEU-SITE` (o domínio deste site; `*` também funciona,
  mas é menos seguro). Sem esse cabeçalho, o navegador descarta a resposta mesmo que o
  servidor tenha salvo os dados — e a página mostraria erro mesmo com tudo certo do lado de
  lá. Como não há preflight (ver acima), **esse é o único cabeçalho de CORS necessário.**

### Exemplo mínimo de servidor
Node/Express:
```js
app.post('/rsvp', express.text({ type: '*/*' }), (req, res) => {
  const data = JSON.parse(req.body) // { name, phone, event, confirmedAt, source, utm }
  // ... salvar `data` onde preferir (banco, planilha, CRM) ...
  res.header('Access-Control-Allow-Origin', 'https://SEU-SITE').sendStatus(200)
})
```
PHP:
```php
header('Access-Control-Allow-Origin: https://SEU-SITE');
$data = json_decode(file_get_contents('php://input'), true); // name, phone, event, confirmedAt, source, utm
// ... salvar $data ...
http_response_code(200);
```

### (Opcional) Mostrar "X confirmados" na página
Se o servidor também expuser um **`GET`** que devolva `{"count": 42}` (com o mesmo cabeçalho
de CORS acima), preencha a URL dele em `VITE_GUEST_COUNT_URL` e o contador aparece sozinho
na página. Sem essa variável, o contador simplesmente não aparece — o resto funciona normal.

### Limitações (honestas)
- Não há deduplicação automática: se alguém confirmar duas vezes, vão existir dois envios —
  trate isso do lado do servidor se for importante (ex.: por telefone).
- A página guarda no navegador da pessoa que ela já confirmou (não é à prova de reinstalar
  o navegador/trocar de aparelho), só para evitar reenvio sem querer ao voltar na página.
- Se o envio falhar (servidor fora do ar, CORS mal configurado etc.), a página avisa e,
  se você preencher `EVENT.contactWhatsapp` em `src/data/event.ts`, oferece confirmar direto
  pelo seu WhatsApp como alternativa.
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
