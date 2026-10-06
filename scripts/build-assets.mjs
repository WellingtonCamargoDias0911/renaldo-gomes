import sharp from 'sharp';
import { cleanNetwork } from './clean-network.mjs';
const o = 'originais/', d = 'src/assets/img/';
const opt = { quality: 80, effort: 5 };
{
  const { data, info } = await sharp(o + 'montanha-fundo-retocada.png').resize(1600).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const limpa = cleanNetwork(data, info.width, info.height);
  await sharp(limpa, { raw: { width: info.width, height: info.height, channels: 3 } }).webp({ quality: 76, effort: 5 }).toFile(d + 'montanha.webp');
}
await sharp(o + 'homem-recortado-limpo.png').resize(1100).webp({ quality: 86, alphaQuality: 90, effort: 5 }).toFile(d + 'homem.webp');
await sharp(o + 'capa-completa-ebooks.png').resize(1000).webp(opt).toFile(d + 'capa.webp');
await sharp(o + 'capa-completa-ebooks.png').resize(1200, 630, { fit: 'cover', position: 'top' }).jpeg({ quality: 80 }).toFile('public/og.jpg');
// família do autor (orelha do livro), 6250x3055
await sharp(o + 'capa-aberta-orelhas.png').extract({ left: 60, top: 2290, width: 840, height: 740 }).resize(700).webp(opt).toFile(d + 'familia.webp');
const m = await sharp(d + 'montanha.webp').metadata();
console.log('montanha', m.width, m.height);

// contorno da montanha: src/data/ridge.ts foi ajustado a partir da imagem (nao regerado aqui)
