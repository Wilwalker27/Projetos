/* Agenda gerada a partir das regras do plano, mais faltas e remarcações.
   Regras (briefing, seção 2):
   - 1 remarcação por mês em cada área;
   - quem falta tem até 12 horas para remarcar; depois disso a sessão é perdida;
   - falta depois de uma remarcação também é perdida;
   - sessão perdida é paga ao profissional. */
import { DUR, KIND, RULES } from '../data/plans'
import type { SessOv } from '../state/store'
import type { IconName, PaidPlanKey, PlanKey, ProKey } from '../types'
import { HOUR, addDays, at, dkey, mkey, now, sameDay, sod } from './dates'

/** Dias e horários fixos de cada área para um acolhido. */
export interface Schedule { psiWd: number; psiH: number; efWd: number; efH: number; efDays: number[]; nutWd: number; nutH: number }
export const DEFAULT_SCHEDULE: Schedule = { psiWd: 4, psiH: 19, efWd: 2, efH: 7, efDays: [5, 15, 25], nutWd: 6, nutH: 9 }

/** O que a agenda precisa saber de um acolhido. O estado do app (State) satisfaz este formato. */
export interface Care {
  plan: PlanKey
  since: number
  pausedAt: number | null
  sess: Record<string, SessOv>
  schedule?: Schedule
}

/** agendado: ainda vai acontecer · realizado · falta: faltou e ainda pode remarcar · perdida: faltou e não pode mais remarcar */
export type SessState = 'agendado' | 'realizado' | 'falta' | 'perdida'

export interface Sess {
  /** "<pro>-<dia original>", ex.: "ana-2026-11-19". Estável mesmo depois de remarcar. */
  id: string
  pro: ProKey
  /** Quando acontece (já considerando remarcação). */
  date: Date
  /** Data original, antes de qualquer remarcação. */
  orig: Date
  dur: number
  kind: string
  /** Sempre online no piloto. */
  mode: string
  ic: IconName
  /** Foi remarcado. */
  moved: boolean
  state: SessState
}

/** Link da chamada no protótipo (fictício). No piloto, cada sessão tem seu link do Google Meet. */
export const MEET_DEMO = 'meet.google.com/exemplo-colo'

const nth = (d: Date): number => Math.ceil(d.getDate() / 7)
const hourOf = (pro: ProKey, sc: Schedule): number => (pro === 'ana' ? sc.psiH : pro === 'rafael' ? sc.efH : sc.nutH)

function isTenDaySlot(d: Date, sc: Schedule): boolean {
  return sc.efDays.some((base) => {
    const t = new Date(d.getFullYear(), d.getMonth(), base)
    if (t.getDay() === 0) t.setDate(base + 1) // domingo passa para segunda
    return sameDay(t, d)
  })
}

/** Áreas com encontro previsto no dia d, pelas regras do plano. */
function baseOn(plan: PaidPlanKey, sc: Schedule, d: Date): ProKey[] {
  const out: ProKey[] = []
  const w = d.getDay()
  // psicologia: toda semana, 4 por mês
  if (w === sc.psiWd && d.getDate() <= 28) out.push('ana')
  // educação física: toda semana (Inteiro, 4 por mês) ou a cada 10 dias (Essencial, 3 por mês)
  if (plan === 'inteiro' ? w === sc.efWd && d.getDate() <= 28 : isTenDaySlot(d, sc)) out.push('rafael')
  // nutrição: uma vez por mês (Essencial) ou a cada 15 dias (Inteiro)
  if (w === sc.nutWd && (nth(d) === 4 || (plan === 'inteiro' && nth(d) === 2))) out.push('julia')
  return out
}

const proOfId = (id: string): string => id.slice(0, id.indexOf('-'))
const monthOfId = (id: string): string => id.slice(id.indexOf('-') + 1, id.indexOf('-') + 8)

/** Remarcações já usadas na área, no mês do encontro original. */
export function reschedUsed(care: Care, pro: ProKey, ref: Date | number): number {
  const m = mkey(ref)
  return Object.entries(care.sess).filter(([id, ov]) => ov.to != null && proOfId(id) === pro && monthOfId(id) === m).length
}
/** Saldo de remarcações da área no mês de ref. */
export const reschedLeft = (care: Care, pro: ProKey, ref: Date | number): number =>
  Math.max(0, RULES.reschedPerMonth - reschedUsed(care, pro, ref))

