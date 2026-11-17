/* Jornada: o clima dos dias, as contagens do mês, o diário e as anotações.
   Para quem tem plano, também os encontros, sono e energia e as notas do trio. */
import '../styles/screens/jornada.css'
import { useState } from 'react'
import { MOODS, ORDER, PROS } from '../data/content'
import { WDS, addDays, dLong, dShort, dkey, mkey, now, sod } from '../lib/dates'
import { proNote } from '../lib/pro'
import { hasRisk } from '../lib/risk'
import { lastWith, sessionsBetween } from '../lib/sessions'
import { go } from '../nav/router'
import { addNote, removeNote } from '../state/actions'
import { useS } from '../state/store'
import type { ProKey } from '../types'
import { Av, Sos, TopBar, colorVars, toneVars } from '../ui/bits'
import { Icon, MoodIcon } from '../ui/icons'
import { toast } from '../ui/overlay'

/** Sono e energia nas últimas 8 semanas (dados de exemplo), como no protótipo de referência. */
function Chart() {
  const sleep = [2.4, 2.6, 2.5, 3.0, 3.1, 3.4, 3.3, 3.7], energy = [2.1, 2.5, 2.4, 2.8, 3.2, 3.0, 3.5, 3.6]
  const W = 320, H = 164, L = 22, R = 34, T = 12, B = 24, iw = W - L - R, ih = H - T - B
  const x = (i: number): number => L + (i * iw) / 7
  const y = (v: number): number => T + ((5 - v) * ih) / 4
  const pts = (a: number[]): string => a.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = (a: number[]): string => `${pts(a)} L${x(7).toFixed(1)} ${y(1).toFixed(1)} L${x(0).toFixed(1)} ${y(1).toFixed(1)}Z`
  const fmt = (v: number): string => v.toFixed(1).replace('.', ',')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sono e energia nas últimas 8 semanas, de 1 a 5. Sono subiu de 2,4 para 3,7; energia de 2,1 para 3,6.">
      {[1, 2, 3, 4, 5].map((v) => <line key={v} x1={L} x2={x(7)} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" strokeDasharray={v === 1 ? undefined : '2 4'} />)}
      {[1, 3, 5].map((v) => <text key={v} x={L - 8} y={y(v) + 3.5} textAnchor="end">{v}</text>)}
      <path d={area(sleep)} fill="var(--mente)" opacity=".12" />
      <path d={pts(sleep)} fill="none" stroke="var(--mente)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pts(energy)} fill="none" stroke="var(--corpo)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(7)} cy={y(sleep[7])} r="3.5" fill="var(--mente)" stroke="var(--surface)" strokeWidth="1.5" />
      <circle cx={x(7)} cy={y(energy[7])} r="3.5" fill="var(--corpo)" stroke="var(--surface)" strokeWidth="1.5" />
      <text x={x(7) + 8} y={y(sleep[7]) - 3}>{fmt(sleep[7])}</text>
      <text x={x(7) + 8} y={y(energy[7]) + 11}>{fmt(energy[7])}</text>
      <text x={x(0)} y={H - 6}>há 8 semanas</text>
      <text x={x(7)} y={H - 6} textAnchor="end">esta semana</text>
    </svg>
  )
}

const COUNT_LABEL: Record<ProKey, string> = { ana: 'sessões com Ana', rafael: 'treinos com Rafael', julia: 'consultas com Júlia' }

