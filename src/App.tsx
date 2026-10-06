import { useEffect } from 'react'
import { CartProvider } from './cart/CartContext'
import { BOOK } from './config'
import { captureAttribution, track } from './lib/tracking'
import { Consent } from './components/Consent'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ProofBar, Thesis, Method, Learn } from './components/Sections'
import { Author } from './components/Author'
import { Offer } from './components/Offer'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { ScrollProgress, StickyCta } from './components/Chrome'

export default function App() {
  useEffect(() => {
    captureAttribution()
    track('ViewContent', { value: BOOK.priceCents / 100, quantity: 1 })

    // profundidade de rolagem: 25/50/75/100%
    const hit = new Set<number>()
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      const pct = (window.scrollY / max) * 100
      for (const m of [25, 50, 75, 100]) if (pct >= m - (m === 100 ? 2 : 0) && !hit.has(m)) { hit.add(m); track('ScrollDepth', { percent: m }) }
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <CartProvider>
      <a className="skip" href="#comprar">Ir para a compra</a>
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <ProofBar />
        <Thesis />
        <Method />
        <Learn />
        <Author />
        <Offer />
        <Faq />
      </main>
      <Footer />
      <StickyCta />
      <CartDrawer />
      <Consent />
    </CartProvider>
  )
}
