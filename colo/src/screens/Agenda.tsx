/* Agenda: semana com pontos por área, encontros do dia, próximos encontros, remarcação
   (1 por mês em cada área; falta pode ser remarcada em até 12 horas) e o mês no plano.
   No COLO Aberto não há encontros: a tela explica com calma e aponta para o que continua com a pessoa. */
import '../styles/screens/agenda.css'
import { Fragment, useState } from 'react'
import { ORDER, PROS } from '../data/content'
import { RULES } from '../data/plans'
import { hardMoodNear } from '../lib/invite'
import { HOUR, MES, WD, WDS, addDays, cap, dLong, dShort, hm, monthRange, now, rel, sameDay, sod, until } from '../lib/dates'
import {
  MEET_DEMO, canResched, missDeadline, reschedLeft, roomOpen, roomOpensAt, sessionsBetween, slotsFor, upcoming,
  type ReschedWhy, type Sess,
} from '../lib/sessions'
import { go } from '../nav/router'
import { reschedule } from '../state/actions'
import { getS, useS, type State } from '../state/store'
import { Av, Tag, TopBar, cx, toneVars } from '../ui/bits'
import { Icon } from '../ui/icons'
import { closeSheet, openSheet, toast } from '../ui/overlay'

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

/* ---------- remarcar (painel) ---------- */
/** O mesmo encontro, lido de novo do estado (a situação pode ter mudado desde que o cartão foi desenhado). */
function current(S: State, s: Sess): Sess {
  return sessionsBetween(S, addDays(s.orig, -60), addDays(s.orig, 60)).find((x) => x.id === s.id) ?? s
}
/** Horários de slotsFor() que não repetem o horário atual nem caem em cima de outro encontro. */
function freeSlots(S: State, s: Sess): Date[] {
  const n = now()
  return slotsFor(s, n).filter((d) => {
    if (d <= n || d.getTime() === s.date.getTime()) return false
    const a = d.getTime(), b = a + s.dur * 60000
    return !sessionsBetween(S, new Date(a - 2 * HOUR), new Date(b)).some((x) => x.id !== s.id && x.date.getTime() < b && x.date.getTime() + x.dur * 60000 > a)
  })
}

function reason(s: Sess, why: ReschedWhy): string {
  const p = PROS[s.pro], m = s.orig.getMonth()
  if (why === 'sem-saldo') return `Você já usou a remarcação de ${p.service} de ${MES[m]}. Ela volta em 1º de ${MES[(m + 1) % 12]}.`
  if (why === 'ja-remarcado') return 'Este encontro já foi remarcado uma vez, e só dá pra remarcar cada encontro uma vez.'
  if (why === 'pausado') return 'Seu plano está em pausa. Quando você retomar, em Ajustes, dá pra escolher um novo horário.'
  if (why === 'fora-do-prazo') return `O prazo de ${RULES.missWindowH} horas para remarcar esta falta já passou.`
  return 'Este encontro já aconteceu.'
}

