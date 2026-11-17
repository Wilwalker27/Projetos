/* Ajustes: seu jeito, aparência, plano, privacidade, apoio de crise e os controles do protótipo. */
import '../styles/screens/ajustes.css'
import { useEffect, useState } from 'react'
import { FOCOS, HORAS, ORDER, PROS, TONS } from '../data/content'
import { DUR, PLANS, RULES, brl } from '../data/plans'
import { cap, dLong, now, sod } from '../lib/dates'
import { go } from '../nav/router'
import { ProtoClock, ProtoInvite, ProtoSwitch } from '../shell/proto'
import { cancelPlan, deleteAccount, pausePlan, setCalm, setName, setTheme, setTime, setTone, toggleFocus } from '../state/actions'
import { useS } from '../state/store'
import type { PaidPlanKey, ThemeKey } from '../types'
import { Av, Sos, TopBar } from '../ui/bits'
import { Icon } from '../ui/icons'
import { closeSheet, openSheet, toast } from '../ui/overlay'

const THEMES: [ThemeKey, string][] = [['auto', 'Automático'], ['light', 'Manhã'], ['dark', 'Noite']]

function ResetSheet() {
  return (
    <>
      <h2 className="sh-t" style={{ marginTop: 6 }}>Recomeçar a apresentação?</h2>
      <p className="sh-p">Seu nome, check-ins, combinados, conversas e diário salvos neste navegador serão apagados.</p>
      <div className="sh-acts">
        <button className="btn line" onClick={() => closeSheet()}>Cancelar</button>
        <button className="btn primary" onClick={() => { closeSheet(true); deleteAccount(); go('welcome', { tab: true }) }}>Recomeçar</button>
      </div>
    </>
  )
}
function PauseSheet({ paused }: { paused: boolean }) {
  return (
    <>
      <h2 className="sh-t" style={{ marginTop: 6 }}>{paused ? 'Retomar o plano?' : 'Pausar o plano?'}</h2>
      <p className="sh-p">{paused
        ? 'Seus encontros voltam para a agenda, no mesmo ritmo de antes. Seu trio vai gostar de te ver de novo.'
        : 'Enquanto estiver em pausa, não há encontros nem cobrança. O diário, as pausas e o botão COLO continuam com você, e dá pra voltar quando quiser.'}</p>
      <div className="sh-acts">
        <button className="btn line" onClick={() => closeSheet()}>Agora não</button>
        <button className="btn primary" onClick={() => { pausePlan(!paused); closeSheet(); toast(paused ? 'Plano retomado. Que bom te ver de volta.' : 'Plano em pausa. Seu trio continua aqui quando você voltar.') }}>{paused ? 'Retomar' : 'Pausar'}</button>
      </div>
    </>
  )
}
function CancelSheet() {
  return (
    <>
      <h2 className="sh-t" style={{ marginTop: 6 }}>Encerrar a assinatura?</h2>
      <p className="sh-p">Você continua no COLO Aberto, com seu diário e suas pausas. Se assinou há menos de {RULES.refundDays} dias, o valor volta inteiro.</p>
      <div className="sh-acts">
        <button className="btn line" onClick={() => closeSheet()}>Manter o plano</button>
        <button className="btn primary" onClick={() => { cancelPlan(); closeSheet(); toast('Assinatura encerrada. O COLO Aberto continua com você.') }}>Encerrar</button>
      </div>
    </>
  )
}

function PlanCard() {
  const S = useS()
  if (S.plan === 'aberto') return (
    <section className="card aj-free">
      <div className="eyebrow">Seu plano</div>
      <h2>COLO Aberto</h2>
      <p>Gratuito, sem prazo: check-in, diário, anotações, pausas e bilhete do dia.</p>
      <button className="link" onClick={() => go('planos')}>Conhecer os planos de cuidado <Icon n="next" sm /></button>
    </section>
  )
  const plan = PLANS[S.plan as PaidPlanKey], f = plan.freq!
  const n = now(), day = new Date(S.since).getDate()
  let bill = new Date(n.getFullYear(), n.getMonth(), day)
  if (bill <= sod(n)) bill = new Date(n.getFullYear(), n.getMonth() + 1, day)
  const total = ORDER.reduce((a, k) => a + f[k].perMonth, 0)
  const paused = S.pausedAt != null
  return (
    <>
      <section className="card plan">
        <div className="eyebrow">Seu plano · {plan.name}</div>
        <div className="plan-price">{brl(plan.price)}<small>/mês</small></div>
        <ul className="plan-list">
          {ORDER.map((k) => <li key={k}><Av k={k} size="xs" /> {cap(PROS[k].service)} {f[k].label} · {DUR[k]} min</li>)}
          <li><Icon n="chat" sm /> Conversa com o trio entre os encontros</li>
          <li><Icon n="leaf" sm /> Todas as pausas, o diário e o botão COLO</li>
        </ul>
        <p className="tiny">{paused
          ? `Plano em pausa desde ${dLong(new Date(S.pausedAt!))}. Sem encontros nem cobrança enquanto estiver em pausa.`
          : `Num mês comum são ${total} encontros, cerca de ${brl(Math.round(plan.price / total))} cada. Próxima cobrança em ${dLong(bill)}.`}</p>
      </section>
      <section className="card aj-rows">
        <ul className="rows">
          <li><button className="row" onClick={() => openSheet(<PauseSheet paused={paused} />, paused ? 'Retomar o plano' : 'Pausar o plano')}>
            <Icon n={paused ? 'play' : 'pause'} /><span><b>{paused ? 'Retomar plano' : 'Pausar plano'}</b><em>{paused ? 'Os encontros voltam para a agenda' : 'Sem encontros nem cobrança durante a pausa'}</em></span><Icon n="next" sm /></button></li>
          <li><button className="row" onClick={() => openSheet(<CancelSheet />, 'Encerrar a assinatura')}>
            <Icon n="out" /><span><b>Encerrar assinatura</b><em>Você continua no COLO Aberto</em></span><Icon n="next" sm /></button></li>
        </ul>
      </section>
      <p className="tiny">Pagamento por Pix Automático ou cartão, fora das lojas de aplicativo. A psicóloga pode ajustar a frequência da psicologia com você.</p>
    </>
  )
}

