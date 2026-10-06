import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { FAQ as QA } from '../data/faq'
import { Reveal } from './Reveal'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="section faq" id="faq">
      <div className="container container--narrow">
        <Reveal as="p" className="kicker">Dúvidas frequentes</Reveal>
        <Reveal as="h2" className="h2" delay={0.05}>Antes de <span className="gold">decidir</span></Reveal>
        <div className="acc">
          {QA.map(({ q, a }, i) => (
            <Reveal key={q} delay={i * 0.06} y={14} className={`acc__item ${open === i ? 'is-open' : ''}`}>
              <button className="acc__q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                <span>{q}</span>
                <motion.svg animate={{ rotate: open === i ? 45 : 0 }} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></motion.svg>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div className="acc__a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    <p>{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
