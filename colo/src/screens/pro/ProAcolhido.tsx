/* Painel: um acolhido. Nota privada (só o profissional vê) e nota para o trio (com consentimento). */
import { useState } from 'react'
import { FOCOS, ORDER, PROS } from '../../data/content'
import { PLANS } from '../../data/plans'
import { WD, dShort, hm, now } from '../../lib/dates'
import { acolhidoById, proNote, type Acolhido } from '../../lib/pro'
import { nextWith } from '../../lib/sessions'
import { back, go } from '../../nav/router'
import { setProNote } from '../../state/actions'
import { useS } from '../../state/store'
import type { ProKey } from '../../types'
import { Av, Bar, Ring, Tag } from '../../ui/bits'
import { Icon } from '../../ui/icons'
import { toast } from '../../ui/overlay'
import { Checkins } from './ProTop'

function Notes({ a, pro }: { a: Acolhido; pro: ProKey }) {
  const S = useS()
  const cur = proNote(S, pro, a.id)
  const [priv, setPriv] = useState(cur.priv)
  const [shared, setShared] = useState(cur.shared)
  const p = PROS[pro]
  const others = ORDER.filter((k) => k !== pro)
  return (
    <>
      <section className="card pr-note">
        <div className="sec-h"><h2>Nota privada</h2><span className="tiny">só você vê</span></div>
        <label className="sr" htmlFor="pr-priv">Nota privada sobre {a.first}</label>
        <textarea id="pr-priv" className="field" rows={4} value={priv} maxLength={4000} onChange={(e) => setPriv(e.target.value)} />
        <button className="btn soft sm" disabled={priv === cur.priv} onClick={() => { setProNote(pro, a.id, cur, { priv }); toast('Nota privada guardada. Só você vê.') }}>Guardar</button>
        <p className="tiny">Não vai para o trio nem para {a.first}.</p>
      </section>

      <section className="card pr-note">
        <div className="sec-h"><h2>Nota para o trio</h2></div>
        {a.share[pro] ? (
          <>
            <label className="sr" htmlFor="pr-shared">Nota de {p.service} para o trio</label>
            <textarea id="pr-shared" className="field" rows={4} value={shared} maxLength={4000} onChange={(e) => setShared(e.target.value)} />
            <button className="btn soft sm" disabled={shared === cur.shared} onClick={() => {
              setProNote(pro, a.id, cur, { shared, sharedAt: now().getTime() }); toast(`Nota compartilhada com o trio e com ${a.first}.`)
            }}>Compartilhar</button>
            <p className="tiny">Vai para {others.map((k) => PROS[k].first).join(' e ')} e aparece na Jornada de {a.first}.</p>
          </>
        ) : (
          <div className="callout"><p>{a.first} não autorizou a troca de notas de {p.service} com o trio.</p></div>
        )}
      </section>

      <section className="card">
        <div className="sec-h"><h2>Notas do trio</h2></div>
        <ul className="pr-trio" style={{ marginTop: 12 }}>
          {others.map((k) => {
            const x = proNote(S, k, a.id).shared.trim()
            return (
              <li key={k}><Av k={k} size="sm" /><div><small>{PROS[k].first} · {PROS[k].area}</small>
                <p>{!a.share[k] ? `${a.first} não autorizou a troca de notas de ${PROS[k].service}.` : x || 'Ainda sem nota compartilhada.'}</p></div></li>
            )
          })}
        </ul>
      </section>
    </>
  )
}

export function ProAcolhido({ id }: { id?: string }) {
  const S = useS()
  const pro = S.proAs, p = PROS[pro]
  const a = id ? acolhidoById(S, id) : undefined
  if (!a) return (
    <div className="full"><Bar title="Acolhido" onBack={back} />
      <div className="scr"><p className="lead">Este acolhido não está mais na sua lista.</p><button className="btn line" onClick={() => go('pro-acolhidos', { tab: true })}>Ver acolhidos</button></div></div>
  )
  const next = nextWith(a.care, pro)
  const c = a.comb[pro] || 0
  return (
    <div className="full">
      <Bar title={a.first} onBack={back} />
      <div className="scr">
        <header><h1 className="title">{a.name}</h1><p className="lead">{PLANS[a.plan].name} · {a.fict ? 'acolhido fictício' : 'acolhido deste aparelho'}</p></header>

        <section className="card pr-box">
          <div className="eyebrow">O que quer cuidar</div>
          <div className="pr-tags">{a.focuses.length ? a.focuses.map((f) => <Tag key={f}>{FOCOS.find((x) => x.k === f)?.t}</Tag>) : <span className="tiny">Ainda não escolheu focos.</span>}</div>
          <div className="eyebrow">Check-ins recentes</div>
          <Checkins a={a} />
          <div className="eyebrow">Combinado da semana</div>
          <div className="pr-comb">
            <div className="ring-wrap"><Ring id={`pro-${a.id}-${pro}`} v={c} goal={p.comb.goal} color={p.color} /><span className="ring-n"><span>{c}<small>/{p.comb.goal}</small></span></span></div>
            <div className="comb-txt"><b>{p.comb.text}</b><span>{c >= p.comb.goal ? 'Combinado cumprido.' : `${c} de ${p.comb.goal} nesta semana`}</span></div>
          </div>
          <div className="eyebrow">Próximo encontro com você</div>
          <span className="pr-line"><Icon n="cal" sm /> {next ? `${WD[next.date.getDay()]}, ${dShort(next.date)}, ${hm(next.date)} · online` : 'Nenhum encontro marcado.'}</span>
        </section>

        <Notes a={a} pro={pro} key={pro + a.id} />

        <button className="btn primary block" onClick={() => go('pro-chat', { id: a.id })}><Icon n="chat" sm /> Conversar com {a.first}</button>
      </div>
    </div>
  )
}
