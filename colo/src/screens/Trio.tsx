/* Seu trio: cartões dos três profissionais. No COLO Aberto é uma vitrine, sem preço e sem conversa. */
import '../styles/screens/trio.css'
import { ORDER, PROS } from '../data/content'
import { dkey, now } from '../lib/dates'
import { go } from '../nav/router'
import { markComb } from '../state/actions'
import { useS } from '../state/store'
import type { PaidPlanKey, ProKey } from '../types'
import { Av, TopBar, toneVars } from '../ui/bits'
import { Icon } from '../ui/icons'
import { closeSheet, openSheet, toast } from '../ui/overlay'

function CombSheet({ k }: { k: ProKey }) {
  const S = useS()
  const p = PROS[k], c = S.comb[k] || 0, g = p.comb.goal
  const done = S.combDay[k] === dkey(now())
  return (
    <>
      <div className="eyebrow" style={{ marginTop: 6 }}>Combinado da semana com {p.first}</div>
      <h2 className="sh-t">{p.comb.text}</h2>
      <p className="sh-p">{c >= g ? 'Combinado cumprido. O que vier agora é bônus.' : `Você fez ${c} de ${g} nesta semana.`}</p>
      <div className="sh-acts">
        <button className="btn line" onClick={() => { closeSheet(true); go('agenda', { tab: true }) }}>Ver agenda</button>
        <button className="btn primary" disabled={done} onClick={() => { if (markComb(k)) toast(S.tone === 'quieta' ? 'Anotado.' : `Anotado com carinho. ${p.first} vai ver.`) }}>
          {done ? 'Feito hoje' : 'Fiz hoje'}
        </button>
      </div>
    </>
  )
}

export function Trio() {
  const S = useS()
  const sub = S.plan !== 'aberto'
  return (
    <>
      <TopBar />
      <div className="scr">
        <header>
          <h1 className="title">{sub ? 'Seu trio' : 'O trio do COLO'}</h1>
          <p className="lead">{sub
            ? 'Três profissionais, um cuidado só. Com a sua autorização, eles trocam notas uma vez por mês.'
            : 'Três profissionais que cuidam da mesma pessoa e conversam entre si. Conheça sem pressa.'}</p>
        </header>
        {ORDER.map((k) => {
          const p = PROS[k]
          return (
            <article className="pro" style={toneVars(k)} key={k}>
              <div className="pro-top"><Av k={k} size="lg" /><div><div className="eyebrow">{p.area}</div><h2>{p.name}</h2><span className="pro-reg">{p.role} · {p.reg}</span></div></div>
              <p className="pro-bio">{p.bio}</p>
              <dl className="pro-dl">
                <div><dt>Abordagem</dt><dd>{p.approach}</dd></div>
                {sub && <div><dt>Ritmo</dt><dd>{p.rhythm[S.plan as PaidPlanKey]}</dd></div>}
              </dl>
              {sub && (
                <div className="pro-acts">
                  <button className="btn primary sm" onClick={() => go('chat', { id: k })}><Icon n="chat" sm /> Conversar</button>
                  <button className="btn line sm" onClick={() => openSheet(<CombSheet k={k} />, `Combinado com ${p.first}`)}>Ver combinado</button>
                </div>
              )}
            </article>
          )
        })}
        {sub ? (
          <p className="tiny center">Quer trocar de profissional? Pode pedir quando quiser, sem precisar explicar.</p>
        ) : (
          <section className="callout">
            <b>Como seria com você</b>
            <p>Tudo individual e online. Antes de qualquer decisão, tem uma conversa de boas-vindas, gratuita e sem compromisso.</p>
            <div><button className="btn line sm" style={{ marginTop: 6 }} onClick={() => go('planos')}>Ver como funciona</button></div>
          </section>
        )}
        <p className="tiny center tr-proto">Protótipo: profissionais e registros fictícios.</p>
      </div>
    </>
  )
}
