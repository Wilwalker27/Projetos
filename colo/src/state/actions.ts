/* Ações do COLO: tudo o que muda o estado passa por aqui. */
import { ORDER } from '../data/content'
import { DEMO_ACOLHIDOS } from '../data/demo'
import { dkey, hhmm, now } from '../lib/dates'
import { hasRisk } from '../lib/risk'
import type { Anotacao, FocoKey, JournalEntry, Msg, PaidPlanKey, PlanKey, ProKey, ThemeKey, TimeKey, ToneKey, ViewKey } from '../types'
import { getS, setS, weekKey, wipe, type Consents, type ProNote, type RiskAlert, type SessOv } from './store'

/* ---------- perfil ---------- */
export const setName = (name: string): void => setS({ name: name.trim().slice(0, 30) })
export const toggleFocus = (k: FocoKey): void =>
  setS((s) => ({ focuses: s.focuses.includes(k) ? s.focuses.filter((f) => f !== k) : [...s.focuses, k] }))
export const setTime = (time: TimeKey): void => setS({ time })
export const setTone = (tone: ToneKey): void => setS({ tone })
export const setTheme = (theme: ThemeKey): void => setS({ theme })
export const setCalm = (calm: boolean): void => setS({ calm })
export const finishOnboarding = (): void => setS({ onboarded: true })

/* ---------- dia a dia ---------- */
/** Registra o check-in de clima de hoje. Devolve true se foi o primeiro do dia. */
export function setMood(i: number): boolean {
  const k = dkey(now()), first = getS().moods[k] == null
  setS((s) => ({ moods: { ...s.moods, [k]: i } }))
  return first
}
/** Zera os combinados quando a semana vira. Chamado ao abrir o app e de tempos em tempos. */
export function syncWeek(): void {
  const wk = weekKey(now())
  if (getS().combWeek !== wk) setS({ comb: { ana: 0, rafael: 0, julia: 0 }, combDay: {}, combWeek: wk })
}
/** Marca "fiz hoje" num combinado. Devolve false se já estava marcado hoje. */
export function markComb(k: ProKey): boolean {
  const tk = dkey(now())
  if (getS().combDay[k] === tk) return false
  setS((s) => ({ comb: { ...s.comb, [k]: (s.comb[k] || 0) + 1 }, combDay: { ...s.combDay, [k]: tk } }))
  return true
}
export const nextBilhete = (): void => setS((s) => ({ noteIdx: (s.noteIdx || 0) + 1 }))
export const logPause = (): void => setS((s) => ({ pauseLog: [...s.pauseLog, now().getTime()].slice(-400) }))

/* ---------- risco ---------- */
/** Registra o aviso de cuidado para a psicóloga (só para quem tem plano). Nunca guarda o texto. */
function flagRisk(src: RiskAlert['src']): void {
  if (getS().plan === 'aberto') return
  setS((s) => ({ alerts: [...s.alerts, { d: now().getTime(), src }].slice(-20) }))
}

