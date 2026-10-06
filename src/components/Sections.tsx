import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Counter, Reveal } from './Reveal'
import { NetworkBg } from './NetworkBg'

export function ProofBar() {
  const items = [
    { n: 2000, p: '+', l: 'famílias transformadas' },
    { n: 20, p: '+', l: 'anos no mercado financeiro' },
    { n: 20000, p: '+', l: 'atendimentos validados na prática' },
    { n: 3, p: '', l: 'pilares no Método ODS' },
  ]
  return (
    <section className="proof" aria-label="Números do autor">
      <div className="container proof__grid">
        {items.map((it, i) => (
          <Reveal key={it.l} delay={i * 0.08} className="proof__item">
            <strong><Counter to={it.n} prefix={it.p} /></strong>
            <span>{it.l}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/** Linha de montanha que se desenha conforme o scroll. */
function ScrollRidge() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'end 55%'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  const o = useTransform(p, [0, 0.05], [0, 1])
  return (
    <div ref={ref} aria-hidden="true">
    <svg className="scroll-ridge" viewBox="0 0 800 140" preserveAspectRatio="none">
      <motion.path
        d="M0 130 L90 100 L150 112 L260 62 L320 74 L430 40 L490 52 L620 16 L700 30 L800 4"
        fill="none" stroke="url(#sr)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"
        style={{ pathLength: p, opacity: o, filter: 'drop-shadow(0 0 6px rgba(240,197,101,.8))' }}
      />
      <defs>
        <linearGradient id="sr" x1="0" x2="1"><stop offset="0" stopColor="#c8901c" /><stop offset="1" stopColor="#fff4d6" /></linearGradient>
      </defs>
    </svg>
    </div>
  )
}

export function Thesis() {
  return (
    <section className="section thesis" id="tese">
      <div className="container thesis__grid">
        <div>
          <Reveal as="p" className="kicker">A tese do livro</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>
            A prosperidade não é uma questão de sorte. <span className="gold">É uma consequência matemática.</span>
          </Reveal>
        </div>
        <div className="thesis__copy">
          <Reveal as="p" delay={0.1}>
            Dizem que a felicidade é um lugar onde a gente chega e finca uma bandeira ao acumular riqueza. Mas se você esperar o topo da montanha para comemorar, <strong>terá jogado a sua vida inteira fora.</strong>
          </Reveal>
          <Reveal as="p" delay={0.18}>
            Em <em>Porque todo mundo pode ser um milionário: sendo feliz no meio</em>, Renaldo Gomes — especialista forjado no mercado financeiro, com mais de 20 mil atendimentos validados na prática — revela que a riqueza não é sorte, privilégio ou mágica: <strong className="gold">é matemática e construção.</strong>
          </Reveal>
          <Reveal as="p" delay={0.26}>
            Do estoquista e vendedor ao gestor de grandes fortunas no Banco Safra e fundador da Grafo Capital, o autor desvenda os bastidores da verdadeira prosperidade.
          </Reveal>
        </div>
      </div>
      <ScrollRidge />
    </section>
  )
}

const ODS = [
  { l: 'O', t: 'Objetivo Claro', d: 'Sem direção, nenhum investimento rende o que poderia. Defina aonde quer chegar — e por quê.' },
  { l: 'D', t: 'Disciplina', d: 'Riqueza se constrói com constância. Hábitos simples, repetidos, vencem a intensidade de momentos.' },
  { l: 'S', t: 'Saber Investir', d: 'Conhecimento aplicado na prática, longe de modismos e promessas fáceis, para o dinheiro trabalhar por você.' },
]

export function Method() {
  return (
    <section className="section method" id="metodo">
      <NetworkBg />
      <div className="container">
        <div className="center">
          <Reveal as="p" className="kicker">O Método ODS</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>Um mapa estratégico, <span className="gold">muito além de planilhas frias.</span></Reveal>
        </div>
        <div className="ods">
          {ODS.map((o, i) => (
            <Reveal key={o.l} delay={i * 0.12} className="ods__card">
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="ods__in">
                <span className="ods__letter">{o.l}</span>
                <h3>{o.t}</h3>
                <p>{o.d}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const LEARN = [
  ['Riqueza é construção', 'Por que prosperidade não é sorte, privilégio ou mágica — e como a matemática trabalha a seu favor.'],
  ['Os bastidores', 'O que realmente acontece por trás da prosperidade, contado por quem atendeu mais de 20 mil pessoas.'],
  ['O método na prática', 'Como aplicar o Objetivo Claro, a Disciplina e o Saber Investir no seu dia a dia.'],
  ['Felicidade no meio', 'Como construir patrimônio sem adiar a vida para “quando chegar lá”.'],
]

export function Learn() {
  return (
    <section className="section learn">
      <div className="container">
        <Reveal as="p" className="kicker">O que você vai encontrar</Reveal>
        <Reveal as="h2" className="h2" delay={0.05}>Dentro do <span className="gold">livro</span></Reveal>
        <ul className="learn__list">
          {LEARN.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.1} className="learn__item" x={i % 2 ? 24 : -24} y={10}>
              <span className="learn__n">0{i + 1}</span>
              <div><h3>{t}</h3><p>{d}</p></div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