export function Perfil() {
  const S = useS()
  const [name, setNameDraft] = useState(S.name)
  useEffect(() => { setNameDraft(S.name) }, [S.name])
  const tone = TONS.find((t) => t.k === S.tone) || TONS[0]
  const start = new Date(S.since)
  return (
    <>
      <TopBar />
      <div className="scr">
        <header className="me-head">
          <span className="av lg me-av">{S.name ? S.name.trim().charAt(0).toUpperCase() : '·'}</span>
          <div><h1 className="title">{S.name || 'Seu perfil'}</h1><p className="lead">No COLO desde {dLong(start)}</p></div>
        </header>

        <section className="card set">
          <h2>Seu jeito</h2>
          <label className="fld" htmlFor="pf-name"><span>Como você gosta que te chamem</span>
            <input id="pf-name" value={name} placeholder="Seu nome ou apelido" autoComplete="given-name" maxLength={30}
              onChange={(e) => setNameDraft(e.target.value)} onBlur={() => setName(name)}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }} /></label>
          <div className="fld"><span>O que você quer cuidar agora</span>
            <div className="chips wrap">{FOCOS.map((f) => <button key={f.k} className={'chip' + (S.focuses.includes(f.k) ? ' on' : '')} aria-pressed={S.focuses.includes(f.k)} onClick={() => toggleFocus(f.k)}>{f.t}</button>)}</div></div>
          <div className="fld"><span>Seu melhor horário</span>
            <div className="seg" role="radiogroup" aria-label="Seu melhor horário">{HORAS.map((h) => <button key={h.k} className={S.time === h.k ? 'on' : ''} role="radio" aria-checked={S.time === h.k} onClick={() => setTime(h.k)}>{h.t}</button>)}</div></div>
          <div className="fld"><span>Como prefere receber lembretes</span>
            <div className="seg" role="radiogroup" aria-label="Tom dos lembretes">{TONS.map((t) => <button key={t.k} className={S.tone === t.k ? 'on' : ''} role="radio" aria-checked={S.tone === t.k} onClick={() => setTone(t.k)}>{t.s}</button>)}</div>
            <p className="example">“{tone.ex}”</p></div>
        </section>

        <section className="card set">
          <h2>Aparência</h2>
          <div className="seg" role="radiogroup" aria-label="Tema">{THEMES.map(([k, t]) => <button key={k} className={S.theme === k ? 'on' : ''} role="radio" aria-checked={S.theme === k} onClick={() => setTheme(k)}>{t}</button>)}</div>
          <label className="toggle" htmlFor="pf-calm"><span>Animações suaves</span><em>O app respira devagar. Desligue se preferir tudo parado.</em>
            <input type="checkbox" id="pf-calm" checked={S.calm} onChange={(e) => setCalm(e.target.checked)} /></label>
        </section>

        <PlanCard />

        <section className="card aj-rows">
          <ul className="rows">
            <li><button className="row" onClick={() => go('privacidade')}><Icon n="lock" /><span><b>Privacidade e dados</b><em>Consentimentos, exportar dados e apagar conta</em></span><Icon n="next" sm /></button></li>
          </ul>
        </section>

        <Sos />

        <section className="proto">
          <h2>Protótipo</h2>
          <p className="tiny">Estes controles existem só no protótipo.</p>
          <ProtoSwitch />
          <ProtoClock />
          <ProtoInvite />
          <button className="btn ghost block" onClick={() => openSheet(<ResetSheet />, 'Recomeçar')}>Recomeçar a apresentação</button>
        </section>
        <p className="foot">Protótipo do COLO · profissionais, acolhidos e históricos fictícios</p>
      </div>
    </>
  )
}
