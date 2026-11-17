/* Conversa: lista de mensagens e campo de envio, usados pelo acolhido e pelo painel do profissional. */
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { dShort, dkey, rel } from '../lib/dates'
import type { Msg } from '../types'
import { Icon } from './icons'

const dayLabel = (d: number): string => { const r = rel(new Date(d)); return r === 'hoje' || r === 'ontem' ? r : dShort(new Date(d)) }

/** mine: de quem é o lado direito ('me' = acolhido; 'pro' = profissional, no painel). */
export function MsgList({ msgs, mine, lead }: { msgs: Msg[]; mine: 'me' | 'pro'; lead?: string }) {
  const box = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => { const el = box.current; if (el) el.scrollTop = el.scrollHeight }, [msgs.length])
  let lastDay = ''
  return (
    <div className="msgs" id="msgs" aria-live="polite" ref={box}>
      {lead && <p className="msg sys">{lead}</p>}
      {msgs.map((m, i) => {
        if (m.from === 'day') return <div className="day-sep" key={i}>{m.x}</div>
        if (m.from === 'sys') return <p className="msg sys" key={i}>{m.x}</p>
        // mensagens novas (com data) ganham separador quando o dia muda
        let sep: string | null = null
        if (m.d != null) { const k = dkey(m.d); if (k !== lastDay) { sep = dayLabel(m.d); lastDay = k } }
        return (
          <div key={i} style={{ display: 'contents' }}>
            {sep && <div className="day-sep">{sep}</div>}
            <div className={'msg ' + (m.from === mine ? 'me' : 'them')}><p>{m.x}</p><time>{m.t}</time></div>
          </div>
        )
      })}
    </div>
  )
}

export function Composer({ placeholder, label, onSend }: { placeholder: string; label: string; onSend: (text: string) => void }) {
  const [v, setV] = useState('')
  const ta = useRef<HTMLTextAreaElement>(null)
  // o campo cresce com o texto, até 120px
  useEffect(() => {
    const t = ta.current
    if (!t) return
    t.style.height = 'auto'
    t.style.height = v ? Math.min(120, t.scrollHeight) + 'px' : ''
  }, [v])
  const send = (): void => { const text = v.trim(); if (!text) return; onSend(text); setV('') }
  const onSubmit = (e: FormEvent): void => { e.preventDefault(); send() }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() }
  }
  return (
    <form className="composer" onSubmit={onSubmit}>
      <textarea id="chat-in" ref={ta} rows={1} value={v} maxLength={1200} placeholder={placeholder} aria-label={label}
        onChange={(e) => setV(e.target.value)} onKeyDown={onKey} />
      <button className="icon-btn send" type="submit" aria-label="Enviar"><Icon n="send" sm /></button>
    </form>
  )
}
