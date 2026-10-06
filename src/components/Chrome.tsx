import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BOOK, HAS_PRICE, brl } from '../config'
import { useCart } from '../cart/CartContext'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })
  return <motion.div className="progress" style={{ scaleX: x }} />
}

/** Barra de compra fixa no celular, após passar do hero. */
export function StickyCta() {
  const { add, qty, openCart } = useCart()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const on = () => {
      const buy = document.getElementById('comprar')?.getBoundingClientRect()
      const inOffer = !!buy && buy.top < window.innerHeight * 0.6 && buy.bottom > 0
      setShow(window.scrollY > window.innerHeight * 0.9 && !inOffer)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="sticky" initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
          <div className="sticky__price"><span>{BOOK.author}</span><strong>{HAS_PRICE ? brl(BOOK.priceCents) : 'O livro'}</strong></div>
          <button className="btn btn--gold" onClick={() => (qty > 0 ? openCart() : add(1))}>
            {qty > 0 ? `Ver carrinho (${qty})` : 'Comprar agora'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
