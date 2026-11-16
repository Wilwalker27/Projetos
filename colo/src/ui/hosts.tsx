/* Onde o painel (sheet) e o aviso (toast) aparecem. Montados uma vez, dentro do app. */
import { useEffect, useRef, useState } from 'react'
import { Mark } from './bits'
import { clearToast, closeSheet, useOverlay } from './overlay'

const FOCUSABLE = 'button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function SheetHost() {
  const { sheet, open } = useOverlay()
  const [shown, setShown] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const id = sheet?.n

  // sobe em dois quadros (como no protótipo) e leva o foco para o primeiro botão
  useEffect(() => {
    if (id == null) { setShown(false); return }
    lastFocus.current = document.activeElement as HTMLElement | null
    let r2 = 0
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => {
      setShown(true)
      panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true })
    }) })
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2) }
  }, [id])

  // ao fechar, devolve o foco para quem abriu
  useEffect(() => {
    if (sheet) return
    const el = lastFocus.current
    lastFocus.current = null
    if (el && document.contains(el)) el.focus({ preventScroll: true })
  }, [sheet])

  useEffect(() => {
    if (!sheet) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return }
      if (e.key !== 'Tab' || !panel.current) return
      const f = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (!f.length) return
      const first = f[0], last = f[f.length - 1], act = document.activeElement
      if (!panel.current.contains(act)) { e.preventDefault(); first.focus() }
      else if (e.shiftKey && act === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && act === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sheet])

  if (!sheet) return null
  return (
    <div className={'sheet' + (open && shown ? ' open' : '')}>
      <div className="sheet-scrim" onClick={() => closeSheet()} />
      <div className="sheet-panel" role="dialog" aria-modal="true" aria-label={sheet.label} ref={panel}>
        <div className="grab" />
        <div className="sheet-body" key={sheet.n}>{sheet.node}</div>
      </div>
    </div>
  )
}

export function ToastHost() {
  const { toast } = useOverlay()
  const [show, setShow] = useState(false)
  const id = toast?.n
  useEffect(() => {
    if (id == null) return
    setShow(false)
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
    const t1 = setTimeout(() => setShow(false), 3600)
    const t2 = setTimeout(() => clearToast(id), 3980)
    return () => { cancelAnimationFrame(r); clearTimeout(t1); clearTimeout(t2) }
  }, [id])
  return (
    <div className={'toast' + (show ? ' show' : '')} role="status" aria-live="polite" hidden={!toast}>
      {toast && <><Mark size="sm" hug /><span>{toast.msg}</span></>}
    </div>
  )
}
