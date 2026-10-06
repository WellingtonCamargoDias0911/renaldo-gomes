import { motion, useReducedMotion } from 'framer-motion'
import montanha from '../assets/img/montanha.webp'
import homem from '../assets/img/homem.webp'
import { PEAK, RIDGE_PATH, RIDGE_VIEWBOX } from '../data/ridge'
import { BOOK, HAS_PRICE, brl } from '../config'
import { useCart } from '../cart/CartContext'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { HeroAtmosphere } from './HeroAtmosphere'

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const reduce = useReducedMotion()
  const desktop = useIsDesktop()
  const { add } = useCart()
  const k = reduce ? 0 : 1

  // linha do tempo: contorno -> montanha -> homem -> textos
  const T = { ridge: 0.3 * k, ridgeDur: 2.4 * k, mount: 1.7 * k, man: 2.7 * k, text: 3.0 * k }

  const viewBox = desktop ? `0 100 ${RIDGE_VIEWBOX.w} 900` : `0 0 ${RIDGE_VIEWBOX.w} ${RIDGE_VIEWBOX.h}`
  const par = desktop ? 'xMidYMin slice' : 'xMidYMid meet'

  const fade = (delay: number, y = 24) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0 : 0.9, delay: T.text + delay, ease: EASE },
  })

  return (
    <section className="hero" id="topo">
      <h1 className="sr-only">
        {BOOK.title}, {BOOK.subtitle} — {BOOK.author}
      </h1>

      <motion.div className="hero__text" {...fade(0)}>
        <span className="eyebrow">Método ODS</span>
        <p className="hero__tagline">
          O método que transformou a vida de <strong>mais de 2.000 famílias</strong>.
        </p>
        <p className="hero__lead">
          Riqueza não é sorte nem mágica. É <em>matemática e construção</em> — e dá para ser feliz no meio do caminho.
        </p>
      </motion.div>

      <div className="hero__scene" aria-hidden="true">
        <svg className="hero__svg" viewBox={viewBox} preserveAspectRatio={par}>
          <defs>
            <linearGradient id="ridgeGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#c8901c" />
              <stop offset="0.6" stopColor="#f0c565" />
              <stop offset="1" stopColor="#fff4d6" />
            </linearGradient>
            <radialGradient id="starGrad">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.25" stopColor="#ffe6a0" stopOpacity="0.9" />
              <stop offset="1" stopColor="#e0b04a" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width={RIDGE_VIEWBOX.w} height={RIDGE_VIEWBOX.h} fill="#06070c" />

          <motion.image
            href={montanha}
            width={RIDGE_VIEWBOX.w}
            height={RIDGE_VIEWBOX.h}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 2.2, delay: T.mount, ease: 'easeOut' }}
          />

          {/* traço brilhoso: halos em camadas (sem filtros SVG, para não pesar) + núcleo fino */}
          {[
            { w: 34, op: 0.07 },
            { w: 20, op: 0.12 },
            { w: 10, op: 0.25 },
            { w: 5, op: 0.55 },
            { w: 2.2, op: 1 },
          ].map((s, i) => (
            <motion.path
              key={i}
              d={RIDGE_PATH}
              fill="none"
              stroke="url(#ridgeGrad)"
              strokeWidth={s.w}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={s.op}
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: T.ridgeDur, delay: T.ridge, ease: [0.45, 0, 0.2, 1] }}
            />
          ))}

          {/* estrela no pico */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.9, delay: T.ridge + T.ridgeDur - 0.2 * k, ease: EASE }}
            style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
          >
            <circle cx={PEAK.x} cy={PEAK.y} r="38" fill="url(#starGrad)" />
            <motion.g
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
            >
              <path
                d={`M${PEAK.x} ${PEAK.y - 31} L${PEAK.x + 4} ${PEAK.y - 4} L${PEAK.x + 31} ${PEAK.y} L${PEAK.x + 4} ${PEAK.y + 4} L${PEAK.x} ${PEAK.y + 31} L${PEAK.x - 4} ${PEAK.y + 4} L${PEAK.x - 31} ${PEAK.y} L${PEAK.x - 4} ${PEAK.y - 4}Z`}
                fill="#ffe9ad"
                opacity="0.85"
              />
            </motion.g>
          </motion.g>
        </svg>

        <HeroAtmosphere delay={T.mount + 0.3} />

        <motion.img
          className="hero__man"
          src={homem}
          alt=""
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduce ? 0 : 1.4, delay: T.man, ease: EASE }}
        />
        <div className="hero__fade" />
      </div>

      <motion.div className="hero__cta" {...fade(0.25)}>
        {HAS_PRICE && (
          <div className="hero__price">
            <span>Por apenas</span>
            <strong>{brl(BOOK.priceCents)}</strong>
          </div>
        )}
        <button className="btn btn--gold btn--lg" onClick={() => add(1)}>
          <span>Quero meu exemplar</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
        <a className="hero__more" href="#tese">Conhecer o livro ↓</a>
      </motion.div>
    </section>
  )
}

