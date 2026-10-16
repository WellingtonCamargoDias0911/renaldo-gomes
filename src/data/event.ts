import { BOOK } from '../config'

/**
 * Dados do lançamento — edite à vontade, sem mexer no resto do código.
 * Deixe `dateISO: null` até ter data confirmada: a página mostra "Data a confirmar"
 * e o botão "Adicionar ao Google Agenda" só aparece depois que você preencher.
 */
export const EVENT = {
  name: 'Lançamento do livro',
  dateISO: '2026-10-30T19:00:00-03:00' as string | null,
  durationHours: 3,
  venueName: 'Livraria da Vila — Shopping Pátio Batel' as string,
  address: 'Av. do Batel, 1868 – Batel, Curitiba – PR, 80420-090',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Livraria da Vila, Av. do Batel, 1868, Batel, Curitiba - PR, 80420-090'),
  // TODO: traje, se houver (ex.: 'Traje esporte fino')
  dressCode: '',
  // WhatsApp da organização, só dígitos com DDI 55 (ex.: 5541999998888) — usado se o envio falhar
  contactWhatsapp: '',
} as const

export const HAS_VENUE = EVENT.venueName !== ''

export function formatEventDate(): string {
  if (!EVENT.dateISO) return 'Data a confirmar'
  const d = new Date(EVENT.dateISO)
  const date = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${date.charAt(0).toUpperCase()}${date.slice(1)} às ${time}`
}

/** Link "Adicionar ao Google Agenda"; vazio enquanto a data não estiver definida. */
export function googleCalendarUrl(): string {
  if (!EVENT.dateISO) return ''
  const start = new Date(EVENT.dateISO)
  const end = new Date(start.getTime() + EVENT.durationHours * 3600_000)
  const fmt = (d: Date) => `${d.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${EVENT.name} — ${BOOK.title}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Lançamento do livro ${BOOK.title}, de ${BOOK.author}.`,
    location: EVENT.address || EVENT.venueName,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
