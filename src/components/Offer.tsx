import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState } from 'react'
import capa from '../assets/img/capa.webp'
import { BOOK, HAS_PRICE, brl } from '../config'
import { useCart } from '../cart/CartContext'
import { shareUrl, track } from '../lib/tracking'
import { NetworkBg } from './NetworkBg'
import { Reveal } from './Reveal'

function Book3D() {
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 140, damping: 16 })
  const sy = useSpring(my, { stiffness: 140, damping: 16 })
  const rotY = useTransform(sx, [-0.5, 0.5], [-16, 16])
  const rotX = useTransform(sy, [-0.5, 0.5], [12, -12])

  return (
    <div
      className="book3d"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onPointerLeave={() => { mx.set(0); my.set(0) }}
    >
      <motion.div className="book3d__obj" style={{ rotateY: rotY, rotateX: rotX }}
        animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
        <img src={capa} alt="Capa do livro Porque todo mundo pode ser um milionário" width="400" height="638" loading="lazy" />
        <span className="book3d__shine" />
      </motion.div>
      <span className="book3d__shadow" />
    </div>
  )
}

export function Offer() {
  const { add } = useCart()
  const [n, setN] = useState(1)

  const share = async () => {
    const url = shareUrl('whatsapp')
    const text = `${BOOK.title}, ${BOOK.subtitle} — ${BOOK.author}`
    track('Share', { method: 'whatsapp' })
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: text, text, url }); return } catch { /* cancelado: cai no link */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}
${url}`)}`, '_blank', 'noopener')
  }

  return (
    <section className="section offer" id="comprar">
      <NetworkBg density={0.00004} />
      <div className="container offer__grid">
        <Reveal className="offer__book"><Book3D /></Reveal>

        <div className="offer__box">
          <Reveal as="p" className="kicker">Garanta o seu</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>{BOOK.title}, <span className="gold">{BOOK.subtitle}</span></Reveal>
          <Reveal as="p" className="offer__by" delay={0.1}>Por {BOOK.author} · O método que transformou a vida de mais de 2.000 famílias.</Reveal>

          {HAS_PRICE && (
            <Reveal delay={0.15} className="offer__price">
              {BOOK.fullPriceCents > 0 && <s>{brl(BOOK.fullPriceCents)}</s>}
              <strong>{brl(BOOK.priceCents)}</strong>
            </Reveal>
          )}

          <Reveal delay={0.2}>
            <ul className="checks">
              <li>Livro com o Método ODS completo</li>
              <li>Entrega no endereço que você informar no checkout</li>
              <li>Pagamento em ambiente seguro.</li>
            </ul>
          </Reveal>

          <Reveal delay={0.25} className="offer__buy">
            <div className="stepper stepper--lg" role="group" aria-label="Quantidade">
              <button onClick={() => setN((v) => Math.max(1, v - 1))} aria-label="Diminuir">−</button>
              <span>{n}</span>
              <button onClick={() => setN((v) => Math.min(10, v + 1))} aria-label="Aumentar">+</button>
            </div>
            <button className="btn btn--gold btn--lg btn--grow" onClick={() => { add(n); setN(1) }}>
              Adicionar ao carrinho{HAS_PRICE ? ` · ${brl(BOOK.priceCents * n)}` : ''}
            </button>
          </Reveal>

          <Reveal delay={0.3}>
            <button className="share" onClick={share}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14c-.25.7-1.45 1.35-2 1.4-.52.05-1 .25-3.36-.7-2.84-1.14-4.65-4.04-4.8-4.23-.14-.19-1.15-1.53-1.15-2.92 0-1.4.73-2.07 1-2.35.25-.28.55-.35.74-.35h.53c.17 0 .4-.06.62.48.25.57.84 1.97.9 2.12.08.14.12.31.03.5-.1.19-.14.3-.28.47-.14.17-.3.37-.42.5-.14.14-.28.3-.12.58.16.28.72 1.18 1.55 1.9 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.17-.19.7-.82.89-1.1.19-.28.38-.23.64-.14.26.1 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.69-.18 1.4Z"/></svg>
              Indicar pelo WhatsApp
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
