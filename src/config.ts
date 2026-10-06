export const BOOK = {
  title: 'Porque todo mundo pode ser um milionário',
  subtitle: 'sendo feliz no meio.',
  author: 'Renaldo Gomes',
  // Preço em centavos (ex.: 5990 = R$ 59,90). Com 0, a página NÃO mostra preço em lugar nenhum
  // (o valor aparece só no checkout) e o preço é omitido dos dados estruturados do Google.
  priceCents: 0,
  // Preço "de" riscado (centavos); 0 oculta. Só aparece se priceCents também estiver definido.
  fullPriceCents: 0,
  maxInstallments: 3,
} as const

// Página de checkout existente da Grafo Capital
export const CHECKOUT_URL =
  'https://hub.grafocapital.com.br/checkout/76f35dbd-972e-4136-916f-52fd56b1a68b'

export const AUTHOR_INSTAGRAM = 'https://instagram.com/renaldogomes'

/** Há preço configurado? Controla tudo que exibe ou envia valores. */
export const HAS_PRICE = BOOK.priceCents > 0

export const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
