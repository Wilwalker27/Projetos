/* Convite sutil para assinar, só no COLO Aberto (briefing, seção 4):
   - no máximo 1 convite por semana;
   - só em momentos com sentido, como depois de 7 dias de diário;
   - nunca durante ou logo depois de um registro difícil (chovendo ou neblina). */
import { MOODS } from '../data/content'
import { RULES } from '../data/plans'
import type { State } from '../state/store'
import { DAY, addDays, dkey, now } from './dates'

/** Dias diferentes em que a pessoa escreveu no diário ou nas anotações. */
export function diaryDays(S: Pick<State, 'journal' | 'notes'>): number {
  const days = new Set<string>()
  S.journal.forEach((j) => days.add(dkey(j.d)))
  S.notes.forEach((n) => days.add(dkey(n.d)))
  return days.size
}

/** O check-in de hoje ou de ontem foi difícil (chovendo ou neblina)? */
export function hardMoodNear(S: Pick<State, 'moods'>, nowD: Date = now()): boolean {
  return [0, -1].some((off) => {
    const m = S.moods[dkey(addDays(nowD, off))]
    return m != null && !!MOODS[m]?.hard
  })
}

/** O convite pode aparecer agora? */
export function inviteVisible(S: Pick<State, 'plan' | 'moods' | 'invite' | 'journal' | 'notes'>, nowD: Date = now()): boolean {
  if (S.plan !== 'aberto') return false
  if (hardMoodNear(S, nowD)) return false
  const iv = S.invite
  if (iv.day === dkey(nowD)) return !iv.closed // já é o convite desta semana, mostrado hoje
  if (iv.force) return true // "ver o convite" no painel do protótipo
  if (iv.shownAt != null && nowD.getTime() - iv.shownAt < RULES.inviteGapDays * DAY) return false
  return diaryDays(S) >= RULES.inviteDiaryDays
}
