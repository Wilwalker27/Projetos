/* Planos de cuidado (só no COLO Aberto): Essencial e Inteiro lado a lado, sem pressa.
   Antes de assinar, uma conversa de boas-vindas. A assinatura é simulada no protótipo. */
import '../styles/screens/planos.css'
import { useState } from 'react'
import { ORDER, PROS } from '../data/content'
import { PAID_PLANS, PLANS, RULES, brl } from '../data/plans'
import { WD, addDays, at, cap, dShort, hm, now, sod } from '../lib/dates'
import { go } from '../nav/router'
import { scheduleWelcomeTalk, subscribe } from '../state/actions'
import { useS, type Consents } from '../state/store'
import type { PaidPlanKey, ProKey } from '../types'
import { TopBar, colorVars } from '../ui/bits'
import { Icon } from '../ui/icons'
import { closeSheet, openSheet, toast } from '../ui/overlay'

const when = (d: Date): string => `${cap(WD[d.getDay()])}, ${dShort(d)}, ${hm(d)}`
const short = (k: PaidPlanKey): string => PLANS[k].name.replace('COLO ', '')

function TalkSheet() {
  const base = sod(now())
  const slots = [[1, 18], [2, 12], [4, 19]].map(([d, h]) => at(addDays(base, d), h))
  return (
    <>
      <h2 className="sh-t" style={{ marginTop: 6 }}>Conversa de boas-vindas</h2>
      <p className="sh-p">Uns 20 minutos, por vídeo, com alguém do COLO. Gratuita e sem compromisso.</p>
      <div className="slots">
        {slots.map((s) => (
          <button className="slot" key={+s} onClick={() => { scheduleWelcomeTalk(+s); closeSheet(); toast(`Conversa marcada: ${when(s).toLowerCase()}. A gente te espera.`) }}>{when(s)}</button>
        ))}
      </div>
      <button className="btn ghost block" onClick={() => closeSheet()}>Agora não</button>
    </>
  )
}

const PAY = [{ k: 'pix', t: 'Pix Automático' }, { k: 'cartao', t: 'Cartão' }] as const

function SubscribeSheet({ plan }: { plan: PaidPlanKey }) {
  const p = PLANS[plan]
  const [pay, setPay] = useState<'pix' | 'cartao'>('pix')
  const [tcle, setTcle] = useState(false)
  // consentimento é escolha da pessoa: nada vem ligado (LGPD)
  const [checkins, setCheckins] = useState(false)
  const [share, setShare] = useState<Record<ProKey, boolean>>({ ana: false, rafael: false, julia: false })
  const [term, setTerm] = useState(false)
  const confirm = (): void => {
    const consents: Consents = { tcle: true, checkins, share }
    subscribe(plan, consents)
    closeSheet(true)
    go('home', { tab: true })
    toast(`Boas-vindas ao ${p.name}. Seu trio já sabe que você chegou.`)
  }
  return (
    <>
      <h2 className="sh-t" style={{ marginTop: 6 }}>Assinar o {p.name}</h2>
      <div className="pl-sum"><b>{p.name}</b><span>{brl(p.price)}<small> /mês</small></span></div>
      <p className="pl-h3" id="pl-pay">Forma de pagamento</p>
      <div className="seg" role="radiogroup" aria-labelledby="pl-pay">
        {PAY.map((x) => <button key={x.k} role="radio" aria-checked={pay === x.k} className={pay === x.k ? 'on' : ''} onClick={() => setPay(x.k)}>{x.t}</button>)}
      </div>
      <p className="tiny">Simulação: nenhuma cobrança é feita neste protótipo. Você pode desistir em até {RULES.refundDays} dias e receber tudo de volta.</p>
      <p className="pl-h3">Seu consentimento</p>
      <label className="pl-check">
        <input type="checkbox" checked={tcle} onChange={(e) => setTcle(e.target.checked)} />
        <span>Li e aceito o termo de consentimento para atendimento online (TCLE).</span>
      </label>
      <button className="link" aria-expanded={term} onClick={() => setTerm(!term)}>{term ? 'Fechar o termo' : 'Ler o termo'}</button>
      {term && (
        <div className="callout pl-term">
          <b>Termo de consentimento para atendimento online (texto de exemplo)</b>
          <p>Os encontros do COLO são individuais e online, por vídeo, com profissionais cadastrados nos seus conselhos (psicologia no e-Psi, nutrição no e-Nutricionista).</p>
          <p>O sigilo vale também online. Use um lugar reservado e uma conexão sua. Os encontros não são gravados.</p>
          <p>O COLO não atende urgência. Em crise, ligue para o CVV no 188 ou, em emergência, para o SAMU no 192.</p>
          <p>Você pode retirar este consentimento quando quiser, em Ajustes, e pedir seus dados ou a exclusão da conta.</p>
          <p className="tiny">No piloto, este texto é substituído pelo termo revisado pela equipe.</p>
        </div>
      )}
      <p className="tiny">As escolhas abaixo são opcionais e começam desligadas.</p>
      <label className="toggle" htmlFor="pl-ck"><span>A psicóloga pode ler meus check-ins</span><em>Antes de cada sessão. Mais ninguém vê.</em>
        <input type="checkbox" id="pl-ck" checked={checkins} onChange={(e) => setCheckins(e.target.checked)} /></label>
      {ORDER.map((k) => (
        <label className="toggle" htmlFor={'pl-sh-' + k} key={k}><span>O trio pode trocar notas de {PROS[k].area}</span><em>{PROS[k].first} divide o resumo com os outros dois.</em>
          <input type="checkbox" id={'pl-sh-' + k} checked={share[k]} onChange={(e) => setShare({ ...share, [k]: e.target.checked })} /></label>
      ))}
      <p className="tiny">Você pode mudar essas escolhas quando quiser, em Ajustes.</p>
      <button className="btn primary block" disabled={!tcle} onClick={confirm}>Assinar o {p.name}</button>
      <button className="btn ghost block" onClick={() => closeSheet()}>Ainda não</button>
    </>
  )
}

const BOTH = [
  'Tudo individual e online, por vídeo.',
  `${RULES.reschedPerMonth} remarcação por mês em cada área.`,
  `Se faltar, dá pra remarcar em até ${RULES.missWindowH} horas. Depois disso, ou se a remarcação do mês já foi usada, o encontro fica como perdido e não é reposto, porque o horário reservado é pago ao profissional.`,
  'A psicóloga pode ajustar a frequência da psicologia, conforme o que fizer sentido pra você.',
  'Pagamento mensal por Pix Automático ou cartão, fora das lojas de aplicativo.',
  `Você pode desistir em até ${RULES.refundDays} dias e receber tudo de volta.`,
  'Dá pra pausar ou encerrar quando quiser, em Ajustes.',
  'Psicóloga cadastrada no e-Psi e nutricionista no e-Nutricionista.',
]

export function Planos() {
  const S = useS()
  const [sel, setSel] = useState<PaidPlanKey>('essencial')
  // conversa que já passou some daqui, como na Agenda: dá pra marcar outra
  const talk = S.welcomeTalk != null && S.welcomeTalk > now().getTime() ? new Date(S.welcomeTalk) : null
  return (
    <>
      <TopBar />
      <div className="scr">
        <header><h1 className="title">Planos de cuidado</h1><p className="lead">Sem pressa. O COLO Aberto continua seu, de graça, pelo tempo que você quiser.</p></header>

        <div className="pl-grid" role="group" aria-label="Planos de cuidado">
          {PAID_PLANS.map((k) => {
            const p = PLANS[k], on = sel === k
            return (
              <button className="pl-card" key={k} aria-pressed={on} onClick={() => setSel(k)}>
                <span className="pl-name">{p.name}</span>
                <span className="pl-price">{brl(p.price)}<small>/mês</small></span>
                <span className="pl-freq">
                  {ORDER.map((a) => (
                    <span className="pl-fr" key={a} style={colorVars(PROS[a].color)}><i /><span><b>{PROS[a].area}</b>{p.freq![a].label}</span></span>
                  ))}
                </span>
                <span className="pl-also">E tudo do COLO Aberto</span>
                <span className="pl-pick">{on && <><Icon n="check" sm /> Escolhido</>}</span>
              </button>
            )
          })}
        </div>

        <section className="card">
          <div className="sec-h"><h2>O que vale para os dois</h2></div>
          <ul className="pl-list">{BOTH.map((t) => <li key={t}><Icon n="check" sm /><span>{t}</span></li>)}</ul>
        </section>

        <section className="card pl-talk">
          <div className="sec-h"><h2>Antes de assinar, uma conversa</h2></div>
          {talk ? (
            <>
              <div><div className="eyebrow">Sua conversa de boas-vindas</div><div className="pl-when">{when(talk)}</div><p className="tiny">Online, por vídeo · gratuita, sem compromisso</p></div>
              <div className="pl-links">
                <button className="link" onClick={() => openSheet(<TalkSheet />, 'Conversa de boas-vindas')}>Trocar horário</button>
                <button className="link" onClick={() => { scheduleWelcomeTalk(null); toast('Conversa desmarcada. Quando quiser, é só marcar de novo.') }}>Desmarcar</button>
              </div>
              <button className="btn line block" onClick={() => openSheet(<SubscribeSheet plan={sel} />, `Assinar o ${PLANS[sel].name}`)}>Já conversei, quero assinar o {short(sel)}</button>
              <p className="tiny">No protótipo, você pode seguir sem esperar a conversa.</p>
            </>
          ) : (
            <>
              <p>Uma conversa de boas-vindas, gratuita e sem compromisso, pra você tirar dúvidas e a gente entender o seu momento.</p>
              <button className="btn primary block" onClick={() => openSheet(<TalkSheet />, 'Conversa de boas-vindas')}>Marcar conversa de boas-vindas</button>
            </>
          )}
        </section>
        <p className="tiny center">Protótipo: preços e regras do piloto; nenhuma cobrança é feita aqui.</p>
      </div>
    </>
  )
}
