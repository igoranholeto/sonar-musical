// Dados e regras da ferramenta de upgrade de guitarra (/upgrade-de-guitarra/).
// Cada guitarra traz o que vem de fábrica, conferido no site do fabricante em 26/11/2026 (o campo
// `dado` diz de onde veio quando o fabricante não publica a ficha). As peças apontam para o
// catálogo (src/data/produtos/<id>.json), de onde saem preço, foto e link do Mercado Livre.
// `avaliar()` roda no build (tabelas estáticas) e no navegador (guitarra montada pelo leitor), então
// este arquivo não pode importar nada do Node.

export type Formato = 'strato' | 'tele' | 'superstrato' | 'lespaul' | 'sg';
// Posição dos captadores da ponte para o braço: S = single coil de Strato, H = humbucker,
// T = Telecaster (ponte e braço de Tele).
export type Captacao = 'SSS' | 'HSS' | 'HH' | 'HSH' | 'TT';
export type Ponte = 'tremolo' | 'fixa' | 'tele' | 'tom';
export type Tarraxas = '6L' | '3+3';
export type TipoTarraxa = 'blindada' | 'vintage' | null;
export type Chave = 'lamina5' | 'lamina3' | 'toggle3' | null;
export type OrigemDado = 'fabricante' | 'loja' | 'anuncio';

export interface Guitarra {
  id: string;
  marca: string;
  modelo: string;
  produto?: string; // id no catálogo, quando a guitarra é vendida no site
  formato: Formato;
  captacao: Captacao;
  captadores: string; // como o fabricante descreve
  ceramico: boolean | null; // captadores de ímã cerâmico (null = não informado)
  ponte: Ponte;
  ponteTexto: string;
  tarraxas: Tarraxas;
  tarraxaTipo: TipoTarraxa;
  tarraxasTexto: string;
  nut: string; // material
  nutMm: number | null;
  nutBom?: boolean; // osso ou Graph Tech de fábrica
  controles: string;
  chave: Chave;
  escala: string;
  trastes: number | null;
  lipstick?: boolean; // captador do braço tipo lipstick (Tele da Tagima)
  efeitos?: boolean; // circuito de efeitos embutido (Sixmart)
  dado: OrigemDado;
  fonte: string; // nome da fonte, para o leitor
  confirmar?: string; // o que o fabricante não informa e vale conferir na guitarra
}

export const ORIGEM_DADO: Record<OrigemDado, string> = {
  fabricante: 'site do fabricante',
  loja: 'ficha de lojas (o fabricante não publica)',
  anuncio: 'anúncio do vendedor (o fabricante não publica)',
};

export const NOME_FORMATO: Record<Formato, string> = {
  strato: 'Stratocaster',
  tele: 'Telecaster',
  superstrato: 'superstrato',
  lespaul: 'Les Paul',
  sg: 'SG',
};

export const NOME_CAPTACAO: Record<Captacao, string> = {
  SSS: '3 single coils (SSS)',
  HSS: 'humbucker na ponte + 2 singles (HSS)',
  HH: '2 humbuckers (HH)',
  HSH: 'humbucker, single e humbucker (HSH)',
  TT: '2 singles de Telecaster',
};

export const NOME_PONTE: Record<Ponte, string> = {
  tremolo: 'tremolo (com alavanca)',
  fixa: 'fixa',
  tele: 'fixa de Telecaster',
  tom: 'tune-o-matic com stop bar',
};

const TAGIMA = 'loja oficial da Tagima';
const FENDER = 'site da Fender';
const IBANEZ = 'site da Ibanez';

