/* Palavras de risco (briefing, seção 5): ao aparecerem no diário, nas anotações ou na
   conversa, o app mostra na hora o apoio de crise. Para quem tem plano, a psicóloga
   recebe um aviso no mesmo dia útil, SEM o texto que a pessoa escreveu. */

const TERMS = [
  'suicid', 'me matar', 'me mato', 'tirar minha vida', 'tirar a minha vida', 'acabar com a minha vida', 'acabar com minha vida',
  'acabar com tudo', 'quero morrer', 'queria morrer', 'vontade de morrer', 'prefiro morrer', 'preferia morrer',
  'melhor morrer', 'melhor se eu morresse', 'nao quero mais viver', 'nao aguento mais viver', 'nao vale a pena viver',
  'desistir de viver', 'desistir da vida', 'sumir pra sempre', 'sumir para sempre', 'sumir de vez', 'nao acordar mais',
  'me machucar', 'me cortar', 'me ferir', 'automutil', 'overdose',
  'se matar', 'estar morta', 'estar morto', 'propria vida', 'acabar com a vida', 'dar fim na minha vida',
  'dar fim a minha vida', 'dar fim em tudo', 'nao quero mais estar aqui', 'nao queria mais estar aqui', 'me enforcar',
  'me jogar da', 'me jogar de', 'me jogar na frente', 'dormir e nao acordar', 'nao existisse', 'nao existir mais',
  'quero sumir', 'queria sumir', 'ninguem sentiria minha falta', 'ninguem ia sentir minha falta',
]
/* Lista inicial, a validar com a psicóloga do piloto antes de publicar. */

const norm = (s: string): string => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ')

/** true quando o texto contém alguma expressão de risco. Erra para o lado do cuidado. */
export function hasRisk(text: string | null | undefined): boolean {
  if (!text) return false
  const t = norm(text)
  return TERMS.some((w) => t.includes(w))
}
