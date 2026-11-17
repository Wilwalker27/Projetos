/* Convite sutil para assinar, só no COLO Aberto (briefing, seção 4):
   - no máximo 1 convite por semana;
   - só em momentos com sentido: 7 dias diferentes de diário ou anotações desde o último convite;
   - nunca durante ou logo depois de um registro difícil (chovendo ou neblina). */
import { MOODS } from '../data/content'
import { RULES } from '../data/plans'
import type { State } from '../state/store'
import { DAY, HOUR, addDays, dkey, now } from './dates'

/** Dias diferentes em que a pessoa escreveu no diário ou nas anotações (desde `since`, se dado). */
export function diaryDays(S: Pick<State, 'journal' | 'notes'>, since = 0): number {
  const days = new Set<string>()
  S.journal.forEach((j) => { if (j.d > since) days.add(dkey(j.d)) })
  S.notes.forEach((n) => { if (n.d > since) days.add(dkey(n.d)) })
  return days.size
}

/** Houve registro difícil (chovendo ou neblina) hoje, ontem ou nas últimas 48 horas, mesmo que trocado depois? */
export function hardMoodNear(S: Pick<State, 'moods'> & { hardAt?: number | null }, nowD: Date = now()): boolean {
  if (S.hardAt != null && nowD.getTime() - S.hardAt < 48 * HOUR) return true
  return [0, -1].some((off) => {
    const m = S.moods[dkey(addDays(nowD, off))]
    return m != null && !!MOODS[m]?.hard
  })
}

/** O convite pode aparecer agora? */
export function inviteVisible(S: Pick<State, 'plan' | 'moods' | 'invite' | 'journal' | 'notes'> & { hardAt?: number | null }, nowD: Date = now()): boolean {
  if (S.plan !== 'aberto') return false
  if (hardMoodNear(S, nowD)) return false
  const iv = S.invite
  if (iv.day === dkey(nowD)) return !iv.closed // já é o convite desta semana, mostrado hoje
  if (iv.force) return true // "ver o convite" no painel do protótipo
  if (iv.shownAt != null && nowD.getTime() - iv.shownAt < RULES.inviteGapDays * DAY) return false
  // escrita recente: conta só o que veio depois do último convite (ou dos últimos 30 dias, no primeiro)
  const since = iv.shownAt ?? nowD.getTime() - 30 * DAY
  return diaryDays(S, since) >= RULES.inviteDiaryDays
}
