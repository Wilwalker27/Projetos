/* Boas-vindas (ref. V.welcome): marca, promessa e os dois caminhos de entrada. Sem preço. */
import '../styles/screens/entrada.css'
import { go } from '../nav/router'
import { finishOnboarding } from '../state/actions'
import { Mark, Sky, colorVars } from '../ui/bits'

export function Welcome() {
  const enter = (): void => { finishOnboarding(); go('home', { tab: true }) }
  return (
    <section className="welcome">
      <Sky />
      <div className="w-top">
        <Mark size="xl" breathe />
        <h1 className="wordmark">colo</h1>
        <p className="w-lead">Cuidado inteiro, com três pessoas do seu lado.</p>
        <p className="w-sub">Psicologia, movimento e nutrição cuidando de você juntos. Comece pelo COLO Aberto, que é gratuito.</p>
        <div className="w-trio">
          <span><i style={colorVars('mente')} />Mente</span>
          <span><i style={colorVars('corpo')} />Movimento</span>
          <span><i style={colorVars('nutri')} />Nutrição</span>
        </div>
      </div>
      <div className="w-acts">
        <button className="btn primary block" onClick={() => go('onboard', { id: '1' })}>Começar</button>
        <button className="btn ghost block" onClick={enter}>Já tenho conta</button>
      </div>
    </section>
  )
}
