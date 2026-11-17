/* Navegação do COLO: rotas no hash (#/agenda, #/chat/ana), integradas ao botão voltar
   do aparelho. Não precisa de regra de servidor: funciona em qualquer hospedagem estática. */
import { useSyncExternalStore } from 'react'
import { getS } from '../state/store'

export type RouteName =
  | 'welcome' | 'onboard' | 'home' | 'agenda' | 'pausas' | 'jornada' | 'trio' | 'perfil' | 'planos'
  | 'breathe' | 'session' | 'chat' | 'privacidade'
  | 'pro' | 'pro-acolhidos' | 'pro-acolhido' | 'pro-conversas' | 'pro-chat' | 'pro-resumo'

export interface Route { name: RouteName; id?: string }

const NAMES: RouteName[] = [
  'welcome', 'onboard', 'home', 'agenda', 'pausas', 'jornada', 'trio', 'perfil', 'planos', 'breathe', 'session', 'chat', 'privacidade',
  'pro', 'pro-acolhidos', 'pro-acolhido', 'pro-conversas', 'pro-chat', 'pro-resumo',
]
/** Telas que mostram a barra de abas. */
export const TAB_ROUTES: RouteName[] = ['home', 'agenda', 'pausas', 'jornada', 'trio', 'perfil', 'planos', 'pro', 'pro-acolhidos', 'pro-conversas', 'pro-resumo']
export const isProRoute = (n: RouteName): boolean => n === 'pro' || n.startsWith('pro-')

function parse(hash: string): Route | null {
  const [name, id] = hash.replace(/^#\/?/, '').split('/')
  if (!NAMES.includes(name as RouteName)) return null
  return { name: name as RouteName, id: id ? decodeURIComponent(id) : undefined }
}
const toHash = (r: Route): string => '#/' + r.name + (r.id ? '/' + encodeURIComponent(r.id) : '')
/** Tela inicial conforme o estado: boas-vindas, início ou painel do profissional. */
export const homeRoute = (): Route => {
  const s = getS()
  return { name: s.view === 'pro' ? 'pro' : s.onboarded ? 'home' : 'welcome' }
}

let cur: Route = parse(location.hash) ?? homeRoute()
let depth = 0
const subs = new Set<() => void>()
const emit = (): void => subs.forEach((fn) => fn())
const hist = (): History | null => { try { return window.history } catch { return null } }

try { hist()?.replaceState({ d: 0 }, '', toHash(cur)) } catch { /* ambiente sem histórico */ }
window.addEventListener('popstate', (e) => {
  cur = parse(location.hash) ?? homeRoute()
  depth = (e.state as { d?: number } | null)?.d ?? 0
  emit()
})

export interface GoOpts {
  id?: string
  /** Navegação de aba: zera a pilha do botão voltar do app. */
  tab?: boolean
  /** Troca a tela atual sem empilhar. */
  replace?: boolean
}
export function go(name: RouteName, o: GoOpts = {}): void {
  const next: Route = { name, id: o.id }
  const same = next.name === cur.name && next.id === cur.id
  const d = o.tab ? 0 : o.replace || same ? depth : depth + 1
  try {
    if (o.replace || same) hist()?.replaceState({ d }, '', toHash(next))
    else hist()?.pushState({ d }, '', toHash(next))
  } catch { /* segue só em memória */ }
  depth = d
  cur = next
  emit()
}
/** Botão voltar das telas cheias. Sem pilha, vai para a tela inicial. */
export function back(): void {
  if (depth > 0 && hist()) { hist()!.back(); return }
  const h = homeRoute()
  go(h.name, { tab: true, replace: true })
}

const subscribe = (fn: () => void): (() => void) => { subs.add(fn); return () => { subs.delete(fn) } }
const snap = (): Route => cur
/** Rota atual, reativa. */
export const useRoute = (): Route => useSyncExternalStore(subscribe, snap, snap)
export const getRoute = (): Route => cur
