// Conteúdo das páginas /afinador/<instrumento>/ (ver src/pages/afinador/[instrumento].astro).
// As afinações em si ficam no script de src/components/Afinador.astro.

export type Instrumento = 'cavaquinho' | 'ukulele' | 'viola' | 'bandolim';
export interface Pagina {
  slug: string;
  instrumento: Instrumento;
  nome: string;
  artigo: 'o' | 'a';
  title: string;
  description: string;
  h1: string;
  subtitulo: string;
  afinacoesResumo: string;
  intro: string;
  passos: string[];
  secoes: { titulo: string; html: string }[];
  faq: { question: string; answer: string }[];
}

export const AFINADORES: Pagina[] = [
  {
    slug: 'cavaquinho',
    instrumento: 'cavaquinho',
    nome: 'cavaquinho',
    artigo: 'o',
    title: 'Afinador de Cavaquinho Online e Grátis (Ré Sol Si Ré)',
    description: 'Afinador de cavaquinho online e grátis pelo microfone. Afinação padrão Ré Sol Si Ré (DGBD) e natural Ré Sol Si Mi (DGBE), com agulha e desvio em cents.',
    h1: 'Afinador de Cavaquinho Online',
    subtitulo: 'Ré Sol Si Ré · Microfone · Grátis',
    afinacoesResumo: 'Ré Sol Si Ré (DGBD), a mais usada no samba, no pagode e no choro, e Ré Sol Si Mi (DGBE), a afinação natural.',
    intro: 'Este <strong>afinador de cavaquinho</strong> funciona pelo microfone do celular ou do computador, sem instalar aplicativo. Ele já abre na afinação padrão <strong>Ré, Sol, Si, Ré</strong>: toque uma corda por vez e leve a agulha até o centro.',
    passos: [
      'Confira a afinação no menu: <strong>Ré Sol Si Ré</strong> já vem selecionada.',
      'Clique em <strong>Ativar Microfone</strong> e permita o acesso.',
      'Toque a 4ª corda (a mais grossa, em cima) solta. O afinador mostra a nota e o desvio.',
      'Agulha à esquerda: a corda está grave, aperte a tarraxa. À direita: está aguda, afrouxe.',
      'Quando ficar verde e no centro, passe para a próxima corda até a 1ª.',
    ],
    secoes: [
      {
        titulo: 'Qual a afinação do cavaquinho',
        html: '<p>A afinação mais usada no Brasil é <strong>Ré, Sol, Si, Ré</strong> (DGBD), da 4ª corda, a mais grossa, para a 1ª, a mais fina. É a do samba, do pagode e do choro, e a que quase todo método ensina primeiro.</p><p>A outra opção do afinador é a <strong>natural, Ré, Sol, Si, Mi</strong> (DGBE). Ela repete o desenho das quatro cordas mais finas do violão, então quem já toca violão reconhece os acordes. Siga a afinação do professor ou do método que você usa, porque os desenhos de acorde mudam de uma para a outra.</p>',
      },
      {
        titulo: 'Por que o cavaquinho desafina tanto',
        html: '<p>As cordas de aço do cavaquinho são curtas e finas, então qualquer mudança de temperatura ou um toque na tarraxa mexe na nota. Cordas novas também esticam nos primeiros dias: afine, toque um pouco e afine de novo. Se o instrumento não segura a afinação nem depois disso, o problema pode ser tarraxa frouxa ou corda velha.</p><p>Ainda escolhendo o instrumento? Veja o guia do <a href="/blog/melhor-cavaquinho-para-iniciante/">melhor cavaquinho para iniciante</a>.</p>',
      },
    ],
    faq: [
      { question: 'Qual a afinação padrão do cavaquinho?', answer: 'Ré, Sol, Si, Ré (DGBD), da 4ª corda (mais grossa) para a 1ª (mais fina). É a mais usada no samba, no pagode e no choro, e é a que o afinador abre selecionada.' },
      { question: 'O que é a afinação natural do cavaquinho?', answer: 'É Ré, Sol, Si, Mi (DGBE). Ela tem o mesmo desenho das quatro cordas mais finas do violão, por isso alguns métodos usam para quem vem do violão. Está no menu de afinações do afinador.' },
      { question: 'O afinador de cavaquinho é grátis e funciona no celular?', answer: 'Sim. É gratuito, sem cadastro e sem aplicativo. Funciona no navegador do celular ou do computador; basta permitir o microfone. O som é analisado no próprio aparelho e nada é gravado.' },
    ],
  },
  {
    slug: 'ukulele',
    instrumento: 'ukulele',
    nome: 'ukulele',
    artigo: 'o',
    title: 'Afinador de Ukulele Online e Grátis (Sol Dó Mi Lá)',
    description: 'Afinador de ukulele online e grátis pelo microfone. Afinação padrão Sol Dó Mi Lá (GCEA), Sol grave (Low G) e barítono, com agulha e desvio em cents.',
    h1: 'Afinador de Ukulele Online',
    subtitulo: 'Sol Dó Mi Lá · Microfone · Grátis',
    afinacoesResumo: 'Sol Dó Mi Lá (GCEA), a padrão do soprano, concert e tenor, Sol grave (Low G) e barítono, Ré Sol Si Mi.',
    intro: 'Este <strong>afinador de ukulele</strong> funciona pelo microfone do celular ou do computador, sem instalar aplicativo. Ele já abre na afinação padrão <strong>Sol, Dó, Mi, Lá</strong>: toque uma corda por vez e leve a agulha até o centro.',
    passos: [
      'Confira a afinação no menu: <strong>Sol Dó Mi Lá</strong> já vem selecionada. Para ukulele barítono, escolha a opção barítono.',
      'Clique em <strong>Ativar Microfone</strong> e permita o acesso.',
      'Toque a 4ª corda (a de cima, Sol) solta. O afinador mostra a nota e o desvio.',
      'Agulha à esquerda: a corda está grave, aperte a tarraxa. À direita: está aguda, afrouxe.',
      'Quando ficar verde e no centro, passe para a próxima corda até a 1ª (Lá).',
    ],
    secoes: [
      {
        titulo: 'Qual a afinação do ukulele',
        html: '<p>Os ukuleles soprano, concert e tenor usam <strong>Sol, Dó, Mi, Lá</strong> (GCEA), da 4ª corda para a 1ª. A corda Sol é mais aguda que a Dó, mesmo estando em cima: é a afinação reentrante, que dá o som brilhante típico do instrumento.</p><p>Algumas pessoas trocam a corda Sol por uma mais grossa, afinada uma oitava abaixo: é o <strong>Sol grave (Low G)</strong>, que dá mais corpo. O <strong>ukulele barítono</strong>, maior, usa <strong>Ré, Sol, Si, Mi</strong>, igual às quatro cordas mais finas do violão. As três opções estão no menu.</p>',
      },
      {
        titulo: 'Por que o ukulele novo desafina tanto',
        html: '<p>Cordas de nylon esticam bastante nas primeiras uma ou duas semanas. Nesse período o ukulele desafina a cada poucos minutos, mesmo sendo um instrumento bom. Afine sempre antes de tocar e a afinação estabiliza. Se depois de algumas semanas ele ainda não segura, desconfie das tarraxas.</p><p>Ainda escolhendo o seu? Veja o guia do <a href="/blog/melhor-ukulele-para-iniciante/">melhor ukulele para iniciante</a>.</p>',
      },
    ],
    faq: [
      { question: 'Qual a afinação padrão do ukulele?', answer: 'Sol, Dó, Mi, Lá (GCEA), da 4ª corda para a 1ª, nos ukuleles soprano, concert e tenor. A corda Sol é mais aguda que a Dó, e isso dá o som característico do ukulele.' },
      { question: 'Como afinar ukulele barítono?', answer: 'O barítono usa Ré, Sol, Si, Mi (DGBE), igual às quatro cordas mais finas do violão. Escolha "Barítono" no menu de afinações e afine da 4ª corda (Ré) para a 1ª (Mi).' },
      { question: 'O afinador de ukulele é grátis e funciona no celular?', answer: 'Sim. É gratuito, sem cadastro e sem aplicativo. Funciona no navegador do celular ou do computador; basta permitir o microfone. O som é analisado no próprio aparelho e nada é gravado.' },
    ],
  },
  {
    slug: 'viola-caipira',
    instrumento: 'viola',
    nome: 'viola caipira',
    artigo: 'a',
    title: 'Afinador de Viola Caipira Online (Cebolão, Rio Abaixo)',
    description: 'Afinador de viola caipira online e grátis pelo microfone: Cebolão em Ré, Cebolão em Mi, Rio Abaixo e Natural, com agulha, desvio em cents e dica para os pares oitavados.',
    h1: 'Afinador de Viola Caipira Online',
    subtitulo: 'Cebolão · Rio Abaixo · Microfone · Grátis',
    afinacoesResumo: 'Cebolão em Ré, Cebolão em Mi, Rio Abaixo e Natural, do 5º par para o 1º.',
    intro: 'Este <strong>afinador de viola caipira</strong> funciona pelo microfone do celular ou do computador, sem instalar aplicativo. Escolha a afinação no menu (Cebolão em Ré já vem selecionada), toque um par de cada vez e leve a agulha até o centro.',
    passos: [
      'Escolha a afinação no menu: <strong>Cebolão em Ré</strong>, <strong>Cebolão em Mi</strong>, <strong>Rio Abaixo</strong> ou <strong>Natural</strong>.',
      'Clique em <strong>Ativar Microfone</strong> e permita o acesso.',
      'Comece pelo 5º par. Toque só a corda mais grossa do par e leve a agulha ao centro.',
      'Depois toque a outra corda do mesmo par e afine pela mesma nota. O afinador mostra o nome da nota em qualquer oitava.',
      'Repita par a par até o 1º. Agulha à esquerda: aperte a cravelha. À direita: afrouxe.',
    ],
    secoes: [
      {
        titulo: 'Como afinar os pares da viola',
        html: '<p>A viola caipira tem <strong>dez cordas em cinco pares</strong>. Nos dois pares mais agudos (2º e 1º), as duas cordas têm exatamente a mesma nota. Nos três mais graves (5º, 4º e 3º), uma corda fica uma oitava acima da outra. Por isso a dica é afinar cada corda sozinha: com as duas soando juntas, o microfone fica confuso.</p><p>Como o afinador mostra o nome da nota independentemente da oitava, a corda fina de um par oitavado aparece com a mesma letra da grossa. Afine as duas até a agulha ficar no centro na mesma nota.</p>',
      },
      {
        titulo: 'Afinações de viola no menu',
        html: '<p>Do 5º par para o 1º:</p><ul><li><strong>Cebolão em Ré:</strong> Lá, Ré, Fá#, Lá, Ré.</li><li><strong>Cebolão em Mi:</strong> Si, Mi, Sol#, Si, Mi, um tom acima do Cebolão em Ré.</li><li><strong>Rio Abaixo:</strong> Sol, Ré, Sol, Si, Ré.</li><li><strong>Natural:</strong> Lá, Ré, Sol, Si, Mi, igual às cinco cordas mais finas do violão.</li></ul><p>Não existe afinação certa para começar: siga a do professor ou do método. Para escolher o instrumento, veja o guia da <a href="/blog/melhor-viola-caipira/">melhor viola caipira</a>.</p>',
      },
    ],
    faq: [
      { question: 'Qual a afinação mais usada na viola caipira?', answer: 'O Cebolão, em Ré (Lá, Ré, Fá#, Lá, Ré) ou em Mi (Si, Mi, Sol#, Si, Mi), do 5º par para o 1º. Rio Abaixo e a afinação Natural também são comuns, e as quatro estão no menu do afinador.' },
      { question: 'Como afinar as cordas oitavadas da viola?', answer: 'Afine uma corda de cada vez. Primeiro a mais grossa do par, depois a mais fina pela mesma nota: o afinador mostra o nome da nota em qualquer oitava, então as duas devem chegar ao centro com a mesma letra.' },
      { question: 'O afinador de viola caipira é grátis e funciona no celular?', answer: 'Sim. É gratuito, sem cadastro e sem aplicativo. Funciona no navegador do celular ou do computador; basta permitir o microfone. O som é analisado no próprio aparelho e nada é gravado.' },
    ],
  },
  {
    slug: 'bandolim',
    instrumento: 'bandolim',
    nome: 'bandolim',
    artigo: 'o',
    title: 'Afinador de Bandolim Online e Grátis (Sol Ré Lá Mi)',
    description: 'Afinador de bandolim online e grátis pelo microfone. Afinação Sol Ré Lá Mi (GDAE), a mesma do violino, com agulha, desvio em cents e dica para afinar os pares.',
    h1: 'Afinador de Bandolim Online',
    subtitulo: 'Sol Ré Lá Mi · Microfone · Grátis',
    afinacoesResumo: 'Sol Ré Lá Mi (GDAE), do par mais grave para o mais agudo, a mesma afinação do violino.',
    intro: 'Este <strong>afinador de bandolim</strong> funciona pelo microfone do celular ou do computador, sem instalar aplicativo. Ele já abre na afinação <strong>Sol, Ré, Lá, Mi</strong>: toque uma corda de cada vez e leve a agulha até o centro.',
    passos: [
      'Clique em <strong>Ativar Microfone</strong> e permita o acesso.',
      'Comece pelo par mais grave (Sol). Toque uma corda só e leve a agulha ao centro.',
      'Toque a outra corda do mesmo par e afine pela mesma nota.',
      'Agulha à esquerda: a corda está grave, aperte a tarraxa. À direita: está aguda, afrouxe.',
      'Repita nos pares Ré, Lá e Mi.',
    ],
    secoes: [
      {
        titulo: 'Qual a afinação do bandolim',
        html: '<p>O bandolim de 8 cordas tem <strong>quatro pares</strong>, e as duas cordas de cada par têm a mesma nota. Do par mais grave para o mais agudo, a afinação é <strong>Sol, Ré, Lá, Mi</strong> (GDAE), a mesma do violino. Afine uma corda de cada vez: com as duas soando juntas, qualquer diferença vira um batimento que confunde o microfone.</p><p>Para escolher o instrumento, veja o guia do <a href="/blog/melhor-bandolim/">melhor bandolim</a>.</p>',
      },
    ],
    faq: [
      { question: 'Qual a afinação do bandolim?', answer: 'Sol, Ré, Lá, Mi (GDAE), do par mais grave para o mais agudo, igual ao violino. Cada nota tem duas cordas afinadas iguais.' },
      { question: 'O afinador de bandolim é grátis e funciona no celular?', answer: 'Sim. É gratuito, sem cadastro e sem aplicativo. Funciona no navegador do celular ou do computador; basta permitir o microfone. O som é analisado no próprio aparelho e nada é gravado.' },
    ],
  },
];
