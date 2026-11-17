/* Pausas: pequenos cuidados assinados pelo trio. Filtro por momento, a Respiração 5,5 em
   destaque e a lista das pausas guiadas. Igual para o COLO Aberto e para quem tem plano. */
import '../styles/screens/pausas.css'
import { useState } from 'react'
import { PAUSAS, PROS } from '../data/content'
import { go } from '../nav/router'
import { useS } from '../state/store'
import type { Pausa } from '../types'
import { TopBar, cx, toneVars } from '../ui/bits'
import { Icon } from '../ui/icons'

const CATS: [string, string][] = [['todas', 'Todas'], ['agora', 'Pra agora'], ['mente', 'Mente'], ['corpo', 'Corpo'], ['comida', 'Comida'], ['sono', 'Sono']]
/** O filtro escolhido continua valendo ao voltar de uma pausa, como na referência. */
let lastCat = 'todas'

export function Pausas() {
  const S = useS()
  const sub = S.plan !== 'aberto'
  const [cat, setCat] = useState(lastCat)
  const pick = (c: string): void => { lastCat = c; setCat(c) }
  const desc = (x: Pausa): string => (sub ? x.desc : x.descFree ?? x.desc)
  const open = (x: Pausa): void => { if (x.special === 'breathe') go('breathe'); else go('session', { id: x.id }) }

  const L = PAUSAS.filter((x) => cat === 'todas' || x.cat.includes(cat))
  const feat = L.find((x) => x.id === 'respira')
  return (
    <>
      <TopBar />
      <div className="scr">
        <header>
          <h1 className="title">Pausas</h1>
          <p className="lead">
            {sub
              ? 'Pequenos cuidados criados pelo seu trio. Nenhum passa de 10 minutos.'
              : 'Pequenos cuidados criados pelo trio do COLO. Nenhum passa de 10 minutos.'}
          </p>
        </header>
        <div className="chips" role="group" aria-label="Filtrar pausas">
          {CATS.map(([k, t]) => (
            <button key={k} className={cx('chip', cat === k && 'on')} aria-pressed={cat === k} onClick={() => pick(k)}>{t}</button>
          ))}
        </div>
        {feat && (
          <button className="feat" onClick={() => go('breathe')}>
            <span className="feat-orb" aria-hidden="true" />
            <span>
              <span className="eyebrow">Comece por aqui</span>
              <b>Respiração 5,5</b>
              <p>{desc(feat)}</p>
              <span className="pz-by">por Ana · 2 min</span>
            </span>
          </button>
        )}
        <ul className="pz-list">
          {L.filter((x) => x.id !== 'respira').map((x) => (
            <li key={x.id}>
              <button className="pz-row" onClick={() => open(x)} style={toneVars(x.by)}>
                <span className="pz-ic"><Icon n={x.ic} /></span>
                <span className="pz-t"><b>{x.title}</b><span>{desc(x)}</span><em>por {PROS[x.by].first} · {x.min} min</em></span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