export const GUITARRAS: Guitarra[] = [
  // Tagima: tagimastore.com, "Informações Técnicas" de cada modelo.
  { id: 'tagima-tg-500', marca: 'Tagima', modelo: 'TG-500', formato: 'strato', captacao: 'SSS', captadores: '3 single coils cerâmicos by Tagima', ceramico: true, ponte: 'tremolo', ponteTexto: 'Tremolo', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'Diecast', nut: 'plástico', nutMm: 43, controles: 'chave de 5 posições, 1 volume e 2 tonalidades', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'fabricante', fonte: TAGIMA },
  { id: 'tagima-tg-510', marca: 'Tagima', modelo: 'TG-510', produto: 'tagima-tg-510', formato: 'strato', captacao: 'HSS', captadores: 'humbucker cerâmico e 2 single coils cerâmicos by Tagima', ceramico: true, ponte: 'tremolo', ponteTexto: 'Tremolo', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'Diecast', nut: 'plástico', nutMm: 43, controles: 'chave de 5 posições, volume e tonalidade', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'fabricante', fonte: TAGIMA },
  { id: 'tagima-tg-530', marca: 'Tagima', modelo: 'TG-530 (Woodstock)', produto: 'tagima-tg-530', formato: 'strato', captacao: 'SSS', captadores: '3 single coils cerâmicos by Tagima', ceramico: true, ponte: 'tremolo', ponteTexto: 'Tremolo', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'Diecast', nut: 'plástico', nutMm: 43, controles: 'chave de 5 posições, 1 volume e 2 tonalidades', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'fabricante', fonte: TAGIMA },
  { id: 'tagima-tg-540', marca: 'Tagima', modelo: 'TG-540', formato: 'strato', captacao: 'HSS', captadores: 'humbucker cerâmico e 2 single coils cerâmicos by Tagima', ceramico: true, ponte: 'tremolo', ponteTexto: 'Tremolo', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'Diecast', nut: 'plástico', nutMm: 43, controles: 'chave de 5 posições, 1 volume e 2 tonalidades', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'fabricante', fonte: TAGIMA },
  { id: 'tagima-sixmart', marca: 'Tagima', modelo: 'Sixmart', produto: 'tagima-sixmart', formato: 'strato', captacao: 'HSS', captadores: 'humbucker cerâmico e 2 single coils cerâmicos by Tagima', ceramico: true, ponte: 'tremolo', ponteTexto: 'Tremolo', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'Diecast', nut: 'não informado', nutMm: 43, controles: 'chave de 5 posições, volume, tonalidade, delay, reverb, overdrive, distortion e saída de fone', chave: 'lamina5', escala: '25,5"', trastes: 22, efeitos: true, dado: 'fabricante', fonte: TAGIMA },
  { id: 'tagima-tw-55', marca: 'Tagima', modelo: 'TW-55 (Telecaster)', produto: 'tagima-tw-55-telecaster', formato: 'tele', captacao: 'TT', captadores: 'single coil e lipstick cerâmicos by Tagima', ceramico: true, ponte: 'tele', ponteTexto: 'Fixa tradicional TL', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'Diecast', nut: 'plástico', nutMm: 43, controles: 'chave de 3 posições, volume e tonalidade', chave: 'lamina3', escala: '25,5"', trastes: 22, lipstick: true, dado: 'fabricante', fonte: TAGIMA },
  { id: 'tagima-t-550', marca: 'Tagima', modelo: 'T-550 (Telecaster)', produto: 'tagima-t-550', formato: 'tele', captacao: 'TT', captadores: 'single coil alnico e lipstick alnico by Tagima', ceramico: false, ponte: 'tele', ponteTexto: 'Fixa tradicional TL', tarraxas: '6L', tarraxaTipo: 'vintage', tarraxasTexto: 'Vintage', nut: 'osso', nutMm: 43, nutBom: true, controles: 'chave de 3 posições, volume e tonalidade', chave: 'lamina3', escala: '25,5"', trastes: 22, lipstick: true, dado: 'fabricante', fonte: TAGIMA },
  { id: 'memphis-mg-30', marca: 'Memphis (Tagima)', modelo: 'MG-30', produto: 'tagima-memphis-mg30-kit', formato: 'strato', captacao: 'SSS', captadores: '3 single coils cerâmicos by Memphis', ceramico: true, ponte: 'tremolo', ponteTexto: 'Tremolo', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'Diecast', nut: 'plástico', nutMm: 42, controles: 'chave de 5 posições, 1 volume e 2 tonalidades', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'fabricante', fonte: TAGIMA },

  // Squier e Fender: fender.com (loja internacional), aba Specs.
  { id: 'squier-debut-strat', marca: 'Squier', modelo: 'Debut Stratocaster', produto: 'squier-debut-stratocaster', formato: 'strato', captacao: 'SSS', captadores: '3 single coils cerâmicos', ceramico: true, ponte: 'tremolo', ponteTexto: 'tremolo com alavanca', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas die-cast', nut: 'sintético', nutMm: 42, controles: 'chave de 5 posições, 1 volume e 2 tonalidades', chave: 'lamina5', escala: '25,5"', trastes: 21, dado: 'anuncio', fonte: 'anúncios da linha Debut', confirmar: 'tipo de tremolo (2 pinos ou 6 parafusos) e largura do nut' },
  { id: 'squier-debut-tele', marca: 'Squier', modelo: 'Debut Telecaster', produto: 'squier-debut-telecaster', formato: 'tele', captacao: 'TT', captadores: '2 single coils cerâmicos', ceramico: true, ponte: 'tele', ponteTexto: 'fixa de Telecaster', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas die-cast', nut: 'sintético', nutMm: 42, controles: 'chave de 3 posições, volume e tonalidade', chave: 'lamina3', escala: '25,5"', trastes: 21, dado: 'anuncio', fonte: 'anúncios da linha Debut', confirmar: 'tipo de ponte e largura do nut' },
  { id: 'squier-bullet-strat-ht', marca: 'Squier', modelo: 'Bullet Stratocaster HT', produto: 'squier-bullet-stratocaster-ht', formato: 'strato', captacao: 'SSS', captadores: '3 single coils Standard Strat (cerâmicos)', ceramico: true, ponte: 'fixa', ponteTexto: 'fixa (hardtail) de 6 carrinhos, cordas pelo corpo', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'die-cast', nut: 'sintético', nutMm: 42, controles: 'chave de 5 posições, 1 volume e 2 tonalidades', chave: 'lamina5', escala: '25,5"', trastes: 21, dado: 'loja', fonte: 'fichas de lojas (a Fender trocou a Bullet pela Sonic)', confirmar: 'largura do nut' },
  { id: 'squier-sonic-strat', marca: 'Squier', modelo: 'Sonic Stratocaster', produto: 'squier-sonic-stratocaster', formato: 'strato', captacao: 'SSS', captadores: '3 Ceramic Single-Coil', ceramico: true, ponte: 'tremolo', ponteTexto: '6-Saddle Vintage-Style Synchronized Tremolo (6 parafusos)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas', nut: 'osso sintético', nutMm: 42, controles: 'chave de 5 posições, Master Volume, Tone 1 e Tone 2', chave: 'lamina5', escala: '25,5"', trastes: 21, dado: 'fabricante', fonte: FENDER },
  { id: 'squier-sonic-strat-hss', marca: 'Squier', modelo: 'Sonic Stratocaster HSS', formato: 'strato', captacao: 'HSS', captadores: 'Ceramic Humbucker e 2 Ceramic Single-Coil', ceramico: true, ponte: 'tremolo', ponteTexto: '6-Saddle Vintage-Style Synchronized Tremolo (6 parafusos)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas', nut: 'osso sintético', nutMm: 42, controles: 'chave de 5 posições, Master Volume, Tone 1 e Tone 2', chave: 'lamina5', escala: '25,5"', trastes: 21, dado: 'fabricante', fonte: FENDER },
  { id: 'squier-sonic-strat-ht', marca: 'Squier', modelo: 'Sonic Stratocaster HT', formato: 'strato', captacao: 'SSS', captadores: '3 Ceramic Single-Coil', ceramico: true, ponte: 'fixa', ponteTexto: '6-Saddle Top-Load Hardtail', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas', nut: 'osso sintético', nutMm: 42, controles: 'chave de 5 posições, Master Volume, Tone 1 e Tone 2', chave: 'lamina5', escala: '25,5"', trastes: 21, dado: 'fabricante', fonte: FENDER },
  { id: 'squier-affinity-strat', marca: 'Squier', modelo: 'Affinity Stratocaster', produto: 'squier-affinity-stratocaster', formato: 'strato', captacao: 'SSS', captadores: '3 Ceramic Single-Coil', ceramico: true, ponte: 'tremolo', ponteTexto: '2-Point Synchronized Tremolo with Block Saddles (2 pinos)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas die-cast', nut: 'osso sintético', nutMm: 42, controles: 'chave de 5 posições, Master Volume, Tone 1 e Tone 2', chave: 'lamina5', escala: '25,5"', trastes: 21, dado: 'fabricante', fonte: FENDER },
  { id: 'squier-affinity-tele', marca: 'Squier', modelo: 'Affinity Telecaster', produto: 'squier-affinity-telecaster', formato: 'tele', captacao: 'TT', captadores: '2 Ceramic Single-Coil', ceramico: true, ponte: 'tele', ponteTexto: '6-Saddle Strings-Through-Body Tele', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas die-cast', nut: 'osso sintético', nutMm: 42, controles: 'chave de 3 posições, Master Volume e Master Tone', chave: 'lamina3', escala: '25,5"', trastes: 21, dado: 'fabricante', fonte: FENDER },
  { id: 'squier-cv-60s-strat', marca: 'Squier', modelo: "Classic Vibe '60s Stratocaster", produto: 'squier-classic-vibe-60s-stratocaster', formato: 'strato', captacao: 'SSS', captadores: '3 Fender-Designed Alnico Single-Coil', ceramico: false, ponte: 'tremolo', ponteTexto: '6-Saddle Vintage-Style Synchronized Tremolo (6 parafusos)', tarraxas: '6L', tarraxaTipo: 'vintage', tarraxasTexto: 'vintage', nut: 'osso', nutMm: 42, nutBom: true, controles: 'chave de 5 posições, Master Volume, Tone 1 e Tone 2', chave: 'lamina5', escala: '25,5"', trastes: 21, dado: 'fabricante', fonte: FENDER },
  { id: 'fender-standard-strat', marca: 'Fender', modelo: 'Standard Stratocaster', produto: 'fender-standard-stratocaster', formato: 'strato', captacao: 'SSS', captadores: '3 Standard Single-Coil Strat', ceramico: null, ponte: 'tremolo', ponteTexto: 'Standard 2-Point Tremolo with Block Saddles (2 pinos)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas', nut: 'Micarta', nutMm: 42.86, controles: 'chave de 5 posições, Master Volume, Tone 1 e Tone 2', chave: 'lamina5', escala: '25,5"', trastes: 21, dado: 'fabricante', fonte: FENDER },
  { id: 'fender-player-ii-strat', marca: 'Fender', modelo: 'Player II Stratocaster', produto: 'fender-player-ii-stratocaster', formato: 'strato', captacao: 'SSS', captadores: '3 Player Series Alnico 5 Strat Single-Coil', ceramico: false, ponte: 'tremolo', ponteTexto: '2-Point Synchronized Tremolo with Bent Steel Saddles (2 pinos)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas', nut: 'osso sintético', nutMm: 42, controles: 'chave de 5 posições, Master Volume, Tone 1 e Tone 2', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'fabricante', fonte: FENDER },

  // Ibanez: ibanez.com (Europa), specs de cada GIO.
  { id: 'ibanez-grg121dx', marca: 'Ibanez', modelo: 'GIO GRG121DX', produto: 'ibanez-gio-grg121dx', formato: 'superstrato', captacao: 'HH', captadores: '2 IBZ-6 (H) passivos cerâmicos', ceramico: true, ponte: 'fixa', ponteTexto: 'F106 (fixa)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas', nut: 'plástico', nutMm: 43, controles: 'chave de 5 posições, volume e tonalidade', chave: 'lamina5', escala: '25,5"', trastes: 24, dado: 'fabricante', fonte: IBANEZ },
  { id: 'ibanez-grg131dx', marca: 'Ibanez', modelo: 'GIO GRG131DX', produto: 'ibanez-grg131dx', formato: 'superstrato', captacao: 'HH', captadores: '2 Infinity R (H) passivos cerâmicos', ceramico: true, ponte: 'fixa', ponteTexto: 'F106 (fixa)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas', nut: 'plástico', nutMm: 43, controles: 'chave de 5 posições, volume e tonalidade', chave: 'lamina5', escala: '25,5"', trastes: 24, dado: 'fabricante', fonte: IBANEZ },
  { id: 'ibanez-grg170dx', marca: 'Ibanez', modelo: 'GIO GRG170DX', produto: 'ibanez-grg170dx', formato: 'superstrato', captacao: 'HSH', captadores: 'Infinity R (H), Infinity RS (S) e Infinity R (H), passivos cerâmicos', ceramico: true, ponte: 'tremolo', ponteTexto: 'T102 (tremolo)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas', nut: 'plástico', nutMm: 43, controles: 'chave de 5 posições, volume e tonalidade', chave: 'lamina5', escala: '25,5"', trastes: 24, dado: 'fabricante', fonte: IBANEZ },
  { id: 'ibanez-grgr131ex', marca: 'Ibanez', modelo: 'GIO GRGR131EX', produto: 'ibanez-grgr131ex', formato: 'superstrato', captacao: 'HH', captadores: '2 Infinity R (H) passivos cerâmicos', ceramico: true, ponte: 'fixa', ponteTexto: 'F106 (fixa)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas', nut: 'plástico', nutMm: 43, controles: 'volume, tonalidade e chave seletora', chave: null, escala: '25,5"', trastes: 24, dado: 'fabricante', fonte: IBANEZ },

  { id: 'jackson-js22-dinky', marca: 'Jackson', modelo: 'JS22 Dinky', produto: 'jackson-js22-dinky', formato: 'superstrato', captacao: 'HH', captadores: '2 Jackson High-Output Humbucking', ceramico: null, ponte: 'tremolo', ponteTexto: '2-Point Fulcrum Tremolo (2 pinos)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'Jackson Sealed Die-Cast', nut: 'plástico', nutMm: 42.86, controles: 'chave de lâmina de 3 posições, volume e tonalidade', chave: 'lamina3', escala: '25,5"', trastes: 24, dado: 'fabricante', fonte: 'site da Jackson' },
  { id: 'cort-x100', marca: 'Cort', modelo: 'X100', produto: 'cort-x100', formato: 'superstrato', captacao: 'HH', captadores: 'set Cort Powersound (2 humbuckers de alto ganho)', ceramico: null, ponte: 'tremolo', ponteTexto: 'tremolo de 6 parafusos', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'Die-Cast', nut: 'não informado', nutMm: null, controles: 'chave de 3 posições, 1 volume e 1 tonalidade', chave: null, escala: '25,5"', trastes: 24, dado: 'fabricante', fonte: 'site da Cort' },
  { id: 'yamaha-pacifica-012', marca: 'Yamaha', modelo: 'Pacifica 012', produto: 'yamaha-pacifica-012', formato: 'strato', captacao: 'HSS', captadores: 'humbucker cerâmico e 2 single coils cerâmicos', ceramico: true, ponte: 'tremolo', ponteTexto: 'Vintage Style Tremolo (6 parafusos)', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'Covered (blindadas)', nut: 'resina (urea)', nutMm: 41, controles: 'chave de 5 posições, Master Volume e Master Tone', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'fabricante', fonte: 'site da Yamaha Brasil' },

  // Epiphone: loja oficial (gibson.com), coleção Inspired by Gibson.
  { id: 'epiphone-les-paul-standard-50s', marca: 'Epiphone', modelo: 'Les Paul Standard 50s', produto: 'epiphone-les-paul-standard-50s', formato: 'lespaul', captacao: 'HH', captadores: 'ProBucker 1 (braço) e ProBucker 2 (ponte), alnico', ceramico: false, ponte: 'tom', ponteTexto: 'LockTone Tune-O-Matic e LockTone Stop Bar', tarraxas: '3+3', tarraxaTipo: null, tarraxasTexto: 'Epiphone Vintage Deluxe', nut: 'Graph Tech', nutMm: 43, nutBom: true, controles: 'chave de 3 posições, 2 volumes e 2 tonalidades', chave: 'toggle3', escala: '24,75"', trastes: 22, dado: 'fabricante', fonte: 'loja oficial da Epiphone' },
  { id: 'epiphone-sg-standard', marca: 'Epiphone', modelo: 'SG Standard', produto: 'epiphone-sg-standard', formato: 'sg', captacao: 'HH', captadores: 'ProBucker 2 (braço) e ProBucker 3 (ponte), alnico', ceramico: false, ponte: 'tom', ponteTexto: 'LockTone Tune-O-Matic e Stop Bar', tarraxas: '3+3', tarraxaTipo: 'blindada', tarraxasTexto: 'Grover Rotomatic', nut: 'Graph Tech', nutMm: 43, nutBom: true, controles: 'chave de 3 posições, 2 volumes e 2 tonalidades', chave: 'toggle3', escala: '24,75"', trastes: 22, dado: 'fabricante', fonte: 'loja oficial da Epiphone' },

  // Nacionais e outras de entrada.
  { id: 'giannini-g-100', marca: 'Giannini', modelo: 'G-100', produto: 'giannini-g-100-standard', formato: 'strato', captacao: 'SSS', captadores: '3 single coils cerâmicos', ceramico: true, ponte: 'tremolo', ponteTexto: 'Tremolo standard', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas cromadas', nut: 'ABS', nutMm: 42, controles: 'chave de 5 posições, volume e 2 tonalidades', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'fabricante', fonte: 'site da Giannini' },
  { id: 'giannini-g-101', marca: 'Giannini', modelo: 'G-101', produto: 'giannini-g-101', formato: 'strato', captacao: 'HSS', captadores: 'humbucker cerâmico e 2 single coils cerâmicos', ceramico: true, ponte: 'tremolo', ponteTexto: 'Tremolo standard', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas cromadas', nut: 'ABS', nutMm: 42, controles: 'chave de 5 posições, volume e 2 tonalidades', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'fabricante', fonte: 'site da Giannini' },
  { id: 'strinberg-sts100', marca: 'Strinberg', modelo: 'STS100', produto: 'strinberg-sts100', formato: 'strato', captacao: 'SSS', captadores: '3 single coils passivos', ceramico: null, ponte: 'tremolo', ponteTexto: 'tremolo vintage de 6 parafusos', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas cromadas', nut: 'não informado', nutMm: 42.5, controles: 'chave de 5 posições, 1 volume e 2 tonalidades', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'anuncio', fonte: 'anúncio de revenda', confirmar: 'material do nut e ímã dos captadores' },
  { id: 'strinberg-lps230', marca: 'Strinberg', modelo: 'LPS230 (Les Paul)', produto: 'strinberg-lps230', formato: 'lespaul', captacao: 'HH', captadores: '2 humbuckers', ceramico: null, ponte: 'tom', ponteTexto: 'tune-o-matic com stop bar', tarraxas: '3+3', tarraxaTipo: null, tarraxasTexto: 'não informado', nut: 'não informado', nutMm: null, controles: 'chave de 3 posições, 2 volumes e 2 tonalidades', chave: 'toggle3', escala: '24,75"', trastes: 22, dado: 'anuncio', fonte: 'anúncios da Strinberg', confirmar: 'tipo de tarraxa, material do nut e ímã dos captadores' },
  { id: 'seizi-katana-musashi', marca: 'Seizi', modelo: 'Katana Musashi HSS', produto: 'seizi-katana-musashi', formato: 'superstrato', captacao: 'HSS', captadores: 'Seizi Chidori humbucker cerâmico na ponte e 2 single coils', ceramico: true, ponte: 'tremolo', ponteTexto: 'tremolo de 6 parafusos', tarraxas: '6L', tarraxaTipo: 'blindada', tarraxasTexto: 'blindadas', nut: 'não informado', nutMm: null, controles: 'chave de 5 posições, volume e tonalidade', chave: 'lamina5', escala: '25,5"', trastes: 22, dado: 'loja', fonte: 'ficha de lojas', confirmar: 'material e largura do nut' },
  { id: 'sx-sst57-plus', marca: 'SX', modelo: 'SST57+', produto: 'sx-sst57-plus', formato: 'strato', captacao: 'SSS', captadores: '3 single coils cerâmicos', ceramico: true, ponte: 'tremolo', ponteTexto: 'tremolo vintage', tarraxas: '6L', tarraxaTipo: 'vintage', tarraxasTexto: 'vintage SZMHG101', nut: 'sintético', nutMm: 42, controles: 'chave de 5 posições, 1 volume e 2 tonalidades', chave: 'lamina5', escala: '25,5"', trastes: 21, dado: 'loja', fonte: 'fichas de lojas europeias da SX' },
];

// ------------------------------------------------------------------ peças
export type TipoPeca =
  | 'set-strat' // 3 singles de Strato
  | 'single' // 1 single de Strato
  | 'rail' // humbucker no tamanho de single (ponte)
  | 'humbucker' // 1 humbucker
  | 'set-hh' // par de humbuckers
  | 'set-tele'
  | 'tarraxa-6l'
  | 'tarraxa-3x3'
  | 'nut-fender'
  | 'nut-43-reto'
  | 'nut-gibson'
  | 'pot-250'
  | 'pot-500-curto'
  | 'pot-500-longo'
  | 'chave-5'
  | 'toggle-3'
  | 'strap';

export type Area = 'captadores' | 'tarraxas' | 'nut' | 'eletrica' | 'acessorio';

export interface Peca {
  id: string; // id no catálogo
  tipo: TipoPeca;
  curto: string; // nome curto para os cards
  som?: 'vintage' | 'quente' | 'pesado' | 'versatil'; // para captadores
  ativo?: boolean; // captador ativo (bateria)
  generica?: boolean; // sem marca
}

export const AREA_DA_PECA: Record<TipoPeca, Area> = {
  'set-strat': 'captadores',
  single: 'captadores',
  rail: 'captadores',
  humbucker: 'captadores',
  'set-hh': 'captadores',
  'set-tele': 'captadores',
  'tarraxa-6l': 'tarraxas',
  'tarraxa-3x3': 'tarraxas',
  'nut-fender': 'nut',
  'nut-43-reto': 'nut',
  'nut-gibson': 'nut',
  'pot-250': 'eletrica',
  'pot-500-curto': 'eletrica',
  'pot-500-longo': 'eletrica',
  'chave-5': 'eletrica',
  'toggle-3': 'eletrica',
  strap: 'acessorio',
};

export const PECAS: Peca[] = [
  { id: 'captadores-ronsani-strato-alnico', tipo: 'set-strat', curto: 'Ronsani Strato Alnico V (set)', som: 'vintage' },
  { id: 'captadores-fender-tex-mex-strat', tipo: 'set-strat', curto: 'Fender Tex-Mex Strat (set)', som: 'quente' },
  { id: 'captadores-malagoli-texas-soul', tipo: 'set-strat', curto: 'Malagoli Texas Soul (set)', som: 'quente' },
  { id: 'seymour-duncan-ssl-1', tipo: 'single', curto: 'Seymour Duncan SSL-1', som: 'vintage' },
  { id: 'seymour-duncan-hot-rails-strat', tipo: 'rail', curto: 'Seymour Duncan Hot Rails (ponte)', som: 'pesado' },
  { id: 'captadores-fender-tex-mex-tele', tipo: 'set-tele', curto: 'Fender Tex-Mex Telecaster (set)', som: 'quente' },
  { id: 'captadores-malagoli', tipo: 'set-hh', curto: 'Malagoli Custom 59 + 84 (par)', som: 'versatil' },
  { id: 'seymour-duncan-sh-4-jb', tipo: 'humbucker', curto: 'Seymour Duncan SH-4 JB (ponte)', som: 'pesado' },
  { id: 'dimarzio-super-distortion-dp100', tipo: 'humbucker', curto: 'DiMarzio Super Distortion (ponte)', som: 'pesado' },
  { id: 'seymour-duncan-hot-rodded-set-jb-jazz', tipo: 'set-hh', curto: 'Seymour Duncan JB + Jazz (par)', som: 'versatil' },
  { id: 'captadores-emg-81-85', tipo: 'set-hh', curto: 'EMG 81 + 85 (par, ativos)', som: 'pesado', ativo: true },
  { id: 'tarraxas-trava-6-em-linha', tipo: 'tarraxa-6l', curto: 'Tarraxas com trava 6 em linha (sem marca)', generica: true },
  { id: 'tarraxas-gotoh-sg381-trava-6l', tipo: 'tarraxa-6l', curto: 'Gotoh SG381 com trava (6 em linha)' },
  { id: 'tarraxas-gotoh-sg301-trava-3x3', tipo: 'tarraxa-3x3', curto: 'Gotoh SG301 com trava (3+3)' },
  { id: 'nut-graph-tech-tusq-pq-5000', tipo: 'nut-fender', curto: 'Graph Tech Tusq PQ-5000' },
  { id: 'nut-graph-tech-tusq-xl-pql-6643', tipo: 'nut-43-reto', curto: 'Graph Tech Tusq XL PQL-6643' },
  { id: 'nut-graph-tech-tusq-xl-pql-6010', tipo: 'nut-gibson', curto: 'Graph Tech Tusq XL PQL-6010' },
  { id: 'potenciometro-cts-a250k-curto', tipo: 'pot-250', curto: 'CTS A250K (eixo curto)' },
  { id: 'potenciometro-cts-a500k-curto', tipo: 'pot-500-curto', curto: 'CTS A500K (eixo curto)' },
  { id: 'potenciometro-cts-a500k-longo', tipo: 'pot-500-longo', curto: 'CTS A500K (eixo longo)' },
  { id: 'chave-oak-grigsby-5-posicoes', tipo: 'chave-5', curto: 'Oak Grigsby 5 posições' },
  { id: 'chave-switchcraft-3-posicoes', tipo: 'toggle-3', curto: 'Switchcraft 3 posições' },
  { id: 'dunlop-straplok', tipo: 'strap', curto: 'Dunlop Straplok (par)' },
];

// ------------------------------------------------------------------ regras
// direto: encaixa sem mexer na madeira nem no escudo (solda conta como instalação normal).
// parcial: só parte da peça tem lugar na guitarra. ajuste: precisa de serviço de luthier além da
// troca. dispensa: serve, mas a guitarra já vem com algo equivalente. nao: não serve.
// `null` = a peça não tem nada a ver com essa guitarra e nem entra na lista do que não serve.
export type Nivel = 'direto' | 'parcial' | 'ajuste' | 'dispensa' | 'nao';
export interface Veredito {
  nivel: Nivel;
  motivo: string;
}

export type GuitarraBase = Pick<
  Guitarra,
  'formato' | 'captacao' | 'ponte' | 'tarraxas' | 'tarraxaTipo' | 'nutBom' | 'chave' | 'lipstick' | 'efeitos' | 'nut'
>;

const singles = (g: GuitarraBase) => [...g.captacao].filter((c) => c === 'S').length;
const humbuckers = (g: GuitarraBase) => [...g.captacao].filter((c) => c === 'H').length;
const soSingle = (g: GuitarraBase) => humbuckers(g) === 0;

export function avaliar(p: Peca, g: GuitarraBase): Veredito | null {
  const s = singles(g);
  const h = humbuckers(g);
  const tele = g.captacao === 'TT';
  const efeitos = g.efeitos ? ' O circuito de efeitos da Sixmart passa pela mesma placa: deixe a troca com um luthier.' : '';
  switch (p.tipo) {
    case 'set-strat':
      if (tele) return { nivel: 'nao', motivo: 'Captador de Strato não tem o formato da Telecaster.' };
      if (s === 3) return { nivel: 'direto', motivo: 'Mesma medida dos três originais: troca o set inteiro sem mexer no escudo.' };
      if (s === 2) return { nivel: 'parcial', motivo: 'Sua ponte é humbucker: servem o do braço e o do meio, e o terceiro sobra.' };
      if (s === 1) return { nivel: 'nao', motivo: 'Só o captador do meio é single: dois do set sobrariam. Um single avulso resolve.' };
      return { nivel: 'nao', motivo: 'Sua guitarra não tem lugar para single coil: precisaria abrir a madeira.' };
    case 'single':
      if (tele) return { nivel: 'nao', motivo: 'Single de Strato não encaixa nas posições da Telecaster.' };
      if (s === 0) return { nivel: 'nao', motivo: 'Sua guitarra não tem lugar para single coil.' };
      return {
        nivel: 'direto',
        motivo: s === 3 ? 'Serve em qualquer posição; o mais comum é trocar o da ponte, que é o mais usado.' : s === 2 ? 'Serve no braço ou no meio.' : 'Serve na posição do meio.',
      };
    case 'rail':
      if (tele) return { nivel: 'nao', motivo: 'A ponte da Telecaster tem outro formato (existe Hot Rails para Tele, mas não é este).' };
      if (s === 3) return { nivel: 'direto', motivo: 'Entra no lugar do single da ponte, sem cortar nada, e dá peso de humbucker para distorção.' };
      if (h > 0) return { nivel: 'nao', motivo: 'Sua ponte já é humbucker: o Hot Rails de ponte não acrescenta nada aqui.' };
      return null;
    case 'humbucker':
      if (h > 0)
        return {
          nivel: 'direto',
          motivo: g.captacao === 'HSS' ? 'Mesma medida do humbucker da ponte que já vem nela.' : 'Serve na posição da ponte; o do braço continua o original.',
        };
      if (tele) return { nivel: 'nao', motivo: 'A Telecaster não tem lugar para humbucker sem abrir a madeira.' };
      return { nivel: 'nao', motivo: 'Só tem lugar para single coil. Humbucker exige abrir a madeira e trocar o escudo; o Hot Rails dá o peso sem corte.' };
    case 'set-hh': {
      const bateria = p.ativo ? ' É ativo: precisa de espaço para uma bateria de 9 V na cavidade e troca os potenciômetros (vêm na caixa).' : '';
      if (h >= 2) return { nivel: p.ativo ? 'ajuste' : 'direto', motivo: (p.ativo ? 'Os dois humbuckers têm lugar.' : 'Mesma medida dos dois humbuckers originais.') + bateria };
      if (h === 1) return { nivel: 'nao', motivo: 'Só a ponte é humbucker: um dos dois sobraria. Para a ponte, um humbucker avulso basta.' };
      if (tele) return { nivel: 'nao', motivo: 'A Telecaster não tem lugar para humbucker.' };
      return { nivel: 'nao', motivo: 'Sua guitarra não tem lugar para humbucker sem abrir a madeira.' };
    }
    case 'set-tele':
      if (!tele) return { nivel: 'nao', motivo: 'Feito para Telecaster.' };
      if (g.lipstick) return { nivel: 'parcial', motivo: 'O da ponte serve direto. O do braço não: a sua usa lipstick, que tem outro recorte no escudo.' };
      return { nivel: 'direto', motivo: 'Mesma medida da ponte e do braço da Telecaster.' };
    case 'tarraxa-6l':
      if (g.tarraxas !== '6L') return { nivel: 'nao', motivo: 'Sua guitarra tem 3 tarraxas de cada lado.' };
      if (g.tarraxaTipo === 'vintage')
        return { nivel: 'ajuste', motivo: 'As suas são do tipo vintage, de furo mais fino. O luthier alarga o furo para 10 mm.' };
      return {
        nivel: 'direto',
        motivo:
          'Mesmo furo de 10 mm das blindadas; às vezes falta um furinho para o parafuso de fixação.' +
          (g.ponte === 'tremolo' ? ' Com alavanca, a trava ajuda a afinação a voltar no lugar.' : ''),
      };
    case 'tarraxa-3x3':
      if (g.tarraxas !== '3+3') return { nivel: 'nao', motivo: 'Sua guitarra tem as 6 tarraxas do mesmo lado.' };
      if (g.tarraxaTipo === 'vintage') return { nivel: 'ajuste', motivo: 'As suas são do tipo vintage, de furo mais fino. O luthier alarga o furo para 10 mm.' };
      return {
        nivel: 'direto',
        motivo: g.tarraxaTipo === 'blindada' ? 'Mesmo furo de 10 mm das blindadas.' : 'Serve se o furo da sua for de 10 mm, o padrão das tarraxas blindadas: confira antes.',
      };
    case 'nut-fender':
      if (g.formato === 'lespaul' || g.formato === 'sg') return { nivel: 'nao', motivo: 'O nut da Les Paul e da SG tem outro formato: veja o PQL-6010.' };
      if (g.formato === 'superstrato') return null;
      if (g.nutBom) return { nivel: 'dispensa', motivo: 'A sua já vem com nut de osso: a troca não traz ganho.' };
      return { nivel: 'ajuste', motivo: 'Troca de nut é serviço de luthier: ele lixa a peça até a medida do seu braço e acerta a altura dos rasgos.' };
    case 'nut-43-reto':
      if (g.formato !== 'superstrato') return null;
      return { nivel: 'ajuste', motivo: 'Base reta de 43 mm, o formato das superstrato. O luthier ajusta a altura dos rasgos.' };
    case 'nut-gibson':
      if (g.formato !== 'lespaul' && g.formato !== 'sg') return null;
      if (g.nutBom) return { nivel: 'dispensa', motivo: 'A sua já vem com nut da Graph Tech.' };
      return { nivel: 'ajuste', motivo: 'Formato de Les Paul e SG, 43 mm. O luthier ajusta a altura dos rasgos.' };
    case 'pot-250':
      if (g.formato === 'lespaul' || g.formato === 'sg' || (h >= 2 && !tele))
        return { nivel: 'nao', motivo: 'Encaixa, mas 250k deixa humbucker abafado: o valor certo para os seus é 500k.' };
      return {
        nivel: 'ajuste',
        motivo:
          (g.captacao === 'HSS' ? '250k mantém o brilho dos singles (com o humbucker, 500k). ' : '250k é o valor certo para single coil. ') +
          'O eixo do CTS tem 24 dentes: os knobs de guitarras asiáticas podem não encaixar, e o furo do escudo pode precisar alargar.' +
          efeitos,
      };
    case 'pot-500-curto':
      if (g.formato === 'lespaul') return { nivel: 'nao', motivo: 'O tampo da Les Paul é grosso: use o de eixo longo.' };
      if (soSingle(g)) return { nivel: 'nao', motivo: 'Com single coil, 500k deixa o som estridente: o valor certo é 250k.' };
      return {
        nivel: 'ajuste',
        motivo: '500k é o valor dos humbuckers. O eixo do CTS tem 24 dentes: confira se os knobs servem e se o furo comporta a rosca do CTS.' + efeitos,
      };
    case 'pot-500-longo':
      if (g.formato !== 'lespaul') return null;
      return { nivel: 'direto', motivo: 'Eixo longo para o tampo grosso da Les Paul, 500k para humbucker.' };
    case 'chave-5':
      if (g.chave === 'lamina5') {
        if (h >= 2) return { nivel: 'ajuste', motivo: 'Com dois humbuckers, a ligação de 5 posições divide as bobinas: leve o esquema da sua ao luthier.' };
        if (g.efeitos) return { nivel: 'ajuste', motivo: 'Mesma furação da chave de Strato.' + efeitos };
        return { nivel: 'direto', motivo: 'Mesma furação da chave de Strato; é só soldar no lugar da original.' };
      }
      if (g.chave === 'toggle3' || g.chave === 'lamina3' || tele) return { nivel: 'nao', motivo: 'Sua guitarra usa chave de 3 posições.' };
      return null;
    case 'toggle-3':
      if (g.chave === 'toggle3') return { nivel: 'direto', motivo: 'Chave do tipo toggle, a mesma da sua. Confira se a cavidade comporta o corpo curto.' };
      if (g.chave === 'lamina5' || g.chave === 'lamina3' || tele) return { nivel: 'nao', motivo: 'Sua chave é de lâmina, não toggle.' };
      return null;
    case 'strap':
      return { nivel: 'direto', motivo: 'Troca os dois pinos de correia: a correia ganha trava e não solta.' };
  }
}

// Por onde começar: uma nota curta por área, na ordem em que a troca rende mais nessa guitarra.
export interface Prioridade {
  area: Area;
  peso: number; // maior = vale mais a pena
  texto: string;
}

export function prioridades(g: GuitarraBase & { ceramico?: boolean | null }): Prioridade[] {
  const out: Prioridade[] = [];
  const cer = g.ceramico;
  out.push({
    area: 'captadores',
    peso: cer === true ? 3 : cer === false ? 1 : 2,
    texto:
      cer === true
        ? 'Os captadores de fábrica são cerâmicos e simples: é a troca que mais muda o som.'
        : cer === false
          ? 'Os captadores de fábrica já são bons (alnico). Troque só se quiser outro timbre.'
          : 'O fabricante não informa o ímã dos captadores. Se o som está fraco ou chiando, é a troca que mais muda o timbre.',
  });
  const plastico = /plástico|abs|resina|sintético|não informado/i.test(g.nut) && !g.nutBom;
  out.push({
    area: 'tarraxas',
    peso: g.ponte === 'tremolo' ? 2.5 : 1.5,
    texto:
      g.ponte === 'tremolo'
        ? 'Com alavanca, tarraxa com trava segura a afinação e agiliza a troca de cordas.'
        : 'Sem alavanca, a tarraxa original costuma segurar bem. A trava ajuda na troca de cordas.',
  });
  out.push({
    area: 'nut',
    peso: g.nutBom ? 0 : plastico && g.ponte === 'tremolo' ? 2.4 : plastico ? 1.4 : 1,
    texto: g.nutBom
      ? 'O nut de fábrica já é bom.'
      : plastico
        ? 'Nut de plástico prende a corda no rasgo e desafina, principalmente com alavanca.'
        : 'Nut de material sintético: troque se a corda "estala" ou desafina ao voltar da alavanca.',
  });
  out.push({
    area: 'eletrica',
    peso: g.efeitos ? 0.5 : 1.2,
    texto: g.efeitos
      ? 'A eletrônica tem circuito de efeitos: mexa só com um luthier.'
      : 'Potenciômetro e chave melhores dão um volume que abaixa por igual e acabam com chiado de chave.',
  });
  out.push({ area: 'acessorio', peso: 0.8, texto: 'Trava de correia: barata e evita a guitarra no chão.' });
  return out.sort((a, b) => b.peso - a.peso);
}

export const NOME_AREA: Record<Area, string> = {
  captadores: 'Captadores',
  tarraxas: 'Tarraxas',
  nut: 'Nut (pestana)',
  eletrica: 'Elétrica',
  acessorio: 'Acessório',
};
