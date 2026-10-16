// Gera a imagem de compartilhamento da página de convidados (WhatsApp/Facebook/X): 1200x630.
// Mesma composição "hero" do og.jpg principal, com uma faixa de convite no topo.
import sharp from 'sharp'

const d = 'src/assets/img/'
const W = 1200, H = 630

const sceneW = 1500
const sceneH = Math.round(sceneW * 1915 / 1200)
const mountain = await sharp(d + 'montanha.webp').resize(sceneW, sceneH, { fit: 'fill' }).png().toBuffer()
const bg = await sharp(mountain).extract({ left: 300, top: Math.round(sceneH * 0.115), width: W, height: H }).png().toBuffer()

const manW = 720
const manH = Math.round(manW * 1915 / 1200)
const manFull = await sharp(d + 'homem.webp').resize(manW, manH, { fit: 'fill' }).png().toBuffer()
const manTop = Math.round(manH * 0.237)
const man = await sharp(manFull).extract({ left: 0, top: manTop, width: manW, height: H }).png().toBuffer()

const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>
<linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#06070c" stop-opacity=".95"/><stop offset=".38" stop-color="#06070c" stop-opacity=".35"/><stop offset=".6" stop-color="#06070c" stop-opacity="0"/></linearGradient>
<linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06070c" stop-opacity=".55"/><stop offset=".22" stop-color="#06070c" stop-opacity="0"/><stop offset=".85" stop-color="#06070c" stop-opacity="0"/><stop offset="1" stop-color="#06070c" stop-opacity=".7"/></linearGradient>
</defs><rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#v)"/></svg>`)

const mark = await sharp('public/favicon.svg', { density: 384 }).resize(84, 84).png().toBuffer()

// faixa de convite no topo: pílula dourada com o texto principal + legenda
const band = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Arial, Helvetica, sans-serif">
  <defs>
    <linearGradient id="pill" x1="0" x2="1">
      <stop offset="0" stop-color="#c8901c"/><stop offset="0.55" stop-color="#f0c565"/><stop offset="1" stop-color="#fff4d6"/>
    </linearGradient>
  </defs>
  <rect x="160" y="46" width="470" height="54" rx="27" fill="url(#pill)"/>
  <text x="185" y="82" font-size="27" font-weight="700" letter-spacing="0.5" fill="#1a1204">VOCÊ ESTÁ CONVIDADO(A)</text>
  <text x="160" y="128" font-size="22" font-weight="600" fill="#f5e6c8">Lançamento do livro · Confirme sua presença</text>
</svg>`)

await sharp(bg)
  .composite([
    { input: shade },
    { input: man, left: 330, top: 0 },
    { input: mark, left: 56, top: 44 },
    { input: band },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og-convidados.jpg')

console.log('og-convidados.jpg gerado')
