/**
 * Catálogo de sabores em destaque na landing page.
 *
 * Para adicionar um sabor novo, basta incluir um objeto no array abaixo.
 * Para usar uma foto real, salve a imagem em assets/img/sabores/ com o
 * nome indicado em "img" — se o arquivo ainda não existir, o card usa
 * automaticamente a ilustração de fundo (emoji + gradiente) no lugar.
 */
const DGULA_FLAVORS = [
  {
    slug: "gula-da-casa",
    name: "Gula da Casa",
    desc: "Nossa criação: calabresa, catupiry, milho e cebola caramelizada.",
    tag: "Mais pedida",
    price: "a partir de R$ 39,90",
    emoji: "🤤",
    img: "assets/img/sabores/gula-da-casa.jpg"
  },
  {
    slug: "calabresa-acebolada",
    name: "Calabresa Acebolada",
    desc: "A clássica que nunca sai de moda, com bastante cebola no ponto certo.",
    tag: "Clássica",
    price: "a partir de R$ 34,90",
    emoji: "🧅",
    img: "assets/img/sabores/calabresa-acebolada.jpg"
  },
  {
    slug: "frango-catupiry",
    name: "Frango com Catupiry",
    desc: "Frango desfiado bem temperado com bastante catupiry cremoso.",
    tag: "Favorita",
    price: "a partir de R$ 36,90",
    emoji: "🧀",
    img: "assets/img/sabores/frango-catupiry.jpg"
  },
  {
    slug: "quatro-queijos",
    name: "Quatro Queijos",
    desc: "Mussarela, catupiry, provolone e parmesão — pra quem ama queijo de verdade.",
    tag: "Clássica",
    price: "a partir de R$ 38,90",
    emoji: "🫕",
    img: "assets/img/sabores/quatro-queijos.jpg"
  },
  {
    slug: "bacon-cheddar",
    name: "Bacon com Cheddar",
    desc: "Bacon crocante e cheddar derretido em cada fatia.",
    tag: "Novidade",
    price: "a partir de R$ 39,90",
    emoji: "🥓",
    img: "assets/img/sabores/bacon-cheddar.jpg"
  },
  {
    slug: "chocolate-morango",
    name: "Chocolate com Morango",
    desc: "Pizza doce com chocolate ao leite derretido e morango fresquinho.",
    tag: "Sobremesa",
    price: "a partir de R$ 32,90",
    emoji: "🍓",
    img: "assets/img/sabores/chocolate-morango.jpg"
  }
];
