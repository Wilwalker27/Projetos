/* Painel: conversas com cada acolhido. */
import { acolhidos, proThread } from '../../lib/pro'
import { go } from '../../nav/router'
import { useS } from '../../state/store'
import { Icon } from '../../ui/icons'
import { ProTop, Who } from './ProTop'

export function ProConversas() {
  const S = useS()
  const pro = S.proAs
  const L = acolhidos(S)
  return (
    <>
      <ProTop />
      <div className="scr">
        <header><h1 className="title">Conversas</h1><p className="lead">Você responde no horário combinado. A conversa não é canal de urgência.</p></header>
        <section className="card" style={{ padding: '6px 18px' }}>
          <ul className="rows">
            {L.map((a) => {
              const last = proThread(S, pro, a.id).filter((m) => m.from === 'me' || m.from === 'pro').pop()
              return (
                <li key={a.id}>
                  <button className="row" onClick={() => go('pro-chat', { id: a.id })}>
                    <Who a={a} />
                    <span><b>{a.name}</b><em className="pr-prev">{last ? `${last.from === 'pro' ? 'Você: ' : ''}${last.x}` : 'Nenhuma mensagem ainda.'}</em></span>
                    <Icon n="next" sm />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
        <p className="tiny center">Conversas com acolhidos fictícios existem só no protótipo.</p>
      </div>
    </>
  )
}
