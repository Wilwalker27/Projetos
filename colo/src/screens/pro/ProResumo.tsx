/* Painel: resumo do mês. Sessões feitas, faltas e valor a receber. */
import { useState } from 'react'
import { PROS } from '../../data/content'
import { brl } from '../../data/plans'
import { MES, cap, monthRange, now } from '../../lib/dates'
import { acolhidos, monthSummary, proSessions } from '../../lib/pro'
import { useS } from '../../state/store'
import { ProTop } from './ProTop'

const pl = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

export function ProResumo() {
  const S = useS()
  const pro = S.proAs
  const [prev, setPrev] = useState(false)
  const n = now()
  const ref = prev ? new Date(n.getFullYear(), n.getMonth() - 1, 1) : n
  const m = monthSummary(S, pro, ref, n)
  const [a, b] = monthRange(ref)
  const L = proSessions(S, pro, a, b, n)
  const by = acolhidos(S, n).map((who) => {
    const mine = L.filter((x) => x.who.id === who.id)
    return { who, done: mine.filter((x) => x.s.state === 'realizado').length, missed: mine.filter((x) => x.s.state === 'perdida').length }
  }).filter((x) => x.done + x.missed > 0)
  const paid = m.done + m.missed
  return (
    <>
      <ProTop />
      <div className="scr">
        <header><h1 className="title">Resumo de {MES[ref.getMonth()]}</h1><p className="lead">{PROS[pro].name} · {PROS[pro].service}</p></header>
        <div className="seg" role="radiogroup" aria-label="Mês do resumo">
          <button role="radio" aria-checked={!prev} className={!prev ? 'on' : ''} onClick={() => setPrev(false)}>Este mês</button>
          <button role="radio" aria-checked={prev} className={prev ? 'on' : ''} onClick={() => setPrev(true)}>Mês passado</button>
        </div>

        <div className="counts pr-month">
          <div className="count"><b>{m.done}</b><span>{m.done === 1 ? 'sessão feita' : 'sessões feitas'}</span></div>
          <div className="count"><b>{m.missed}</b><span>{m.missed === 1 ? 'falta paga' : 'faltas pagas'}</span></div>
          <div className="count"><b>{m.ahead}</b><span>por vir</span></div>
        </div>

        <section className="card">
          <div className="eyebrow">{prev ? `Recebido em ${MES[ref.getMonth()]}` : 'A receber até agora'}</div>
          <div className="pr-total">{brl(m.total)}</div>
          <p className="tiny">{pl(paid, 'sessão', 'sessões')} × {brl(m.rate)}. Sessão perdida também é paga. O repasse cai direto na sua conta a cada pagamento.</p>
          {m.open > 0 && <p className="tiny" style={{ marginTop: 6 }}>{pl(m.open, 'falta ainda pode ser remarcada', 'faltas ainda podem ser remarcadas')} e não {m.open === 1 ? 'entra' : 'entram'} no valor por enquanto.</p>}
        </section>

        <section className="card">
          <div className="sec-h"><h2>Por acolhido</h2></div>
          {by.length ? (
            <ul className="pr-by">{by.map((x) => (
              <li key={x.who.id}><span>{x.who.name}</span><span>{pl(x.done, 'feita', 'feitas')}{x.missed ? ` · ${pl(x.missed, 'falta', 'faltas')}` : ''}</span></li>
            ))}</ul>
          ) : <p className="tiny" style={{ marginTop: 8 }}>Nenhuma sessão em {cap(MES[ref.getMonth()])} até agora.</p>}
        </section>
        <p className="tiny center">Valores de exemplo, com acolhidos fictícios.</p>
      </div>
    </>
  )
}
