/* Ícones do protótipo de referência (traço 1,6 em caixa 24) e os novos, no mesmo desenho. */
import type { IconName, MoodKey } from '../types'

const IC: Record<IconName, string> = {
  home: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5V7M15.5 3.5V7"/>',
  leaf: '<path d="M5 19c0-8.3 5.7-14 14-14 0 8.3-5.7 14-14 14z"/><path d="M5 19l7.5-7.5"/>',
  path: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="4" r="2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>',
  chat: '<path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8.5A1.5 1.5 0 0 1 19 17h-9l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z"/>',
  video: '<rect x="3.5" y="6.5" width="12" height="11" rx="2.5"/><path d="M15.5 10.5l5-3v9l-5-3"/>',
  pin: '<path d="M12 20.5s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0c0 4.900-6.500 10.500-6.500 10.500z"/><circle cx="12" cy="10" r="2.3"/>',
  back: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
  next: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  check: '<path d="M5.5 12.5l4 4 9-9"/>',
  play: '<path d="M8 5.5v13l10-6.5z"/>',
  pause: '<path d="M9 5.5v13M15 5.5v13"/>',
  send: '<path d="M4.5 12 19.5 5l-4 14-3.5-5.5z"/><path d="M12 13.5 19.5 5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  sunrise: '<path d="M3.5 18h17M7 18a5 5 0 0 1 10 0M12 6.5v3M5.2 11.2l1.6 1M18.8 11.2l-1.6 1"/>',
  user: '<circle cx="12" cy="9" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  wind: '<path d="M3.5 9H14a2.5 2.5 0 1 0-2.5-2.5M3.5 13H18a2.5 2.5 0 1 1-2.5 2.5M3.5 17H10"/>',
  anchor: '<circle cx="12" cy="5.5" r="2"/><path d="M12 7.5V20M8.5 11h7M5 13.5a7 7 0 0 0 14 0"/>',
  pen: '<path d="M15.5 5l3.5 3.5L9 18.5H5.5V15z"/><path d="M13.5 7l3.5 3.5"/>',
  shoulders: '<circle cx="12" cy="6.5" r="2.6"/><path d="M4.5 19.5c0-4.5 2.8-7.5 7.5-7.5s7.5 3 7.5 7.5"/>',
  bowl: '<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 8c0-1.5 1-2 1-3.5M13.5 8c0-1.5 1-2 1-3.5"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M9 21l2.5-6 2.5 2.5V21M11.5 15l1-5 3 3h3M12.5 10l-3.5 1.5-1.5 3"/>',
  quote: '<path d="M5 17c2.5-1 3.5-3 3.5-6V7H4.5v4.5h4M13.5 17c2.5-1 3.5-3 3.5-6V7h-4v4.5h4"/>',
  /* novos */
  users: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="10" r="2.4"/><path d="M16.5 14.600a4.500 4.500 0 0 1 4 4.400"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.500 3.500 0 0 1 7 0v2.500"/>',
  note: '<path d="M6.500 4.500h8l4 4V18a1.500 1.500 0 0 1-1.500 1.500H6.500A1.500 1.500 0 0 1 5 18V6a1.500 1.500 0 0 1 1.500-1.500z"/><path d="M14.500 4.500v4h4M8.500 12.500h7M8.500 15.500h5"/>',
  chart: '<path d="M4.500 19.500h15M7.500 16v-4M12 16V8M16.500 16v-6.500"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.500V12l3 2"/>',
  phone: '<path d="M6.600 4.500h2.900l1.500 4-2 1.500a10 10 0 0 0 5 5l1.500-2 4 1.500v2.900a1.600 1.600 0 0 1-1.700 1.600A15.500 15.500 0 0 1 5 6.200a1.600 1.600 0 0 1 1.600-1.700z"/>',
  heart: '<path d="M12 19.500s-7-4.300-7-9.500a4 4 0 0 1 7-2.600 4 4 0 0 1 7 2.600c0 5.200-7 9.500-7 9.500z"/>',
  download: '<path d="M12 4.500v10M8 11l4 4 4-4M5 19.500h14"/>',
  trash: '<path d="M5 7.500h14M9.500 7.500v-2h5v2M7 7.500l.800 11a1.500 1.500 0 0 0 1.500 1.400h5.400a1.500 1.500 0 0 0 1.500-1.400l.800-11"/>',
  out: '<path d="M14 5.500h3.500A1.500 1.500 0 0 1 19 7v10a1.500 1.500 0 0 1-1.500 1.500H14M10.500 8.500 7 12l3.500 3.500M7 12h8"/>',
}

const MI: Record<MoodKey, string> = {
  chuva: '<path d="M9.5 18.5h13a4.5 4.5 0 0 0 .4-9A6.5 6.5 0 0 0 10.6 10a4.3 4.3 0 0 0-1.1 8.5z"/><path d="M12 22.5l-1 3M17 22.5l-1 3M22 22.5l-1 3"/>',
  nublado: '<path d="M8.5 23.5h15a5 5 0 0 0 .5-9.970A7 7 0 0 0 9.800 14.600a4.500 4.500 0 0 0-1.300 8.900z"/>',
  neblina: '<path d="M5 11.5c3-2 5.5 2 8.5 0s5.5-2 8.5 0 3.5 1 5 0M5 16.5c3-2 5.5 2 8.5 0s5.5-2 8.5 0 3.5 1 5 0M5 21.5c3-2 5.5 2 8.5 0s5.5-2 8.5 0 3.500 1 5 0"/>',
  abrindo: '<circle cx="12" cy="12" r="4"/><path d="M12 4.5V6M4.5 12H6M6.700 6.700l1.100 1.100M17.300 6.700l-1.100 1.100"/><path d="M13 25h10a4 4 0 0 0 .4-7.980A5.600 5.600 0 0 0 13.600 18a3.600 3.600 0 0 0-.600 7z"/>',
  sol: '<circle cx="16" cy="16" r="5"/><path d="M16 5v2.500M16 24.500V27M5 16h2.500M24.500 16H27M8.200 8.200 10 10M22 22l1.800 1.800M8.200 23.800 10 22M22 10l1.800-1.800"/>',
}

/** Ícone de traço. sm = 17px; padrão = 22px. */
export function Icon({ n, sm, className }: { n: IconName; sm?: boolean; className?: string }) {
  return (
    <svg
      className={'ic' + (sm ? ' sm' : '') + (className ? ' ' + className : '')}
      viewBox="0 0 24 24" aria-hidden="true" focusable="false"
      dangerouslySetInnerHTML={{ __html: IC[n] }}
    />
  )
}
/** Ícone de clima do check-in (caixa 32). O tamanho e o traço vêm do CSS de quem usa (.mood svg, .sd svg). */
export function MoodIcon({ k }: { k: MoodKey }) {
  return <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: MI[k] }} />
}
