/* Painel que sobe (sheet) e aviso (toast): um de cada por vez, como no protótipo. */
import { useSyncExternalStore, type ReactNode } from 'react'

export interface SheetData { node: ReactNode; label: string; n: number }
export interface ToastData { msg: ReactNode; n: number }
interface Overlay { sheet: SheetData | null; open: boolean; toast: ToastData | null }

let O: Overlay = { sheet: null, open: false, toast: null }
let n = 0
let closeT: ReturnType<typeof setTimeout> | undefined
const subs = new Set<() => void>()
const set = (p: Partial<Overlay>): void => { O = { ...O, ...p }; subs.forEach((fn) => fn()) }

/** Abre o painel com o conteúdo dado. label é o nome lido por leitores de tela. */
export function openSheet(node: ReactNode, label: string): void {
  clearTimeout(closeT)
  set({ sheet: { node, label, n: ++n }, open: true })
}
/** Fecha o painel. immediate=true fecha sem animação (ao trocar de tela). */
export function closeSheet(immediate = false): void {
  if (!O.sheet) return
  clearTimeout(closeT)
  if (immediate) { set({ sheet: null, open: false }); return }
  set({ open: false })
  closeT = setTimeout(() => set({ sheet: null }), 420)
}
/** Mostra um aviso curto na parte de baixo da tela. */
export function toast(msg: ReactNode): void { set({ toast: { msg, n: ++n } }) }
export const clearToast = (id: number): void => { if (O.toast?.n === id) set({ toast: null }) }

const subscribe = (fn: () => void): (() => void) => { subs.add(fn); return () => { subs.delete(fn) } }
const snap = (): Overlay => O
export const useOverlay = (): Overlay => useSyncExternalStore(subscribe, snap, snap)
