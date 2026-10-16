import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Logo } from './Logo'

/** Cabeçalho enxuto da página de convidados: sem carrinho, sem menu de seções do livro. */
export function InviteHeader() {
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
        <a href="/" className="logo" aria-label="Renaldo Gomes — início">
          <Logo size={38} />
        </a>
        <a className="invite__back" href="/">Conheça o livro</a>
      </div>
    </motion.header>
  )
}
