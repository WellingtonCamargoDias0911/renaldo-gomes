import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getConsent, hasTrackers, loadTrackers, setConsent } from '../lib/tracking'

/** Aviso de cookies (LGPD). Só aparece se houver pixels/tags configurados. */
export function Consent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!hasTrackers) return
    const c = getConsent()
    if (c === 'granted') loadTrackers()
    else if (c === null) {
      const id = window.setTimeout(() => setShow(true), 2500)
      return () => window.clearTimeout(id)
    }
  }, [])

  const choose = (v: 'granted' | 'denied') => {
    setConsent(v)
    if (v === 'granted') loadTrackers()
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="consent" role="dialog" aria-label="Aviso de cookies"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >
          <p>Usamos cookies para medir o desempenho da página e melhorar sua experiência. Você pode aceitar ou recusar.</p>
          <div className="consent__btns">
            <button className="btn btn--ghost" onClick={() => choose('denied')}>Recusar</button>
            <button className="btn btn--gold" onClick={() => choose('granted')}>Aceitar</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
