/* Controles do PROTÓTIPO: alternar entre COLO Aberto, assinante e painel do profissional,
   e adiantar o relógio para testar agenda, remarcação e convite. Não fazem parte do app final. */
import { PLANS } from '../data/plans'
import { HOUR, DAY, WD, dLong, hm, now } from '../lib/dates'
import { go } from '../nav/router'
import { inviteForce, resetClock, setPlan, setView, shiftClock } from '../state/actions'
import { useS } from '../state/store'
import type { PlanKey } from '../types'
import { toast } from '../ui/overlay'

const MODES: { k: PlanKey | 'pro'; t: string }[] = [
  { k: 'aberto', t: 'COLO Aberto' }, { k: 'essencial', t: 'Essencial' }, { k: 'inteiro', t: 'Inteiro' }, { k: 'pro', t: 'Profissional' },
]

/** Alterna a versão mostrada: gratuito, assinante (Essencial ou Inteiro) ou painel do profissional. */
export function ProtoSwitch() {
  const S = useS()
  const cur: PlanKey | 'pro' = S.view === 'pro' ? 'pro' : S.plan
  const pick = (k: PlanKey | 'pro'): void => {
    if (k === 'pro') { setView('pro'); go('pro', { tab: true }); return }
    setPlan(k)
    const wasPro = S.view === 'pro'
    setView('acolhido')
    if (wasPro) go(S.onboarded ? 'home' : 'welcome', { tab: true })
    toast(k === 'aberto' ? 'Você está vendo o COLO Aberto, a versão gratuita.' : `Você está vendo como assinante do ${PLANS[k].name}.`)
  }
  return (
    <div className="proto-seg" role="radiogroup" aria-label="Ver o protótipo como">
      {MODES.map((m) => (
        <button key={m.k} role="radio" aria-checked={cur === m.k} className={cur === m.k ? 'on' : ''} onClick={() => pick(m.k)}>{m.t}</button>
      ))}
    </div>
  )
}

/** Relógio do protótipo: adianta o tempo para ver o que muda. */
export function ProtoClock() {
  const S = useS()
  const n = now()
  return (
    <div className="proto-clock">
      <div className="proto-seg" role="group" aria-label="Adiantar o relógio do protótipo">
        <button onClick={() => shiftClock(HOUR)}>+1 hora</button>
        <button onClick={() => shiftClock(DAY)}>+1 dia</button>
        <button onClick={() => shiftClock(7 * DAY)}>+1 semana</button>
        <button onClick={() => resetClock()} disabled={!S.clock}>Agora</button>
      </div>
      <p className="tiny" aria-live="polite">{S.clock ? `No protótipo, agora é ${WD[n.getDay()]}, ${dLong(n)}, ${hm(n)}.` : 'O relógio do protótipo está na hora real.'}</p>
    </div>
  )
}

/** Mostra o convite para assinar sem esperar os 7 dias de diário (a regra do check-in difícil continua valendo). */
export function ProtoInvite() {
  const S = useS()
  if (S.plan !== 'aberto' || S.view === 'pro') return null
  return (
    <button className="link" onClick={() => { inviteForce(); go('home', { tab: true }); toast('O convite aparece no Início, a não ser que o check-in de hoje ou de ontem tenha sido difícil.') }}>
      Ver o convite para assinar
    </button>
  )
}
