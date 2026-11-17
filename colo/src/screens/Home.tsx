/* Início: saudação, check-in de clima, próximo encontro e combinados (assinante),
   bilhete do dia, pausas pra agora, convite sutil (só COLO Aberto) e atalho do trio. */
import '../styles/screens/home.css'
import { useEffect } from 'react'
import { BILHETES, MOODS, ORDER, PAUSAS, PROS } from '../data/content'
import { HOUR, WD, cap, dLong, dkey, doy, hm, now, rel } from '../lib/dates'
import { inviteVisible } from '../lib/invite'
import { missDeadline, nextWith, sessionsBetween, upcoming, type Sess } from '../lib/sessions'
import { go } from '../nav/router'
import { runAction } from '../shell/colo'
import { inviteClose, inviteSeen, markComb, nextBilhete, setMood } from '../state/actions'
import { getS, useS, type State } from '../state/store'
import type { Bilhete, Pausa, ProKey, TimeKey } from '../types'
import { Av, Ring, Sky, TopBar, cx, toneVars } from '../ui/bits'
import { Icon, MoodIcon } from '../ui/icons'
import { toast } from '../ui/overlay'

const LINES = ['Que bom te ver por aqui.', 'Respira. Você chegou.', 'Hoje a gente vai no seu ritmo.', 'Um dia de cada vez, com companhia.']
const PREF: Record<TimeKey, string> = { manha: 'corpo', tarde: 'comida', noite: 'sono' }

/* ---------- check-in ---------- */
function CheckinCard({ S }: { S: State }) {
  const sub = S.plan !== 'aberto'
  const reads = sub && S.consents.checkins
  const m = S.moods[dkey(now())]
  const sel = m != null ? MOODS[m] : null
  const acts = sel ? (sub ? sel.a : sel.aFree ?? sel.a) : []
  const pick = (i: number): void => {
    if (!setMood(i)) return
    toast(S.tone === 'quieta' ? 'Check-in feito.' : reads ? 'Obrigado por contar. A Ana vai ler antes da sessão.' : 'Obrigado por contar.')
  }
  return (
    <section className="card checkin" aria-labelledby="ck-h">
      <div className="sec-h"><h2 id="ck-h">Como está o seu tempo por dentro?</h2></div>
      <div className="moods" role="radiogroup" aria-labelledby="ck-h">
        {MOODS.map((x, i) => (
          <button key={x.k} className={cx('mood', m === i && 'on')} role="radio" aria-checked={m === i} onClick={() => pick(i)}>
            <MoodIcon k={x.k} /><span>{x.t}</span>
          </button>
        ))}
      </div>
      {sel ? (
        <div className="reply">
          <p>{sel.r}</p>
          <div className="reply-acts">
            {acts.map(([v, label]) => <button key={v} className="btn soft sm" onClick={() => runAction(v)}>{label}</button>)}
          </div>
          <p className="tiny">
            {reads
              ? 'A Ana lê seus check-ins antes de cada sessão, porque você autorizou. Mais ninguém vê.'
              : sub
                ? 'Seus check-ins ficam só com você. Para a Ana ler antes da sessão, autorize em Ajustes.'
                : 'Seus check-ins ficam só com você.'}
          </p>
        </div>
      ) : (
        <p className="tiny">Toque no que mais parece com hoje. Não existe resposta certa.</p>
      )}
    </section>
  )
}

/* ---------- aviso de falta (assinante) ---------- */
/** Falta das últimas 13 horas que ainda pode ser remarcada (a mais recente). */
function recentMiss(S: State): Sess | undefined {
  const n = now()
  return sessionsBetween(S, new Date(n.getTime() - 13 * HOUR), n).filter((s) => s.state === 'falta').pop()
}
function MissCard({ s }: { s: Sess }) {
  return (
    <section className="callout tone hm-miss" style={toneVars(s.pro)} aria-label="Encontro que você não pôde vir">
      <p>Você não pôde vir ao encontro com {PROS[s.pro].first}. Dá pra remarcar até {hm(missDeadline(s))}.</p>
      <button className="btn soft sm" onClick={() => go('agenda', { tab: true })}>Remarcar</button>
    </section>
  )
}

