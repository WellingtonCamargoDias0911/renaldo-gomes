import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import capa from '../assets/img/capa.webp'
import { BOOK, brl } from '../config'
import { buildCheckoutUrl, track } from '../lib/tracking'
import { useCart } from '../cart/CartContext'

export function CartDrawer() {
  const { open, closeCart, qty, setQty, subtotal, clear } = useCart()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, closeCart])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" onClick={closeCart} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="drawer"
            role="dialog" aria-modal="true" aria-label="Carrinho"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          >
            <header className="drawer__head">
              <h2>Seu carrinho</h2>
              <button className="icon-btn" onClick={closeCart} aria-label="Fechar carrinho">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </header>

            {qty === 0 ? (
              <div className="drawer__empty">
                <p>Seu carrinho está vazio.</p>
                <button className="btn btn--gold" onClick={() => setQty(1)}>Adicionar o livro</button>
              </div>
            ) : (
              <>
                <motion.div className="line" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <img src={capa} alt="Capa do livro" width="84" height="134" />
                  <div className="line__info">
                    <h3>{BOOK.title}</h3>
                    <p>{BOOK.author} · Livro</p>
                    <div className="line__row">
                      <div className="stepper" role="group" aria-label="Quantidade">
                        <button onClick={() => setQty(qty - 1)} aria-label="Diminuir">−</button>
                        <span aria-live="polite">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} aria-label="Aumentar" disabled={qty >= 10}>+</button>
                      </div>
                      <strong>{brl(subtotal)}</strong>
                    </div>
                    <button className="link-btn" onClick={clear}>Remover</button>
                  </div>
                </motion.div>

                <footer className="drawer__foot">
                  <div className="sum"><span>Subtotal</span><strong>{brl(subtotal)}</strong></div>
                  <p className="sum__note">Frete e prazo de entrega são informados na etapa seguinte.</p>
                  <a
                    className="btn btn--green btn--lg"
                    href={buildCheckoutUrl()}
                    onClick={() => track('InitiateCheckout', { value: subtotal / 100, quantity: qty })}
                  >
                    Finalizar compra
                  </a>
                  <button className="link-btn link-btn--center" onClick={closeCart}>Continuar vendo a página</button>
                  <p className="secure">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                    Checkout seguro Grafo Capital
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
