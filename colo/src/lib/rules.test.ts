/* Testes das regras do piloto (briefing, seções 2 e 4): frequências por plano, remarcação,
   faltas, convite para assinar, palavras de risco e resumo do profissional. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PAYOUT } from '../data/plans'
import { fresh, type State } from '../state/store'
import type { PlanKey, ProKey } from '../types'
import { HOUR, addDays, dkey } from './dates'
import { diaryDays, hardMoodNear, inviteVisible } from './invite'
import { acolhidos, monthSummary } from './pro'
import { hasRisk } from './risk'
import { canResched, reschedLeft, sessionsBetween, upcoming, type Care, type Sess } from './sessions'

const care = (plan: PlanKey, extra: Partial<Care> = {}): Care => ({ plan, since: +new Date(2025, 0, 1), pausedAt: null, sess: {}, ...extra })
const month = (c: Care, y: number, m: number, nowD = new Date(2026, 10, 17, 12)): Sess[] => sessionsBetween(c, new Date(y, m, 1), new Date(y, m + 1, 1), nowD)
const count = (L: Sess[], k: ProKey): number => L.filter((s) => s.pro === k).length

describe('frequências por plano', () => {
  for (let m = 0; m < 12; m++) {
    it(`mês ${m + 1} de 2026`, () => {
      const e = month(care('essencial'), 2026, m), i = month(care('inteiro'), 2026, m)
      expect([count(e, 'ana'), count(e, 'rafael'), count(e, 'julia')]).toEqual([4, 3, 1])
      expect([count(i, 'ana'), count(i, 'rafael'), count(i, 'julia')]).toEqual([4, 4, 2])
      // nunca dois encontros da mesma área no mesmo dia
      for (const L of [e, i]) expect(new Set(L.map((s) => s.pro + dkey(s.date))).size).toBe(L.length)
    })
  }
  it('COLO Aberto não tem encontros', () => expect(month(care('aberto'), 2026, 10)).toEqual([]))
  it('educação física do Essencial sai do domingo para a segunda', () => {
    // 15 de novembro de 2026 é domingo
    const ef = month(care('essencial'), 2026, 10).filter((s) => s.pro === 'rafael').map((s) => s.date.getDate())
    expect(ef).toEqual([5, 16, 25])
  })
  it('tudo online', () => expect(month(care('inteiro'), 2026, 10).every((s) => s.mode === 'Online, por vídeo')).toBe(true))
})

describe('remarcação: 1 por mês em cada área', () => {
  const nowD = new Date(2026, 10, 17, 12)
  const to = +new Date(2026, 10, 20, 10)
  it('usa o saldo da área e move o encontro, mantendo o id', () => {
    const c = care('essencial', { sess: { 'ana-2026-11-19': { to } } })
    expect(reschedLeft(care('essencial'), 'ana', nowD)).toBe(1)
    expect(reschedLeft(c, 'ana', nowD)).toBe(0)
    expect(reschedLeft(c, 'rafael', nowD)).toBe(1) // áreas independentes
    expect(reschedLeft(c, 'ana', new Date(2026, 11, 3))).toBe(1) // volta no mês seguinte
    const L = month(c, 2026, 10, nowD)
    const s = L.find((x) => x.id === 'ana-2026-11-19')!
    expect(+s.date).toBe(to)
    expect(s.moved).toBe(true)
    expect(L.filter((x) => x.pro === 'ana' && x.date.getDate() === 19)).toHaveLength(0)
    expect(count(L, 'ana')).toBe(4)
  })
  it('explica por que não dá para remarcar', () => {
    const c = care('essencial', { sess: { 'ana-2026-11-19': { to } } })
    const L = month(c, 2026, 10, nowD)
    expect(canResched(c, L.find((x) => x.id === 'ana-2026-11-19')!)).toEqual({ ok: false, why: 'ja-remarcado' })
    expect(canResched(c, L.find((x) => x.id === 'ana-2026-11-26')!)).toEqual({ ok: false, why: 'sem-saldo' })
    expect(canResched(c, L.find((x) => x.id === 'ana-2026-11-12')!)).toEqual({ ok: false, why: 'realizado' })
    expect(canResched(c, L.find((x) => x.pro === 'julia')!)).toEqual({ ok: true })
  })
})

describe('faltas: 12 horas para remarcar', () => {
  const id = 'ana-2026-11-12' // quinta, 19h
  const at19 = +new Date(2026, 10, 12, 19)
  const st = (c: Care, nowD: Date): Sess => month(c, 2026, 10, nowD).find((x) => x.id === id)!
  it('dentro de 12 horas e com saldo: ainda pode remarcar', () => {
    const c = care('essencial', { sess: { [id]: { falta: true } } })
    expect(st(c, new Date(at19 + 11 * HOUR)).state).toBe('falta')
    expect(canResched(c, st(c, new Date(at19 + 11 * HOUR)))).toEqual({ ok: true })
  })
  it('depois de 12 horas: perdida', () => {
    const c = care('essencial', { sess: { [id]: { falta: true } } })
    const s = st(c, new Date(at19 + 13 * HOUR))
    expect(s.state).toBe('perdida')
    expect(canResched(c, s)).toEqual({ ok: false, why: 'fora-do-prazo' })
  })
  it('sem saldo: perdida na hora', () => {
    const c = care('essencial', { sess: { [id]: { falta: true }, 'ana-2026-11-05': { to: +new Date(2026, 10, 6, 10) } } })
    const s = st(c, new Date(at19 + HOUR))
    expect(s.state).toBe('perdida')
    expect(canResched(c, s)).toEqual({ ok: false, why: 'sem-saldo' })
  })
  it('falta depois de uma remarcação: perdida', () => {
    const to = +new Date(2026, 10, 13, 10)
    const c = care('essencial', { sess: { [id]: { to, falta: true } } })
    const s = st(c, new Date(to + HOUR))
    expect(s.state).toBe('perdida')
    expect(canResched(c, s)).toEqual({ ok: false, why: 'ja-remarcado' })
  })
  it('remarcar a falta dentro do prazo devolve o encontro à agenda', () => {
    const to = +new Date(2026, 10, 14, 10)
    const c = care('essencial', { sess: { [id]: { to } } })
    expect(st(c, new Date(at19 + 2 * HOUR)).state).toBe('agendado')
  })
  it('sem falta marcada, encontro passado conta como realizado', () => {
    expect(st(care('essencial'), new Date(at19 + HOUR)).state).toBe('realizado')
  })
})

describe('plano em pausa', () => {
  it('não gera encontros depois da pausa', () => {
    const nowD = new Date(2026, 10, 17, 12)
    expect(upcoming(care('inteiro', { pausedAt: +nowD }), nowD)).toEqual([])
    expect(upcoming(care('inteiro'), nowD).length).toBeGreaterThan(0)
  })
})

describe('convite para assinar (COLO Aberto)', () => {
  const nowD = new Date(2026, 10, 17, 12)
  const diary = (n: number): State['journal'] => [...Array(n)].map((_, i) => ({ d: +addDays(nowD, -i), title: 'Diário', items: [{ q: 'q', a: 'a' }] }))
  const base = (p: Partial<State> = {}): State => ({ ...fresh(), plan: 'aberto', moods: {}, journal: diary(7), ...p })
  const iv = (p: Partial<State['invite']> = {}): State['invite'] => ({ shownAt: null, day: null, closed: false, force: false, ...p })
  it('aparece depois de 7 dias de diário, não antes', () => {
    expect(diaryDays(base())).toBe(7)
    expect(inviteVisible(base(), nowD)).toBe(true)
    expect(inviteVisible(base({ journal: diary(6) }), nowD)).toBe(false)
  })
  it('nunca para assinante', () => expect(inviteVisible(base({ plan: 'essencial', invite: iv({ force: true }) }), nowD)).toBe(false))
  it('nunca perto de um check-in difícil, nem forçado', () => {
    for (const mood of [0, 2]) { // chovendo, neblina
      for (const off of [0, -1]) {
        const s = base({ moods: { [dkey(addDays(nowD, off))]: mood }, invite: iv({ force: true }) })
        expect(hardMoodNear(s, nowD)).toBe(true)
        expect(inviteVisible(s, nowD)).toBe(false)
      }
    }
    expect(inviteVisible(base({ moods: { [dkey(nowD)]: 1 } }), nowD)).toBe(true) // nublado não bloqueia
  })
  it('no máximo 1 por semana', () => {
    expect(inviteVisible(base({ invite: iv({ shownAt: +addDays(nowD, -6), day: dkey(addDays(nowD, -6)) }) }), nowD)).toBe(false)
    expect(inviteVisible(base({ invite: iv({ shownAt: +addDays(nowD, -8), day: dkey(addDays(nowD, -8)) }) }), nowD)).toBe(true)
  })
  it('continua visível no dia em que apareceu, até ser fechado', () => {
    expect(inviteVisible(base({ invite: iv({ shownAt: +nowD, day: dkey(nowD) }) }), nowD)).toBe(true)
    expect(inviteVisible(base({ invite: iv({ shownAt: +nowD, day: dkey(nowD), closed: true }) }), nowD)).toBe(false)
  })
})

describe('palavras de risco', () => {
  it('detecta com acento, sem acento, maiúsculas e espaços', () => {
    for (const t of ['quero morrer', 'QUERO   MORRER', 'não aguento mais viver', 'nao quero mais viver', 'pensei em suicídio', 'vontade de me cortar', 'queria sumir pra sempre'])
      expect(hasRisk(t), t).toBe(true)
  })
  it('não dispara em frases do dia a dia', () => {
    for (const t of ['morri de rir hoje', 'estou morrendo de fome', 'o dia foi pesado, mas passou', 'cortei o cabelo', '', null, undefined])
      expect(hasRisk(t), String(t)).toBe(false)
  })
})

describe('painel do profissional', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 10, 17, 12)) })
  afterEach(() => { vi.useRealTimers() })
  it('quem está no COLO Aberto não entra na lista do trio', () => {
    expect(acolhidos({ ...fresh(), plan: 'aberto' }).some((a) => a.id === 'voce')).toBe(false)
    expect(acolhidos({ ...fresh(), plan: 'essencial' })[0].id).toBe('voce')
  })
  it('valor a receber = (feitas + perdidas) x repasse; falta ainda remarcável fica de fora', () => {
    const nowD = new Date(2026, 10, 17, 12)
    for (const k of ['ana', 'rafael', 'julia'] as ProKey[]) {
      const m = monthSummary({ ...fresh(), plan: 'inteiro' }, k, nowD, nowD)
      expect(m.rate).toBe(PAYOUT[k])
      expect(m.total).toBe((m.done + m.missed) * PAYOUT[k])
    }
    expect(PAYOUT).toEqual({ ana: 65, rafael: 50, julia: 60 })
    // falta marcada há 1 hora, com saldo: ainda aberta, não entra no valor
    const s0 = { ...fresh(), plan: 'inteiro' as const }
    const before = monthSummary(s0, 'rafael', nowD, nowD)
    const s1 = { ...s0, sess: { 'rafael-2026-11-17': { falta: true } } } // terça, 7h (há 5 horas)
    const after = monthSummary(s1, 'rafael', nowD, nowD)
    expect(after.open).toBe(before.open + 1)
    expect(after.total).toBe(before.total - PAYOUT.rafael)
    // 13 horas depois vira perdida e volta a ser paga
    const later = new Date(2026, 10, 17, 21)
    expect(monthSummary(s1, 'rafael', later, later).missed).toBe(monthSummary(s0, 'rafael', later, later).missed + 1)
  })
})
