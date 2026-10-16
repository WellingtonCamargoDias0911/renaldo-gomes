/**
 * Confirmação de presença (RSVP) — envia os dados para o SEU PRÓPRIO servidor (o mesmo
 * domínio que já recebe a compra do livro), via uma requisição HTTP comum.
 *
 * Contrato completo (exemplo de payload, resposta esperada, CORS): README.md →
 * "Lista de convidados (RSVP)". Resumo rápido:
 *   - POST para VITE_RSVP_ENDPOINT, corpo em JSON (veja `buildPayload`).
 *   - Sucesso: qualquer resposta 2xx. Qualquer outra coisa é tratada como falha.
 *   - O servidor precisa devolver o cabeçalho `Access-Control-Allow-Origin` liberando
 *     o domínio deste site (CORS) — sem isso o navegador bloqueia a resposta.
 *
 * Configure em .env / variáveis do Render:
 *   VITE_RSVP_ENDPOINT    — URL completa do endpoint que recebe a confirmação (POST)
 *   VITE_GUEST_COUNT_URL  — (opcional) URL que devolve {"count": N}, para mostrar
 *                           "X confirmados" na própria página
 */
import { attribution } from './tracking'
import { EVENT } from '../data/event'

const env = import.meta.env

const RSVP_ENDPOINT = (env.VITE_RSVP_ENDPOINT as string | undefined) || ''
const COUNT_URL = (env.VITE_GUEST_COUNT_URL as string | undefined) || ''

/** Endpoint configurado? Enquanto não estiver, o botão de confirmar fica desativado. */
export const hasRsvpBackend = /^https?:\/\//.test(RSVP_ENDPOINT)

const STORE = 'rg-rsvp-v1'

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

type SubmitResult = 'ok' | 'error'

/** Monta exatamente o corpo que é enviado — use isto como referência ao implementar o servidor. */
export function buildRsvpPayload(name: string, phone: string) {
  return {
    name: name.trim(),
    phone: onlyDigits(phone),
    event: EVENT.name,
    confirmedAt: new Date().toISOString(),
    source: 'landing-convidados',
    utm: attribution(), // ex.: { utm_source: 'whatsapp', utm_medium: 'share' } — pode vir {}
  }
}

/**
 * Envia a confirmação para o servidor configurado em VITE_RSVP_ENDPOINT.
 *
 * O Content-Type vai como "text/plain" de propósito, mesmo o corpo sendo JSON: isso faz o
 * navegador tratar a requisição como "simples" e pular o preflight (OPTIONS) do CORS — o
 * servidor só precisa aceitar o POST, fazer JSON.parse do corpo e devolver o cabeçalho
 * Access-Control-Allow-Origin. Veja o contrato completo no README.
 */
export async function submitRsvp(name: string, phone: string): Promise<SubmitResult> {
  const payload = buildRsvpPayload(name, phone)
  let res: Response
  try {
    res = await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[rsvp] falha de rede ao enviar a confirmação', err)
    return 'error'
  }
  if (!res.ok) {
    console.error('[rsvp] servidor recusou a confirmação', res.status, await res.text().catch(() => ''))
    return 'error'
  }
  saveRsvp({ name: payload.name, phone: payload.phone, ts: Date.now() })
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
