/* Estado do COLO, salvo apenas neste aparelho (localStorage).
   No piloto real, este módulo é o ponto de troca para o Supabase (região São Paulo). */
import { useSyncExternalStore } from 'react'
import { NOTAS, ORDER } from '../data/content'
import { DAY, addDays, dkey, setClockOffset, sod } from '../lib/dates'
import type { Anotacao, FocoKey, JournalEntry, Msg, PlanKey, ProKey, ThemeKey, TimeKey, ToneKey, ViewKey } from '../types'

/** Ajuste de um encontro: falta marcada pelo profissional e/ou novo horário (remarcação). */
export interface SessOv { falta?: boolean; to?: number }
/** Notas do profissional sobre um acolhido: a privada só ele vê; a compartilhada vai para o trio e para o acolhido. */
export interface ProNote { priv: string; shared: string; sharedAt: number | null }
/** Aviso de cuidado para a psicóloga. Nunca guarda o texto que a pessoa escreveu. */
export interface RiskAlert { d: number; src: 'diario' | 'anotacao' | 'conversa' }
/** Consentimentos (LGPD): termo do atendimento online, leitura dos check-ins e troca de notas por área. */
export interface Consents { tcle: boolean; checkins: boolean; share: Record<ProKey, boolean> }
export interface InviteState { shownAt: number | null; day: string | null; closed: boolean; force: boolean }

export interface State {
  v: 1
  onboarded: boolean
  name: string
  focuses: FocoKey[]
  time: TimeKey
  tone: ToneKey
  theme: ThemeKey
  /** Animações suaves ligadas. */
  calm: boolean
  /** 'aberto' = COLO Aberto (gratuito). */
  plan: PlanKey
  /** Momento em que o plano foi pausado, ou null. */
  pausedAt: number | null
  /** Lado do protótipo: acolhido ou painel do profissional. */
  view: ViewKey
  /** Profissional em uso no painel. */
  proAs: ProKey
  /** Início no COLO (histórico fictício: 57 dias atrás). */
  since: number
  /** Check-ins de clima: dia ("2026-11-16") -> índice em MOODS. */
  moods: Record<string, number>
  /** Combinados da semana: quantas vezes fez. */
  comb: Record<ProKey, number>
  combDay: Partial<Record<ProKey, string>>
  /** Segunda-feira da semana a que os combinados se referem. */
  combWeek: string
  journal: JournalEntry[]
  notes: Anotacao[]
  /** Momento de cada pausa concluída. */
  pauseLog: number[]
  chats: Record<ProKey, Msg[]>
  noteIdx: number
  sess: Record<string, SessOv>
  consents: Consents
  invite: InviteState
  /** Conversa de boas-vindas marcada (antes de assinar), ou null. */
  welcomeTalk: number | null
  /** Notas do painel: chave "<pro>:<acolhido>". */
  proNotes: Record<string, ProNote>
  /** Conversas do painel com acolhidos fictícios: chave "<pro>:<acolhido>". */
  proChats: Record<string, Msg[]>
  alerts: RiskAlert[]
  /** Relógio do protótipo: deslocamento em ms. */
  clock: number
}

const KEY = 'colo.app.v1'

/** Segunda-feira da semana de d, como chave de dia. */
export const weekKey = (d: Date | number): string => { const x = sod(d); return dkey(addDays(x, -((x.getDay() + 6) % 7))) }

export function defaultChats(): Record<ProKey, Msg[]> {
  return {
    ana: [
      { from: 'day', x: 'ontem' },
      { from: 'pro', t: '18:40', x: 'Oi! Lembrei do que você contou sobre as tardes de segunda. Se bater aquele aperto, experimenta a âncora 5-4-3-2-1 e depois me conta como foi?' },
      { from: 'me', t: '21:12', x: 'Tentei hoje. Ajudou a desacelerar um pouco.' },
      { from: 'pro', t: '21:30', x: 'Que bom que você tentou. Um pouco já é movimento. Na quinta a gente conversa mais sobre isso.' },
    ],
    rafael: [
      { from: 'day', x: 'esta semana' },
      { from: 'pro', t: '08:05', x: 'Mandou bem no treino! Subi a caminhada pra 25 minutos. Se o joelho reclamar, volta pra 20 e me avisa.' },
    ],
    julia: [
      { from: 'day', x: 'sábado' },
      { from: 'pro', t: '10:20', x: 'Lembrete gentil: o lanche da tarde planejado é o nosso combinado do mês. Pode ser simples, tipo fruta com castanhas.' },
    ],
  }
}