function ReschedSheet({ s }: { s: Sess }) {
  // a situação é lida uma vez, ao abrir: o painel não muda de conteúdo enquanto desce
  const [v] = useState(() => {
    const S = getS(), cur = current(S, s)
    return { cur, chk: canResched(S, cur), slots: freeSlots(S, cur) }
  })
  const { cur, chk, slots } = v
  const p = PROS[cur.pro]
  const write = (): void => { closeSheet(); go('chat', { id: cur.pro }) }

  if (!chk.ok) {
    const past = cur.state !== 'agendado'
    return (
      <>
        <h2 className="sh-t" style={{ marginTop: 6 }}>Desta vez, não dá pra remarcar</h2>
        <p className="sh-p">{reason(cur, chk.why)}</p>
        {chk.why !== 'realizado' && (
          <div className="callout">
            <p>
              {past ? 'Tudo bem: o encontro fica como perdido e o próximo continua marcado.' : 'Se não der pra vir, tudo bem: o encontro fica como perdido e o próximo continua marcado.'}
              {' '}O horário reservado é pago a {p.first}, por isso não dá pra repor.
            </p>
          </div>
        )}
        <div className="sh-acts ag-acts">
          <button className="btn primary" onClick={() => closeSheet()}>Entendi</button>
          <button className="btn line" onClick={write}>Escrever pra {p.first}</button>
        </div>
      </>
    )
  }

  const pick = (d: Date): void => {
    // confere de novo na hora de escolher: o prazo da falta pode ter passado com o painel aberto
    const S = getS(), fresh = current(S, cur)
    if (!canResched(S, fresh).ok || d <= now()) { openResched(fresh); return }
    reschedule(fresh.id, d.getTime())
    closeSheet()
    toast(`Remarcado para ${WD[d.getDay()]}, ${dShort(d)}, ${hm(d)}. ${p.first} confirma por mensagem.`)
  }
  return (
    <>
      <h2 className="sh-t" style={{ marginTop: 6 }}>Remarcar com {p.first}</h2>
      <p className="sh-p">Escolha um horário livre. {p.first} confirma por mensagem.</p>
      <div className="callout">
        <p>Você tem {plural(RULES.reschedPerMonth, 'remarcação', 'remarcações')} de {p.service} em {MES[cur.orig.getMonth()]}. Depois de usar, ela volta no mês seguinte.</p>
      </div>
      {slots.length ? (
        <div className="slots">
          {slots.map((d) => (
            <button key={d.getTime()} className="slot" onClick={() => pick(d)}>{cap(WD[d.getDay()])}, {dShort(d)} · {hm(d)}</button>
          ))}
        </div>
      ) : (
        <div className="empty-day">
          Nenhum horário livre nos próximos dias. {p.first} pode achar um com você.<br />
          <button className="link" style={{ marginTop: 6 }} onClick={write}>Escrever pra {p.first}</button>
        </div>
      )}
      <button className="btn ghost block" onClick={() => closeSheet()}>Manter como está</button>
    </>
  )
}
function openResched(s: Sess): void { openSheet(<ReschedSheet s={s} />, 'Remarcar') }

/* ---------- cartão de encontro ---------- */
function enter(s: Sess): void {
  if (roomOpen(s)) { toast(`Sala aberta. No protótipo, o link é de exemplo: ${MEET_DEMO}.`); return }
  const o = roomOpensAt(s)
  toast(`A sala abre 10 minutos antes: ${WD[o.getDay()]}, às ${hm(o)}.`)
}

function SessCard({ s, paused }: { s: Sess; paused: boolean }) {
  const p = PROS[s.pro]
  // encontro que já começou e ainda não terminou: a sala continua aberta
  const live = s.state === 'realizado' && roomOpen(s)
  const past = (s.state === 'realizado' && !live) || s.state === 'perdida'
  return (
    <article className={cx('sess', past && 'past')} style={toneVars(s.pro)}>
      <div className="sess-time"><b>{hm(s.date)}</b><span>{s.dur} min</span></div>
      <div className="sess-main">
        <div className="sess-k ag-k"><i />{s.kind}{s.moved && <Tag tone>Remarcado</Tag>}</div>
        <div className="sess-who"><Av k={s.pro} size="xs" /> {p.name}</div>
        <div className="sess-mode"><Icon n={s.ic} sm /> {s.mode}</div>
        {s.state === 'agendado' && (
          <div className="sess-acts">
            <button className="btn soft sm" onClick={() => enter(s)}>Entrar na sala</button>
            <button className="btn ghost sm" onClick={() => openResched(s)}>Remarcar</button>
          </div>
        )}
        {live && (
          <>
            <p className="ag-line">Está acontecendo agora.</p>
            <div className="sess-acts"><button className="btn soft sm" onClick={() => enter(s)}>Entrar na sala</button></div>
          </>
        )}
        {s.state === 'realizado' && !live && <div className="sess-done"><Icon n="check" sm /> Encontro realizado</div>}
        {s.state === 'falta' && (
          <>
            <p className="ag-line">Você não pôde vir. Dá pra remarcar até {until(missDeadline(s))}.</p>
            <div className="sess-acts"><button className="btn soft sm" onClick={() => openResched(s)}>Remarcar</button></div>
          </>
        )}
        {s.state === 'perdida' && (
          <>
            <div className="sess-done ag-lost"><i className="ag-ring" /> Encontro perdido</div>
            <p className="tiny">{paused ? 'Acontece.' : 'Acontece. O próximo continua marcado.'}</p>
            <button className="link ag-why" onClick={() => openResched(s)}>Por que não dá pra remarcar?</button>
          </>
        )}
      </div>
    </article>
  )
}

