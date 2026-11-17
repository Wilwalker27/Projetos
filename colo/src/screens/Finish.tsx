/* Tela "Pronto.", no fim de uma pausa (respiração ou pausa guiada), e o apoio de crise
   das telas de escrita. O símbolo fecha o abraço 350 ms depois, como na referência. */
import '../styles/screens/pausas.css'
import { useEffect, useRef, type ReactNode } from 'react'
import { go } from '../nav/router'
import { Mark, Sos } from '../ui/bits'

/** Apoio de crise quando aparecem palavras de risco. Para quem tem plano, conta que a Ana é avisada, sem o texto. */
export function RiskSos({ sub }: { sub: boolean }) {
  return (
    <Sos v="risco">
      {sub && <p className="tiny">A Ana recebe hoje um aviso de que você pode precisar de mais cuidado. O que você escreveu continua só seu.</p>}
    </Sos>
  )
}

/** Fim da pausa. children entra entre a mensagem e os botões (ex.: apoio de crise). */
export function Finish({ msg, children }: { msg: string; children?: ReactNode }) {
  const h = useRef<HTMLHeadingElement>(null)
  // quem usa leitor de tela ou teclado chega junto: o foco vai para o "Pronto."
  useEffect(() => { h.current?.focus({ preventScroll: true }) }, [])
  return (
    <div className="fin">
      <div><Mark size="xl" hugAfter={350} /></div>
      <h2 className="fin-t" ref={h} tabIndex={-1}>Pronto.</h2>
      <p className="fin-p">{msg}</p>
      {children}
      <div className="fin-acts">
        <button className="btn primary block" onClick={() => go('home', { tab: true })}>Voltar ao início</button>
        <button className="btn ghost block" onClick={() => go('pausas', { tab: true })}>Outra pausa</button>
      </div>
    </div>
  )
}
