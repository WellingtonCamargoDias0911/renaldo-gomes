import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import montanha from '../assets/img/montanha.webp'
import { HeroAtmosphere } from '../components/HeroAtmosphere'
import { Counter, Reveal } from '../components/Reveal'
import { InviteHeader } from '../components/InviteHeader'
import { Footer } from '../components/Footer'
import { ScrollProgress } from '../components/Chrome'
import { BOOK } from '../config'
import { EVENT, HAS_VENUE, formatEventDate, googleCalendarUrl } from '../data/event'
import { captureAttribution, track } from '../lib/tracking'
import {
  fetchGuestCount, flushRsvpOutbox, formatPhone, getSavedRsvp, hasRsvpBackend,
  isValidName, isValidPhone, submitRsvp,
} from '../lib/rsvp'

type Status = 'idle' | 'sending' | 'ok'

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
)
const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.4" />
  </svg>
)
const ShirtIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 4 4 7l2 3 2-1.3V20h8V8.7L18 10l2-3-4-3-2 2h-4Z" />
  </svg>
)
const CheckBadge = () => (
  <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="rgba(0,194,127,0.15)" stroke="#00c27f" strokeWidth="1.5" />
    <path d="M7 12.5 10.5 16 17 9" stroke="#00c27f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

export function GuestsPage() {
  const saved = useMemo(() => getSavedRsvp(), [])
  const [name, setName] = useState(saved?.name ?? '')
  const [phone, setPhone] = useState(saved ? formatPhone(saved.phone) : '')
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<Status>(saved ? 'ok' : 'idle')
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'Você está convidado(a) — Lançamento do livro | Renaldo Gomes'
    captureAttribution()
    track('ViewInvite')
    fetchGuestCount().then(setCount)
    void flushRsvpOutbox() // reenvia em silêncio qualquer confirmação pendente de uma visita anterior
  }, [])

  const nameOk = isValidName(name)
  const phoneOk = isValidPhone(phone)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!nameOk || !phoneOk || status === 'sending' || !hasRsvpBackend) return
    setStatus('sending')
    await submitRsvp(name, phone)
    track('RSVP', { quantity: 1 })
    setCount((c) => (c === null ? c : c + 1))
    setStatus('ok')
  }

  const calUrl = googleCalendarUrl()

  return (
    <>
      <ScrollProgress />
      <InviteHeader />

      <main className="invite">
        <section className="invite__hero" id="topo">
          <img className="invite__bg" src={montanha} alt="" aria-hidden="true" />
          <HeroAtmosphere delay={0.2} />
          <div className="invite__scrim" aria-hidden="true" />

          <div className="container invite__hero-in">
            <Reveal as="p" className="eyebrow">Lançamento do livro</Reveal>
            <Reveal as="h1" className="h2 invite__title" delay={0.08}>
              Você está <span className="gold">convidado(a)</span>
            </Reveal>
            <Reveal as="p" className="invite__subtitle" delay={0.14}>
              {BOOK.title}, {BOOK.subtitle} — por {BOOK.author}
            </Reveal>

            <Reveal className="invite__details" delay={0.2}>
              <div className="invite__detail">
                <CalendarIcon />
                <span>{formatEventDate()}</span>
              </div>
              <div className="invite__detail">
                <PinIcon />
                <span>
                  {HAS_VENUE ? EVENT.venueName : 'Local a confirmar'}
                  {EVENT.mapsUrl && <a href={EVENT.mapsUrl} target="_blank" rel="noreferrer"> · Ver mapa</a>}
                </span>
              </div>
              {EVENT.dressCode && (
                <div className="invite__detail">
                  <ShirtIcon />
                  <span>{EVENT.dressCode}</span>
                </div>
              )}
            </Reveal>

            {count !== null && (
              <Reveal delay={0.26} className="invite__count">
                <strong><Counter to={count} /></strong> {count === 1 ? 'confirmado até agora' : 'confirmados até agora'}
              </Reveal>
            )}
          </div>
        </section>

        <section className="section invite__form-section">
          <div className="container container--narrow">
            <Reveal className="invite__card">
              <AnimatePresence mode="wait">
                {status === 'ok' ? (
                  <motion.div
                    key="ok" className="invite__success"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  >
                    <CheckBadge />
                    <h2 className="h2 invite__success-title">Presença confirmada!</h2>
                    <p>
                      {name || saved?.name}, você está na lista. Guarde esta página — os detalhes do encontro
                      aparecem aqui em cima assim que forem confirmados.
                    </p>
                    {calUrl && (
                      <a className="btn btn--ghost" href={calUrl} target="_blank" rel="noreferrer">
                        Adicionar ao Google Agenda
                      </a>
                    )}
                    <button className="link-btn" onClick={() => setStatus('idle')}>Confirmar outra pessoa</button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form" className="invite__form" onSubmit={onSubmit} noValidate
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    <h2 className="h2 invite__form-title">Confirme sua presença</h2>
                    <p className="invite__form-sub">Leva 10 segundos. Só precisamos do seu nome e WhatsApp.</p>

                    <label className="field">
                      <span>Nome completo</span>
                      <input
                        type="text" autoComplete="name" value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => setTouched(true)}
                        placeholder="Seu nome completo"
                        aria-invalid={touched && !nameOk}
                      />
                      {touched && !nameOk && <small>Digite seu nome completo.</small>}
                    </label>

                    <label className="field">
                      <span>WhatsApp</span>
                      <input
                        type="tel" inputMode="tel" autoComplete="tel" value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        onBlur={() => setTouched(true)}
                        placeholder="(11) 98765-4321"
                        aria-invalid={touched && !phoneOk}
                      />
                      {touched && !phoneOk && <small>Digite um WhatsApp válido, com DDD.</small>}
                    </label>

                    {!hasRsvpBackend && (
                      <p className="invite__warn">
                        Formulário ainda não conectado. Veja <code>README.md</code> → "Lista de convidados".
                      </p>
                    )}

                    <button className="btn btn--gold btn--lg btn--grow" type="submit" disabled={status === 'sending' || !hasRsvpBackend}>
                      {status === 'sending' ? 'Enviando…' : 'Confirmar presença'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