/* ---------- diário e anotações ---------- */
/** Guarda uma entrada do diário. Devolve true se havia palavras de risco (mostre o apoio de crise). */
export function addJournal(title: string, items: JournalEntry['items']): boolean {
  const clean = items.map((i) => ({ q: i.q, a: i.a.trim().slice(0, 4000) })).filter((i) => i.a)
  if (!clean.length) return false
  setS((s) => ({ journal: [{ d: now().getTime(), title, items: clean }, ...s.journal].slice(0, 120) }))
  const risk = clean.some((i) => hasRisk(i.a))
  if (risk) flagRisk('diario')
  return risk
}
/** Guarda uma anotação livre. Devolve true se havia palavras de risco. */
export function addNote(x: string): boolean {
  const text = x.trim().slice(0, 4000)
  if (!text) return false
  const n: Anotacao = { id: now().getTime().toString(36) + Math.random().toString(36).slice(2, 6), d: now().getTime(), x: text }
  setS((s) => ({ notes: [n, ...s.notes].slice(0, 200) }))
  const risk = hasRisk(text)
  if (risk) flagRisk('anotacao')
  return risk
}
export const removeNote = (id: string): void => setS((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
export const removeJournal = (d: number): void => setS((s) => ({ journal: s.journal.filter((j) => j.d !== d) }))

/* ---------- conversa ---------- */
const msgNow = (from: Msg['from'], x: string): Msg => ({ from, t: hhmm(now()), x: x.trim().slice(0, 1200), d: now().getTime() })
/** Acolhido envia mensagem ao profissional. Devolve se havia palavras de risco. */
export function sendMsg(k: ProKey, text: string): { risk: boolean } {
  if (!text.trim()) return { risk: false }
  setS((s) => ({ chats: { ...s.chats, [k]: [...(s.chats[k] || []), msgNow('me', text)] } }))
  const risk = hasRisk(text)
  if (risk) flagRisk('conversa')
  return { risk }
}
/** Mensagem de sistema na conversa do acolhido (ex.: lembrar o prazo de resposta). */
export const sysMsg = (k: ProKey, x: string): void =>
  setS((s) => ({ chats: { ...s.chats, [k]: [...(s.chats[k] || []), { from: 'sys', x }] } }))
/** Profissional responde a um acolhido, pelo painel. */
export function proReply(pro: ProKey, id: string, text: string): void {
  if (!text.trim()) return
  const m = msgNow('pro', text)
  if (id === 'voce') { setS((s) => ({ chats: { ...s.chats, [pro]: [...(s.chats[pro] || []), m] } })); return }
  const key = `${pro}:${id}`
  setS((s) => {
    const cur = s.proChats[key] || DEMO_ACOLHIDOS.find((a) => a.id === id)?.chats[pro] || []
    return { proChats: { ...s.proChats, [key]: [...cur, m] } }
  })
}

/* ---------- agenda ---------- */
/** Remarca um encontro (id estável) para o novo horário. Quem chama já validou com canResched(). */
export const reschedule = (id: string, to: number): void => setS((s) => ({ sess: { ...s.sess, [id]: { to } } }))
/** Painel do profissional: marca presença ou falta num encontro do acolhido deste aparelho. */
export function setAttendance(id: string, falta: boolean): void {
  setS((s) => {
    const cur = s.sess[id] || {}
    const next: SessOv = { ...cur, falta }
    if (!falta) delete next.falta
    const sess = { ...s.sess, [id]: next }
    if (!Object.keys(next).length) delete sess[id]
    return { sess }
  })
}

/* ---------- plano ---------- */
const ALL_CONSENTS: Consents = { tcle: true, checkins: true, share: { ana: true, rafael: true, julia: true } }
/** Assinatura feita pelo fluxo de Planos (simulada no protótipo), com os consentimentos escolhidos. */
export function subscribe(plan: PaidPlanKey, consents: Consents): void {
  setS({ plan, pausedAt: null, consents: { ...consents, tcle: true }, invite: { shownAt: null, day: null, closed: false, force: false } })
}
/** Troca de plano pelo painel do protótipo. Ao entrar num plano pago sem termo aceito, assume os consentimentos de exemplo. */
export function setPlan(plan: PlanKey): void {
  const s = getS()
  setS({ plan, pausedAt: null, consents: plan !== 'aberto' && !s.consents.tcle ? ALL_CONSENTS : s.consents })
}
export const pausePlan = (on: boolean): void => setS({ pausedAt: on ? now().getTime() : null })
/** Encerra a assinatura: a pessoa continua no COLO Aberto, com diário e pausas guardados. */
export const cancelPlan = (): void => setS({ plan: 'aberto', pausedAt: null })
export const setConsent = (patch: Partial<Omit<Consents, 'share'>>): void => setS((s) => ({ consents: { ...s.consents, ...patch } }))
export const setShare = (k: ProKey, on: boolean): void =>
  setS((s) => ({ consents: { ...s.consents, share: { ...s.consents.share, [k]: on } } }))
export const scheduleWelcomeTalk = (ts: number | null): void => setS({ welcomeTalk: ts })

/* ---------- convite (COLO Aberto) ---------- */
/** O convite desta semana apareceu agora. */
export const inviteSeen = (): void => setS({ invite: { shownAt: now().getTime(), day: dkey(now()), closed: false, force: false } })
export const inviteClose = (): void => setS((s) => ({ invite: { ...s.invite, closed: true, force: false } }))
/** Painel do protótipo: mostrar o convite mesmo sem os 7 dias de diário (a regra do check-in difícil continua valendo). */
export const inviteForce = (): void => setS({ invite: { shownAt: null, day: null, closed: false, force: true } })

/* ---------- painel do profissional ---------- */
export const setView = (view: ViewKey): void => setS({ view })
export const setProAs = (proAs: ProKey): void => setS({ proAs })
export function setProNote(pro: ProKey, id: string, cur: ProNote, patch: Partial<ProNote>): void {
  setS((s) => ({ proNotes: { ...s.proNotes, [`${pro}:${id}`]: { ...cur, ...patch } } }))
}
export const clearAlerts = (): void => setS({ alerts: [] })

/* ---------- protótipo ---------- */
export const shiftClock = (ms: number): void => { setS((s) => ({ clock: s.clock + ms })); syncWeek() }
export const resetClock = (): void => { setS({ clock: 0 }); syncWeek() }

/* ---------- privacidade ---------- */
/** Tudo o que o app guarda sobre a pessoa, em JSON legível (LGPD: exportar dados). */
export function exportData(): string {
  const s = getS()
  return JSON.stringify({
    produto: 'COLO — Plataforma de Cuidado', exportadoEm: new Date().toISOString(),
    perfil: { nome: s.name, focos: s.focuses, melhorHorario: s.time, tomDosLembretes: s.tone, plano: s.plan, desde: new Date(s.since).toISOString() },
    consentimentos: s.consents, checkins: s.moods, combinados: s.comb, diario: s.journal, anotacoes: s.notes,
    pausasFeitas: s.pauseLog.map((t) => new Date(t).toISOString()),
    conversas: Object.fromEntries(ORDER.map((k) => [k, s.chats[k]])), remarcacoesEFaltas: s.sess,
  }, null, 2)
}
/** Apaga a conta: remove tudo deste aparelho. */
export const deleteAccount = (): void => wipe()
