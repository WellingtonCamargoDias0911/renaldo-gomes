import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useCart } from '../cart/CartContext'
import { Logo } from './Logo'

const NAV = [
  { href: '#tese', label: 'O livro' },
  { href: '#metodo', label: 'Método ODS' },
  { href: '#autor', label: 'Autor' },
  { href: '#faq', label: 'Dúvidas' },
]

export function Header() {
  const { qty, openCart, bump } = useCart()
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <motion.header
      className={`header ${solid ? 'header--solid' : ''}`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="container header__in">
        <a href="#topo" className="logo" aria-label="Renaldo Gomes — início">
          <Logo size={38} />
        </a>

        <nav className="nav" aria-label="Principal">
          {NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
        </nav>

        <button className="cart-btn" onClick={openCart} aria-label={`Abrir carrinho, ${qty} item(ns)`}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h2.5l2.2 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6.2" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" />
          </svg>
          {qty > 0 && (
            <motion.span key={bump} className="cart-btn__badge" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
              {qty}
            </motion.span>
          )}
        </button>
      </div>
    </motion.header>
  )
}
