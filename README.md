# D'Gula Pizzaria — Landing Page

Landing page de conversão para a **D'Gula Pizzaria** (Paripe, Salvador - BA),
feita para receber tráfego pago (Instagram/Meta Ads) e levar o visitante a
pedir pelo **WhatsApp** o mais rápido possível.

Site 100% estático (HTML + CSS + JavaScript puro, sem frameworks ou build
step), leve e rápido de carregar — importante para não perder cliques de
anúncio por lentidão.

## Estrutura do projeto

```
index.html                     → página única (todas as seções)
assets/
  css/style.css                → todo o estilo visual
  js/main.js                   → interações (WhatsApp, animações, PDF, etc.)
  js/flavors.js                → catálogo de sabores exibido na seção "Sabores"
  img/logo.svg                 → logo em vetor (recriada a partir da arte enviada)
  img/sabores/                 → onde entram as fotos reais dos sabores
  img/og-image.png             → imagem de pré-visualização ao compartilhar o link
  cardapio/                    → onde entra o cardápio completo em PDF
```

## Decisões importantes

- **Sem endereço em destaque.** Como o site é pensado para anúncios
  segmentados por região, o endereço completo não aparece na página — só a
  menção a "Paripe e região" no rodapé, para não expor o endereço exato de
  cara e reforçar a sensação de proximidade ("pizzaria que tá crescendo
  perto de você").
- **Foco total no WhatsApp.** Por isso não existe menu de navegação
  "distraindo" o visitante — cada seção empurra para o botão verde do
  WhatsApp (com mensagem pré-preenchida, já citando o sabor quando aplicável).
- **Cardápio online como caminho alternativo.** O link para
  `app.cardapioweb.com/dgula` aparece como opção secundária (botão
  "Ver/Pedir cardápio online"), com UTMs próprias da landing page.

## Como atualizar o conteúdo

### Adicionar fotos dos sabores
Veja `assets/img/sabores/LEIA-ME.txt`. Resumo: salve a foto na pasta e
aponte o campo `img` do sabor correspondente em `assets/js/flavors.js`.
Sem foto, o card usa uma ilustração colorida automaticamente — nada quebra.

### Adicionar/editar sabores
Edite o array `DGULA_FLAVORS` em `assets/js/flavors.js`. Cada sabor é um
objeto simples com nome, descrição, tag, preço, emoji e imagem.

### Publicar o cardápio em PDF
Veja `assets/cardapio/LEIA-ME.txt`. Resumo: salve o PDF como
`assets/cardapio/cardapio-dgula.pdf` e o botão "Baixar cardápio em PDF"
passa a funcionar sozinho.

### Trocar número de WhatsApp ou mensagens
No topo de `assets/js/main.js`, altere a constante `WHATSAPP_NUMBER`. As
mensagens pré-preenchidas de cada botão ficam no atributo
`data-message="..."` de cada link no `index.html`.

### Instalar pixel de anúncios (Meta/TikTok Ads)
Há um comentário indicando o local exato no `<head>` do `index.html` —
é só colar o script de pixel da plataforma ali para rastrear conversões.

### Trocar a logo
A logo atual (`assets/img/logo.svg`) é uma recriação em vetor da arte
enviada. Para usar o arquivo original, substitua
`assets/img/logo.svg` pelo arquivo definitivo (mantendo o mesmo nome) ou
atualize as referências no `index.html` para o novo caminho/formato.
Depois, regenere `assets/img/og-image.png` e `assets/img/apple-touch-icon.png`
com a arte final (ou peça para gerar novamente a partir da logo definitiva).

## Como publicar (deploy)

Como é um site estático, pode subir em qualquer um destes serviços
gratuitos, sem configuração de servidor:

- **Netlify / Vercel**: arraste a pasta do projeto no painel, ou conecte o
  repositório Git.
- **GitHub Pages**: ative em Settings → Pages, apontando para a branch
  principal.
- **Hospedagem tradicional (cPanel etc.)**: envie os arquivos por FTP para
  a pasta pública do domínio.

## Rodando localmente

Não precisa de instalação — basta um servidor estático simples:

```bash
python3 -m http.server 8000
# depois abra http://localhost:8000
```
