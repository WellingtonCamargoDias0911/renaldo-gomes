// Remove a "rede de pontos" desenhada na foto da montanha (círculos e fios mais claros que o entorno)
// com um top-hat morfológico: tudo que é mais claro e mais fino que a janela é subtraído.
// A zona do contorno brilhante e da estrela é preservada.
import { readFileSync } from 'node:fs'

const WIN = 71 // diâmetro máximo (px, em 1600 de largura) do que é removido

function minmax(src, w, h, win, isMin) {
  const r = win >> 1
  const tmp = new Float32Array(src.length)
  const out = new Float32Array(src.length)
  const pick = isMin ? Math.min : Math.max
  // horizontal
  for (let y = 0; y < h; y++) {
    const row = y * w
    for (let x = 0; x < w; x++) {
      let v = src[row + x]
      const a = Math.max(0, x - r), b = Math.min(w - 1, x + r)
      for (let k = a; k <= b; k++) v = pick(v, src[row + k])
      tmp[row + x] = v
    }
  }
  // vertical
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let v = tmp[y * w + x]
      const a = Math.max(0, y - r), b = Math.min(h - 1, y + r)
      for (let k = a; k <= b; k++) v = pick(v, tmp[k * w + x])
      out[y * w + x] = v
    }
  }
  return out
}

function ridgePoints() {
  const ts = readFileSync(new URL('../src/data/ridge.ts', import.meta.url), 'utf8')
  const d = ts.match(/RIDGE_PATH = '(M[^']+)'/)[1].slice(1).split(' L')
  return d.map((p) => p.split(' ').map(Number))
}

const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t) }

/** @param {Buffer} rgb  buffer RGB (3 canais) w×h */
export function cleanNetwork(rgb, w, h) {
  const n = w * h
  const lum = new Float32Array(n)
  for (let i = 0; i < n; i++) lum[i] = 0.3 * rgb[i * 3] + 0.59 * rgb[i * 3 + 1] + 0.11 * rgb[i * 3 + 2]
  const opened = minmax(minmax(lum, w, h, WIN, true), w, h, WIN, false)

  const pts = ridgePoints()
  const sc = 1200 / w // px -> unidades do contorno
  const out = Buffer.from(rgb)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const th = lum[i] - opened[i]
      if (th <= 0.5) continue
      const ux = x * sc, uy = y * sc
      // só onde existe rede: lado esquerdo da imagem
      let f = 1 - smooth(560, 720, ux)
      if (f <= 0) continue
      // preserva o brilho do contorno e a estrela
      let dmin = 1e9
      for (let k = 0; k < pts.length; k += 2) {
        const dx = pts[k][0] - ux, dy = pts[k][1] - uy
        const dd = dx * dx + dy * dy
        if (dd < dmin) dmin = dd
      }
      f *= smooth(28, 70, Math.sqrt(dmin))
      if (f <= 0) continue
      const sub = th * f
      for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.max(0, Math.round(rgb[i * 3 + c] - sub))
    }
  }
  return out
}