/** Notas iniciais (fictícias) do trio sobre a própria pessoa: chave "<pro>:voce". */
function defaultProNotes(): Record<string, ProNote> {
  const priv: Record<ProKey, string> = {
    ana: 'Observar a autocobrança nas segundas. Retomar o registro de pensamentos na próxima sessão.',
    rafael: 'Joelho direito sensível em descidas. Manter progressão leve e checar o calçado.',
    julia: 'Pula o lanche em dias de reunião longa. Sugerir opções que não precisem de geladeira.',
  }
  const out: Record<string, ProNote> = {}
  ORDER.forEach((k) => { out[`${k}:voce`] = { priv: priv[k], shared: NOTAS[k], sharedAt: null } })
  return out
}

const SAMPLE_MOODS = [1, 2, 1, 2, 3, 2, 2, 3, 3, 2, 4, 3, 3]

export function fresh(): State {
  const today = sod(Date.now())
  const moods: Record<string, number> = {}
  SAMPLE_MOODS.forEach((m, i) => { moods[dkey(addDays(today, i - 13))] = m })
  return {
    v: 1,
    onboarded: false, name: '', focuses: ['mente', 'dormir'], time: 'noite', tone: 'delicada', theme: 'auto', calm: true,
    plan: 'aberto', pausedAt: null, view: 'acolhido', proAs: 'ana',
    since: today.getTime() - 57 * DAY,
    moods, comb: { ana: 2, rafael: 2, julia: 3 }, combDay: {}, combWeek: weekKey(today),
    journal: [], notes: [], pauseLog: [], chats: defaultChats(), noteIdx: 0, sess: {},
    consents: { tcle: false, checkins: false, share: { ana: false, rafael: false, julia: false } },
    invite: { shownAt: null, day: null, closed: false, force: false },
    welcomeTalk: null, proNotes: defaultProNotes(), proChats: {}, alerts: [], clock: 0,
  }
}

function load(): State {
  const base = fresh()
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null') as Partial<State> | null
    if (!raw || typeof raw !== 'object' || raw.v !== 1) return base
    return {
      ...base, ...raw,
      consents: { ...base.consents, ...(raw.consents || {}), share: { ...base.consents.share, ...(raw.consents?.share || {}) } },
      invite: { ...base.invite, ...(raw.invite || {}) },
      comb: { ...base.comb, ...(raw.comb || {}) },
      chats: { ...base.chats, ...(raw.chats || {}) },
      proNotes: { ...base.proNotes, ...(raw.proNotes || {}) },
    }
  } catch {
    return base
  }
}

let S: State = load()
setClockOffset(S.clock)

const subs = new Set<() => void>()
const subscribe = (fn: () => void): (() => void) => { subs.add(fn); return () => { subs.delete(fn) } }

/** Estado atual (fora de componentes). */
export const getS = (): State => S

/** Atualiza o estado, salva e avisa a interface. Nunca altere S diretamente. */
export function setS(patch: Partial<State> | ((s: State) => Partial<State>)): void {
  const p = typeof patch === 'function' ? patch(S) : patch
  S = { ...S, ...p }
  setClockOffset(S.clock)
  try { localStorage.setItem(KEY, JSON.stringify(S)) } catch { /* armazenamento indisponível: segue em memória */ }
  subs.forEach((fn) => fn())
}

/** Estado inteiro, reativo. Use dentro de componentes: const S = useS(). */
export function useS(): State {
  return useSyncExternalStore(subscribe, getS, getS)
}

/** Apaga tudo o que foi salvo neste aparelho e volta ao estado inicial. */
export function wipe(): void {
  try { localStorage.removeItem(KEY) } catch { /* sem armazenamento */ }
  S = fresh()
  setClockOffset(0)
  subs.forEach((fn) => fn())
}
