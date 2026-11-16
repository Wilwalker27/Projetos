/* Datas em pt-BR, como no protótipo de referência.
   IMPORTANTE: use sempre now() em vez de new Date(): o relógio do protótipo pode ser
   adiantado (Ajustes > Protótipo) para testar agenda, remarcação e convite. */

export const DAY = 864e5
export const HOUR = 36e5
export const WD = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
export const WDS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
export const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
export const MESC = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

let clockOffset = 0
/** Usado só pelo estado (store) para aplicar o relógio do protótipo. */
export const setClockOffset = (ms: number): void => { clockOffset = Number.isFinite(ms) ? ms : 0 }
export const now = (): Date => new Date(Date.now() + clockOffset)

export const sod = (d: Date | number): Date => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
export const addDays = (d: Date | number, n: number): Date => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const at = (d: Date | number, h: number, m = 0): Date => { const x = new Date(d); x.setHours(h, m, 0, 0); return x }
const p2 = (n: number): string => String(n).padStart(2, '0')
/** Chave do dia: "2026-11-16". */
export const dkey = (d: Date | number): string => { const x = new Date(d); return `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}` }
/** Chave do mês: "2026-11". */
export const mkey = (d: Date | number): string => { const x = new Date(d); return `${x.getFullYear()}-${p2(x.getMonth() + 1)}` }
export const sameDay = (a: Date | number, b: Date | number): boolean => dkey(a) === dkey(b)
/** Dia do ano (1 a 366). */
export const doy = (d: Date): number => Math.floor((sod(d).getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / DAY)
/** "19h" ou "7h30". */
export const hm = (d: Date): string => d.getHours() + 'h' + (d.getMinutes() ? p2(d.getMinutes()) : '')
/** "19:05" (mensagens). */
export const hhmm = (d: Date): string => p2(d.getHours()) + ':' + p2(d.getMinutes())
/** "16 de novembro". */
export const dLong = (d: Date): string => `${d.getDate()} de ${MES[d.getMonth()]}`
/** "16 nov". */
export const dShort = (d: Date): string => `${d.getDate()} ${MESC[d.getMonth()]}`
/** "hoje", "amanhã", "ontem", "em 3 dias", "há 2 dias". */
export function rel(d: Date): string {
  const n = Math.round((sod(d).getTime() - sod(now()).getTime()) / DAY)
  return n === 0 ? 'hoje' : n === 1 ? 'amanhã' : n === -1 ? 'ontem' : n > 1 ? `em ${n} dias` : `há ${-n} dias`
}
/** Segundos como "1:05". */
export const fmtS = (s: number): string => Math.floor(s / 60) + ':' + p2(s % 60)
export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
/** Primeiro dia do mês de d e primeiro dia do mês seguinte. */
export const monthRange = (d: Date): [Date, Date] => [new Date(d.getFullYear(), d.getMonth(), 1), new Date(d.getFullYear(), d.getMonth() + 1, 1)]
