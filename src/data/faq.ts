export interface FaqItem { q: string; a: string }

/** Fonte única: usada no FAQ visível e no JSON-LD (FAQPage) gerado no build. */
export const FAQ: FaqItem[] = [
  { q: 'Para quem é este livro?', a: 'Para quem quer construir patrimônio com método e consciência — sem depender de sorte e sem adiar a felicidade para o dia em que “chegar lá”.' },
  { q: 'O livro é recomendação de investimento?', a: 'Não. É um material de educação financeira e não constitui oferta, recomendação de investimento ou garantia de rentabilidade. Rentabilidade passada não é garantia de rentabilidade futura.' },
  { q: 'Como recebo o meu pedido?', a: 'Ao finalizar a compra você informa seus dados e o endereço de entrega no checkout seguro da Grafo Capital. Frete e prazo aparecem nessa etapa.' },
  { q: 'Posso comprar mais de um exemplar?', a: 'Pode. Ajuste a quantidade na página ou direto no carrinho.' },
  { q: 'Quem é Renaldo Gomes?', a: 'Matemático, MBA em Planejamento Financeiro, ex-executivo de grandes bancos, sócio fundador da Grafo Capital e autor do Método ODS, que já transformou a vida de mais de 2.000 famílias.' },
]