/* ---------- COLO Aberto ---------- */
function AgendaAberto({ S }: { S: State }) {
  const talk = S.welcomeTalk != null && S.welcomeTalk > now().getTime() ? new Date(S.welcomeTalk) : null
  return (
    <>
      <TopBar />
      <div className="scr">
        <header>
          <h1 className="title">Agenda</h1>
          <p className="lead">Aqui ficam os encontros com o trio, para quem tem um plano de cuidado.</p>
        </header>
        {talk && (
          <div className="daylist">
            <div className="day-h">{cap(rel(talk))} · {WD[talk.getDay()]}, {dShort(talk)}</div>
            <article className="sess ag-talk">
              <div className="sess-time"><b>{hm(talk)}</b></div>
              <div className="sess-main">
                <div className="sess-k"><i />Conversa de boas-vindas</div>
                <div className="sess-mode"><Icon n="video" sm /> Online, por vídeo · gratuita, sem compromisso</div>
                <button className="link ag-why" onClick={() => go('planos')}>Trocar horário</button>
              </div>
            </article>
          </div>
        )}
        <div className="empty-day">
          No COLO Aberto não há encontros marcados. As pausas, o diário e o bilhete do dia continuam com você.<br />
          <button className="link" style={{ marginTop: 6 }} onClick={() => go('pausas', { tab: true })}>Ver pausas</button>
        </div>
        {!hardMoodNear(S) && <button className="trio-row" onClick={() => go('trio')}>
          <span className="avs">{ORDER.map((k) => <Av key={k} k={k} size="sm" />)}</span>
          <span className="trio-t"><b>Conheça o trio</b><span>Ana, Rafael e Júlia: uma psicóloga, um educador físico e uma nutricionista que cuidam da mesma pessoa, juntos.</span></span>
          <Icon n="next" />
        </button>}
      </div>
    </>
  )
}

