// Gera a imagem de compartilhamento (WhatsApp/Facebook/LinkedIn/X): 1200x630, JPG leve.
// Composição "hero": montanha com o contorno dourado + autor (mesmo recorte da abertura do site).
import sharp from 'sharp'

const d = 'src/assets/img/'
const W = 1200, H = 630

// fundo: montanha ampliada, enquadrando o contorno e o pico à direita
const sceneW = 1500
const sceneH = Math.round(sceneW * 1915 / 1200)
const mountain = await sharp(d + 'montanha.webp').resize(sceneW, sceneH, { fit: 'fill' }).png().toBuffer()
const bg = await sharp(mountain).extract({ left: 300, top: Math.round(sceneH * 0.115), width: W, height: H }).png().toBuffer()

// autor: recorte do rosto até o título "MILIONÁRIO", centro-direita
const manW = 720
const manH = Math.round(manW * 1915 / 1200)
const manFull = await sharp(d + 'homem.webp').resize(manW, manH, { fit: 'fill' }).png().toBuffer()
const manTop = Math.round(manH * 0.237)  // começa um pouco acima da cabeça
const man = await sharp(manFull).extract({ left: 0, top: manTop, width: manW, height: H }).png().toBuffer()

// escurece a esquerda e as bordas para dar foco ao autor
const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>
<linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#06070c" stop-opacity=".95"/><stop offset=".38" stop-color="#06070c" stop-opacity=".35"/><stop offset=".6" stop-color="#06070c" stop-opacity="0"/></linearGradient>
<linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06070c" stop-opacity=".35"/><stop offset=".2" stop-color="#06070c" stop-opacity="0"/><stop offset=".85" stop-color="#06070c" stop-opacity="0"/><stop offset="1" stop-color="#06070c" stop-opacity=".7"/></linearGradient>
</defs><rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#v)"/></svg>`)

// logo (marca) à esquerda
const mark = await sharp('public/favicon.svg', { density: 384 }).resize(96, 96).png().toBuffer()

await sharp(bg)
  .composite([
    { input: shade },
    { input: man, left: 330, top: 0 },
    { input: mark, left: 56, top: 48 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og.jpg')

await sharp('public/favicon.svg', { density: 384 }).resize(192, 192).png().toFile('public/icon-192.png')
console.log('og.jpg + icon-192.png gerados')
