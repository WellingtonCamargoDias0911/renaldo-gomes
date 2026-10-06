import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/** Textura de fumaça tileável (fBm periódico) gerada uma única vez no cliente. */
function makeSmokeTile(size = 256, seed = 1): string {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(size, size)

  // PRNG determinístico
  let s = seed * 9301 + 49297
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)

  const octaves = [4, 8, 16, 32]
  const grids = octaves.map((f) => Array.from({ length: f * f }, rnd))
  const fade = (t: number) => t * t * (3 - 2 * t)
  const sample = (g: number[], f: number, x: number, y: number) => {
    const gx = x * f, gy = y * f
    const x0 = Math.floor(gx), y0 = Math.floor(gy)
    const tx = fade(gx - x0), ty = fade(gy - y0)
    const at = (i: number, j: number) => g[(((j % f) + f) % f) * f + (((i % f) + f) % f)]
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx
    return a + (b - a) * ty
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0, amp = 0.55, norm = 0
      octaves.forEach((f, i) => {
        v += sample(grids[i], f, x / size, y / size) * amp
        norm += amp
        amp *= 0.55
      })
      v /= norm
      const a = Math.max(0, Math.min(1, (v - 0.42) * 2.6)) // contraste: nuvens com vazios
      const i = (y * size + x) * 4
      img.data[i] = 226; img.data[i + 1] = 188; img.data[i + 2] = 124
      img.data[i + 3] = Math.round(a * a * 255)
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}


interface Node {
  x: number; y: number; vx: number; vy: number; r: number
  phase: number; tw: number; hub: boolean
}
interface Pulse { a: number; b: number; t: number; speed: number }

/**
 * Teoria dos grafos como atmosfera: vértices (partículas) à deriva, arestas ligando
 * vértices próximos, pulsos de "sinal" percorrendo as arestas e o cursor como vértice extra.
 */
