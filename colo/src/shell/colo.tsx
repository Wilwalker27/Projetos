/* Botão COLO: "Estou aqui." Uma coisa só de cada vez, com CVV 188 e SAMU 192 sempre visíveis. */
import { useState } from 'react'
import { frasesFor } from '../data/content'
import { go } from '../nav/router'
import { useS } from '../state/store'
import type { ProKey } from '../types'
import { Mark, Sos } from '../ui/bits'
import { Icon } from '../ui/icons'
import { closeSheet, openSheet } from '../ui/overlay'

/** Executa uma ação curta do app: 'breathe' | 'frase' | 'chat:<pro>' | 'session:<pausa>'. */
export function runAction(v: string): void {
  const i = v.indexOf(':'), a = i < 0 ? v : v.slice(0, i), b = i < 0 ? '' : v.slice(i + 1)
  if (a === 'frase') { openFrase(); return }
  closeSheet(true)
  if (a === 'breathe') go('breathe', { id: 'curta' })
  else if (a === 'chat') go('chat', { id: (b || 'ana') as ProKey })
  else if (a === 'session') go('session', { id: b })
}

function ColoSheet() {
  const S = useS()
  const sub = S.plan !== 'aberto'
  return (
    <>
      <div className="sh-mark"><Mark size="lg" breathe hugAfter={350} /></div>
      <h2 className="sh-t">Estou aqui{S.name ? ', ' + S.name : ''}.</h2>
      <p className="sh-p">O que te ajudaria agora? Escolha uma coisa só.</p>
      <div className="colo-opts">
        <button className="colo-opt" onClick={() => runAction('breathe')}><Icon n="wind" /><span><b>Respirar junto</b><em>1 minuto, no ritmo 5,5</em></span></button>
        <button className="colo-opt" onClick={() => runAction('session:ancora')}><Icon n="anchor" /><span><b>Voltar pro agora</b><em>Âncora 5-4-3-2-1, 3 minutos</em></span></button>
        <button className="colo-opt" onClick={() => runAction('frase')}><Icon n="quote" /><span><b>Uma frase pra segurar</b><em>Curta, pra levar com você</em></span></button>
        {sub && (
          <button className="colo-opt" onClick={() => runAction('chat:ana')}><Icon n="chat" /><span><b>Escrever pra Ana</b><em>Sua psicóloga lê e responde em até 1 dia útil</em></span></button>
        )}
      </div>
      <Sos v="colo" />
    </>
  )
}
export const openColo = (): void => openSheet(<ColoSheet />, 'COLO agora')

let FR = Math.floor(Math.random() * 7)
function FraseSheet() {
  const S = useS()
  const L = frasesFor(S.plan)
  const [i, setI] = useState(FR % L.length)
  const [fade, setFade] = useState(false)
  const next = (): void => {
    setFade(true)
    setTimeout(() => { FR = (i + 1) % L.length; setI(FR); setFade(false) }, 250)
  }
  return (
    <>
      <div className="eyebrow" style={{ marginTop: 6 }}>Pra segurar</div>
      <p className="frase-x" aria-live="polite" style={{ opacity: fade ? 0 : 1 }}>{L[i]}</p>
      <div className="sh-acts">
        <button className="btn line" onClick={next}>Outra frase</button>
        <button className="btn primary" onClick={() => closeSheet()}>Guardei</button>
      </div>
    </>
  )
}
export const openFrase = (): void => openSheet(<FraseSheet />, 'Uma frase pra segurar')
