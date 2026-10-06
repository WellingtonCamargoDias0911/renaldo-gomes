import { useId } from 'react'

/**
 * Marca Renaldo Gomes: anel dourado + linha de montanha em ascensão
 * cujos vértices são nós de um grafo, terminando numa estrela no pico.
 * (Mesmo desenho de public/favicon.svg.)
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className="logo__mark">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#c8901c" />
          <stop offset="0.55" stopColor="#f0c565" />
          <stop offset="1" stopColor="#fff4d6" />
        </linearGradient>
        <radialGradient id={`s${id}`}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.3" stopColor="#ffe6a0" stopOpacity="0.85" />
          <stop offset="1" stopColor="#e0b04a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="21.5" fill="#080a14" stroke={`url(#g${id})`} strokeWidth="1.5" />
      <path d="M10.5 33 18 25.5 22 29.5 29.5 20.5 35 14.5" fill="none" stroke={`url(#g${id})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <g fill="#f5e6c8">
        <circle cx="10.5" cy="33" r="1.7" />
        <circle cx="18" cy="25.5" r="1.7" />
        <circle cx="22" cy="29.5" r="1.7" />
        <circle cx="29.5" cy="20.5" r="1.7" />
      </g>
      <circle cx="35" cy="14.5" r="6.5" fill={`url(#s${id})`} />
      <path d="M35 8.6 36 13.5 40.9 14.5 36 15.5 35 20.4 34 15.5 29.1 14.5 34 13.5Z" fill="#fff4d6" />
    </svg>
  )
}

export function Logo({ size = 36, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <span className="logo__lockup">
      <LogoMark size={size} />
      {showText && (
        <span className="logo__text">
          <span className="logo__first">RENALDO</span>
          <span className="logo__last gold">GOMES</span>
        </span>
      )}
    </span>
  )
}
