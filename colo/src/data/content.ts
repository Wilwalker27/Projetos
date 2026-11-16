/* Conteúdo do COLO: equipe, focos, check-in, bilhetes, frases e pausas.
   Textos vindos do protótipo de referência aprovado. A equipe é FICTÍCIA
   (nomes, registros e históricos), como pede o briefing para o protótipo. */
import type { Bilhete, Foco, Hora, Mood, Pausa, PlanKey, Pro, ProKey, Tom } from '../types'

export const PROS: Record<ProKey, Pro> = {
  ana: {
    name: 'Ana Luíza Prado', first: 'Ana', role: 'Psicóloga', sign: 'sua psicóloga', signFree: 'psicóloga do COLO',
    area: 'Mente', service: 'psicologia', reg: 'CRP 03/18472', color: 'mente',
    approach: 'Terapia cognitivo-comportamental e ACT',
    rhythm: { essencial: 'Toda quinta, 19h · 50 min · online', inteiro: 'Toda quinta, 19h · 50 min · online' },
    bio: 'Começa cada sessão perguntando como foi a semana no corpo, antes de chegar na cabeça.',
    reply: 'responde em até 1 dia útil', replyWindow: 'Segunda a sexta, das 9h às 18h',
    comb: { text: 'Três linhas no diário antes de dormir', goal: 5, unit: 'noites', one: 'noite' },
  },
  rafael: {
    name: 'Rafael Menezes', first: 'Rafael', role: 'Profissional de Educação Física', sign: 'seu educador físico', signFree: 'educador físico do COLO',
    area: 'Movimento', service: 'educação física', reg: 'CREF 024518-G/BA', color: 'corpo',
    approach: 'Treino funcional e mobilidade para quem passa o dia sentado',
    rhythm: { essencial: 'A cada 10 dias, 7h · 50 min · online', inteiro: 'Toda terça, 7h · 50 min · online' },
    bio: 'Acredita que o melhor treino é o que cabe na sua semana de verdade.',
    reply: 'responde em até 1 dia útil', replyWindow: 'Segunda a sexta, das 7h às 16h',
    comb: { text: 'Caminhar 25 minutos', goal: 3, unit: 'caminhadas', one: 'caminhada' },
  },
  julia: {
    name: 'Júlia Santana', first: 'Júlia', role: 'Nutricionista', sign: 'sua nutricionista', signFree: 'nutricionista do COLO',
    area: 'Nutrição', service: 'nutrição', reg: 'CRN-5 9031', color: 'nutri',
    approach: 'Nutrição comportamental, sem dieta da moda',
    rhythm: { essencial: 'Uma vez por mês · 60 min · online', inteiro: 'A cada 15 dias · 60 min · online' },
    bio: 'Não trabalha com proibições. Trabalha a partir do que você gosta de comer.',
    reply: 'responde em até 1 dia útil', replyWindow: 'Segunda a sexta, das 10h às 17h',
    comb: { text: 'Almoçar sem tela', goal: 5, unit: 'almoços', one: 'almoço' },
  },
}
export const ORDER: ProKey[] = ['ana', 'rafael', 'julia']

export const FOCOS: Foco[] = [
  { k: 'mente', t: 'Cuidar da cabeça' }, { k: 'mexer', t: 'Voltar a me mexer' }, { k: 'comer', t: 'Comer com mais calma' },
  { k: 'dormir', t: 'Dormir melhor' }, { k: 'energia', t: 'Ter mais energia' }, { k: 'pressao', t: 'Lidar com a pressão' },
]
export const HORAS: Hora[] = [
  { k: 'manha', t: 'Manhã', d: 'Antes do meio-dia', ic: 'sunrise' },
  { k: 'tarde', t: 'Tarde', d: 'Entre 12h e 18h', ic: 'sun' },
  { k: 'noite', t: 'Noite', d: 'Depois das 18h', ic: 'moon' },
]
export const TONS: Tom[] = [
  { k: 'delicada', t: 'Com delicadeza', s: 'Delicado', ex: 'Quando der, que tal uma caminhada curtinha? Sem pressão.' },
  { k: 'empurrao', t: 'Com um empurrãozinho', s: 'Empurrãozinho', ex: 'Bora? São 25 minutos de caminhada, e o resto do dia agradece.' },
  { k: 'quieta', t: 'Só quando eu pedir', s: 'Só se eu pedir', ex: 'Nenhum lembrete. Tudo fica aqui, esperando você.' },
]