function stateOf(care: Care, id: string, pro: ProKey, date: Date, orig: Date, nowD: Date): SessState {
  const ov = care.sess[id]
  if (date > nowD) return 'agendado'
  if (ov?.falta) {
    const open = ov.to == null && nowD.getTime() - date.getTime() <= RULES.missWindowH * HOUR && reschedLeft(care, pro, orig) > 0
    return open ? 'falta' : 'perdida'
  }
  return 'realizado'
}

/** Encontros com data em [a, b), em ordem. COLO Aberto não tem encontros. */
export function sessionsBetween(care: Care, a: Date, b: Date, nowD: Date = now()): Sess[] {
  if (care.plan === 'aberto') return []
  const sc = care.schedule ?? DEFAULT_SCHEDULE
  const out: Sess[] = []
  const since = sod(care.since)
  // margem: uma remarcação pode trazer para dentro da janela um encontro de fora dela
  const end = addDays(sod(b), 75)
  for (let d = addDays(sod(a), -75); d < end; d = addDays(d, 1)) {
    if (d < since) continue
    for (const pro of baseOn(care.plan, sc, d)) {
      const orig = at(d, hourOf(pro, sc))
      const id = `${pro}-${dkey(orig)}`
      const ov = care.sess[id]
      const date = ov?.to != null ? new Date(ov.to) : orig
      if (date < a || date >= b) continue
      if (care.pausedAt != null && date.getTime() > care.pausedAt) continue
      out.push({
        id, pro, date, orig, dur: DUR[pro], kind: KIND[pro], mode: 'Online, por vídeo', ic: 'video',
        moved: ov?.to != null, state: stateOf(care, id, pro, date, orig, nowD),
      })
    }
  }
  return out.sort((x, y) => x.date.getTime() - y.date.getTime())
}

/** Próximos encontros (até 45 dias). */
export const upcoming = (care: Care, nowD: Date = now()): Sess[] =>
  sessionsBetween(care, nowD, addDays(nowD, 45), nowD).filter((s) => s.state === 'agendado')
export const nextWith = (care: Care, k: ProKey, nowD: Date = now()): Sess | undefined => upcoming(care, nowD).find((s) => s.pro === k)
/** Último encontro realizado com o profissional (até 45 dias atrás). */
export const lastWith = (care: Care, k: ProKey, nowD: Date = now()): Sess | undefined =>
  sessionsBetween(care, addDays(nowD, -45), nowD, nowD).filter((s) => s.pro === k && s.state === 'realizado').pop()

export type ReschedWhy = 'realizado' | 'ja-remarcado' | 'sem-saldo' | 'fora-do-prazo'
export type ReschedCheck = { ok: true } | { ok: false; why: ReschedWhy }

/** Pode remarcar este encontro agora? Vale para encontro futuro e para falta dentro das 12 horas. */
export function canResched(care: Care, s: Sess): ReschedCheck {
  if (s.state === 'realizado') return { ok: false, why: 'realizado' }
  if (s.moved) return { ok: false, why: 'ja-remarcado' }
  if (reschedLeft(care, s.pro, s.orig) <= 0) return { ok: false, why: 'sem-saldo' }
  if (s.state === 'perdida') return { ok: false, why: 'fora-do-prazo' }
  return { ok: true }
}

/** Até quando uma falta ainda pode ser remarcada. */
export const missDeadline = (s: Sess): Date => new Date(s.date.getTime() + RULES.missWindowH * HOUR)

/** Horários livres oferecidos para remarcar (fictícios), sempre depois de agora. */
export function slotsFor(s: Sess, nowD: Date = now()): Date[] {
  const base = sod(nowD)
  const plan: [number, number][] = s.pro === 'rafael' ? [[2, 7], [3, 18], [6, 7]] : s.pro === 'julia' ? [[2, 10], [4, 9], [7, 11]] : [[2, 18], [3, 10], [6, 19]]
  return plan.map(([d, h]) => at(addDays(base, d), h))
}

/** A sala abre 10 minutos antes e fica aberta até o fim do encontro. */
export const roomOpensAt = (s: Sess): Date => new Date(s.date.getTime() - 10 * 60000)
export const roomOpen = (s: Sess, nowD: Date = now()): boolean =>
  nowD >= roomOpensAt(s) && nowD.getTime() < s.date.getTime() + s.dur * 60000