function GraphField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // sprite de brilho pré-renderizado (bem mais barato que shadowBlur)
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = 64
    const sctx = sprite.getContext('2d')!
    const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,244,214,1)')
    grad.addColorStop(0.2, 'rgba(244,205,120,0.85)')
    grad.addColorStop(0.55, 'rgba(224,176,74,0.22)')
    grad.addColorStop(1, 'rgba(224,176,74,0)')
    sctx.fillStyle = grad
    sctx.fillRect(0, 0, 64, 64)

    let w = 0, h = 0, raf = 0, last = 0, visible = true, link = 140
    let nodes: Node[] = []
    const pulses: Pulse[] = []
    const pointer = { x: 0, y: 0, on: false }

    const make = (): Node => {
      const hub = Math.random() < 0.18
      const ang = Math.random() * Math.PI * 2
      const sp = 6 + Math.random() * 14
      return {
        x: Math.random() * w, y: Math.random() * h,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 4, // leve tendência a subir
        r: hub ? 4 + Math.random() * 2.4 : 2 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2, tw: 0.6 + Math.random() * 1.4, hub,
      }
    }

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.max(45, Math.min(160, Math.round((w * h) / 6000)))
      nodes = Array.from({ length: n }, make)
      link = Math.max(95, Math.min(175, Math.min(w, h) * 0.2))
      pulses.length = 0
    }

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016)
      last = t
      const time = t / 1000
      ctx.clearRect(0, 0, w, h)

      // movimento + reaparecimento nas bordas
      if (!reduce) {
        for (const n of nodes) {
          n.x += n.vx * dt; n.y += n.vy * dt
          const m = 30
          if (n.x < -m) n.x = w + m; else if (n.x > w + m) n.x = -m
          if (n.y < -m) n.y = h + m; else if (n.y > h + m) n.y = -m
        }
      }
      const vis = (n: Node) => {
        const e = Math.min(1, Math.min(n.y, h - n.y) / (h * 0.16))
        const ex = Math.min(1, Math.min(n.x, w - n.x) / (w * 0.06))
        return Math.max(0, Math.min(e, ex))
      }

      // arestas
      const edges: [number, number, number][] = []
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i], va = vis(a)
        if (va <= 0) continue
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > link * link) continue
          const k = 1 - Math.sqrt(d2) / link
          const al = Math.pow(k, 1.3) * 0.7 * Math.min(va, vis(b))
          if (al < 0.01) continue
          ctx.strokeStyle = `rgba(240,197,101,${al.toFixed(3)})`
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          edges.push([i, j, al])
        }
      }

      // o cursor é um vértice extra que se conecta aos vizinhos
      if (pointer.on) {
        const R = link * 1.35
        for (const n of nodes) {
          const dx = n.x - pointer.x, dy = n.y - pointer.y
          const d = Math.hypot(dx, dy)
          if (d > R) continue
          ctx.strokeStyle = `rgba(255,236,176,${(Math.pow(1 - d / R, 1.1) * 0.75).toFixed(3)})`
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(pointer.x, pointer.y); ctx.lineTo(n.x, n.y); ctx.stroke()
        }
        ctx.globalAlpha = 0.9
        ctx.drawImage(sprite, pointer.x - 20, pointer.y - 20, 40, 40)
        ctx.globalAlpha = 1
      }

      // pulsos de sinal percorrendo as arestas
      if (!reduce && edges.length && pulses.length < 9 && Math.random() < 0.06) {
        const [a, b] = edges[(Math.random() * edges.length) | 0]
        pulses.push({ a, b, t: 0, speed: 0.55 + Math.random() * 0.7 })
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.t += p.speed * dt
        if (p.t >= 1) { pulses.splice(i, 1); continue }
        const A = nodes[p.a], B = nodes[p.b]
        const x = A.x + (B.x - A.x) * p.t, y = A.y + (B.y - A.y) * p.t
        ctx.globalAlpha = Math.sin(p.t * Math.PI) * 0.95
        ctx.drawImage(sprite, x - 14, y - 14, 28, 28)
      }

      // vértices
      for (const n of nodes) {
        const tw = 0.7 + 0.3 * Math.sin(time * n.tw + n.phase)
        ctx.globalAlpha = Math.max(0, vis(n) * tw * (n.hub ? 0.8 : 0.6))
        const size = n.r * (n.hub ? 7 : 6)
        ctx.drawImage(sprite, n.x - size / 2, n.y - size / 2, size, size)
        // núcleo nítido: a "bolinha" do vértice
        ctx.fillStyle = n.hub ? 'rgba(255,240,200,0.6)' : 'rgba(245,215,150,0.5)'
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (n.hub ? 0.62 : 0.55), 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
      if (!reduce && visible) raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top
      pointer.on = e.pointerType === 'mouse' && pointer.x >= 0 && pointer.y >= 0 && pointer.x <= r.width && pointer.y <= r.height
    }
    const onLeave = () => { pointer.on = false }

    setup()
    raf = requestAnimationFrame(frame)
    const ro = new ResizeObserver(() => { setup(); if (reduce) frame(0) })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) { last = performance.now(); raf = requestAnimationFrame(frame) }
    })
    io.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="atmos__embers" />
}

/** Fumaça em camadas + grafo de partículas, entre a montanha e o autor. */
export function HeroAtmosphere({ delay = 0 }: { delay?: number }) {
  const [tile, setTile] = useState('')
  useEffect(() => {
    // gera após o primeiro paint para não atrasar a abertura
    const id = requestAnimationFrame(() => setTile(makeSmokeTile(256, 7)))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <motion.div
      className="atmos"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.4, delay, ease: 'easeOut' }}
    >
      {tile && (
        <>
          <div className="atmos__smoke atmos__smoke--a" style={{ backgroundImage: `url(${tile})` }} />
          <div className="atmos__smoke atmos__smoke--b" style={{ backgroundImage: `url(${tile})` }} />
        </>
      )}
      <GraphField />
    </motion.div>
  )
}
