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
- [ ] Se for usar `/convidados`: configure o Google Forms (seção abaixo) e preencha `src/data/event.ts`.

## Lista de convidados (RSVP) — `/convidados`

Página separada (mesmo tema e efeitos do site) com um formulário de **nome + WhatsApp**
para confirmar presença no lançamento. Não existe servidor/banco de dados próprio aqui —
as respostas vão direto para um **Google Forms** que você cria e controla. Isso responde a
pergunta "onde vou guardar a lista": ela fica guardada automaticamente no **Google
(Forms + Sheets)**, exatamente como qualquer outro Google Forms que você já tenha usado —
e é lá que você abre para ver os nomes, telefones e **quantas pessoas confirmaram** (a aba
"Respostas" já mostra o total, com gráfico, sem precisar de nada técnico).

### 1. Crie o formulário (uma vez)
1. Acesse [forms.google.com](https://forms.google.com) → **Formulário em branco**.
2. Crie exatamente duas perguntas, do tipo **Resposta curta**:
   - **Nome completo**
   - **WhatsApp**
3. (Opcional) Em **Respostas** → ícone verde do Sheets → **Criar planilha**, para ter os
   dados também numa planilha do Google Sheets (fica ligada ao formulário automaticamente).

### 2. Pegue os IDs para conectar ao site
No formulário (modo de edição), clique no menu **⋮** (três pontinhos, canto superior
direito) → **Obter link para preenchimento prévio**. Preencha qualquer coisa nos dois
campos (ex.: "Teste" e "41999999999"), clique em **Obter link** e copie o link gerado.
Ele se parece com isto:

```
https://docs.google.com/forms/d/e/1FAIpQLSc_ALGO_LONGO/viewform?usp=pp_url&entry.111222333=Teste&entry.444555666=41999999999
```

Dessa URL, copie três pedaços para o `.env` (ou nas variáveis do Render):

| Na URL | Variável |
|---|---|
| o trecho entre `/d/e/` e `/viewform` (`1FAIpQLSc_ALGO_LONGO`) | `VITE_GFORM_ID` |
| o número depois de `entry.` **no campo Nome** (`111222333`) | `VITE_GFORM_ENTRY_NAME` |
| o número depois de `entry.` **no campo WhatsApp** (`444555666`) | `VITE_GFORM_ENTRY_PHONE` |

Confira qual `entry.` é qual olhando a ordem em que você preencheu — "Teste" é sempre o
Nome, o número é sempre o WhatsApp. Salve o `.env`, rode `npm run build` (ou faça o deploy
no Render) e o formulário do site já envia para o seu Google Forms.

### 3. (Opcional) Mostrar "X confirmados" na página
Sem isso o site funciona normalmente — você só não vê o contador ao vivo na página (mas
continua vendo o total real a qualquer momento na aba "Respostas" do formulário). Para
ativar o contador:
1. Abra a planilha de respostas (Sheets) → **Arquivo → Compartilhar → Publicar na web**.
2. Selecione a aba de respostas e o formato **Valores separados por vírgula (.csv)** →
   **Publicar**.
3. Copie o link gerado em `VITE_GUEST_COUNT_CSV_URL`.

### Limitações (honestas)
- Não existe confirmação 100% garantida de que a linha foi salva no Google — o navegador
  não permite ler a resposta de outro site. Na prática é bem confiável; se algo falhar de
  verdade (sem internet, por exemplo), a página mostra um aviso e, se você preencher
  `EVENT.contactWhatsapp` em `src/data/event.ts`, oferece confirmar direto pelo seu WhatsApp.
- Não há deduplicação automática: se alguém confirmar duas vezes com nomes digitados
  diferente, aparecem duas linhas — basta olhar a planilha de vez em quando.
- A página guarda no navegador da pessoa que ela já confirmou (não é à prova de reinstalar
  o navegador/trocar de aparelho), só para evitar reenvio sem querer ao voltar na página.
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
