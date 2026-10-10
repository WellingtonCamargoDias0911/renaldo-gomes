import familia from '../assets/img/familia.webp'
import { AUTHOR_INSTAGRAM } from '../config'
import { Reveal } from './Reveal'

const BIO = [
  'Casado com Ana Paula há 20 anos. Pai da Isabelli, Heloísa e Daniel. Atua há mais de 20 anos no âmbito eclesiástico, especialmente na formação e cuidado da juventude.',
  'Matemático (Unibrasil). MBA em Gestão Estratégica (UFPR). MBA em Planejamento Financeiro Pessoal e Familiar (Fundação Galícia).',
  'Carreira executiva nos bancos HSBC Premier (2008), Itaú Personnalité (2010) e Safra (2014).',
  'Agente Autônomo de Investimentos certificado e credenciado pela ANCORD (2017). CPA-10 e CPA-20 — Certificação Profissional ANBIMA.',
  'Sócio fundador e Head de Economia Macro da Grafo Capital, escritório credenciado ao Grupo XP Investimentos.',
  'Profissional do ano, título concedido pela Câmara Municipal de Curitiba em 2022. Colunista, escritor, comentarista econômico e palestrante.',
]

export function Author() {
  return (
    <section className="section author" id="autor">
      <div className="container author__grid">
        <Reveal className="author__photo">
          <img src={familia} alt="Renaldo Gomes com a esposa e os três filhos" loading="lazy" width="700" height="617" />
          <span className="author__tag">Renaldo & família</span>
        </Reveal>
        <div>
          <Reveal as="p" className="kicker">Sobre o autor</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>Renaldo <span className="gold">Gomes</span></Reveal>
          <ul className="bio">
            {BIO.map((b, i) => <Reveal as="li" key={i} delay={0.06 * i} y={14}>{b}</Reveal>)}
          </ul>
          <Reveal delay={0.1}>
            <a className="btn btn--ghost" href={AUTHOR_INSTAGRAM} target="_blank" rel="noreferrer">Fale com o autor · @renaldogomes_1</a>
          </Reveal>
        </div>
      </div>

      <Reveal className="container quote-wrap">
        <blockquote className="quote">
          “A vida milionária é possível para todos. Não é sorte, não é mágica, é construção. E se você deixar para ser feliz apenas quando chegar lá, você pode ter jogado sua vida inteira fora.”
          <cite>— Renaldo Gomes</cite>
        </blockquote>
      </Reveal>
    </section>
  )
}
