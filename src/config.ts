export const BOOK = {
  title: 'Porque todo mundo pode ser um milionário',
  subtitle: 'sendo feliz no meio.',
  author: 'Renaldo Gomes',
  // TODO: confirme o preço oficial (em centavos) — valor provisório
  priceCents: 5990,
  // TODO: se houver preço "de", informe aqui (em centavos); 0 oculta
  fullPriceCents: 0,
  maxInstallments: 3,
} as const

// Página de checkout existente da Grafo Capital
export const CHECKOUT_URL =
  'https://hub.grafocapital.com.br/checkout/76f35dbd-972e-4136-916f-52fd56b1a68b'

export const AUTHOR_INSTAGRAM = 'https://instagram.com/renaldogomes'

export const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
