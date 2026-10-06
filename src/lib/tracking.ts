/**
 * Atribuição (UTMs e IDs de clique) + eventos de conversão.
 *
 * - UTMs são lidas da URL, guardadas por 30 dias (first-touch e last-touch) e anexadas ao link do checkout.
 * - Pixels/tags (GTM, GA4, Meta Pixel) só carregam se houver ID configurado E o visitante aceitar o aviso de cookies.
 *   Configure em .env / variáveis do Render: VITE_GTM_ID, VITE_GA4_ID, VITE_META_PIXEL_ID.
 */
import { CHECKOUT_URL } from '../config'

const STORE = 'rg-attrib-v1'
const CONSENT = 'rg-consent-v1'
const TTL = 30 * 24 * 60 * 60 * 1000

const PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid', 'msclkid', 'src', 'sck',
] as const

type Params = Record<string, string>
interface Touch { params: Params; landing: string; referrer: string; ts: number }
interface Stored { first?: Touch; last?: Touch }

const env = import.meta.env
export const TRACKERS = {
  gtm: (env.VITE_GTM_ID as string | undefined) || '',
  ga4: (env.VITE_GA4_ID as string | undefined) || '',
  meta: (env.VITE_META_PIXEL_ID as string | undefined) || '',
}
export const hasTrackers = !!(TRACKERS.gtm || TRACKERS.ga4 || TRACKERS.meta)

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...a: unknown[]) => void
    fbq?: ((...a: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown }
    _fbq?: unknown
  }
}

const read = (): Stored => {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) ?? '{}') as Stored
    if (v.last && Date.now() - v.last.ts > TTL) return {}
    return v
  } catch { return {} }
}
const write = (v: Stored) => { try { localStorage.setItem(STORE, JSON.stringify(v)) } catch { /* sem storage */ } }

/** Lê UTMs/IDs de clique da URL atual e persiste. Chamar uma vez ao abrir a página. */
export function captureAttribution() {
  const q = new URLSearchParams(window.location.search)
  const params: Params = {}
  for (const k of PARAMS) { const v = q.get(k); if (v) params[k] = v.slice(0, 200) }

  const stored = read()
  let ref = ''
  try { ref = document.referrer && new URL(document.referrer).host !== window.location.host ? document.referrer : '' } catch { /* noop */ }

  if (Object.keys(params).length) {
    const touch: Touch = { params, landing: window.location.pathname, referrer: ref, ts: Date.now() }
    write({ first: stored.first ?? touch, last: touch })
  } else if (!stored.first && ref) {
    // visita orgânica/indireta: registra só o referrer como origem
    let host = ''
    try { host = new URL(ref).hostname.replace(/^www\./, '') } catch { /* noop */ }
    if (host) {
      const touch: Touch = { params: { utm_source: host, utm_medium: 'referral' }, landing: window.location.pathname, referrer: ref, ts: Date.now() }
      write({ first: touch, last: touch })
    }
  }
}

/** Parâmetros de atribuição vigentes (last-touch; se não houver, first-touch). */
export function attribution(): Params {
  const s = read()
  return { ...(s.first?.params ?? {}), ...(s.last?.params ?? {}) }
}

/** Link do checkout com as UTMs preservadas (não sobrescreve o que já existir no link). */
export function buildCheckoutUrl(): string {
  const url = new URL(CHECKOUT_URL)
  for (const [k, v] of Object.entries(attribution())) if (!url.searchParams.has(k)) url.searchParams.set(k, v)
  return url.toString()
}

/** Link da própria página para compartilhar (marca a origem como whatsapp/share). */
export function shareUrl(source = 'whatsapp') {
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.set('utm_source', source)
  url.searchParams.set('utm_medium', 'share')
  url.searchParams.set('utm_campaign', 'indicacao')
  return url.toString()
}

/* ------------------------------ eventos ------------------------------ */

const GA4_NAMES: Record<string, string> = { ViewContent: 'view_item', AddToCart: 'add_to_cart', InitiateCheckout: 'begin_checkout' }

export interface TrackData { value?: number; quantity?: number; [k: string]: unknown }

export function track(event: string, data: TrackData = {}) {
  const payload = { ...data, ...attribution() }
  ;(window.dataLayer ??= []).push({ event, ...payload })

  if (window.fbq) {
    const std = ['ViewContent', 'AddToCart', 'InitiateCheckout'].includes(event)
    const meta = { value: data.value, currency: 'BRL', content_type: 'product', content_ids: ['livro-renaldo-gomes'], num_items: data.quantity }
    window.fbq(std ? 'track' : 'trackCustom', event, meta)
  }
  if (window.gtag && !TRACKERS.gtm) {
    window.gtag('event', GA4_NAMES[event] ?? event.toLowerCase(), {
      currency: 'BRL', value: data.value,
      items: data.quantity ? [{ item_id: 'livro-renaldo-gomes', item_name: 'Porque todo mundo pode ser um milionário', quantity: data.quantity }] : undefined,
      ...attribution(),
    })
  }
}

/* ------------------------------ consentimento ------------------------------ */

export const getConsent = (): 'granted' | 'denied' | null => {
  try { return (localStorage.getItem(CONSENT) as 'granted' | 'denied' | null) ?? null } catch { return null }
}
export const setConsent = (v: 'granted' | 'denied') => { try { localStorage.setItem(CONSENT, v) } catch { /* noop */ } }

let loaded = false
const script = (src: string, attrs: Record<string, string> = {}) => {
  const s = document.createElement('script')
  s.async = true; s.src = src
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
  document.head.appendChild(s)
}

/** Carrega GTM / GA4 / Meta Pixel (apenas após consentimento). */
export function loadTrackers() {
  if (loaded || !hasTrackers) return
  loaded = true
  const w = window
  w.dataLayer = w.dataLayer || []

  if (TRACKERS.gtm) {
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    script(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(TRACKERS.gtm)}`)
  }
  if (TRACKERS.ga4 && !TRACKERS.gtm) {
    w.gtag = function () { (w.dataLayer as unknown[]).push(arguments) } // eslint-disable-line prefer-rest-params
    script(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(TRACKERS.ga4)}`)
    w.gtag('js', new Date())
    w.gtag('config', TRACKERS.ga4, { send_page_view: true, ...attribution() })
  }
  if (TRACKERS.meta) {
    if (!w.fbq) {
      const n = function (...a: unknown[]) {
        if (n.callMethod) (n.callMethod as (...x: unknown[]) => void)(...a)
        else (n.queue as unknown[]).push(a)
      } as NonNullable<Window['fbq']>
      n.queue = []; n.loaded = true; n.version = '2.0'; n.push = n
      w.fbq = n; w._fbq = n
    }
    script('https://connect.facebook.net/en_US/fbevents.js')
    w.fbq!('init', TRACKERS.meta)
    w.fbq!('track', 'PageView')
  }
}
