import { Logo } from './Logo'

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__logo"><Logo size={44} /></div>
        <p className="footer__legal">
          A Grafo Capital é um escritório de assessoria de investimentos vinculado à XP Investimentos. O livro é um material de educação financeira e não constitui oferta, recomendação de investimento ou garantia de rentabilidade. Rentabilidade passada não é garantia de rentabilidade futura, e as decisões de investimento são de responsabilidade do investidor.
        </p>
        <p className="footer__copy">© {YEAR} Renaldo Gomes · Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
