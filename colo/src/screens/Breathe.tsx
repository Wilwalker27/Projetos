/* Respiração 5,5: uma esfera que cresce e encolhe a cada 5,5 segundos.
   1, 2 ou 5 minutos (5, 11 ou 27 respirações). Dá pra pausar e continuar quando quiser. */
import '../styles/screens/pausas.css'
import { useEffect, useRef, useState } from 'react'
import { back } from '../nav/router'
import { logPause } from '../state/actions'
import { useS } from '../state/store'
import { Bar, cx } from '../ui/bits'
import { Icon } from '../ui/icons'
import { Finish } from './Finish'

const DURS: [number, string][] = [[5, '1 min'], [11, '2 min'], [27, '5 min']]
const HALF = 5500
const START = 'Quando quiser, é só começar.'

/** Andamento do exercício fora do React: quem conta as respirações é o timer. */
interface Run { done: number; phase: 'in' | 'out'; started: boolean; t?: ReturnType<typeof setTimeout> }
const freshRun = (): Run => ({ done: 0, phase: 'out', started: false })

function BreatheRun({ short }: { short: boolean }) {
  const S = useS()
  const [brd, setBrd] = useState(short ? 5 : 11)
  const [run, setRun] = useState(false)
  const [big, setBig] = useState(false)
  const [label, setLabel] = useState(START)
  /** Respirações completas, ou null antes de começar. */
  const [done, setDone] = useState<number | null>(null)
  const [fin, setFin] = useState(false)
  const R = useRef<Run>(freshRun())

  // ao sair da tela, o timer para
  useEffect(() => () => clearTimeout(R.current.t), [])

  const tick = (total: number): void => {
    const r = R.current
    if (r.phase === 'out') {
      if (r.started) r.done++
      r.started = true
      if (r.done >= total) { setRun(false); logPause(); setFin(true); return }
      setBig(true); setLabel('Inspire devagar'); r.phase = 'in'
    } else {
      setBig(false); setLabel('Solte o ar'); r.phase = 'out'
    }
    setDone(r.done)
    r.t = setTimeout(() => tick(total), HALF)
  }
  const toggle = (): void => {
    const r = R.current
    clearTimeout(r.t)
    if (run) {
      setRun(false); setBig(false); setLabel('Pausado. Continue quando quiser.')
    } else {
      setRun(true); r.started = false; r.phase = 'out'
      tick(brd)
    }
  }
  const pickDur = (n: number): void => {
    clearTimeout(R.current.t)
    R.current = freshRun()
    setBrd(n); setRun(false); setBig(false); setLabel(START); setDone(null)
  }

  return (
    <div className="full br-screen">
      <Bar title="Respiração 5,5" onBack={back} close />
      {fin ? (
        <Finish msg={`${brd} respirações no seu ritmo. ${S.tone === 'empurrao' ? 'Corpo mais leve, cabeça mais clara. Bora seguir?' : 'Que bom que você tirou esse tempo pra você.'}`} />
      ) : (
        <div className="br-body" id="br-body">
          <div className="durs" role="radiogroup" aria-label="Duração">
            {DURS.map(([n, t]) => (
              <button key={n} className={cx('chip', brd === n && 'on')} role="radio" aria-checked={brd === n} onClick={() => pickDur(n)}>{t}</button>
            ))}
          </div>
          <div className="orb-wrap" aria-hidden="true"><div className="orb-halo" /><div className={cx('orb', big && 'big')} id="orb" /></div>
          <p className="br-label" id="br-label" aria-live="polite">{label}</p>
          <p className="br-count" id="br-count">
            {done == null ? `${brd} respirações · cerca de ${Math.max(1, Math.round(brd * 11 / 60))} min` : `Respiração ${done + 1} de ${brd}`}
          </p>
          <button className="btn primary" id="br-go" onClick={toggle}>
            {run ? <><Icon n="pause" sm /> Pausar</> : <><Icon n="play" sm /> {done != null ? 'Continuar' : 'Começar'}</>}
          </button>
          <p className="br-why">Respirar devagar, perto de seis vezes por minuto, costuma desacelerar o coração e acalmar o corpo. Inspire pelo nariz e solte pela boca, sem forçar.</p>
        </div>
      )}
    </div>
  )
}

/** id 'curta' começa em 1 minuto (atalhos do check-in e do botão COLO); senão, 2 minutos. */
export function Breathe({ id }: { id?: string }) {
  return <BreatheRun key={id ?? ''} short={id === 'curta'} />
}
