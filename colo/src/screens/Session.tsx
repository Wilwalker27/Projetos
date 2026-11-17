/* Pausa guiada: um passo de cada vez, com contagem (anel) ou campo de escrita.
   Nas telas de escrita, o apoio de crise (CVV 188 e SAMU 192) está sempre à vista;
   se aparecerem palavras de risco, ele cresce na hora. */
import '../styles/screens/pausas.css'
import { useEffect, useRef, useState } from 'react'
import { PAUSAS, PROS } from '../data/content'
import { fmtS } from '../lib/dates'
import { hasRisk } from '../lib/risk'
import { back, go } from '../nav/router'
import { addJournal, logPause, noticeRisk } from '../state/actions'
import { useS } from '../state/store'
import type { Pausa } from '../types'
import { Bar, Sos, toneVars } from '../ui/bits'
import { Icon } from '../ui/icons'
import { Finish, RiskSos } from './Finish'

function Guided({ x }: { x: Pausa }) {
  const S = useS()
  const sub = S.plan !== 'aberto'
  const steps = x.steps ?? []
  const N = steps.length
  const [i, setI] = useState(0)
  const [ans, setAns] = useState<string[]>([])
  const [left, setLeft] = useState(steps[0]?.s ?? 0)
  const [paused, setPaused] = useState(false)
  const [fin, setFin] = useState<{ msg: string; risk: boolean } | null>(null)
  const st = steps[i]

  const finished = useRef(false)
  const finish = (): void => {
    if (finished.current) return
    finished.current = true
    let msg: string, risk = false
    if (x.journal) {
      const items = steps.map((s, j) => ({ q: s.t, a: (ans[j] || '').trim() })).filter((it) => it.a)
      risk = addJournal(x.title, items)
      msg = items.length
        ? 'Suas linhas ficaram guardadas na sua Jornada. Só você vê.'
        : 'Às vezes só pensar já basta. O diário fica aqui quando quiser escrever.'
    } else {
      msg = S.tone === 'empurrao'
        ? (sub ? `Mais uma pausa na conta. ${PROS[x.by].first} vai gostar de saber.` : 'Mais uma pausa na conta.')
        : 'Que bom que você tirou esse tempo pra você.'
    }
    logPause()
    setFin({ msg, risk })
  }
  const show = (j: number): void => { setI(j); setLeft(steps[j].s ?? 0); setPaused(false) }
  const next = (): void => { if (i >= N - 1) finish(); else show(i + 1) }
  const prev = (): void => { if (i > 0) show(i - 1) }

  // a contagem lê sempre o estado mais recente (respostas, passo, pausa)
  const live = useRef({ next, paused })
  useEffect(() => { live.current = { next, paused } })

  // contagem do passo: 1 segundo por vez; 800 ms depois do zero, segue sozinha
  const secs = fin ? 0 : st?.s ?? 0
  useEffect(() => {
    if (!secs) return
    let n = secs
    let after: ReturnType<typeof setTimeout> | undefined
    const iv = setInterval(() => {
      if (live.current.paused) return
      n--
      setLeft(n)
      if (n <= 0) { clearInterval(iv); after = setTimeout(() => live.current.next(), 800) }
    }, 1000)
    return () => { clearInterval(iv); clearTimeout(after) }
  }, [i, secs])

  const risk = ans.some((a) => hasRisk(a))
  // a tela diz que a Ana é avisada: o aviso sai já, não só ao concluir
  useEffect(() => { if (risk && sub) noticeRisk('diario') }, [risk, sub])

  return (
    <div className="full session" style={toneVars(x.by)}>
      <Bar title={x.title} onBack={back} close />
      {fin ? (
        <Finish msg={fin.msg}>{fin.risk && <RiskSos sub={sub} />}</Finish>
      ) : st && (
        <div className="sp" id="sp">
          <div className="sp-prog" aria-hidden="true">
            {steps.map((s, j) => <span key={s.t} className={j < i ? 'done' : j === i ? 'on' : undefined} />)}
          </div>
          <div className="sp-step" key={i}>
            <div className="eyebrow">Passo {i + 1} de {N}</div>
            <h2 className="sp-t">{st.t}</h2>
            <p className="sp-d">{st.d}</p>
            {st.input && (
              <>
                <label htmlFor="sp-in" className="pa-sr">{st.t}</label>
                <textarea
                  id="sp-in" className="sp-in" rows={4} placeholder="Escreva do seu jeito. Só você vê." value={ans[i] || ''}
                  onChange={(e) => { const v = e.target.value; setAns((a) => { const b = [...a]; b[i] = v; return b }) }}
                />
                <p className="tiny pa-priv">
                  {sub
                    ? 'Só você vê. Se aparecerem palavras de risco, o COLO mostra apoio na hora e avisa a Ana, sem enviar o seu texto.'
                    : 'Só você vê.'}
                </p>
                {risk ? <RiskSos sub={sub} /> : <Sos v="diario" />}
              </>
            )}
            {!!st.s && (
              <div className="sp-timer" role="timer" aria-label="Tempo restante">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle className="ring-bg" cx="50" cy="50" r="44" />
                  <circle id="sp-ring" className="ring-fg" cx="50" cy="50" r="44" pathLength={100} style={{ strokeDasharray: `${(100 * left / st.s).toFixed(2)} 100` }} />
                </svg>
                <span id="sp-left">{fmtS(Math.max(0, left))}</span>
              </div>
            )}
          </div>
          <div className="sp-ctrl">
            <button className="btn ghost" onClick={prev} disabled={i === 0}><Icon n="back" sm /> Voltar</button>
            {!!st.s && (
              <button className="icon-btn big" id="sp-pp" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Continuar' : 'Pausar'}>
                <Icon n={paused ? 'play' : 'pause'} />
              </button>
            )}
            <button className="btn primary" onClick={next}>{i === N - 1 ? 'Concluir' : 'Próximo'} <Icon n="next" sm /></button>
          </div>
        </div>
      )}
    </div>
  )
}

/** id desconhecido abre a Âncora 5-4-3-2-1; a Respiração 5,5 tem tela própria. */
export function Session({ id }: { id?: string }) {
  const x = PAUSAS.find((z) => z.id === id) ?? PAUSAS[1]
  const breathe = x.special === 'breathe'
  useEffect(() => { if (breathe) go('breathe', { replace: true }) }, [breathe])
  if (breathe) return null
  return <Guided key={x.id} x={x} />
}
