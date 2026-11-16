/* COLO — Plataforma de Cuidado. Casco do app: palco, aparelho, tela atual, abas, painel e aviso. */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { TAB_ROUTES, go, isProRoute, useRoute, type Route } from './nav/router'
import { Agenda } from './screens/Agenda'
import { Breathe } from './screens/Breathe'
import { Chat } from './screens/Chat'
import { Home } from './screens/Home'
import { Jornada } from './screens/Jornada'
import { Onboard } from './screens/Onboard'
import { Pausas } from './screens/Pausas'
import { Perfil } from './screens/Perfil'
import { Planos } from './screens/Planos'
import { Privacidade } from './screens/Privacidade'
import { Session } from './screens/Session'
import { Trio } from './screens/Trio'
import { Welcome } from './screens/Welcome'
import { ProAcolhido } from './screens/pro/ProAcolhido'
import { ProAcolhidos } from './screens/pro/ProAcolhidos'
import { ProAgenda } from './screens/pro/ProAgenda'
import { ProChat } from './screens/pro/ProChat'
import { ProConversas } from './screens/pro/ProConversas'
import { ProResumo } from './screens/pro/ProResumo'
import { BrandCol, StatusBar, TabBar, useTick } from './shell/chrome'
import { syncWeek } from './state/actions'
import { useS, type State } from './state/store'
import { SheetHost, ToastHost } from './ui/hosts'
import { closeSheet } from './ui/overlay'

/** Para onde levar a pessoa quando a rota não vale para a versão que ela está vendo. */
function guard(r: Route, S: State): Route | null {
  const pro = isProRoute(r.name)
  if (S.view === 'pro') return pro ? null : { name: 'pro' }
  if (pro) return { name: S.onboarded ? 'home' : 'welcome' }
  if (r.name === 'chat' && S.plan === 'aberto') return { name: 'trio' } // conversa é só para quem tem plano
  if (r.name === 'planos' && S.plan !== 'aberto') return { name: 'perfil' } // quem tem plano vê o plano em Ajustes
  return null
}

function Screen({ r }: { r: Route }) {
  switch (r.name) {
    case 'welcome': return <Welcome />
    case 'onboard': return <Onboard id={r.id} />
    case 'home': return <Home />
    case 'agenda': return <Agenda />
    case 'pausas': return <Pausas />
    case 'breathe': return <Breathe id={r.id} />
    case 'session': return <Session id={r.id} />
    case 'jornada': return <Jornada />
    case 'trio': return <Trio />
    case 'chat': return <Chat id={r.id} />
    case 'planos': return <Planos />
    case 'perfil': return <Perfil />
    case 'privacidade': return <Privacidade />
    case 'pro': return <ProAgenda />
    case 'pro-acolhidos': return <ProAcolhidos />
    case 'pro-acolhido': return <ProAcolhido id={r.id} />
    case 'pro-conversas': return <ProConversas />
    case 'pro-chat': return <ProChat id={r.id} />
    case 'pro-resumo': return <ProResumo />
  }
}

function applyTheme(theme: State['theme']): void {
  const root = document.documentElement
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme)
  else root.removeAttribute('data-theme')
  // cor da barra do sistema acompanha o tema escolhido
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
  metas.forEach((m, i) => {
    if (theme === 'auto') { m.media = i === 0 ? '(prefers-color-scheme: light)' : '(prefers-color-scheme: dark)'; m.content = i === 0 ? '#FAF4F0' : '#1B1618' }
    else { m.media = ''; m.content = theme === 'dark' ? '#1B1618' : '#FAF4F0' }
  })
}

export function App() {
  const S = useS()
  const raw = useRoute()
  const tick = useTick()
  const scr = useRef<HTMLElement>(null)

  const redirect = guard(raw, S)
  const r = redirect ?? raw
  const key = r.name + '/' + (r.id ?? '')
  const redirectKey = redirect ? redirect.name + '/' + (redirect.id ?? '') : ''

  useEffect(() => {
    if (redirect) go(redirect.name, { id: redirect.id, tab: true, replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectKey])

  useEffect(() => { applyTheme(S.theme) }, [S.theme])

  // "Animações suaves": com a opção desligada, ou com movimento reduzido no aparelho, tudo fica parado
  useEffect(() => {
    let mq: MediaQueryList | null = null
    try { mq = matchMedia('(prefers-reduced-motion: reduce)') } catch { /* sem matchMedia */ }
    const apply = (): void => { document.documentElement.classList.toggle('calm', !!S.calm && !mq?.matches) }
    apply()
    mq?.addEventListener?.('change', apply)
    return () => mq?.removeEventListener?.('change', apply)
  }, [S.calm])

  useEffect(() => { syncWeek() }, [tick])

  // troca de tela: volta ao topo, fecha o painel e faz a tela subir 10px em 0,6s
  useLayoutEffect(() => {
    const el = scr.current
    if (!el) return
    closeSheet(true)
    el.scrollTop = 0
    el.classList.remove('enter')
    void el.offsetWidth
    el.classList.add('enter')
    const t = setTimeout(() => el.classList.remove('enter'), 700)
    return () => clearTimeout(t)
  }, [key])

  const tabs = TAB_ROUTES.includes(r.name)
  return (
    <div className="stage">
      <BrandCol />
      <div className="device">
        <div className={'app' + (tabs ? '' : ' notabs')} id="app">
          <StatusBar />
          <main id="screen" ref={scr}><Screen r={r} /></main>
          <TabBar hidden={!tabs} />
          <SheetHost />
          <ToastHost />
        </div>
      </div>
    </div>
  )
}
