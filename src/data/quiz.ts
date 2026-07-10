export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

export const QUIZ_QUESTIONS: Record<'Iniciante' | 'Intermediário' | 'Avançado', QuizQuestion[]> = {
  Iniciante: [
    {
      question: 'Quantas notas musicais naturais (sem sustenidos ou bemóis) existem?',
      options: ['5', '7', '8', '12'],
      correctIndex: 1,
      hint: 'Pense nas teclas brancas do piano dentro de uma oitava.',
    },
    {
      question: 'Qual é a ordem correta das notas naturais a partir do Dó?',
      options: [
        'Dó Ré Mi Fá Sol Lá Si',
        'Dó Mi Ré Fá Sol Si Lá',
        'Dó Ré Mi Sol Fá Lá Si',
        'Dó Ré Fá Mi Sol Si Lá',
      ],
      correctIndex: 0,
      hint: 'É a sequência que você já canta: Dó Ré Mi Fá Sol Lá Si.',
    },
    {
      question: 'Na afinação padrão da guitarra, qual é a nota da corda mais grave (6ª corda)?',
      options: ['Mi', 'Lá', 'Ré', 'Sol'],
      correctIndex: 0,
      hint: 'É a mesma nota que abre o nome da afinação padrão: E A D G B E.',
    },
    {
      question: "O que é um 'tom' (intervalo de tom inteiro) em música?",
      options: [
        'A distância de dois semitons',
        'A distância de um semitom',
        'Um acorde com três notas',
        'O andamento de uma música',
      ],
      correctIndex: 0,
      hint: 'Um tom equivale a dois "passos" de semitom somados.',
    },
    {
      question: 'O que é BPM?',
      options: [
        'Beats por minuto — mede o andamento da música',
        'Um tipo de acorde',
        'A quantidade de cordas de um instrumento',
        'Um efeito de pedal',
      ],
      correctIndex: 0,
      hint: "A sigla vem do inglês 'beats per minute'.",
    },
    {
      question: 'Quantas cordas tem uma guitarra ou violão no formato padrão?',
      options: ['4', '5', '6', '7'],
      correctIndex: 2,
      hint: 'Conte as cordas de um violão clássico ou de uma guitarra Stratocaster.',
    },
    {
      question: 'O que forma um acorde maior básico (tríade)?',
      options: [
        'Tônica, terça maior e quinta justa',
        'Apenas duas notas',
        'Tônica e sétima menor',
        'Quatro notas iguais',
      ],
      correctIndex: 0,
      hint: 'Toda tríade é formada por três notas empilhadas em intervalos de terça.',
    },
    {
      question: 'Qual símbolo geralmente indica que uma nota deve subir meio tom?',
      options: ['Sustenido (#)', 'Bemol (♭)', 'Bequadro', 'Fermata'],
      correctIndex: 0,
      hint: 'O bemol (♭) faz o efeito contrário: abaixa a nota.',
    },
    {
      question: 'O que é uma pausa, na notação musical?',
      options: [
        'Um símbolo que indica silêncio por um tempo determinado',
        'Uma nota muito aguda',
        'Um tipo de acorde',
        'O final obrigatório de toda música',
      ],
      correctIndex: 0,
      hint: 'É o oposto de tocar uma nota — representa a ausência de som.',
    },
    {
      question: 'Em um compasso 4/4, quantos tempos (batidas) há em cada compasso?',
      options: ['2', '3', '4', '6'],
      correctIndex: 2,
      hint: "O número de cima do 'x/4' indica quantos tempos há no compasso.",
    },
    {
      question: 'O que é uma escala musical?',
      options: [
        'Uma sequência ordenada de notas dentro de uma oitava',
        'Um tipo específico de pedal de efeito',
        'Um acorde com 7 notas simultâneas',
        'O nome de uma afinação alternativa',
      ],
      correctIndex: 0,
      hint: 'Pense em "Dó Ré Mi Fá Sol Lá Si Dó" tocado em sequência, uma nota por vez.',
    },
    {
      question: 'Qual destas opções é uma nota, e não um acorde?',
      options: ['Ré', 'Dó maior', 'Sol7', 'Lám7'],
      correctIndex: 0,
      hint: 'Um acorde sempre tem mais de uma nota tocada ao mesmo tempo.',
    },
  ],
  Intermediário: [
    {
      question: 'Qual é o intervalo entre Dó e Sol?',
      options: ['Quinta justa', 'Quarta justa', 'Terça maior', 'Sexta maior'],
      correctIndex: 0,
      hint: 'Conte os nomes das notas a partir de Dó: Dó(1) Ré(2) Mi(3) Fá(4) Sol(5).',
    },
    {
      question: 'Quantos semitons tem uma terça maior?',
      options: ['3', '4', '5', '2'],
      correctIndex: 1,
      hint: 'Duas terças maiores empilhadas quase completam uma oitava (12 semitons).',
    },
    {
      question: 'Qual é a fórmula de um acorde menor (tríade)?',
      options: [
        'Tônica, terça menor, quinta justa',
        'Tônica, terça maior, quinta justa',
        'Tônica, terça maior, quinta aumentada',
        'Tônica, terça menor, quinta diminuta',
      ],
      correctIndex: 0,
      hint: 'A diferença entre maior e menor está no tamanho da terça, não da quinta.',
    },
    {
      question: 'No campo harmônico de Dó maior, qual é o acorde do II grau?',
      options: ['Ré menor (Dm)', 'Mi menor (Em)', 'Fá maior (F)', 'Sol maior (G)'],
      correctIndex: 0,
      hint: 'Conte a partir de Dó usando só notas naturais: I=Dó, II=?',
    },
    {
      question: 'Qual armadura de clave tem a escala de Sol maior?',
      options: ['1 sustenido (Fá#)', '2 sustenidos', '1 bemol', 'Nenhum acidente'],
      correctIndex: 0,
      hint: 'Sol maior é uma das escalas com armadura mais simples, tirando Dó maior.',
    },
    {
      question: 'O que caracteriza um acorde de sétima da dominante (ex: G7)?',
      options: [
        'Tríade maior + sétima menor',
        'Tríade menor + sétima maior',
        'Tríade maior + sétima maior',
        'Tríade diminuta + sétima diminuta',
      ],
      correctIndex: 0,
      hint: 'Dominantes têm uma tensão característica que pede resolução — a sétima é menor.',
    },
    {
      question: 'Qual é o relativo menor de Dó maior?',
      options: ['Lá menor', 'Mi menor', 'Ré menor', 'Sol menor'],
      correctIndex: 0,
      hint: 'Comece a contar a escala de Dó maior a partir do 6º grau.',
    },
    {
      question: 'Quantos semitons existem em uma oitava?',
      options: ['12', '10', '8', '7'],
      correctIndex: 0,
      hint: 'Conte todas as teclas do piano, brancas e pretas, de um Dó ao próximo Dó.',
    },
    {
      question: 'O que é o modo Mixolídio, em relação à escala maior?',
      options: [
        'Escala maior com a sétima abaixada um semitom',
        'Escala maior com a terça abaixada',
        'Escala menor natural',
        'Escala maior com a quarta aumentada',
      ],
      correctIndex: 0,
      hint: 'É quase uma escala maior comum, mas com um grau específico abaixado.',
    },
    {
      question: 'Qual é o intervalo entre Mi e o Dó imediatamente abaixo dele?',
      options: ['Terça maior', 'Terça menor', 'Quarta justa', 'Segunda maior'],
      correctIndex: 0,
      hint: 'Inverta a pergunta: qual é o intervalo entre Dó e Mi, subindo?',
    },
    {
      question: 'Em uma progressão II-V-I em Dó maior, quais são os acordes?',
      options: [
        'Dm7 - G7 - Cmaj7',
        'Em7 - A7 - Dmaj7',
        'Dm7 - G7 - Fmaj7',
        'Am7 - D7 - Gmaj7',
      ],
      correctIndex: 0,
      hint: 'O V grau de Dó maior é Sol, e ele aparece com sétima por ser a função dominante.',
    },
    {
      question: 'O que é uma nota de passagem?',
      options: [
        'Uma nota que conecta melodicamente dois acordes ou notas principais',
        'Uma nota tocada obrigatoriamente com slide',
        'A primeira nota de uma escala',
        'Um sinônimo de tônica',
      ],
      correctIndex: 0,
      hint: 'Geralmente é uma nota curta, fora do acorde, que liga duas notas principais por grau.',
    },
  ],
  Avançado: [
    {
      question: 'Qual é a fórmula de um acorde m7(b5) (semidiminuto)?',
      options: [
        'Terça menor, quinta diminuta, sétima menor',
        'Terça menor, quinta justa, sétima menor',
        'Terça maior, quinta diminuta, sétima menor',
        'Terça menor, quinta diminuta, sétima maior',
      ],
      correctIndex: 0,
      hint: 'O "b5" já entrega que a quinta é diminuta — falta decidir a terça e a sétima.',
    },
    {
      question: 'Quantos modos gregos existem, derivados da escala maior?',
      options: ['7', '5', '6', '8'],
      correctIndex: 0,
      hint: 'São tantos quantos são os graus de uma escala maior.',
    },
    {
      question: 'Qual modo grego tem a mesma sequência de notas de Lá menor natural, partindo de Lá?',
      options: ['Eólio', 'Dórico', 'Frígio', 'Lócrio'],
      correctIndex: 0,
      hint: 'É o modo mais "natural" de todos, sem nenhuma alteração em relação à relativa maior.',
    },
    {
      question: 'O que é enarmonia?',
      options: [
        'Duas notas com o mesmo som mas grafias diferentes, como Ré# e Mib',
        'Um acorde com quatro terças sobrepostas',
        'A relação entre tônica e dominante',
        'Um tipo de escala simétrica',
      ],
      correctIndex: 0,
      hint: 'Pense na mesma tecla do piano com dois nomes diferentes possíveis.',
    },
    {
      question: 'Qual é o nome do intervalo de seis semitons, formado por exemplo entre Dó e Fá#?',
      options: [
        'Quarta aumentada / quinta diminuta (trítono)',
        'Terça maior',
        'Sexta menor',
        'Sétima maior',
      ],
      correctIndex: 0,
      hint: 'É exatamente a metade de uma oitava — por isso soa tão instável.',
    },
    {
      question: 'O que diferencia a escala menor harmônica da escala menor natural?',
      options: [
        'A sétima é elevada um semitom, tornando-se maior',
        'A sexta é elevada um semitom',
        'A segunda é abaixada um semitom',
        'A terça é elevada, tornando-se maior',
      ],
      correctIndex: 0,
      hint: 'A mudança cria uma sonoridade mais tensa, típica de música árabe ou flamenca.',
    },
    {
      question: 'Qual é a função mais comum de um acorde de sétima diminuta (dim7) numa progressão?',
      options: [
        'Funcionar como acorde de passagem ou dominante substituto, criando tensão simétrica',
        'Sempre substituir a tônica',
        'Ser usado apenas em cadências finais',
        'Não ter função harmônica, é apenas ornamental',
      ],
      correctIndex: 0,
      hint: 'Pense nele como uma ponte entre dois acordes, não como um destino final.',
    },
    {
      question: 'O que é a escala simétrica diminuta (octatônica)?',
      options: [
        'Uma escala de 8 notas alternando tom e semitom',
        'Uma escala pentatônica invertida',
        'A escala maior sem a quarta e a sétima',
        'Uma escala de 5 notas usada só em jazz',
      ],
      correctIndex: 0,
      hint: 'O nome "octa" já entrega quantas notas ela tem.',
    },
    {
      question: "Em Dó maior, o que representa 'V7 do V' (V7/V)?",
      options: [
        'D7, o dominante que resolve para Sol (o V grau de Dó)',
        'G7, dominante da tônica',
        'C7, dominante de Fá',
        'A7, dominante de Ré',
      ],
      correctIndex: 0,
      hint: 'Primeiro encontre o V grau de Dó, depois encontre o V grau desse V grau.',
    },
    {
      question: 'Qual é a diferença entre um acorde add9 e um acorde 9?',
      options: [
        'O add9 não inclui a sétima; o 9 inclui a sétima (geralmente menor)',
        'Não há diferença, são sinônimos',
        'O add9 é sempre menor; o 9 é sempre maior',
        'O 9 tem só três notas; o add9 tem cinco',
      ],
      correctIndex: 0,
      hint: 'A presença ou ausência da sétima é o que separa esses dois nomes parecidos.',
    },
    {
      question: 'O que caracteriza harmonicamente o acorde de Napolitana (bII)?',
      options: [
        'Um acorde maior construído sobre o segundo grau abaixado, comum em certas cadências',
        'Um acorde diminuto usado só em música atonal',
        'Um sinônimo para o acorde de subdominante',
        'Um acorde usado exclusivamente em escalas pentatônicas',
      ],
      correctIndex: 0,
      hint: 'Pense no segundo grau da escala, só que abaixado um semitom.',
    },
    {
      question: 'Quantos semitons tem uma sétima maior (por exemplo, de Dó a Si)?',
      options: ['11', '10', '12', '9'],
      correctIndex: 0,
      hint: 'É um semitom menor do que uma oitava completa (12 semitons).',
    },
  ],
};
