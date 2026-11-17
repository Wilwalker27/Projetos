# COLO — Plataforma de Cuidado

Protótipo navegável do app do COLO: cuidado em conjunto, com psicologia, educação física e
nutrição acompanhando a mesma pessoa. É um PWA (um único código web, instalável no celular),
feito em React + Vite + TypeScript, como pede a stack do briefing.

A interface segue o protótipo de referência aprovado ("pêssego & névoa"): as mesmas cores,
fontes, espaçamentos, componentes, animações e textos. O que este app acrescenta é o que o
briefing pede: os três planos, a versão gratuita e a de assinante, as regras de remarcação e
o painel do profissional.

> **Tudo aqui é protótipo.** Profissionais, acolhidos, registros e históricos são fictícios.
> Não há servidor, login nem cobrança: o que a pessoa marca fica salvo só no navegador dela.

## Rodar

```bash
npm install
```

```bash
npm run dev
```

Abra o endereço que aparecer no terminal. Em tela larga, o app aparece dentro de um aparelho,
com uma coluna ao lado para trocar de versão e pular entre telas. No celular, ocupa a tela toda.

Outros comandos:

```bash
npm run build
```

```bash
npm run preview
```

```bash
npm test
```

`npm run build` confere os tipos e gera a pasta `dist/`, pronta para qualquer hospedagem
estática (Vercel, Netlify, GitHub Pages). O build usa caminhos relativos e as rotas ficam no
`#` do endereço, então não precisa de nenhuma regra de servidor.

## O que dá para ver

| Versão | Como chegar | O que mostra |
|---|---|---|
| COLO Aberto (gratuito) | é a versão inicial | check-in de clima, bilhete do dia, pausas, diário, anotações, botão COLO, vitrine do trio, planos |
| Assinante (Essencial ou Inteiro) | coluna lateral, ou Ajustes → Protótipo, ou assinando pela tela de Planos | + próximo encontro, combinados, agenda com remarcação, conversa, jornada completa, plano |
| Painel do profissional | coluna lateral, ou Ajustes → Protótipo → Profissional | agenda da semana, acolhidos, notas privadas e do trio, conversas, resumo do mês |

Em **Ajustes → Protótipo** (e na coluna lateral) há também o **relógio do protótipo**, que
adianta o tempo em 1 hora, 1 dia ou 1 semana. Serve para ver o que acontece depois de um
encontro, na virada do mês (o saldo de remarcações volta) ou uma semana depois de um convite.

Roteiro para ver as regras de falta e remarcação:

1. Entre como assinante e abra a Agenda. Remarque um encontro: o saldo daquela área cai para zero.
2. Adiante o relógio até passar um encontro.
3. Vá ao painel do profissional daquela área e marque "Faltou".
4. Volte como acolhido: o encontro aparece como falta, com o prazo de 12 horas para remarcar
   (ou como perdido, se a remarcação do mês já foi usada).

## Onde cada coisa mora

```
src/
  data/content.ts     equipe fictícia, focos, check-in, bilhetes, frases, pausas (textos da referência)
  data/plans.ts       planos, preços, repasses e regras (único lugar onde vivem)
  data/demo.ts        acolhidos fictícios do painel do profissional
  lib/sessions.ts     agenda gerada pelo plano, faltas e remarcações
  lib/invite.ts       regras do convite para assinar (COLO Aberto)
  lib/risk.ts         palavras de risco
  lib/pro.ts          dados do painel: acolhidos, agenda, resumo do mês
  lib/dates.ts        datas em pt-BR e o relógio do protótipo
  state/store.ts      estado, salvo no localStorage
  state/actions.ts    tudo o que muda o estado
  nav/router.ts       rotas no hash, integradas ao botão voltar do aparelho
  ui/                 marca, ícones, avatar, anel, céu, painel, aviso, apoio de crise
  shell/              barra de abas, botão COLO, coluna lateral, controles do protótipo
  screens/            uma tela por arquivo; screens/pro/ é o painel do profissional
  styles/reference.css  CSS do protótipo aprovado, copiado sem alteração
  styles/app.css        o que o app acrescenta (PWA, toque de 44px, peças novas)
  styles/screens/       estilos de cada tela nova
```

Para mudar um preço, uma frequência ou uma regra (remarcações por mês, prazo de 12 horas,
intervalo do convite), altere `src/data/plans.ts`. As telas leem de lá.

## Regras do briefing e onde estão no código

- **Planos**: COLO Aberto (grátis), Essencial (R$ 499) e Inteiro (R$ 679) — `data/plans.ts`.
  O preço só aparece na tela de Planos e no cartão "Seu plano", em Ajustes.
- **Faltas e remarcações**: 1 remarcação por mês em cada área; quem falta tem 12 horas para
  remarcar; falta depois de remarcar é perdida; sessão perdida é paga ao profissional —
  `lib/sessions.ts`. Testes de todas as regras em `lib/rules.test.ts` (`npm test`).
- **Convite para assinar**: no máximo 1 por semana, só depois de 7 dias de diário, nunca perto
  de um check-in difícil (chovendo ou neblina) — `lib/invite.ts`.
- **Crise**: CVV 188 e SAMU 192 no botão COLO, em Ajustes e em toda tela de diário e de
  anotação. Palavras de risco mostram o apoio na hora; para quem tem plano, a psicóloga recebe
  um aviso sem o texto, assim que as palavras aparecem — `lib/risk.ts`, `ui/bits.tsx` (`Sos`).
  A lista de palavras é inicial e precisa ser validada pela psicóloga antes de publicar.
- **Dados (LGPD)**: consentimento por área, notas privadas por profissional, exportar dados e
  apagar conta — tela de Privacidade.
- **Vocabulário**: "acolhido" (nunca cliente ou paciente), "plano de cuidado" ou "assinatura"
  (nunca "plano de saúde"), sem depoimentos.

## Antes de publicar

Além das decisões em aberto do briefing (marca, Asaas com CPF, contador), o protótipo deixa
estes pontos para a equipe:

- validar com a psicóloga a lista de palavras de risco (`src/lib/risk.ts`);
- trocar o texto de exemplo do termo de consentimento (tela de Planos) pelo termo revisado;
- trocar a equipe fictícia, os registros e os horários de resposta pelos reais (`src/data/content.ts`);
- conferir o contraste de alguns tons da paleta (texto claro sobre pêssego e névoa) para AA.

## O que é simulado

| No protótipo | No piloto |
|---|---|
| Estado no `localStorage` | Supabase, região São Paulo, com regras de acesso por linha (`state/store.ts` e `state/actions.ts` são o ponto de troca) |
| Assinatura que só muda o plano na tela | Asaas: assinatura, split, Pix Automático, webhooks |
| Link de chamada de exemplo | um link do Google Meet por sessão |
| Aviso de risco que aparece no painel | aviso à psicóloga no mesmo dia útil |
| Horários de resposta e de agenda fictícios | os de cada profissional |

## Publicar como app

O build já sai como PWA: manifesto, ícones e funcionamento offline (`vite.config.ts`).
No iPhone, a pessoa adiciona à tela inicial pelo Safari. Para a Google Play, o mesmo endereço
publicado é empacotado como TWA com o Bubblewrap.