/* ---------- próximo encontro (assinante) ---------- */
function NextCard({ S }: { S: State }) {
  if (S.pausedAt != null) {
    return (
      <section className="callout hm-paused" aria-label="Plano em pausa">
        <p>Seu plano está em pausa. Os encontros voltam quando você retomar, em Ajustes.</p>
        <button className="link" onClick={() => go('perfil')}>Ir para Ajustes <Icon n="next" sm /></button>
      </section>
    )
  }
  const s = upcoming(S)[0]
  if (!s) return null
  const p = PROS[s.pro]
  return (
    <section className="next" style={toneVars(s.pro)}>
      <div className="eyebrow">Próximo encontro · {rel(s.date)}</div>
      <div className="next-when">{cap(WD[s.date.getDay()])}, {hm(s.date)}</div>
      <div className="next-who">{s.kind} com {p.first}</div>
      <div className="next-meta"><Icon n={s.ic} sm /> {s.mode} · {s.dur} min</div>
      <button className="link" onClick={() => go('agenda', { tab: true })}>Ver agenda completa <Icon n="next" sm /></button>
    </section>
  )
}

/* ---------- combinados da semana (assinante) ---------- */
function combMsg(S: State, k: ProKey): string {
  const p = PROS[k], s = nextWith(S, k)
  const r = s ? rel(s.date) : ''
  const when = !s ? 'no próximo encontro' : r === 'hoje' ? 'ainda hoje' : r === 'amanhã' ? 'amanhã' : `no encontro de ${WD[s.date.getDay()]}`
  if (S.tone === 'empurrao') return `Isso! Mais um pra conta. ${p.first} vai gostar de ver.`
  if (S.tone === 'quieta') return 'Anotado.'
  return `Anotado com carinho. ${p.first} vê isso ${when}.`
}
function CombinadosCard({ S }: { S: State }) {
  const tk = dkey(now())
  const mark = (k: ProKey): void => { if (markComb(k)) toast(combMsg(S, k)) }
  return (
    <section className="card">
      <div className="sec-h"><h2>Combinados da semana</h2></div>
      <p className="tiny" style={{ marginTop: 4 }}>O que você topou fazer com o trio. Sem placar, só acompanhamento.</p>
      <ul className="comb-list">
        {ORDER.map((k) => {
          const p = PROS[k], c = S.comb[k] || 0, g = p.comb.goal, done = S.combDay[k] === tk, left = g - c
          const sub = left <= 0
            ? 'Combinado cumprido. O que vier agora é bônus.'
            : `com ${p.first} · ${left === 1 ? 'falta 1 ' + p.comb.one : `faltam ${left} ${p.comb.unit}`}`
          return (
            <li key={k}>
              <div className="ring-wrap">
                <Ring id={k} v={c} goal={g} color={p.color} />
                <span className="ring-n"><span>{c}<small>/{g}</small></span></span>
              </div>
              <div className="comb-txt"><b>{p.comb.text}</b><span>{sub}</span></div>
              <button
                className={cx('btn', done ? 'done' : 'line', 'sm')} onClick={() => mark(k)} disabled={done}
                aria-label={done ? 'Já marcado hoje' : 'Marcar que fiz hoje: ' + p.comb.text}
              >
                {done ? <><Icon n="check" sm />Hoje</> : 'Fiz hoje'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ---------- bilhete do dia ---------- */
function bilhetes(S: State): Bilhete[] {
  const f = BILHETES.filter((b) => S.focuses.includes(b.tag))
  return f.length ? f : BILHETES
}
function BilheteCard({ S }: { S: State }) {
  const L = bilhetes(S), b = L[(doy(now()) + (S.noteIdx || 0)) % L.length], p = PROS[b.by]
  return (
    <section className="note" aria-label="Bilhete do dia">
      <div className="eyebrow">Bilhete do dia</div>
      <p className="note-x">{b.x}</p>
      <div className="note-foot">
        <span className="sig"><Av k={b.by} size="xs" /> {p.first}, {S.plan !== 'aberto' ? p.sign : p.signFree}</span>
        <button className="link" onClick={() => nextBilhete()}>Outro bilhete</button>
      </div>
    </section>
  )
}

/* ---------- pausas pra agora ---------- */
function PzCard({ x }: { x: Pausa }) {
  const open = (): void => { if (x.special === 'breathe') go('breathe'); else go('session', { id: x.id }) }
  return (
    <button className="pz-card" style={toneVars(x.by)} onClick={open}>
      <span className="pz-min">{x.min} min</span><b>{x.title}</b><span className="pz-by">por {PROS[x.by].first}</span>
    </button>
  )
}
function QuickPauses({ S }: { S: State }) {
  const pref = PREF[S.time]
  const L = PAUSAS.filter((x) => x.cat.includes('agora') || x.cat.includes(pref))
    .sort((a, b) => (b.cat.includes(pref) ? 1 : 0) - (a.cat.includes(pref) ? 1 : 0))
  return (
    <section>
      <div className="sec-h"><h2>Pausas pra agora</h2><button className="link" onClick={() => go('pausas', { tab: true })}>Ver todas</button></div>
      <div className="hscroll">{L.slice(0, 5).map((x) => <PzCard key={x.id} x={x} />)}</div>
    </section>
  )
}

/* ---------- convite sutil (só COLO Aberto) ---------- */
/** Aparece no máximo uma vez por semana, nunca perto de um check-in difícil, e sai com um toque. Sem preço. */
function InviteCard() {
  // registra que o convite desta semana apareceu hoje (lê o estado atual: o efeito roda duas vezes em desenvolvimento)
  useEffect(() => { if (getS().invite.day !== dkey(now())) inviteSeen() }, [])
  return (
    <section className="hm-invite" aria-labelledby="hm-inv-h">
      <div className="eyebrow">Um convite, sem pressa</div>
      <h2 id="hm-inv-h" className="hm-invite-h">Quer dividir isso com alguém de verdade?</h2>
      <p className="hm-invite-p">Você tem escrito por aqui há alguns dias. Se fizer sentido, o trio do COLO pode caminhar com você.</p>
      <div className="hm-invite-acts">
        <button className="btn soft sm" onClick={() => go('trio')}>Conhecer o trio</button>
        <button className="btn ghost sm" onClick={() => inviteClose()}>Agora não</button>
      </div>
    </section>
  )
}

/* ---------- início ---------- */
export function Home() {
  const S = useS()
  const sub = S.plan !== 'aberto'
  const n = now(), h = n.getHours()
  const greet = h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const miss = sub ? recentMiss(S) : undefined
  return (
    <>
      <Sky className="small" />
      <TopBar />
      <div className="scr">
        <header className="hello-wrap">
          <div className="eyebrow">{WD[n.getDay()]}, {dLong(n)}</div>
          <h1 className="hello">
            {greet}{S.name ? <>, <em>{S.name}</em></> : null}.<br />
            <span className="soft">{LINES[doy(n) % LINES.length]}</span>
          </h1>
        </header>
        <CheckinCard S={S} />
        {sub && miss && <MissCard s={miss} />}
        {sub && <NextCard S={S} />}
        {sub && <CombinadosCard S={S} />}
        <BilheteCard S={S} />
        <QuickPauses S={S} />
        {!sub && inviteVisible(S) && <InviteCard />}
        <button className="trio-row" onClick={() => go('trio')}>
          <span className="avs">{ORDER.map((k) => <Av key={k} k={k} size="sm" />)}</span>
          {sub ? (
            <span className="trio-t"><b>Seu trio</b><span>Ana, Rafael e Júlia trocam notas uma vez por mês, com a sua autorização, pra que o cuidado faça sentido junto.</span></span>
          ) : (
            <span className="trio-t"><b>Conheça o trio</b><span>Ana, Rafael e Júlia: uma psicóloga, um educador físico e uma nutricionista que cuidam da mesma pessoa, juntos.</span></span>
          )}
          <Icon n="next" />
        </button>
        <p className="footline">Você não precisa dar conta de tudo por conta própria.</p>
      </div>
    </>
  )
}
