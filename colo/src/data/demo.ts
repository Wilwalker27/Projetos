/* Acolhidos FICTÍCIOS para o painel do profissional. Só existem no protótipo. */
import type { Schedule } from '../lib/sessions'
import type { FocoKey, Msg, PaidPlanKey, ProKey } from '../types'

export interface DemoAcolhido {
  id: string
  name: string
  first: string
  plan: PaidPlanKey
  /** Há quantos dias está no COLO. */
  sinceDays: number
  schedule: Schedule
  focuses: FocoKey[]
  /** Check-ins dos últimos 7 dias (índice em MOODS; -1 = sem check-in). O último é hoje. */
  moods: number[]
  comb: Record<ProKey, number>
  /** Faltas: a n-ésima sessão passada mais recente daquela área (1 = a última). */
  faltas: { pro: ProKey; back: number }[]
  /** Autorizações da pessoa. */
  checkins: boolean
  share: Record<ProKey, boolean>
  notes: Record<ProKey, { priv: string; shared: string }>
  chats: Record<ProKey, Msg[]>
}

export const DEMO_ACOLHIDOS: DemoAcolhido[] = [
  {
    id: 'bia', name: 'Beatriz Moura', first: 'Bia', plan: 'inteiro', sinceDays: 96,
    schedule: { psiWd: 1, psiH: 18, efWd: 3, efH: 6, efDays: [3, 13, 23], nutWd: 5, nutH: 12 },
    focuses: ['pressao', 'dormir'], moods: [2, 1, -1, 3, 3, 2, 3], comb: { ana: 3, rafael: 2, julia: 4 },
    faltas: [{ pro: 'rafael', back: 2 }], checkins: true, share: { ana: true, rafael: true, julia: true },
    notes: {
      ana: { priv: 'Insônia ligada a fechamento de mês no trabalho. Trabalhar higiene do sono sem virar mais uma cobrança.', shared: 'Semana de pico no trabalho. Combinamos proteger a última hora do dia.' },
      rafael: { priv: 'Prefere treinar cedo. Evitar impacto por enquanto.', shared: 'Treinos mais curtos nesta semana, foco em mobilidade.' },
      julia: { priv: 'Janta tarde em dias de fechamento. Ver marmita de véspera.', shared: 'Jantar mais cedo em três dias da semana.' },
    },
    chats: {
      ana: [{ from: 'day', x: 'ontem' }, { from: 'me', t: '22:10', x: 'Consegui desligar a tela às dez, dois dias seguidos.' }, { from: 'pro', t: '09:05', x: 'Dois dias já é um caminho. Na segunda a gente olha o que ajudou.' }],
      rafael: [{ from: 'day', x: 'esta semana' }, { from: 'me', t: '06:40', x: 'Hoje não acordei a tempo, desculpa.' }],
      julia: [{ from: 'day', x: 'esta semana' }, { from: 'pro', t: '11:15', x: 'Mandei três ideias de jantar rápido. Vê qual combina com a sua semana.' }],
    },
  },
  {
    id: 'caio', name: 'Caio Ribeiro', first: 'Caio', plan: 'essencial', sinceDays: 41,
    schedule: { psiWd: 3, psiH: 12, efWd: 5, efH: 18, efDays: [8, 18, 28], nutWd: 2, nutH: 17 },
    focuses: ['mexer', 'energia'], moods: [3, 3, 4, -1, 2, 3, -1], comb: { ana: 1, rafael: 3, julia: 2 },
    faltas: [], checkins: true, share: { ana: true, rafael: true, julia: false },
    notes: {
      ana: { priv: 'Chegou por cansaço constante. Explorar o que ele chama de preguiça.', shared: 'Estamos separando cansaço de falta de vontade.' },
      rafael: { priv: 'Sedentário há três anos. Começar pelo que ele já gosta: bicicleta.', shared: 'Duas pedaladas leves por semana, 20 minutos.' },
      julia: { priv: 'Não autorizou a troca de notas de nutrição com o trio.', shared: '' },
    },
    chats: {
      ana: [{ from: 'day', x: 'segunda' }, { from: 'pro', t: '10:00', x: 'Como foi o fim de semana sem despertador?' }],
      rafael: [{ from: 'day', x: 'ontem' }, { from: 'me', t: '19:30', x: 'Pedalei 25 minutos! Cansei menos do que achava.' }],
      julia: [{ from: 'day', x: 'esta semana' }, { from: 'me', t: '13:02', x: 'Posso trocar o lanche por iogurte?' }],
    },
  },
  {
    id: 'lucia', name: 'Lúcia Andrade', first: 'Lúcia', plan: 'essencial', sinceDays: 23,
    schedule: { psiWd: 2, psiH: 15, efWd: 4, efH: 9, efDays: [2, 12, 22], nutWd: 1, nutH: 10 },
    focuses: ['comer', 'mente'], moods: [1, 0, 1, 2, -1, 2, 2], comb: { ana: 2, rafael: 1, julia: 3 },
    faltas: [{ pro: 'ana', back: 1 }], checkins: false, share: { ana: false, rafael: true, julia: true },
    notes: {
      ana: { priv: 'Relação difícil com o espelho. Ir devagar, sem tarefas de exposição por enquanto.', shared: '' },
      rafael: { priv: 'Desconforto em mostrar o corpo na câmera. Oferecer treino com câmera opcional.', shared: 'Treinos com câmera opcional, no ritmo dela.' },
      julia: { priv: 'Histórico de dietas restritivas. Nada de contagem.', shared: 'Sem contagem e sem balança. Foco em regularidade.' },
    },
    chats: {
      ana: [{ from: 'day', x: 'ontem' }, { from: 'me', t: '15:20', x: 'Não consegui entrar hoje. Posso remarcar?' }],
      rafael: [{ from: 'day', x: 'esta semana' }, { from: 'pro', t: '09:40', x: 'Pode deixar a câmera desligada quando quiser, combinado?' }],
      julia: [{ from: 'day', x: 'sábado' }, { from: 'me', t: '08:15', x: 'Tomei café da manhã três dias seguidos.' }],
    },
  },
]
