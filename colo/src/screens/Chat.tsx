/* Conversa com cada profissional. Não é canal de urgência: o horário de resposta fica no topo. */
import '../styles/screens/trio.css'
import { useEffect, useRef } from 'react'
import { PROS } from '../data/content'
import { back } from '../nav/router'
import { sendMsg, sysMsg } from '../state/actions'
import { useS } from '../state/store'
import type { ProKey } from '../types'
import { Av, Cvv, Samu, Sos, toneVars } from '../ui/bits'
import { Icon } from '../ui/icons'
import { closeSheet, openSheet } from '../ui/overlay'
import { Composer, MsgList } from '../ui/thread'

/** Já lembramos o prazo de resposta desta conversa nesta abertura do app. */
const SENT: Partial<Record<ProKey, boolean>> = {}

export function RiskSheet({ sub }: { sub: boolean }) {
  return (
    <>
      <Sos v="risco">
        {sub && <p className="tiny" style={{ marginTop: 12 }}>A Ana recebe hoje um aviso de que você pode precisar de mais cuidado. A conversa não é canal de urgência.</p>}
      </Sos>
      <button className="btn ghost block" onClick={() => closeSheet()}>Fechar</button>
    </>
  )
}

export function Chat({ id }: { id?: string }) {
  const S = useS()
  const k: ProKey = id && id in PROS ? (id as ProKey) : 'ana'
  const p = PROS[k]
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const send = (text: string): void => {
    const { risk } = sendMsg(k, text)
    if (risk) openSheet(<RiskSheet sub={S.plan !== 'aberto'} />, 'Apoio agora')
    if (!SENT[k]) {
      SENT[k] = true
      timer.current = setTimeout(() => sysMsg(k, `${p.first} costuma responder em até 1 dia útil. Se precisar de colo antes disso, o botão no centro da tela está sempre aqui.`), 900)
    }
  }
  return (
    <div className="full chat" style={toneVars(k)}>
      <div className="bar">
        <button className="icon-btn" onClick={back} aria-label="Voltar"><Icon n="back" /></button>
        <div className="chat-who"><Av k={k} size="sm" /><div><b>{p.name}</b><span>{p.role} · {p.reply}</span></div></div>
        <span />
      </div>
      <p className="chat-note">{p.first} {p.reply}, {p.replyWindow.charAt(0).toLowerCase() + p.replyWindow.slice(1)}. Não é canal de urgência: se precisar agora, CVV <Cvv /> ou SAMU <Samu />.</p>
      <MsgList msgs={S.chats[k] || []} mine="me" lead="As primeiras mensagens são de exemplo, do protótipo." />
      <Composer placeholder={`Escreva pra ${p.first}…`} label={`Mensagem para ${p.first}`} onSend={send} />
    </div>
  )
}
