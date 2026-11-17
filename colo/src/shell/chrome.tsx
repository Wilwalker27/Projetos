/* Casco do app: coluna da marca (telas largas), barra de status e barra de abas. */
import { useEffect, useState } from 'react'
import { ORDER, PROS } from '../data/content'
import { PLANS } from '../data/plans'
import { now } from '../lib/dates'
import { go, useRoute, type RouteName } from '../nav/router'
import { useS } from '../state/store'
import { Mark, colorVars } from '../ui/bits'
import { Icon } from '../ui/icons'
import type { IconName } from '../types'
import { openColo } from './colo'
import { ProtoClock, ProtoInvite, ProtoSwitch } from './proto'

/** Faz a tela se redesenhar de tempos em tempos (relógio, "hoje", prazos). */
export function useTick(ms = 30000): number {
  const [t, setT] = useState(0)
  useEffect(() => { const i = setInterval(() => setT((x) => x + 1), ms); return () => clearInterval(i) }, [ms])
  return t
}

export function StatusBar() {
  const n = now()
  return (
    <div className="statusbar" aria-hidden="true">
      <span>{n.getHours() + ':' + String(n.getMinutes()).padStart(2, '0')}</span>
      <span className="sb-r">5G{' '}
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity=".45" />
          <rect x="2" y="2" width="15" height="8" rx="1.6" fill="currentColor" />
          <rect x="22.6" y="4" width="1.8" height="4" rx=".9" fill="currentColor" opacity=".45" />
        </svg>
      </span>
    </div>
  )
}

/** Como na coluna da referência: "psicóloga, toda semana". */
const WHO = { ana: 'psicóloga', rafael: 'educador físico', julia: 'nutricionista' } as const

type NavItem = { t: string; name?: RouteName; id?: string; act?: () => void }
const NAV_ACOLHIDO: NavItem[] = [
  { t: 'Boas-vindas', name: 'welcome' }, { t: 'Personalização', name: 'onboard', id: '1' }, { t: 'Início', name: 'home' },
  { t: 'COLO agora', act: openColo }, { t: 'Agenda', name: 'agenda' }, { t: 'Pausas', name: 'pausas' },
  { t: 'Respiração 5,5', name: 'breathe' }, { t: 'Jornada', name: 'jornada' }, { t: 'Seu trio', name: 'trio' },
  { t: 'Conversa', name: 'chat', id: 'ana' }, { t: 'Planos', name: 'planos' }, { t: 'Ajustes', name: 'perfil' }, { t: 'Privacidade', name: 'privacidade' },
]
const NAV_PRO: NavItem[] = [
  { t: 'Agenda da semana', name: 'pro' }, { t: 'Acolhidos', name: 'pro-acolhidos' }, { t: 'Conversas', name: 'pro-conversas' }, { t: 'Resumo do mês', name: 'pro-resumo' },
]

/** Coluna ao lado do aparelho, só em telas largas: marca, versão do protótipo e atalhos. */
export function BrandCol() {
  const S = useS()
  const r = useRoute()
  const pro = S.view === 'pro'
  const plan = PLANS[S.plan]
  const nav = pro ? NAV_PRO : NAV_ACOLHIDO.filter((i) => (S.plan === 'aberto' ? i.name !== 'chat' : i.name !== 'planos'))
  return (
    <aside className="brand-col" aria-label="Sobre o COLO">
      <div className="bc-mark"><Mark size="xl" breathe /></div>
      <h1 className="bc-word">colo</h1>
      <p className="bc-lead">Cuidado inteiro, com três pessoas do seu lado.</p>
      <dl className="bc-plan">
        {ORDER.map((k) => (
          <div key={k}>
            <dt><i style={colorVars(PROS[k].color)} />{PROS[k].area}</dt>
            <dd>{plan.freq ? `${WHO[k]}, ${plan.freq[k].label}` : WHO[k]}</dd>
          </div>
        ))}
      </dl>
      <div className="bc-nav">
        <span className="eyebrow">Ver o protótipo como</span>
        <ProtoSwitch />
      </div>
      <nav className="bc-nav" aria-label="Telas do protótipo">
        <span className="eyebrow">Ir direto para uma tela</span>
        <div>
          {nav.map((i) => (
            <button key={i.t} aria-current={!!i.name && r.name === i.name && (!i.id || i.id === r.id)}
              onClick={() => (i.act ? i.act() : go(i.name!, { id: i.id, tab: true }))}>{i.t}</button>
          ))}
        </div>
      </nav>
      <div className="bc-nav">
        <span className="eyebrow">Relógio do protótipo</span>
        <ProtoClock />
        <ProtoInvite />
      </div>
      <p className="bc-note">Protótipo navegável. Profissionais, acolhidos e históricos são fictícios. O que você marca fica salvo apenas neste navegador.</p>
    </aside>
  )
}

function Tab({ name, ic, t }: { name: RouteName; ic: IconName; t: string }) {
  const r = useRoute()
  return (
    <button className="tab" aria-current={r.name === name ? 'page' : undefined} onClick={() => go(name, { tab: true })}>
      <Icon n={ic} /><span>{t}</span>
    </button>
  )
}

/** Barra de abas. Acolhido: Início · Agenda · COLO · Pausas · Jornada. Profissional: 4 abas. */
export function TabBar({ hidden }: { hidden: boolean }) {
  const S = useS()
  if (S.view === 'pro') return (
    <nav className="tabbar tabbar-pro" aria-label="Navegação do painel" hidden={hidden}>
      <Tab name="pro" ic="cal" t="Agenda" />
      <Tab name="pro-acolhidos" ic="users" t="Acolhidos" />
      <Tab name="pro-conversas" ic="chat" t="Conversas" />
      <Tab name="pro-resumo" ic="chart" t="Resumo" />
    </nav>
  )
  return (
    <nav className="tabbar" aria-label="Navegação principal" hidden={hidden}>
      <Tab name="home" ic="home" t="Início" />
      <Tab name="agenda" ic="cal" t="Agenda" />
      <button className="tab tab-colo" onClick={openColo} aria-label="COLO agora: ajuda rápida">
        <span className="colo-btn"><Mark size="md" breathe /></span><span>COLO</span>
      </button>
      <Tab name="pausas" ic="leaf" t="Pausas" />
      <Tab name="jornada" ic="path" t="Jornada" />
    </nav>
  )
}
