import { useEffect, useRef } from 'react'

/** Rede de nós flutuantes — referência ao grafo da marca. */
export function NetworkBg({ density = 0.00006, className = '' }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0, visible = true
    type P = { x: number; y: number; vx: number; vy: number; r: number }
    let pts: P[] = []

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.max(18, Math.min(70, Math.round(w * h * density)))
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.8,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const max = 140
      for (const p of pts) {
        if (!reduce) { p.x += p.vx; p.y += p.vy }
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.hypot(dx, dy)
          if (d < max) {
            ctx.strokeStyle = `rgba(224,176,74,${(1 - d / max) * 0.22})`
            ctx.lineWidth = 0.7
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke()
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = 'rgba(245,230,200,0.55)'
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }
      if (!reduce && visible) raf = requestAnimationFrame(draw)
    }

    setup(); draw()
    const ro = new ResizeObserver(() => { setup(); if (reduce) draw() })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) draw()
    })
    io.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [density])

  return <canvas ref={ref} className={`network ${className}`} aria-hidden="true" />
}
