import { loadEnv, type Plugin } from 'vite'
import { AUTHOR_INSTAGRAM, BOOK, CHECKOUT_URL } from '../src/config.ts'
import { FAQ } from '../src/data/faq.ts'

const DESCRIPTION =
  'Livro de Renaldo Gomes com o Método ODS, que já transformou a vida de mais de 2.000 famílias. Riqueza é matemática e construção — e dá para ser feliz no meio do caminho.'

/**
 * Gera no build: JSON-LD (Book/Product, Person, FAQPage, WebSite), bloco <noscript> com o conteúdo
 * principal (para robôs sem JavaScript), robots.txt e sitemap.xml — tudo a partir de src/config.ts,
 * src/data/faq.ts e VITE_SITE_URL, para nunca ficar fora de sincronia com a página.
 */
export function seo(): Plugin {
  let site = ''

  return {
    name: 'seo',
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), 'VITE_')
      site = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '')
    },

    transformIndexHtml(html) {
      const price = (BOOK.priceCents / 100).toFixed(2)
      const graph = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${site}/#website`,
            url: `${site}/`,
            name: `${BOOK.title} | ${BOOK.author}`,
            inLanguage: 'pt-BR',
          },
          {
            '@type': 'Person',
            '@id': `${site}/#autor`,
            name: BOOK.author,
            jobTitle: 'Sócio fundador e Head de Economia Macro da Grafo Capital',
            description: 'Matemático, MBA em Planejamento Financeiro, ex-executivo de grandes bancos e autor do Método ODS.',
            sameAs: [AUTHOR_INSTAGRAM],
          },
          {
            '@type': ['Book', 'Product'],
            '@id': `${site}/#livro`,
            name: `${BOOK.title}, ${BOOK.subtitle.replace(/\.$/, '')}`,
            alternateName: BOOK.title,
            description: DESCRIPTION,
            image: [`${site}/og.jpg`, `${site}/icon-512.png`],
            inLanguage: 'pt-BR',
            isbn: '9786502110300',
            author: { '@id': `${site}/#autor` },
            url: `${site}/`,
            ...(BOOK.priceCents > 0 && {
              offers: {
                '@type': 'Offer',
                url: `${site}/#comprar`,
                price,
                priceCurrency: 'BRL',
                availability: 'https://schema.org/InStock',
                itemCondition: 'https://schema.org/NewCondition',
              },
            }),
          },
          {
            '@type': 'FAQPage',
            '@id': `${site}/#faq`,
            mainEntity: FAQ.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          },
        ],
      }

      const esc = (s: string) => s.replace(/</g, '&lt;')
      const noscript = `<noscript>
      <main style="max-width:720px;margin:0 auto;padding:96px 24px;font-family:system-ui,sans-serif;line-height:1.6;color:#ece9e2">
        <h1>${esc(BOOK.title)}, ${esc(BOOK.subtitle)} — ${esc(BOOK.author)}</h1>
        <p>${esc(DESCRIPTION)}</p>
        <ul>
          <li>O método que transformou a vida de mais de 2.000 famílias.</li>
          <li>Método ODS: Objetivo Claro, Disciplina e Saber Investir.</li>
          <li>Por ${esc(BOOK.author)}, sócio fundador da Grafo Capital.</li>
        </ul>
        <p><a style="color:#e0b04a" href="${CHECKOUT_URL}">Comprar o livro${BOOK.priceCents > 0 ? ` — R$ ${price.replace('.', ',')}` : ''}</a></p>
        <p style="font-size:.8em;opacity:.7">Esta página usa JavaScript para exibir o conteúdo completo.</p>
      </main>
    </noscript>`

      return html
        .replace('<!--JSONLD-->', `<script type="application/ld+json">${JSON.stringify(graph)}</script>`)
        .replace('<!--NOSCRIPT-->', noscript)
    },

    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site}/</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
      })
    },
  }
}
