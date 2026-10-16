/**
 * Confirmação de presença (RSVP) — envia os dados para o webhook de marketing do ERP da
 * Grafo Capital ("Receber convidados da landing page"), o mesmo sistema que já recebe a
 * compra do livro.
 *
 * Importante (pedido explícito): quem está confirmando NUNCA vê erro técnico. A tela de
 * sucesso aparece assim que os dados são validados no navegador; o envio de verdade roda
 * em segundo plano com novas tentativas automáticas, e se mesmo assim falhar, o pedido
 * fica guardado no navegador e é reenviado sozinho na próxima vez que a página abrir —
 * nada se perde, e a pessoa nunca vê uma mensagem de "deu erro".
 *
 * Configure em .env / variáveis do Render:
 *   VITE_RSVP_ENDPOINT    — URL do webhook (POST)
 *   VITE_GUEST_COUNT_URL  — (opcional) URL que devolve {"count": N}, para "X confirmados"
 */
import { attribution } from './tracking'
import { EVENT } from '../data/event'

const env = import.meta.env

const RSVP_ENDPOINT = (env.VITE_RSVP_ENDPOINT as string | undefined) || ''
const COUNT_URL = (env.VITE_GUEST_COUNT_URL as string | undefined) || ''

/** Endpoint configurado? Enquanto não estiver, o botão de confirmar fica desativado. */
export const hasRsvpBackend = /^https?:\/\//.test(RSVP_ENDPOINT)

const STORE = 'rg-rsvp-v1'
const OUTBOX = 'rg-rsvp-outbox-v1'

export interface RsvpRecord { name: string; phone: string; ts: number }

/** Confirmação salva neste navegador (evita reenviar sem querer ao voltar na página). */
export function getSavedRsvp(): RsvpRecord | null {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) ?? 'null') as RsvpRecord | null
    return v && v.name && v.phone ? v : null
  } catch { return null }
}
const saveRsvp = (r: RsvpRecord) => { try { localStorage.setItem(STORE, JSON.stringify(r)) } catch { /* sem storage */ } }
export const clearSavedRsvp = () => { try { localStorage.removeItem(STORE) } catch { /* noop */ } }

/** Mantém só dígitos, limitado a 11 (DDD + número). */
export const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 11)

/** Aplica a máscara (DD) 9XXXX-XXXX enquanto a pessoa digita. */
export function formatPhone(raw: string): string {
  const d = onlyDigits(raw)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const isValidName = (v: string) => v.trim().length >= 3 && v.trim().includes(' ')
export const isValidPhone = (v: string) => onlyDigits(v).length >= 10

/** Formato exato esperado pelo webhook: nome + telefone (e os apelidos name/whatsapp, de brinde). */
interface RsvpPayload {
  nome: string
  telefone: string
  name: string
  whatsapp: string
  event: string
  confirmedAt: string
  source: string
  utm: Record<string, string>
}

function buildPayload(name: string, phone: string): RsvpPayload {
  const nome = name.trim()
  const telefone = onlyDigits(phone)
  return {
    nome, telefone, name: nome, whatsapp: telefone,
    event: EVENT.name,
    confirmedAt: new Date().toISOString(),
    source: 'landing-convidados',
    utm: attribution(),
  }
}

/** Uma tentativa de envio, com tempo limite. Nunca lança — só diz se deu certo. */
async function attemptSend(payload: RsvpPayload, timeoutMs: number): Promise<boolean> {
  const ctrl = new AbortController()
  const id = window.setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    })
    return res.ok
  } catch (err) {
    // só no console: a pessoa confirmando nunca vê isto.
    console.error('[rsvp] tentativa de envio falhou (tratado em segundo plano)', err)
    return false
  } finally {
    window.clearTimeout(id)
  }
}

const readOutbox = (): RsvpPayload[] => {
  try { return JSON.parse(localStorage.getItem(OUTBOX) ?? '[]') } catch { return [] }
}
const writeOutbox = (items: RsvpPayload[]) => { try { localStorage.setItem(OUTBOX, JSON.stringify(items)) } catch { /* noop */ } }
const queueOutbox = (payload: RsvpPayload) => writeOutbox([...readOutbox(), payload])

/** Tenta reenviar o que ficou pendente (chamado ao abrir a página). Silencioso, não bloqueia nada. */
export async function flushRsvpOutbox(): Promise<void> {
  const items = readOutbox()
  if (!items.length || !hasRsvpBackend) return
  const remaining: RsvpPayload[] = []
  for (const item of items) {
    const ok = await attemptSend(item, 10_000)
    if (!ok) remaining.push(item)
  }
  writeOutbox(remaining)
}

/** Entrega em segundo plano: duas tentativas (cobre o servidor "acordando" no Render) e, se
 *  mesmo assim falhar, guarda para reenviar depois. Nunca é esperado pela tela. */
async function deliver(payload: RsvpPayload): Promise<void> {
  for (const timeout of [8_000, 15_000]) {
    if (await attemptSend(payload, timeout)) return
  }
  queueOutbox(payload)
}

/**
 * Confirma a presença. Sempre "dá certo" do ponto de vista da pessoa confirmando — o envio
 * de verdade roda em segundo plano (ver `deliver`). Um pequeno atraso aqui é só para a tela
 * de "Enviando…" não piscar rápido demais.
 */
export async function submitRsvp(name: string, phone: string): Promise<'ok'> {
  const payload = buildPayload(name, phone)
  saveRsvp({ name: payload.nome, phone: payload.telefone, ts: Date.now() })
  void deliver(payload) // não aguardado de propósito
  await new Promise((r) => setTimeout(r, 450))
  return 'ok'
}

/** Lê o total de confirmados no endpoint opcional VITE_GUEST_COUNT_URL (ver README). */
export async function fetchGuestCount(): Promise<number | null> {
  if (!COUNT_URL) return null
  try {
    const res = await fetch(COUNT_URL, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { count?: number }
    return typeof data.count === 'number' ? data.count : null
  } catch {
    return null
  }
}
