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

## UTMs e atribuição
- Qualquer link com `?utm_source=...&utm_medium=...&utm_campaign=...` (e `utm_term`, `utm_content`, `gclid`, `fbclid`, `ttclid`…) é lido ao abrir a página e guardado por 30 dias (primeiro e último toque).
- O botão **Finalizar compra** leva as UTMs para o checkout (`hub.grafocapital.com.br/...?utm_source=...`).
- Exemplo de link de campanha: `https://SEU-SITE/?utm_source=instagram&utm_medium=bio&utm_campaign=lancamento`
- Eventos enviados ao `dataLayer`/GA4/Meta: `ViewContent`, `AddToCart`, `InitiateCheckout`, `ScrollDepth` (25/50/75/100) e `Share`.

## SEO / compartilhamento
- `index.html`: title, description, canonical, robots, Open Graph (WhatsApp/Facebook/LinkedIn/Telegram) e Twitter Card.
- Gerados no build por `vite-plugins/seo.ts`: **JSON-LD** (Livro/Produto com preço, Autor, FAQ, WebSite), `sitemap.xml`, `robots.txt` e um bloco `<noscript>`.
- Imagem do cartão: `public/og.jpg` (1200×630). Para refazer: `npm run og`.

## Ajustes rápidos
- `src/config.ts` — preço, link do checkout, Instagram.
- `src/data/faq.ts` — perguntas frequentes (alimentam a página e o JSON-LD).
- `npm run assets` — regera as imagens otimizadas a partir de `originais/` (requer a pasta localmente).
- `src/components/Hero.tsx` — linha do tempo da animação de abertura.
