// Gera a imagem de compartilhamento (WhatsApp/Facebook/LinkedIn/X): 1200x630, JPG leve.
// Composição: montanha com o contorno brilhante à direita, capa do livro em destaque à esquerda.
import sharp from 'sharp'

const d = 'src/assets/img/'
const W = 1200, H = 630

// cenário no formato 1200x1915 -> recorta a faixa do contorno (pico + degraus), ampliando para cobrir a largura
const sceneW = 1500
const sceneH = Math.round(sceneW * 1915 / 1200)
const mountain = await sharp(d + 'montanha.webp').resize(sceneW, sceneH, { fit: 'fill' }).png().toBuffer()
const scene = mountain
const top = Math.round(sceneH * 0.115)
const crop = await sharp(scene).extract({ left: 300, top, width: W, height: H }).png().toBuffer()

// capa com bordas arredondadas e sombra
const coverH = 500
const coverBuf = await sharp(d + 'capa.webp').resize({ height: coverH }).png().toBuffer()
const cm = await sharp(coverBuf).metadata()
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cm.width}" height="${cm.height}"><rect width="100%" height="100%" rx="10" fill="#fff"/></svg>`)
const cover = await sharp(coverBuf).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
const shadow = await sharp({ create: { width: cm.width + 120, height: cm.height + 120, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cm.width + 120}" height="${cm.height + 120}"><rect x="60" y="60" width="${cm.width}" height="${cm.height}" rx="10" fill="#e0b04a" opacity=".5"/></svg>`) }])
  .blur(36).png().toBuffer()

// escurece o lado esquerdo para destacar a capa
const gradient = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#06070c" stop-opacity=".92"/><stop offset=".42" stop-color="#06070c" stop-opacity=".55"/><stop offset=".7" stop-color="#06070c" stop-opacity="0"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`)

const left = 90, topPos = Math.round((H - cm.height) / 2)
await sharp(crop)
  .composite([
    { input: gradient },
    { input: shadow, left: left - 60, top: topPos - 60 },
    { input: cover, left, top: topPos },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/og.jpg')

// ícone 192 (manifest)
await sharp('public/favicon.svg', { density: 384 }).resize(192, 192).png().toFile('public/icon-192.png')
console.log('og.jpg + icon-192.png gerados')
