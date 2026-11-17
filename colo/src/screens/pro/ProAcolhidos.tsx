/* Painel: lista de acolhidos, com focos, check-ins recentes e o combinado da área. */
import { FOCOS, PROS } from '../../data/content'
import { PLANS } from '../../data/plans'
import { acolhidos } from '../../lib/pro'
import { go } from '../../nav/router'
import { useS } from '../../state/store'
import { Tag } from '../../ui/bits'
import { Icon } from '../../ui/icons'
import { Checkins, ProTop, Who } from './ProTop'

export function ProAcolhidos() {
  const S = useS()
  const pro = S.proAs, p = PROS[pro]
  const L = acolhidos(S)
  return (
    <>
      <ProTop />
      <div className="scr">
        <header><h1 className="title">Acolhidos</h1><p className="lead">Quem você acompanha no COLO. Cada pessoa decide o que o trio pode ver.</p></header>
        {L.map((a) => (
          <button className="pr-card" key={a.id} onClick={() => go('pro-acolhido', { id: a.id })}>
            <span className="pr-head"><Who a={a} /><span><b>{a.name}</b><em>{PLANS[a.plan].name}{a.fict ? ' · fictício' : ' · este aparelho'}</em></span><Icon n="next" /></span>
            <span className="pr-tags">{a.focuses.map((f) => <Tag key={f}>{FOCOS.find((x) => x.k === f)?.t}</Tag>)}</span>
            <Checkins a={a} />
            <span className="pr-line">{p.comb.text}: {a.comb[pro] || 0} de {p.comb.goal} nesta semana</span>
          </button>
        ))}
        {S.plan === 'aberto' && <p className="tiny center">A pessoa deste aparelho está no COLO Aberto, por isso não aparece aqui. O trio só acompanha quem tem plano.</p>}
      </div>
    </>
  )
}
