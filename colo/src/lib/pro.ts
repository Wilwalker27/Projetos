/* Dados do painel do profissional: acolhidos, agenda da semana e resumo do mês. */
import { DEMO_ACOLHIDOS } from '../data/demo'
import { PAYOUT } from '../data/plans'
import type { ProNote, SessOv, State } from '../state/store'
import type { FocoKey, Msg, PaidPlanKey, ProKey } from '../types'
import { DAY, addDays, dkey, monthRange, now, sod } from './dates'
import { DEFAULT_SCHEDULE, sessionsBetween, type Care, type Sess } from './sessions'

export interface Acolhido {
  /** 'voce' é a pessoa que usa este aparelho; os outros são fictícios. */
  id: string
  name: string
  first: string
  plan: PaidPlanKey
  focuses: FocoKey[]
  /** Check-ins dos últimos 7 dias (índice em MOODS ou null). O último é hoje. */
  moods: (number | null)[]
  comb: Record<ProKey, number>
  care: Care
  /** Autorizou a psicóloga a ler os check-ins. */
  checkins: boolean
  /** Autorizou cada área a trocar notas com o trio. */
  share: Record<ProKey, boolean>
  fict: boolean
}

/** Acolhidos atendidos pelo trio. A pessoa deste aparelho entra na lista quando tem plano. */
export function acolhidos(S: State, nowD: Date = now()): Acolhido[] {
  const out: Acolhido[] = []
  const today = sod(nowD)
  if (S.plan !== 'aberto') {
    out.push({
      id: 'voce', name: S.name || 'Acolhido deste aparelho', first: S.name || 'Você', plan: S.plan, focuses: S.focuses,
      moods: [...Array(7)].map((_, i) => S.moods[dkey(addDays(today, i - 6))] ?? null),
      comb: S.comb, care: S, checkins: S.consents.checkins, share: S.consents.share, fict: false,
    })
  }
  for (const a of DEMO_ACOLHIDOS) {
    const base: Care = { plan: a.plan, since: today.getTime() - a.sinceDays * DAY, pausedAt: null, sess: {}, schedule: a.schedule }
    const sess: Record<string, SessOv> = {}
    for (const f of a.faltas) {
      const past = sessionsBetween(base, addDays(nowD, -60), nowD, nowD).filter((s) => s.pro === f.pro)
      const hit = past[past.length - f.back]
      if (hit) sess[hit.id] = { falta: true }
    }
    out.push({
      id: a.id, name: a.name, first: a.first, plan: a.plan, focuses: a.focuses,
      moods: a.moods.map((m) => (m < 0 ? null : m)), comb: a.comb, care: { ...base, sess },
      checkins: a.checkins, share: a.share, fict: true,
    })
  }
  return out
}
export const acolhidoById = (S: State, id: string, nowD: Date = now()): Acolhido | undefined => acolhidos(S, nowD).find((a) => a.id === id)

export interface ProSess { who: Acolhido; s: Sess }
/** Encontros do profissional com todos os acolhidos em [a, b). */
export function proSessions(S: State, pro: ProKey, a: Date, b: Date, nowD: Date = now()): ProSess[] {
  return acolhidos(S, nowD)
    .flatMap((who) => sessionsBetween(who.care, a, b, nowD).filter((s) => s.pro === pro).map((s) => ({ who, s })))
    .sort((x, y) => x.s.date.getTime() - y.s.date.getTime())
}

export interface MonthSummary {
  /** Sessões feitas no mês, até agora. */
  done: number
  /** Faltas que viraram sessão perdida (pagas ao profissional). */
  missed: number
  /** Faltas ainda dentro das 12 horas para remarcar. */
  open: number
  /** Encontros ainda por vir no mês. */
  ahead: number
  /** Repasse por sessão, em reais. */
  rate: number
  /** Valor a receber até agora: feitas + perdidas. */
  total: number
}
export function monthSummary(S: State, pro: ProKey, ref: Date = now(), nowD: Date = now()): MonthSummary {
  const [a, b] = monthRange(ref)
  const L = proSessions(S, pro, a, b, nowD)
  const n = (st: Sess['state']): number => L.filter((x) => x.s.state === st).length
  const done = n('realizado'), missed = n('perdida')
  return { done, missed, open: n('falta'), ahead: n('agendado'), rate: PAYOUT[pro], total: (done + missed) * PAYOUT[pro] }
}

const noteKey = (pro: ProKey, id: string): string => `${pro}:${id}`
const EMPTY: ProNote = { priv: '', shared: '', sharedAt: null }
/** Notas de um profissional sobre um acolhido (as dos fictícios começam com um texto de exemplo). */
export function proNote(S: State, pro: ProKey, id: string): ProNote {
  const saved = S.proNotes[noteKey(pro, id)]
  if (saved) return saved
  const d = DEMO_ACOLHIDOS.find((a) => a.id === id)
  return d ? { ...d.notes[pro], sharedAt: null } : EMPTY
}
/** Conversa do profissional com um acolhido. Do lado do profissional, 'me' é o acolhido e 'pro' é ele mesmo. */
export function proThread(S: State, pro: ProKey, id: string): Msg[] {
  if (id === 'voce') return S.chats[pro] || []
  return S.proChats[noteKey(pro, id)] || DEMO_ACOLHIDOS.find((a) => a.id === id)?.chats[pro] || []
}
export { DEFAULT_SCHEDULE }
