/* Peças pequenas e comuns: marca, avatar, anel de progresso, céu, barra do topo e apoio de crise. */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { PROS } from '../data/content'
import { go } from '../nav/router'
import { useS } from '../state/store'
import type { AreaColor, ProKey } from '../types'
import { Icon } from './icons'

export const cx = (...a: (string | false | null | undefined)[]): string => a.filter(Boolean).join(' ')

/** Variáveis de cor da área: use em style={toneVars('ana')} para ativar --tone e --tint. */
export const toneVars = (k: ProKey): CSSProperties => colorVars(PROS[k].color)
export const colorVars = (c: AreaColor): CSSProperties => ({ '--tone': `var(--${c})`, '--tint': `var(--${c}-tint)` }) as CSSProperties

/** Símbolo do COLO: um arco aberto abraçando um ponto.
    breathe: o ponto respira (11 s). hug: o arco fecha o abraço. hugAfter: fecha depois de N ms. */
export function Mark({ size = 'md', breathe, hug, hugAfter, className }: {
  size?: 'sm' | 'md' | 'lg' | 'xl'; breathe?: boolean; hug?: boolean; hugAfter?: number; className?: string
}) {
  const [late, setLate] = useState(false)
  useEffect(() => {
    if (hugAfter == null) return
    const t = setTimeout(() => setLate(true), hugAfter)
    return () => clearTimeout(t)
  }, [hugAfter])
  return (
    <svg className={cx('mark', size, breathe && 'breathe', (hug || late) && 'hug', className)} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle className="mk-arc" cx="24" cy="24" r="16" pathLength={100} />
      <circle className="mk-dot" cx="25.5" cy="23" r="6.5" />
    </svg>
  )
}

/** Avatar do profissional: inicial com anel na cor da área. */
export function Av({ k, size }: { k: ProKey; size?: 'xs' | 'sm' | 'lg' }) {
  return <span className={cx('av', size)} style={toneVars(k)} aria-hidden="true">{PROS[k].first[0]}</span>
}

const RING_FROM: Record<string, number> = {}
/** Anel de progresso (combinados). id mantém a animação partindo do último valor mostrado. */
export function Ring({ id, v, goal, color }: { id: string; v: number; goal: number; color: AreaColor }) {
  const pct = Math.min(1, goal > 0 ? v / goal : 0) * 100
  const [shown, setShown] = useState(RING_FROM[id] ?? 0)
  const raf = useRef(0)
  useEffect(() => {
    raf.current = requestAnimationFrame(() => { raf.current = requestAnimationFrame(() => { setShown(pct); RING_FROM[id] = pct }) })
    return () => cancelAnimationFrame(raf.current)
  }, [pct, id])
  return (
    <svg className="ring" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
      <circle className="ring-bg" cx="22" cy="22" r="18" />
      <circle className="ring-fg" cx="22" cy="22" r="18" pathLength={100} style={{ stroke: `var(--${color})`, strokeDasharray: `${shown.toFixed(1)} 100` }} />
    </svg>
  )
}

/** Céu: sol de pêssego atrás de duas faixas de névoa. Fica no topo das telas principais. */
export function Sky({ className }: { className?: string }) {
  return (
    <div className={cx('sky', className)} aria-hidden="true">
      <div className="sun" /><div className="fog f1" /><div className="fog f2" />
    </div>
  )
}

/** Barra do topo das telas com abas: marca (vai para o início) e avatar (abre Ajustes). */
export function TopBar() {
  const S = useS()
  const initial = S.name ? S.name.trim().charAt(0).toUpperCase() : null
  return (
    <div className="topbar">
      <button className="brandmini" onClick={() => go('home', { tab: true })} aria-label="COLO, início">
        <Mark size="sm" breathe /><span>colo</span>
      </button>
      <button className="avatar-btn" onClick={() => go('perfil')} aria-label="Seu perfil e ajustes">
        {initial ?? <Icon n="user" sm />}
      </button>
    </div>
  )
}

/** Barra das telas cheias: voltar/fechar à esquerda, título no centro. */
export function Bar({ title, onBack, close, right, className }: {
  title?: ReactNode; onBack: () => void; close?: boolean; right?: ReactNode; className?: string
}) {
  return (
    <div className={cx('bar', className)}>
      <button className="icon-btn" onClick={onBack} aria-label={close ? 'Fechar' : 'Voltar'}><Icon n={close ? 'x' : 'back'} /></button>
      {typeof title === 'string' ? <span className="bar-t">{title}</span> : title ?? <span />}
      {right ?? <span className="icon-btn ghost" />}
    </div>
  )
}

/** Telefones de crise, tocáveis no celular. */
export const Cvv = () => <a className="num" href="tel:188" aria-label="Ligar para o CVV, 188">188</a>
export const Samu = () => <a className="num" href="tel:192" aria-label="Ligar para o SAMU, 192">192</a>

/** Apoio de crise (CVV 188 e SAMU 192). Obrigatório no botão COLO, em Ajustes e em toda tela de diário.
    v: 'ajustes' | 'colo' | 'diario' (compacto, para telas de escrita) | 'risco' (quando aparecem palavras de risco). */
export function Sos({ v = 'ajustes', children }: { v?: 'ajustes' | 'colo' | 'diario' | 'risco'; children?: ReactNode }) {
  if (v === 'colo') return (
    <div className="sos"><b>Se estiver pesado demais</b>
      <p>Ligue para o CVV no <Cvv />: apoio emocional gratuito, 24 horas. Em emergência, SAMU <Samu />. O COLO não atende urgência.</p>{children}</div>
  )
  if (v === 'diario') return (
    <div className="sos sos-sm" role="note"><p>O COLO não atende urgência. Se estiver pesado demais agora, ligue para o CVV no <Cvv /> (gratuito, 24 horas). Em emergência, SAMU <Samu />.</p>{children}</div>
  )
  if (v === 'risco') return (
    <div className="sos sos-risk" role="alert"><b>Isso que você escreveu importa.</b>
      <p>Você não precisa atravessar isso sem companhia. O CVV atende agora, de graça, 24 horas, no <Cvv />. Em emergência, ligue para o SAMU no <Samu />.</p>
      <div className="sos-acts">
        <a className="btn primary sm" href="tel:188"><Icon n="phone" sm /> Ligar 188</a>
        <a className="btn line sm" href="tel:192"><Icon n="phone" sm /> Ligar 192</a>
      </div>{children}</div>
  )
  return (
    <section className="sos"><b>Precisa de ajuda agora?</b>
      <p>CVV, apoio emocional gratuito e 24 horas: <Cvv />. Em emergência médica, SAMU: <Samu />. O COLO não atende urgência.</p>{children}</section>
  )
}

/** Etiqueta pequena ("Remarcado", "fictício"). tone usa a cor da área ativa (--tint). */
export function Tag({ children, tone }: { children: ReactNode; tone?: boolean }) {
  return <span className={cx('tag', tone && 'tone')}>{children}</span>
}