/* Check-in de clima (nunca notas). Ações: 'breathe' | 'frase' | 'chat:<pro>' | 'session:<pausa>'. */
export const MOODS: Mood[] = [
  { k: 'chuva', t: 'Chovendo', hard: true, r: 'Dia de chuva também é dia. Você não precisa resolver nada agora.',
    a: [['breathe', 'Respirar comigo'], ['chat:ana', 'Escrever pra Ana']],
    aFree: [['breathe', 'Respirar comigo'], ['frase', 'Uma frase pra segurar']] },
  { k: 'nublado', t: 'Nublado', r: 'Tudo bem estar mais pesado hoje. Uma pausa curta pode abrir um pedaço do céu.',
    a: [['breathe', 'Pausa de 1 minuto'], ['frase', 'Uma frase pra segurar']] },
  { k: 'neblina', t: 'Neblina', hard: true, r: 'Quando tudo embaça, um passo de cada vez já basta. Seus sentidos ajudam a voltar pro agora.',
    a: [['session:ancora', 'Âncora 5-4-3-2-1']] },
  { k: 'abrindo', t: 'Abrindo', r: 'Tem luz chegando. Que tal guardar um pouco disso em três linhas?',
    a: [['session:diario', 'Escrever três linhas']] },
  { k: 'sol', t: 'Ensolarado', r: 'Que bom! Anota o que fez o dia ficar assim, pra reler num dia nublado.',
    a: [['session:diario', 'Guardar no diário']] },
]

export const BILHETES: Bilhete[] = [
  { by: 'julia', tag: 'comer', x: 'Deixe uma fruta à vista na mesa de trabalho. A gente come mais aquilo que enxerga primeiro.' },
  { by: 'rafael', tag: 'mexer', x: 'A cada hora sentado, levante por dois minutos. Ir encher a garrafa de água já conta como movimento.' },
  { by: 'ana', tag: 'mente', x: 'Antes de responder aquela mensagem difícil, solte o ar devagar duas vezes. A resposta pode esperar trinta segundos.' },
  { by: 'ana', tag: 'dormir', x: 'Uma hora antes de deitar, diminua as luzes da casa. O corpo entende o recado e começa a desacelerar.' },
  { by: 'rafael', tag: 'energia', x: 'Dez minutos de luz do sol pela manhã ajudam a acertar o relógio do corpo. O sono da noite agradece.' },
  { by: 'julia', tag: 'energia', x: 'Se a tarde pesa, olhe para o almoço: proteína e fibra no prato seguram a energia por mais tempo.' },
  { by: 'ana', tag: 'pressao', x: 'Liste o que está te preocupando. Ao lado de cada item, marque se depende de você ou não. Comece pelos que dependem.' },
  { by: 'julia', tag: 'comer', x: 'Coma a primeira metade do prato sem tela. Depois, se quiser, pode ligar de novo.' },
  { by: 'rafael', tag: 'dormir', x: 'Treinos mais puxados combinam com a manhã ou a tarde. À noite, prefira alongar e soltar.' },
  { by: 'ana', tag: 'mente', x: 'Dá pra sentir duas coisas ao mesmo tempo: cansaço e orgulho, medo e vontade. Uma não cancela a outra.' },
  { by: 'rafael', tag: 'pressao', x: 'Dia corrido? Suba de escada um andar a mais. Movimento pequeno também tira a tensão do corpo.' },
  { by: 'julia', tag: 'dormir', x: 'Café depois das 16h pode roubar um pedaço do seu sono. Experimente trocar por um chá sem cafeína.' },
]

