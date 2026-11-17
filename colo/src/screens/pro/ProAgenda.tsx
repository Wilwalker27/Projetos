/* Painel: agenda da semana, com o link de cada chamada e a presença. */
import { useState } from 'react'
import { PROS } from '../../data/content'
import { PLANS } from '../../data/plans'
import { WD, WDS, addDays, cap, dLong, dShort, hm, now, sod, until } from '../../lib/dates'
import { proSessions, type ProSess } from '../../lib/pro'
import { MEET_DEMO, missDeadline, roomOpen, roomOpensAt } from '../../lib/sessions'
import { go } from '../../nav/router'
import { clearAlerts, setAttendance } from '../../state/actions'
import { useS } from '../../state/store'
import { Tag, colorVars, toneVars } from '../../ui/bits'
import { Icon } from '../../ui/icons'
import { toast } from '../../ui/overlay'
import { ProTop } from './ProTop'

const SRC = { diario: 'no diário', anotacao: 'nas anotações', conversa: 'na conversa' } as const

function SessCard({ x }: { x: ProSess }) {
  const S = useS()
  const { who, s } = x
  const past = s.state !== 'agendado'
  const open = (): void => {
    const o = roomOpensAt(s)
    toast(roomOpen(s) ? `Chamada aberta. No protótipo, o link é de exemplo: ${MEET_DEMO}.` : `A sala abre 10 minutos antes: ${WD[o.getDay()]}, às ${hm(o)}.`)
  }
  const missed = s.state === 'falta' || s.state === 'perdida'
  return (
    <article className={'sess' + (s.state === 'realizado' || s.state === 'perdida' ? ' past' : '')} style={toneVars(S.proAs)}>
      <div className="sess-time"><b>{hm(s.date)}</b><span>{s.dur} min</span></div>
      <div className="sess-main">
        <div className="sess-k pr-k"><i />{who.name}{who.fict && <Tag>fictício</Tag>}{s.moved && <Tag tone>Remarcado</Tag>}</div>
        <div className="sess-who">{s.kind} · {PLANS[who.plan].name}</div>
        <div className="sess-mode pr-mode"><Icon n="video" sm /><span>Online · {MEET_DEMO} (exemplo)</span></div>
        {!past && <div className="sess-acts"><button className="btn soft sm" onClick={open}>Abrir chamada</button></div>}
        {s.state === 'realizado' && <div className="pr-state ok"><Icon n="check" sm /> Sessão feita</div>}
        {s.state === 'falta' && <div className="pr-state">Faltou · pode remarcar até {until(missDeadline(s))}</div>}
        {s.state === 'perdida' && <div className="pr-state">Faltou · sessão perdida, paga a você</div>}
        {past && who.id === 'voce' && (
          <div className="seg pr-att" role="radiogroup" aria-label={`Presença de ${who.first}`}>
            <button role="radio" aria-checked={!missed} className={!missed ? 'on' : ''} onClick={() => setAttendance(s.id, false)}>Compareceu</button>
            <button role="radio" aria-checked={missed} className={missed ? 'on' : ''} onClick={() => setAttendance(s.id, true)}>Faltou</button>
          </div>
        )}
      </div>
    </article>
  )
}

export function ProAgenda() {
  const S = useS()
  const pro = S.proAs, p = PROS[pro]
  const n = now(), today = sod(n)
  const [selTs, setSel] = useState<number | null>(null)
  const mon = addDays(today, -((today.getDay() + 6) % 7))
  // o relógio do protótipo pode ter avançado: um dia fora desta semana volta para hoje
  const sel = selTs != null && selTs >= +mon && selTs < +addDays(mon, 7) ? new Date(selTs) : today
  const week = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(mon, i))
  const all = proSessions(S, pro, mon, addDays(mon, 7))
  const onDay = (d: Date): ProSess[] => all.filter((x) => +sod(x.s.date) === +d)
  const list = onDay(sod(sel))
  const alert = pro === 'ana' && S.plan !== 'aberto' ? S.alerts[S.alerts.length - 1] : undefined
  return (
    <>
      <ProTop />
      <div className="scr">
        <header><h1 className="title">Sua semana</h1><p className="lead">{p.name} · {p.role} · {p.reg}</p></header>

        {alert && (
          <section className="sos pr-alert" role="alert">
            <b>Sinal de cuidado</b>
            <p>{S.name || 'O acolhido deste aparelho'} escreveu palavras de risco {SRC[alert.src]} em {dShort(new Date(alert.d))}. O texto não é enviado. Faça contato no mesmo dia útil.</p>
            <div className="sos-acts">
              <button className="btn primary sm" onClick={() => go('pro-chat', { id: 'voce' })}><Icon n="chat" sm /> Abrir conversa</button>
              <button className="btn line sm" onClick={() => { clearAlerts(); toast('Aviso marcado como visto.') }}>Marcar como visto</button>
            </div>
          </section>
        )}

        <div className="week" role="group" aria-label="Esta semana">
          {week.map((d) => {
            const ss = onDay(d), isT = +d === +today, isS = +d === +sod(sel)
            return (
              <button key={+d} className={'wd' + (isT ? ' today' : '') + (isS ? ' on' : '')} onClick={() => setSel(+d)} aria-pressed={isS}
                aria-label={`${WD[d.getDay()]}, ${dLong(d)}${ss.length ? `, ${ss.length} ${ss.length === 1 ? 'encontro' : 'encontros'}` : ''}`}>
                <small>{WDS[d.getDay()]}</small><b>{d.getDate()}</b>
                <span className="dots">{ss.slice(0, 4).map((_, i) => <i key={i} style={colorVars(p.color)} />)}</span>
              </button>
            )
          })}
        </div>

        <div className="daylist">
          <div className="day-h">{+sod(sel) === +today ? 'Hoje' : cap(WD[sel.getDay()])}, {dLong(sel)}</div>
          {list.length ? list.map((x) => <SessCard x={x} key={x.who.id + x.s.id} />) : <div className="empty-day">Nenhum encontro neste dia.</div>}
        </div>
        <p className="tiny center">{all.length} {all.length === 1 ? 'encontro' : 'encontros'} nesta semana. Acolhidos marcados como fictícios existem só no protótipo.</p>
      </div>
    </>
  )
}