/* ---------- assinante ---------- */
function AgendaPlano({ S }: { S: State }) {
  const [selTs, setSel] = useState<number | null>(null)
  const n = now(), today = sod(n)
  const paused = S.pausedAt != null
  const mon = addDays(today, -((today.getDay() + 6) % 7)), nextMon = addDays(mon, 7)
  const week = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(mon, i))
  // o dia escolhido vale enquanto estiver na semana mostrada; senão, hoje
  const sel = selTs != null && selTs >= mon.getTime() && selTs < nextMon.getTime() ? new Date(selTs) : today
  const weekSess = sessionsBetween(S, mon, nextMon)
  const daySess = weekSess.filter((s) => sameDay(s.date, sel))
  const up = upcoming(S).filter((s) => !sameDay(s.date, sel)).slice(0, 4)
  // falta que ainda dá pra remarcar e não está no dia escolhido: fica à vista, no topo
  const misses = sessionsBetween(S, new Date(n.getTime() - (RULES.missWindowH + 1) * HOUR), n)
    .filter((s) => s.state === 'falta' && !sameDay(s.date, sel))
  const [first, last] = monthRange(n)
  const ms = sessionsBetween(S, first, last)
  const anyLost = ms.some((s) => s.state === 'perdida')

  return (
    <>
      <TopBar />
      <div className="scr">
        <header>
          <h1 className="title">Agenda</h1>
          <p className="lead">Seus encontros com o trio. Remarcar é simples, e ninguém vai te cobrar explicação.</p>
        </header>
        {paused && (
          <section className="callout ag-paused" aria-label="Plano em pausa">
            <p>Seu plano está em pausa desde {dLong(new Date(S.pausedAt!))}. Os encontros voltam quando você retomar, em Ajustes.</p>
            <button className="link" onClick={() => go('perfil')}>Ir para Ajustes <Icon n="next" sm /></button>
          </section>
        )}
        {misses.length > 0 && (
          <div className="daylist">
            {misses.map((s) => (
              <Fragment key={s.id}>
                <div className="day-h">{cap(rel(s.date))} · {WD[s.date.getDay()]}, {dShort(s.date)}</div>
                <SessCard s={s} paused={paused} />
              </Fragment>
            ))}
          </div>
        )}
        <div className="week" role="group" aria-label="Esta semana">
          {week.map((d) => {
            const ss = weekSess.filter((s) => sameDay(s.date, d))
            const isT = sameDay(d, today), isS = sameDay(d, sel)
            return (
              <button
                key={d.getTime()} className={cx('wd', isT && 'today', isS && 'on')} onClick={() => setSel(d.getTime())} aria-pressed={isS}
                aria-label={`${WD[d.getDay()]}, ${dLong(d)}${ss.length ? ', ' + plural(ss.length, 'encontro', 'encontros') : ''}`}
              >
                <small>{WDS[d.getDay()]}</small><b>{d.getDate()}</b>
                <span className="dots">{ss.map((s) => <i key={s.id} style={toneVars(s.pro)} />)}</span>
              </button>
            )
          })}
        </div>
        <div className="daylist">
          <div className="day-h">{sameDay(sel, today) ? 'Hoje' : cap(WD[sel.getDay()])}, {dLong(sel)}</div>
          {daySess.length ? daySess.map((s) => <SessCard key={s.id} s={s} paused={paused} />) : (
            <div className="empty-day">
              Nenhum encontro neste dia. Bom dia pra uma pausa curta.<br />
              <button className="link" style={{ marginTop: 6 }} onClick={() => go('pausas', { tab: true })}>Ver pausas</button>
            </div>
          )}
        </div>
        {up.length > 0 && (
          <div className="daylist">
            <div className="sec-h"><h2>Próximos encontros</h2></div>
            {up.map((s) => (
              <Fragment key={s.id}>
                <div className="day-h">{cap(rel(s.date))} · {WD[s.date.getDay()]}, {dShort(s.date)}</div>
                <SessCard s={s} paused={paused} />
              </Fragment>
            ))}
          </div>
        )}
        <section className="card">
          <div className="sec-h"><h2>{cap(MES[n.getMonth()])} no seu plano</h2></div>
          <p className="tiny" style={{ margin: '4px 0 6px' }}>{plural(ms.length, 'encontro incluído', 'encontros incluídos')} na assinatura deste mês.</p>
          {ORDER.map((k) => {
            const L = ms.filter((s) => s.pro === k)
            const done = L.filter((s) => s.state === 'realizado').length, lost = L.filter((s) => s.state === 'perdida').length
            const left = reschedLeft(S, k, n)
            return (
              <div key={k} className="mrow" style={toneVars(k)}>
                <span>
                  <Av k={k} size="xs" />
                  <span className="ag-area">{PROS[k].area}<em>{left > 0 ? `${plural(left, 'remarcação disponível', 'remarcações disponíveis')}` : 'remarcação do mês usada'}</em></span>
                </span>
                <span className="mdots" role="img" aria-label={`${done} de ${L.length} realizados${lost ? ', ' + plural(lost, 'perdido', 'perdidos') : ''}`}>
                  {L.map((s) => <i key={s.id} className={s.state === 'realizado' ? 'f' : s.state === 'perdida' ? 'ag-x' : undefined} />)}
                </span>
              </div>
            )
          })}
          {anyLost && <p className="tiny ag-legend"><i className="ag-ring" /> Contorno tracejado: encontro perdido.</p>}
        </section>
        <section className="callout ag-rules" aria-labelledby="ag-rules-h">
          <b id="ag-rules-h">Como funcionam as remarcações</b>
          <ul>
            <li>Você tem {plural(RULES.reschedPerMonth, 'remarcação', 'remarcações')} por mês em cada área.</li>
            <li>Se faltar, dá pra remarcar em até {RULES.missWindowH} horas.</li>
            <li>Depois disso, ou se a remarcação do mês já foi usada, o encontro fica como perdido.</li>
            <li>O horário reservado é pago ao profissional, por isso o encontro perdido não é reposto.</li>
          </ul>
        </section>
      </div>
    </>
  )
}

export function Agenda() {
  const S = useS()
  return S.plan === 'aberto' ? <AgendaAberto S={S} /> : <AgendaPlano S={S} />
}
