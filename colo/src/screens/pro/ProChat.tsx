/* Painel: conversa com um acolhido, espelhada (o profissional fica à direita). */
import '../../styles/screens/trio.css'
import { PROS } from '../../data/content'
import { acolhidoById, proThread } from '../../lib/pro'
import { back, go } from '../../nav/router'
import { proReply } from '../../state/actions'
import { useS } from '../../state/store'
import { Bar, toneVars } from '../../ui/bits'
import { Icon } from '../../ui/icons'
import { Composer, MsgList } from '../../ui/thread'
import { Who } from './ProTop'

export function ProChat({ id }: { id?: string }) {
  const S = useS()
  const pro = S.proAs, p = PROS[pro]
  const a = id ? acolhidoById(S, id) : undefined
  if (!a) return (
    <div className="full"><Bar title="Conversa" onBack={back} />
      <div className="scr"><p className="lead">Esta conversa não está mais disponível.</p><button className="btn line" onClick={() => go('pro-conversas', { tab: true })}>Ver conversas</button></div></div>
  )
  return (
    <div className="full chat" style={toneVars(pro)}>
      <div className="bar">
        <button className="icon-btn" onClick={back} aria-label="Voltar"><Icon n="back" /></button>
        <div className="chat-who"><Who a={a} /><div><b>{a.name}</b><span>{a.fict ? 'Acolhido fictício' : 'Acolhido deste aparelho'}</span></div></div>
        <span />
      </div>
      <p className="chat-note">Você responde no horário combinado: {p.replyWindow.charAt(0).toLowerCase() + p.replyWindow.slice(1)}. Não é canal de urgência.</p>
      <MsgList msgs={proThread(S, pro, a.id)} mine="pro" />
      <Composer placeholder={`Responder para ${a.first}…`} label={`Mensagem para ${a.first}`} onSend={(t) => proReply(pro, a.id, t)} />
    </div>
  )
}
