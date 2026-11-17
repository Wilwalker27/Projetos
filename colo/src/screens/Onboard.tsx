/* Personalização (ref. V.onboard): nome, focos, horário, tom e a tela "pronto".
   Os passos trocam sem empilhar no botão voltar do aparelho. */
import '../styles/screens/entrada.css'
import { useState, type ReactNode } from 'react'
import { FOCOS, HORAS, ORDER, PROS, TONS } from '../data/content'
import { WD, dShort, hm } from '../lib/dates'
import { nextWith } from '../lib/sessions'
import { go } from '../nav/router'
import { finishOnboarding, setName, setTime, setTone, toggleFocus } from '../state/actions'
import { useS } from '../state/store'
import type { IconName } from '../types'
import { Av, Mark, cx } from '../ui/bits'
import { Icon } from '../ui/icons'

/** O que já está aberto para quem começa pelo COLO Aberto. */
const ABERTO: { ic: IconName; t: string; d: string }[] = [
  { ic: 'leaf', t: 'Pausas e respiração', d: 'Pequenos cuidados de até 10 minutos' },
  { ic: 'pen', t: 'Diário e check-in', d: 'Só você vê o que escreve' },
  { ic: 'heart', t: 'Bilhete do dia', d: 'Assinado por quem cuida' },
]

export function Onboard({ id }: { id?: string }) {
  const S = useS()
  const st = Math.min(5, Math.max(1, Number(id) || 1))
  const sub = S.plan !== 'aberto'
  const [name, setNameDraft] = useState(S.name)

  const enter = (): void => { finishOnboarding(); go('home', { tab: true }) }
  const next = (): void => {
    if (st === 1) setName(name)
    if (st >= 5) { enter(); return }
    go('onboard', { id: String(st + 1), replace: true })
  }
  const prev = (): void => {
    if (st === 1) setName(name)
    if (st <= 1) go('welcome', { tab: true })
    else go('onboard', { id: String(st - 1), replace: true })
  }

  let body: ReactNode
  let cta = 'Continuar'
  if (st === 1) {
    body = (
      <>
        <div className="eyebrow">Antes de tudo</div>
        <h1 className="ob-h">Como você gosta que <em>te chamem</em>?</h1>
        <p className="lead">{S.plan !== 'aberto' ? 'Pode ser apelido. É assim que o seu trio vai te chamar também.' : 'Pode ser apelido. É assim que o COLO vai te chamar.'}</p>
        <label htmlFor="ob-name" className="eyebrow" style={{ position: 'absolute', left: -9999 }}>Seu nome ou apelido</label>
        <input
          id="ob-name" className="big-in" value={name} placeholder="Seu nome ou apelido" autoComplete="given-name" maxLength={30}
          onChange={(e) => setNameDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); next() } }}
        />
      </>
    )
  } else if (st === 2) {
    body = (
      <>
        <div className="eyebrow">Seu momento</div>
        <h1 className="ob-h">O que você quer <em>cuidar</em> agora?</h1>
        <p className="lead">Escolha quantos quiser. Isso muda os bilhetes e as pausas que aparecem pra você, e dá pra trocar depois.</p>
        <div className="chips wrap big">
          {FOCOS.map((f) => {
            const on = S.focuses.includes(f.k)
            return <button key={f.k} className={cx('chip', on && 'on')} aria-pressed={on} onClick={() => toggleFocus(f.k)}>{f.t}</button>
          })}
        </div>
      </>
    )
  } else if (st === 3) {
    body = (
      <>
        <div className="eyebrow">Seu ritmo</div>
        <h1 className="ob-h">Que hora do dia é mais <em>sua</em>?</h1>
        <p className="lead">A gente sugere pausas e manda lembretes nesse horário.</p>
        <div className="opts" role="radiogroup" aria-label="Seu melhor horário">
          {HORAS.map((h) => {
            const on = S.time === h.k
            return (
              <button key={h.k} className={cx('opt', on && 'on')} role="radio" aria-checked={on} onClick={() => setTime(h.k)}>
                <Icon n={h.ic} /><span><b>{h.t}</b><em>{h.d}</em></span>{on ? <Icon n="check" /> : <span />}
              </button>
            )
          })}
        </div>
      </>
    )
  } else if (st === 4) {
    body = (
      <>
        <div className="eyebrow">Seu tom</div>
        <h1 className="ob-h">Como você prefere <em>receber lembretes</em>?</h1>
        <p className="lead">Do jeito que for mais leve pra você.</p>
        <div className="opts" role="radiogroup" aria-label="Tom dos lembretes">
          {TONS.map((t) => {
            const on = S.tone === t.k
            return (
              <button key={t.k} className={cx('opt notic', on && 'on')} role="radio" aria-checked={on} onClick={() => setTone(t.k)}>
                <span><b>{t.t}</b><em>“{t.ex}”</em></span>{on ? <Icon n="check" /> : <span />}
              </button>
            )
          })}
        </div>
      </>
    )
  } else {
    cta = 'Entrar no meu COLO'
    const hello = S.name ? <>Prazer, <em>{S.name}</em>.</> : 'Prazer.'
    body = (
      <>
        <div className="ready-mark"><Mark size="xl" breathe hugAfter={500} /></div>
        {sub ? (
          <>
            <h1 className="ob-h">{hello} Seu trio já está te esperando.</h1>
            <ul className="ready-list">
              {ORDER.map((k) => {
                const pr = PROS[k], s = nextWith(S, k)
                return (
                  <li key={k}>
                    <Av k={k} />
                    <span><b>{pr.first}</b> · {pr.role}<em>Primeiro encontro: {s ? `${WD[s.date.getDay()]}, ${dShort(s.date)}, ${hm(s.date)}` : 'a combinar'}</em></span>
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <>
            <h1 className="ob-h">{hello} Seu COLO já está aberto.</h1>
            <ul className="ready-list">
              {ABERTO.map((x) => (
                <li key={x.ic}>
                  <span className="ent-ic" aria-hidden="true"><Icon n={x.ic} /></span>
                  <span><b>{x.t}</b><em>{x.d}</em></span>
                </li>
              ))}
            </ul>
            <p className="tiny ent-free">É gratuito e não tem prazo.</p>
          </>
        )}
      </>
    )
  }

  return (
    <div className="full">
      <div className="bar ob">
        <button className="icon-btn" onClick={prev} aria-label="Voltar"><Icon n="back" /></button>
        {st < 5 ? (
          <div className="ob-dots" role="img" aria-label={`Passo ${Math.min(st, 4)} de 4`}>
            {[1, 2, 3, 4].map((i) => <span key={i} className={i <= st ? 'on' : ''} />)}
          </div>
        ) : <span />}
        {st < 5 ? <button className="link" onClick={enter}>Pular</button> : <span />}
      </div>
      <div className="ob-body">{body}</div>
      <div className="ob-foot"><button className="btn primary block" onClick={next}>{cta}</button></div>
    </div>
  )
}