export function Jornada() {
  const S = useS()
  const sub = S.plan !== 'aberto'
  const n = now(), mk = mkey(n), start = new Date(S.since)
  const [all, setAll] = useState(false)
  const [text, setText] = useState('')
  const [flagged, setFlagged] = useState(false)

  const days = [...Array(14)].map((_, i) => addDays(sod(n), i - 13))
  const checkins = Object.keys(S.moods).filter((k) => k.startsWith(mk)).length
  const pausesMonth = S.pauseLog.filter((t) => mkey(t) === mk).length
  const writeDays = new Set([...S.journal.map((j) => j.d), ...S.notes.map((x) => x.d)].filter((d) => mkey(d) === mk).map((d) => dkey(d))).size
  const cnt: Record<ProKey, number> = { ana: 0, rafael: 0, julia: 0 }
  if (sub) sessionsBetween(S, start, n).forEach((s) => { if (s.state === 'realizado') cnt[s.pro]++ })
  const notas = sub ? ORDER.map((k) => ({ k, x: proNote(S, k, 'voce').shared.trim(), last: lastWith(S, k) })).filter((x) => x.x) : []
  const J = all ? S.journal : S.journal.slice(0, 4)
  const pauses = S.pauseLog.length
  const risk = hasRisk(text)

  const save = (): void => {
    if (!text.trim()) return
    const r = addNote(text)
    setFlagged(r)
    setText('')
    if (!r) toast('Anotação guardada. Só você vê.')
  }

  return (
    <>
      <TopBar />
      <div className="scr">
        <header><h1 className="title">Sua jornada</h1><p className="lead">No COLO desde {dLong(start)}. Sem pressa e sem placar: aqui cada dia conta por si só.</p></header>

        <section className="card">
          <div className="sec-h"><h2>Seu tempo por dentro</h2><span className="tiny">2 semanas</span></div>
          <div className="strip">{days.map((d, i) => {
            const m = S.moods[dkey(d)], isT = i === 13
            return (
              <div className={'sd' + (isT ? ' today' : '')} title={m != null ? MOODS[m].t : 'Sem check-in'} key={i}>
                {m != null ? <MoodIcon k={MOODS[m].k} /> : <span className="empty" />}
                <span>{isT ? 'hoje' : WDS[d.getDay()]}</span>
                <span className="sr">{m != null ? MOODS[m].t : 'sem check-in'}</span>
              </div>
            )
          })}</div>
          {S.moods[dkey(n)] == null && <p className="tiny" style={{ marginTop: 12 }}>Hoje ainda está em branco. <button className="link" onClick={() => go('home', { tab: true })}>Fazer check-in</button></p>}
        </section>

        <section>
          <div className="sec-h"><h2>Este mês</h2></div>
          <div className="counts jo-month">
            <div className="count"><b>{checkins}</b><span>{checkins === 1 ? 'check-in' : 'check-ins'}</span></div>
            <div className="count"><b>{pausesMonth}</b><span>{pausesMonth === 1 ? 'pausa feita' : 'pausas feitas'}</span></div>
            <div className="count"><b>{writeDays}</b><span>{writeDays === 1 ? 'dia com diário' : 'dias com diário'}</span></div>
          </div>
        </section>

        {sub && (
          <section>
            <div className="sec-h"><h2>Encontros até aqui</h2></div>
            <div className="counts">{ORDER.map((k) => <div className="count" style={toneVars(k)} key={k}><b>{cnt[k]}</b><span>{COUNT_LABEL[k]}</span></div>)}</div>
          </section>
        )}

        {sub && (
          <section className="card chart">
            <div className="sec-h"><h2>Sono e energia</h2><span className="tiny">dados de exemplo</span></div>
            <p className="tiny" style={{ marginTop: 4 }}>Como você contou que dormiu e que energia teve, semana a semana, numa escala de 1 a 5.</p>
            <div className="legend"><span><i style={colorVars('mente')} />Sono</span><span><i style={colorVars('corpo')} />Energia</span></div>
            <Chart />
          </section>
        )}

        {sub && notas.length > 0 && (
          <section className="card">
            <div className="sec-h"><h2>Notas do seu trio</h2></div>
            <p className="tiny" style={{ marginTop: 4 }}>O resumo que cada profissional compartilha depois do encontro.</p>
            <ul className="notas">{notas.map(({ k, x, last }) => (
              <li key={k}><Av k={k} size="sm" /><div><small>{PROS[k].first} · {last ? dShort(last.date) : 'em breve'}</small><p>{x}</p></div></li>
            ))}</ul>
          </section>
        )}

        <section className="card">
          <div className="sec-h"><h2>Seu diário</h2><span className="tiny">só você vê</span></div>
          {J.length ? (
            <>
              {J.map((j) => (
                <article className="jr" key={j.d}>
                  <small>{dShort(new Date(j.d))} · {j.title}</small>
                  {j.items.map((i, idx) => <p key={idx}><b>{i.q}</b><br />{i.a}</p>)}
                </article>
              ))}
              <div className="jo-more">
                <button className="btn soft sm" onClick={() => go('session', { id: 'diario' })}>Escrever três linhas</button>
                {S.journal.length > 4 && <button className="link" onClick={() => setAll(!all)}>{all ? 'Ver menos' : 'Ver tudo'}</button>}
              </div>
            </>
          ) : (
            <>
              <p className="tiny" style={{ margin: '6px 0 12px' }}>Quando você escrever no diário, suas linhas aparecem aqui.</p>
              <button className="btn soft sm" onClick={() => go('session', { id: 'diario' })}>Escrever três linhas</button>
            </>
          )}
        </section>

        <section className="card">
          <div className="sec-h"><h2>Suas anotações</h2><span className="tiny">só você vê</span></div>
          <div className="jo-form">
            <label className="sr" htmlFor="jo-note">Nova anotação</label>
            <textarea id="jo-note" className="field" rows={3} value={text} maxLength={4000} placeholder="Algo que você quer guardar ou levar para o próximo encontro."
              onChange={(e) => { setText(e.target.value); if (flagged) setFlagged(false) }} />
            <button className="btn soft sm" onClick={save} disabled={!text.trim()}>Guardar anotação</button>
          </div>
          <div className="jo-sos">
            {risk || flagged ? (
              <Sos v="risco">
                {sub && flagged && <p className="tiny" style={{ marginTop: 12 }}>A Ana recebe hoje um aviso de que você pode precisar de mais cuidado. O que você escreveu continua só seu.</p>}
              </Sos>
            ) : <Sos v="diario" />}
          </div>
          {S.notes.length > 0 && (
            <ul className="jo-notes">{S.notes.map((x) => (
              <li key={x.id}>
                <div><small>{dShort(new Date(x.d))}</small><p>{x.x}</p></div>
                <button className="icon-btn" onClick={() => removeNote(x.id)} aria-label={`Apagar a anotação de ${dShort(new Date(x.d))}`}><Icon n="trash" sm /></button>
              </li>
            ))}</ul>
          )}
        </section>

        {pauses > 0 && <p className="footline">{pauses} {pauses === 1 ? 'pausa feita' : 'pausas feitas'} por aqui. Cada uma contou.</p>}
      </div>
    </>
  )
}