const FRASE_TRIO = 'Você tem companhia nisso. Três pessoas estão olhando por você.'
export const FRASES: string[] = [
  'Você não precisa merecer descanso. Pode só descansar.',
  'Hoje, fazer o possível já é fazer muito.',
  'O que você sente faz sentido, mesmo quando ainda não tem nome.',
  'Não precisa decidir a vida inteira agora. Só o próximo passo.',
  'Seu corpo te trouxe até aqui. Que tal agradecer com um copo d’água?',
  'Devagar também chega.',
  FRASE_TRIO,
  'Respirar fundo já é cuidar.',
]
/** Frases de apoio para o plano da pessoa (a frase do trio só faz sentido para quem tem trio). */
export const frasesFor = (plan: PlanKey): string[] => (plan === 'aberto' ? FRASES.filter((f) => f !== FRASE_TRIO) : FRASES)

export const PAUSAS: Pausa[] = [
  { id: 'respira', title: 'Respiração 5,5', by: 'ana', ic: 'wind', cat: ['agora', 'mente', 'sono'], min: 2, special: 'breathe',
    desc: 'Inspire e solte no ritmo de 5,5 segundos. Em dois minutos o corpo entende que pode baixar a guarda.' },
  { id: 'ancora', title: 'Âncora 5-4-3-2-1', by: 'ana', ic: 'anchor', cat: ['agora', 'mente'], min: 3,
    desc: 'Para quando a cabeça dispara. Seus sentidos te trazem de volta pro agora.',
    steps: [
      { t: '5 coisas que você vê', d: 'Olhe em volta devagar e nomeie cinco coisas, em voz baixa ou só pensando. Cores e formas contam.' },
      { t: '4 coisas que você pode tocar', d: 'A textura da roupa, o apoio da cadeira, o chão sob os pés, a temperatura das mãos.' },
      { t: '3 sons ao seu redor', d: 'Os mais próximos e os mais distantes. Não precisa gostar deles, só perceber.' },
      { t: '2 cheiros', d: 'Se não sentir nenhum agora, lembre de dois cheiros de que você gosta.' },
      { t: '1 sabor', d: 'O gosto na boca agora, ou um gole d’água. Depois, solte o ar bem devagar.' }] },
  { id: 'diario', title: 'Diário de três linhas', by: 'ana', ic: 'pen', cat: ['mente', 'sono'], min: 3, journal: true,
    desc: 'Três perguntas curtas para fechar o dia sem levar tudo pra cama.',
    steps: [
      { t: 'Uma coisa que pesou hoje', d: 'Pode ser pequena. Escrever já tira um pouco do peso da cabeça.', input: true },
      { t: 'Uma coisa que foi gentil', d: 'Com você, ou vinda de alguém. Um café, uma mensagem, um minuto de silêncio.', input: true },
      { t: 'Uma coisa que pode ficar pra amanhã', d: 'Nem tudo precisa ser resolvido hoje. O que você pode soltar agora?', input: true }] },
  { id: 'pescoco', title: 'Destravar pescoço e ombros', by: 'rafael', ic: 'shoulders', cat: ['agora', 'corpo'], min: 3,
    desc: 'Para quem passou horas na frente da tela. Dá pra fazer sentado, sem trocar de roupa.',
    steps: [
      { t: 'Ombros em círculo', d: 'Gire os ombros para trás, devagar, como se desenhasse um círculo grande.', s: 40 },
      { t: 'Orelha em direção ao ombro', d: 'Incline a cabeça para a direita, sem levantar o ombro. Respire ali.', s: 30 },
      { t: 'Agora o outro lado', d: 'Incline para a esquerda. Se puxar demais, diminua. Aqui não tem competição.', s: 30 },
      { t: 'Queixo em direção ao peito', d: 'Deixe a cabeça pesar para frente e sinta a nuca alongar.', s: 30 },
      { t: 'Abra o peito', d: 'Entrelace as mãos atrás das costas e afaste os ombros das orelhas.', s: 30 }] },
  { id: 'antesdecomer', title: 'Pausa antes de comer', by: 'julia', ic: 'bowl', cat: ['agora', 'comida'], min: 1,
    desc: 'Um minuto antes da primeira garfada muda o jeito de comer a refeição inteira.',
    steps: [
      { t: 'Três respirações', d: 'Antes de pegar o talher, respire fundo três vezes.', s: 15 },
      { t: 'Olhe o prato', d: 'Repare nas cores, no cheiro, no que tem ali. Comer começa pelos olhos.', s: 15 },
      { t: 'De 0 a 10, quanta fome?', d: 'Sem certo ou errado, só perceba. No meio da refeição, pergunte de novo.', s: 20 }] },
  { id: 'dormir', title: 'Escaneamento para dormir', by: 'ana', ic: 'moon', cat: ['sono', 'mente'], min: 6,
    desc: 'Percorra o corpo dos pés à cabeça, soltando um pedaço de cada vez.',
    steps: [
      { t: 'Deite e se acomode', d: 'De barriga pra cima ou de lado. Deixe o colchão segurar o peso do corpo.', s: 45 },
      { t: 'Pés e pernas', d: 'Perceba os pés. Solte os dedos, os tornozelos, as panturrilhas, os joelhos.', s: 75 },
      { t: 'Quadril e barriga', d: 'Deixe a barriga subir e descer sozinha. Não precisa controlar a respiração.', s: 75 },
      { t: 'Mãos, braços e ombros', d: 'Solte os dedos e os cotovelos. Os ombros podem descer mais um pouco.', s: 75 },
      { t: 'Rosto', d: 'Testa lisa, mandíbula solta, língua descansando. Se vierem pensamentos, tudo bem. Volte ao corpo.', s: 90 }] },
  { id: 'caminhada', title: 'Caminhada atenta', by: 'rafael', ic: 'walk', cat: ['corpo'], min: 10,
    desc: 'Dez minutos de caminhada que contam para o seu combinado com o Rafael.',
    descFree: 'Dez minutos de caminhada no seu ritmo, reparando no caminho.',
    steps: [
      { t: 'Aqueça devagar', d: 'Comece num passo tranquilo e deixe os braços balançarem soltos.', s: 120 },
      { t: 'Encontre o seu ritmo', d: 'Acelere até o ponto em que dá pra conversar, mas não pra cantar.', s: 300 },
      { t: 'Repare em volta', d: 'Procure três coisas que você nunca tinha notado nesse caminho.', s: 120 },
      { t: 'Desacelere', d: 'Volte ao passo calmo e respire pelo nariz.', s: 60 }] },
  { id: 'carta', title: 'Carta de colo', by: 'ana', ic: 'pen', cat: ['mente'], min: 5, journal: true,
    desc: 'Escreva para você do jeito que escreveria para alguém que ama.',
    steps: [
      { t: 'Pense em alguém querido', d: 'Se essa pessoa estivesse passando pelo que você está passando, o que você diria a ela?', s: 30 },
      { t: 'Agora escreva pra você', d: 'Use as mesmas palavras, com o mesmo carinho. Sem corrigir, sem caprichar.', input: true }] },
]

/** Notas que cada profissional compartilha depois do encontro (ponto de partida fictício). */
export const NOTAS: Record<ProKey, string> = {
  ana: 'Falamos sobre a cobrança de dar conta de tudo. Combinado: perceber quando ela aparecer e trocar “eu tenho que” por “eu escolho”.',
  rafael: 'A mobilidade do quadril melhorou bastante. Subimos a caminhada para 25 minutos, três vezes na semana.',
  julia: 'O almoço está mais organizado. Próximo passo: planejar o lanche da tarde, pra não chegar à noite com tanta fome.',
}
