/* Tipos compartilhados do COLO. */

export type ProKey = 'ana' | 'rafael' | 'julia'
/** 'aberto' é o COLO Aberto (gratuito); os outros dois são assinaturas. */
export type PlanKey = 'aberto' | 'essencial' | 'inteiro'
export type PaidPlanKey = Exclude<PlanKey, 'aberto'>
export type FocoKey = 'mente' | 'mexer' | 'comer' | 'dormir' | 'energia' | 'pressao'
export type TimeKey = 'manha' | 'tarde' | 'noite'
export type ToneKey = 'delicada' | 'empurrao' | 'quieta'
export type ThemeKey = 'auto' | 'light' | 'dark'
export type MoodKey = 'chuva' | 'nublado' | 'neblina' | 'abrindo' | 'sol'
export type AreaColor = 'mente' | 'corpo' | 'nutri'
export type ViewKey = 'acolhido' | 'pro'

export type IconName =
  | 'home' | 'cal' | 'leaf' | 'path' | 'chat' | 'video' | 'pin' | 'back' | 'next' | 'x' | 'check'
  | 'play' | 'pause' | 'send' | 'sun' | 'moon' | 'sunrise' | 'user' | 'wind' | 'anchor' | 'pen'
  | 'shoulders' | 'bowl' | 'walk' | 'quote' | 'users' | 'lock' | 'note' | 'chart' | 'clock' | 'phone'
  | 'heart' | 'download' | 'trash' | 'out'

export interface Pro {
  name: string
  first: string
  role: string
  /** Assinatura do bilhete para quem tem plano: "sua psicóloga". */
  sign: string
  /** Assinatura do bilhete no COLO Aberto: "psicóloga do COLO". */
  signFree: string
  area: string
  /** Nome do serviço em minúsculas: "psicologia". */
  service: string
  reg: string
  color: AreaColor
  approach: string
  rhythm: Record<PaidPlanKey, string>
  bio: string
  /** Horário de resposta combinado na conversa (fictício no piloto). */
  reply: string
  replyWindow: string
  comb: { text: string; goal: number; unit: string; one: string }
}

export interface Foco { k: FocoKey; t: string }
export interface Hora { k: TimeKey; t: string; d: string; ic: IconName }
export interface Tom { k: ToneKey; t: string; s: string; ex: string }
export interface Mood {
  k: MoodKey
  t: string
  r: string
  /** Ações para quem tem plano: [ação, rótulo]. */
  a: [string, string][]
  /** Ações no COLO Aberto, quando diferem (sem conversa com profissional). */
  aFree?: [string, string][]
  /** Registro difícil: nunca mostrar convite para assinar perto dele. */
  hard?: boolean
}
export interface Bilhete { by: ProKey; tag: FocoKey; x: string }
export interface PausaStep { t: string; d: string; s?: number; input?: boolean }
export interface Pausa {
  id: string
  title: string
  by: ProKey
  ic: IconName
  cat: string[]
  min: number
  desc: string
  /** Descrição no COLO Aberto, quando a original cita o plano. */
  descFree?: string
  special?: 'breathe'
  journal?: boolean
  steps?: PausaStep[]
}

export interface Msg {
  from: 'day' | 'pro' | 'me' | 'sys'
  /** Hora "HH:MM" (mensagens) */
  t?: string
  x: string
  /** Momento do envio (mensagens novas). As mensagens de exemplo não têm. */
  d?: number
}
export interface JournalEntry {
  d: number
  title: string
  items: { q: string; a: string }[]
}
export interface Anotacao { id: string; d: number; x: string }
