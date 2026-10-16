/**
 * Confirmação de presença (RSVP) — sem backend próprio: os dados vão direto para um
 * Google Forms que você cria e controla. As respostas (nome, WhatsApp, data/hora) ficam
 * na aba "Respostas" do formulário — com contagem automática — e numa planilha do Google
 * Sheets ligada a ele. É ali que você acompanha quantas pessoas confirmaram.
 *
 * Passo a passo completo: README.md → "Lista de convidados (RSVP)".
 *
 * Configure em .env / variáveis do Render:
 *   VITE_GFORM_ID             — o trecho /d/e/XXXX/ do link do seu Google Forms
 *   VITE_GFORM_ENTRY_NAME     — o "entry.123456" do campo Nome completo
 *   VITE_GFORM_ENTRY_PHONE    — o "entry.123456" do campo WhatsApp
 *   VITE_GUEST_COUNT_CSV_URL  — (opcional) planilha publicada como CSV, para mostrar
 *                               "X confirmados" na própria página
 */

const env = import.meta.env

const GFORM_ID = (env.VITE_GFORM_ID as string | undefined) || ''
const ENTRY_NAME = (env.VITE_GFORM_ENTRY_NAME as string | undefined) || ''
const ENTRY_PHONE = (env.VITE_GFORM_ENTRY_PHONE as string | undefined) || ''
const COUNT_CSV_URL = (env.VITE_GUEST_COUNT_CSV_URL as string | undefined) || ''

/** Formulário configurado? Enquanto não estiver, o botão de confirmar fica desativado. */
export const hasRsvpBackend = !!(GFORM_ID && ENTRY_NAME && ENTRY_PHONE)

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

type SubmitResult = 'ok' | 'offline'

/**
 * Envia a confirmação para o Google Forms. Por limitação do navegador (a requisição é
 * entre sites diferentes, sem CORS), não é possível ler de volta a resposta do Google —
 * então "ok" aqui significa que o envio saiu do navegador sem erro de rede, não uma
 * confirmação explícita do Google de que a linha foi gravada. Na prática é bem confiável;
 * "offline" só acontece se a requisição nem sair (sem internet, DNS bloqueado etc.).
 */
export async function submitRsvp(name: string, phone: string): Promise<SubmitResult> {
  const trimmedName = name.trim()
  const digits = onlyDigits(phone)
  const body = new URLSearchParams({ [ENTRY_NAME]: trimmedName, [ENTRY_PHONE]: digits })
  try {
    await fetch(`https://docs.google.com/forms/d/e/${GFORM_ID}/formResponse`, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  } catch {
    return 'offline'
  }
  saveRsvp({ name: trimmedName, phone: digits, ts: Date.now() })
  return 'ok'
}

/** Lê o total de confirmados numa planilha do Google publicada como CSV (ver README). */
export async function fetchGuestCount(): Promise<number | null> {
  if (!COUNT_CSV_URL) return null
  try {
    const res = await fetch(COUNT_CSV_URL, { cache: 'no-store' })
    if (!res.ok) return null
    const text = await res.text()
    const rows = text.trim().split('\n').filter(Boolean)
    return Math.max(0, rows.length - 1) // desconta a linha de cabeçalho
  } catch {
    return null
  }
}
