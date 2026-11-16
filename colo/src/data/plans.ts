/* Planos e regras do piloto (briefing, seção 2). Único lugar onde preço e regra vivem. */
import type { PaidPlanKey, PlanKey, ProKey } from '../types'

export interface PlanFreq { perMonth: number; label: string }
export interface Plan {
  key: PlanKey
  name: string
  /** Preço mensal em reais; 0 no COLO Aberto. Mostrar só na tela de Planos e em "Seu plano". */
  price: number
  lead: string
  freq: Record<ProKey, PlanFreq> | null
}

export const PLANS: Record<PlanKey, Plan> = {
  aberto: {
    key: 'aberto', name: 'COLO Aberto', price: 0,
    lead: 'Check-in, diário, anotações, pausas, bilhete do dia e mensagens de apoio. Gratuito, sem prazo.',
    freq: null,
  },
  essencial: {
    key: 'essencial', name: 'COLO Essencial', price: 499,
    lead: 'O trio inteiro com você, num ritmo mais espaçado.',
    freq: {
      ana: { perMonth: 4, label: 'toda semana' },
      rafael: { perMonth: 3, label: 'a cada 10 dias' },
      julia: { perMonth: 1, label: 'uma vez por mês' },
    },
  },
  inteiro: {
    key: 'inteiro', name: 'COLO Inteiro', price: 679,
    lead: 'O trio inteiro com você, com mais presença no corpo e na comida.',
    freq: {
      ana: { perMonth: 4, label: 'toda semana' },
      rafael: { perMonth: 4, label: 'toda semana' },
      julia: { perMonth: 2, label: 'a cada 15 dias' },
    },
  },
}
export const PAID_PLANS: PaidPlanKey[] = ['essencial', 'inteiro']

/** O que o app oferece em qualquer plano, inclusive no COLO Aberto. */
export const APP_INCLUDES = ['Check-in de clima', 'Diário e anotações', 'Todas as pausas', 'Bilhete do dia e mensagens de apoio', 'Botão COLO']

export const RULES = {
  /** Remarcações por mês em cada área. */
  reschedPerMonth: 1,
  /** Quem falta tem até 12 horas para remarcar; depois disso a sessão é perdida. */
  missWindowH: 12,
  /** Arrependimento (CDC): estorno em até 7 dias, desfazendo a divisão do pagamento. */
  refundDays: 7,
  /** No COLO Aberto: no máximo 1 convite para assinar a cada 7 dias. */
  inviteGapDays: 7,
  /** Momento com sentido para o convite: 7 dias com diário. */
  inviteDiaryDays: 7,
} as const

/** Repasse por sessão realizada (ou perdida), em reais. Só aparece no painel do profissional. */
export const PAYOUT: Record<ProKey, number> = { ana: 65, rafael: 50, julia: 60 }

/** Duração de cada encontro, em minutos. */
export const DUR: Record<ProKey, number> = { ana: 50, rafael: 50, julia: 60 }
export const KIND: Record<ProKey, string> = { ana: 'Sessão de psicologia', rafael: 'Treino', julia: 'Consulta de nutrição' }

export const brl = (v: number): string => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })
