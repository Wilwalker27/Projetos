/* Privacidade e dados (LGPD): consentimento por área, exportar dados e apagar conta. */
import '../styles/screens/ajustes.css'
import { ORDER, PROS } from '../data/content'
import { back, go } from '../nav/router'
import { deleteAccount, exportData, setConsent, setShare } from '../state/actions'
import { useS } from '../state/store'
import { Bar, Sos } from '../ui/bits'
import { Icon } from '../ui/icons'
import { closeSheet, openSheet, toast } from '../ui/overlay'

function download(): void {
  try {
    const url = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'colo-meus-dados.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    toast('Seus dados foram baixados em colo-meus-dados.json.')
  } catch {
    toast('Não deu pra baixar agora. Tente de novo em instantes.')
  }
}

function DeleteSheet() {
  return (
    <>
      <h2 className="sh-t" style={{ marginTop: 6 }}>Apagar sua conta?</h2>
      <p className="sh-p">Tudo o que está salvo neste aparelho será apagado: nome, check-ins, diário, anotações, conversas e combinados. Não dá pra desfazer.</p>
      <div className="sh-acts">
        <button className="btn line" onClick={() => closeSheet()}>Cancelar</button>
        <button className="btn primary" onClick={() => { closeSheet(true); deleteAccount(); go('welcome', { tab: true }); toast('Sua conta foi apagada. Se quiser voltar, o COLO continua aqui.') }}>Apagar tudo</button>
      </div>
    </>
  )
}

const KEPT = [
  'Dados de saúde são tratados como sensíveis (LGPD).',
  'No piloto, ficam criptografados, em servidor no Brasil.',
  'Neste protótipo, tudo fica salvo apenas neste aparelho.',
]

export function Privacidade() {
  const S = useS()
  const sub = S.plan !== 'aberto'
  const c = S.consents
  return (
    <div className="full">
      <Bar title="Privacidade e dados" onBack={back} />
      <div className="scr">
        <p className="lead">Seus dados de saúde são seus. Aqui você decide quem vê o quê.</p>

        <section className="card set pv-set">
          <h2>Quem vê o quê</h2>
          {sub ? (
            <>
              <label className="toggle" htmlFor="pv-ck"><span>A Ana pode ler meus check-ins</span><em>Antes de cada sessão. Mais ninguém vê.</em>
                <input type="checkbox" id="pv-ck" checked={c.checkins} onChange={(e) => setConsent({ checkins: e.target.checked })} /></label>
              {ORDER.map((k) => (
                <label className="toggle" htmlFor={'pv-sh-' + k} key={k}><span>Notas de {PROS[k].service} com o trio</span><em>{PROS[k].first} pode dividir o resumo com os outros dois.</em>
                  <input type="checkbox" id={'pv-sh-' + k} checked={c.share[k]} onChange={(e) => setShare(k, e.target.checked)} /></label>
              ))}
              <div className="pv-term"><span>Termo do atendimento online</span><em>{c.tcle ? <><Icon n="check" sm /> Aceito</> : 'Ainda não aceito'}</em></div>
              <p className="tiny">As notas privadas de cada profissional ficam só com ele. O diário e as anotações são só seus.</p>
            </>
          ) : (
            <p className="lead">No COLO Aberto, tudo o que você registra fica só com você.</p>
          )}
        </section>

        <section className="card">
          <div className="sec-h"><h2>Como seus dados são guardados</h2></div>
          <ul className="pv-list">{KEPT.map((t) => <li key={t}><Icon n="check" sm /><span>{t}</span></li>)}</ul>
        </section>

        <section className="card aj-rows">
          <ul className="rows">
            <li><button className="row" onClick={download}><Icon n="download" /><span><b>Exportar meus dados</b><em>Um arquivo com tudo o que o COLO guarda sobre você</em></span><Icon n="next" sm /></button></li>
            <li><button className="row danger" onClick={() => openSheet(<DeleteSheet />, 'Apagar conta')}><Icon n="trash" /><span><b>Apagar minha conta</b><em>Remove tudo deste aparelho</em></span><Icon n="next" sm /></button></li>
          </ul>
        </section>

        <Sos />
      </div>
    </div>
  )
}
