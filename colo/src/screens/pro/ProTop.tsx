/* Topo do painel do profissional e peças comuns do painel. */
import '../../styles/screens/pro.css'
import { MOODS, ORDER, PROS } from '../../data/content'
import { WDS, addDays, now, sod } from '../../lib/dates'
import type { Acolhido } from '../../lib/pro'
import { go } from '../../nav/router'
import { setProAs, setView } from '../../state/actions'
import { useS } from '../../state/store'
import { Av, Mark, Tag, toneVars } from '../../ui/bits'
import { Icon, MoodIcon } from '../../ui/icons'
import { closeSheet, openSheet } from '../../ui/overlay'

function ProSheet() {
  const S = useS()
  const leave = (): void => { closeSheet(true); setView('acolhido'); go(S.onboarded ? 'home' : 'welcome', { tab: true }) }
  return (
    <>
      <h2 className="sh-t" style={{ marginTop: 6 }}>Painel do profissional</h2>
      <p className="sh-p">Quem está usando o painel agora?</p>
      <div className="opts" role="radiogroup" aria-label="Profissional">
        {ORDER.map((k) => (
          <button key={k} className={'opt' + (S.proAs === k ? ' on' : '')} role="radio" aria-checked={S.proAs === k} onClick={() => { setProAs(k); closeSheet() }}>
            <Av k={k} /><span><b>{PROS[k].name}</b><em>{PROS[k].role}</em></span>{S.proAs === k ? <Icon n="check" /> : <span />}
          </button>
        ))}
      </div>
      <button className="btn ghost block" onClick={leave}>Sair do painel</button>
    </>
  )
}

export function ProTop() {
  const S = useS()
  const p = PROS[S.proAs]
  return (
    <div className="topbar">
      <div className="pr-brand">
        <button className="brandmini" onClick={() => go('pro', { tab: true })} aria-label="COLO, agenda do painel"><Mark size="sm" breathe /><span>colo</span></button>
        <Tag>Painel</Tag>
      </div>
      <button className="avatar-btn pr-me" style={toneVars(S.proAs)} onClick={() => openSheet(<ProSheet />, 'Painel do profissional')}
        aria-label={`${p.name}: trocar de profissional ou sair do painel`}>{p.first[0]}</button>
    </div>
  )
}

/** Inicial do acolhido num círculo neutro. */
export const Who = ({ a }: { a: Acolhido }) => <span className="av sm pr-who" aria-hidden="true">{a.first.charAt(0).toUpperCase()}</span>

/** Check-ins dos últimos 7 dias. Só a psicóloga vê, e só com autorização do acolhido. */
export function Checkins({ a }: { a: Acolhido }) {
  const S = useS()
  if (S.proAs !== 'ana') return <span className="pr-line"><Icon n="lock" sm /> Check-ins: só a psicóloga vê.</span>
  if (!a.checkins) return <span className="pr-line"><Icon n="lock" sm /> Sem autorização para ver os check-ins.</span>
  const today = sod(now())
  return (
    <span className="strip" role="img" aria-label={'Check-ins dos últimos 7 dias: ' + a.moods.map((m) => (m == null ? 'sem check-in' : MOODS[m].t)).join(', ')}>
      {a.moods.map((m, i) => (
        <span className={'sd' + (i === 6 ? ' today' : '')} key={i} title={m != null ? MOODS[m].t : 'Sem check-in'}>
          {m != null ? <MoodIcon k={MOODS[m].k} /> : <span className="empty" />}
          <span>{i === 6 ? 'hoje' : WDS[addDays(today, i - 6).getDay()]}</span>
        </span>
      ))}
    </span>
  )
}
