// Dados da calculadora de fonte para pedais (/calculadora-de-fonte-para-pedais/).
//
// Consumo dos pedais: tensão, corrente (mA) e se o circuito é digital. Origem de cada dado:
//   boss       = página de especificações do pedal em boss.info ("Current Draw"), conferida em 26/11/2026
//   manual     = ficha técnica do fabricante, no manual ou repetida pelas lojas (conferida em 26/11/2026)
//   pedalpedia = banco PedalPedia da RockBoard (rockboard.de/pedalPedia), conferido em 26/11/2026
// A ficha do Mercado Livre não serve de fonte: ela erra tensão e consumo com frequência.
//
// Saídas das fontes: descrição do anúncio nacional do link de afiliado (conferida em 26/11/2026).
// Preço, foto e link vêm do catálogo (src/data/produtos/<id>.json), que a rotina de preços atualiza.

export type OrigemDado = 'boss' | 'manual' | 'pedalpedia';

/**
 * dc = plugue de pedal comum; propria = precisa da fonte original (corrente alta demais para
 * fonte de pedal); tomada = liga direto na tomada; usb = bateria interna que carrega pelo USB.
 */
export type Alimentacao = 'dc' | 'propria' | 'tomada' | 'usb';

export interface PedalConsumo {
  id: string;
  marca: string;
  nome: string;
  /** Tensão de trabalho (V). */
  v: number;
  /** Consumo máximo informado, em mA. 0 quando não se aplica (tomada, usb). */
  ma: number;
  digital: boolean;
  pedaleira?: boolean;
  alimentacao?: Alimentacao;
  /** id do produto no catálogo, quando há ficha em /produto/<id>/. */
  produto?: string;
  dado: OrigemDado;
  obs?: string;
}

const boss = (id: string, nome: string, ma: number, digital: boolean, extra: Partial<PedalConsumo> = {}): PedalConsumo => ({
  id: `boss-${id}`,
  marca: 'Boss',
  nome,
  v: 9,
  ma,
  digital,
  dado: 'boss',
  ...extra,
});

export const PEDAIS: PedalConsumo[] = [
  // Boss: specifications de cada modelo em boss.info
  boss('ac-3', 'AC-3 Acoustic Simulator', 70, true),
  boss('bd-2', 'BD-2 Blues Driver', 20, false, { produto: 'boss-bd-2-blues-driver' }),
  boss('bd-2w', 'BD-2W Blues Driver Waza Craft', 18, false),
  boss('bf-3', 'BF-3 Flanger', 60, true),
  boss('ce-2w', 'CE-2W Chorus Waza Craft', 25, false),
  boss('ce-5', 'CE-5 Chorus Ensemble', 55, false, { produto: 'boss-ce-5-chorus-ensemble' }),
  boss('ch-1', 'CH-1 Super Chorus', 55, false, { produto: 'boss-ch-1-super-chorus' }),
  boss('cs-3', 'CS-3 Compression Sustainer', 20, false, { produto: 'boss-cs-3-compression-sustainer' }),
  boss('dc-2w', 'DC-2W Dimension C', 65, false),
  boss('dd-3t', 'DD-3T Digital Delay', 70, true, { produto: 'boss-dd-3t-digital-delay' }),
  boss('dd-7', 'DD-7 Digital Delay', 55, true),
  boss('dd-8', 'DD-8 Digital Delay', 100, true, { produto: 'boss-dd-8-digital-delay' }),
  boss('dd-200', 'DD-200 Digital Delay', 225, true),
  boss('dd-500', 'DD-500 Digital Delay', 200, true),
  boss('dm-2w', 'DM-2W Delay Waza Craft', 35, false),
  boss('ds-1', 'DS-1 Distortion', 10, false, { produto: 'boss-ds-1' }),
  boss('ds-1w', 'DS-1W Distortion Waza Craft', 15, false),
  boss('ds-2', 'DS-2 Turbo Distortion', 15, false),
  boss('ge-7', 'GE-7 Equalizer', 30, false),
  boss('hm-2w', 'HM-2W Heavy Metal Waza Craft', 30, false),
  boss('ir-2', 'IR-2 Amp & Cabinet', 160, true),
  boss('ir-200', 'IR-200 Amp & IR Cabinet', 335, true),
  boss('ls-2', 'LS-2 Line Selector', 30, false),
  boss('md-200', 'MD-200 Modulation', 225, true),
  boss('mt-2', 'MT-2 Metal Zone', 30, false),
  boss('ns-2', 'NS-2 Noise Suppressor', 25, false),
  boss('oc-5', 'OC-5 Octave', 60, true),
  boss('od-3', 'OD-3 OverDrive', 15, false),
  boss('ph-3', 'PH-3 Phase Shifter', 50, true),
  boss('ps-6', 'PS-6 Harmonist', 65, true),
  boss('rc-1', 'RC-1 Loop Station', 95, true, { produto: 'boss-rc-1-loop-station' }),
  boss('rc-5', 'RC-5 Loop Station', 170, true, { produto: 'boss-rc-5-loop-station' }),
  boss('rc-30', 'RC-30 Loop Station', 195, true),
  boss('rc-500', 'RC-500 Loop Station', 330, true),
  boss('re-2', 'RE-2 Space Echo', 75, true),
  boss('rv-6', 'RV-6 Reverb', 95, true, { produto: 'boss-rv-6-reverb' }),
  boss('rv-500', 'RV-500 Reverb', 225, true),
  boss('sd-1', 'SD-1 Super OverDrive', 10, false),
  boss('sd-1w', 'SD-1W Super OverDrive Waza Craft', 15, false),
  boss('st-2', 'ST-2 Power Stack', 65, false),
  boss('sy-1', 'SY-1 Synthesizer', 115, true),
  boss('tr-2', 'TR-2 Tremolo', 25, false),
  boss('tu-3', 'TU-3 Chromatic Tuner', 20, true, { produto: 'boss-tu-3-afinador-cromatico' }),
  boss('tu-3w', 'TU-3W Chromatic Tuner Waza Craft', 50, true),
  boss('gt-1000-core', 'GT-1000 Core', 670, true, { pedaleira: true, produto: 'boss-gt-1000-core' }),
  boss('gx-1', 'GX-1', 250, true, { pedaleira: true, produto: 'boss-gx-1', obs: 'Também funciona com 4 pilhas AA ou pelo USB.' }),
  boss('me-90', 'ME-90', 190, true, { pedaleira: true, produto: 'boss-me-90', obs: 'Também funciona com 4 pilhas AA.' }),
  boss('ms-3', 'MS-3 Multi Effects Switcher', 280, true, { pedaleira: true }),

  // Outras marcas
  { id: 'behringer-to800', marca: 'Behringer', nome: 'TO800 Vintage Tube Overdrive', v: 9, ma: 30, digital: false, dado: 'pedalpedia' },
  { id: 'ehx-big-muff-pi', marca: 'Electro-Harmonix', nome: 'Big Muff Pi', v: 9, ma: 3, digital: false, dado: 'pedalpedia' },
  { id: 'ehx-nano-big-muff-pi', marca: 'Electro-Harmonix', nome: 'Nano Big Muff Pi', v: 9, ma: 2, digital: false, dado: 'pedalpedia' },
  { id: 'ehx-soul-food', marca: 'Electro-Harmonix', nome: 'Soul Food', v: 9, ma: 22, digital: false, dado: 'pedalpedia', obs: 'Vem com fonte de 9,6 V, mas funciona em 9 V.' },
  { id: 'fuhrmann-ad20', marca: 'Fuhrmann', nome: 'AD20 Analog Delay', v: 9, ma: 12, digital: false, dado: 'pedalpedia', produto: 'fuhrmann-ad20-analog-delay' },
  { id: 'fuhrmann-bass-compressor', marca: 'Fuhrmann', nome: 'Bass Compressor', v: 9, ma: 12, digital: false, dado: 'pedalpedia', produto: 'fuhrmann-bass-compressor' },
  { id: 'fuhrmann-co10', marca: 'Fuhrmann', nome: 'Chorus Cycle CO10', v: 9, ma: 20, digital: false, dado: 'pedalpedia', produto: 'fuhrmann-chorus-cycle-co10' },
  { id: 'fuhrmann-cm10', marca: 'Fuhrmann', nome: 'Compressor CM10', v: 9, ma: 4, digital: false, dado: 'pedalpedia', produto: 'fuhrmann-compressor-cm10' },
  { id: 'ibanez-ts9', marca: 'Ibanez', nome: 'TS9 Tube Screamer', v: 9, ma: 8, digital: false, dado: 'pedalpedia' },
  { id: 'ibanez-ts-mini', marca: 'Ibanez', nome: 'TS Mini', v: 9, ma: 18, digital: false, dado: 'pedalpedia' },
  { id: 'joyo-jf-01', marca: 'Joyo', nome: 'JF-01 Vintage Overdrive', v: 9, ma: 7, digital: false, dado: 'pedalpedia', produto: 'joyo-vintage-overdrive-jf-01' },
  { id: 'joyo-jf-10', marca: 'Joyo', nome: 'JF-10 Dynamic Compressor', v: 9, ma: 8, digital: false, dado: 'pedalpedia', produto: 'joyo-jf-10-dynamic-compressor' },
  { id: 'joyo-r-04', marca: 'Joyo', nome: 'R-04 Zip Amp', v: 9, ma: 20, digital: false, dado: 'pedalpedia' },
  { id: 'joyo-r-14', marca: 'Joyo', nome: 'R-14 Atmosphere', v: 9, ma: 140, digital: true, dado: 'pedalpedia', produto: 'joyo-atmosphere-r-14' },
  { id: 'joyo-d-seed-ii', marca: 'Joyo', nome: 'D-Seed II', v: 9, ma: 220, digital: true, dado: 'pedalpedia', produto: 'joyo-d-seed-ii' },
  { id: 'm-vave-looper-pro', marca: 'M-Vave', nome: 'Looper Pro', v: 9, ma: 100, digital: true, dado: 'pedalpedia', produto: 'm-vave-looper-pro' },
  { id: 'm-vave-lost-tempo', marca: 'M-Vave', nome: 'Lost Tempo Looper e Drum', v: 9, ma: 300, digital: true, dado: 'pedalpedia', produto: 'm-vave-lost-tempo-looper-e-drum' },
  { id: 'm-vave-mini-universe', marca: 'M-Vave', nome: 'Mini Universe Reverb', v: 9, ma: 100, digital: true, dado: 'pedalpedia', produto: 'm-vave-mini-universe-reverb' },
  { id: 'mooer-ana-echo', marca: 'Mooer', nome: 'Ana Echo', v: 9, ma: 26, digital: false, dado: 'pedalpedia' },
  { id: 'mooer-black-secret', marca: 'Mooer', nome: 'Black Secret', v: 9, ma: 3, digital: false, dado: 'pedalpedia' },
  { id: 'mooer-green-mile', marca: 'Mooer', nome: 'Green Mile', v: 9, ma: 7, digital: false, dado: 'pedalpedia' },
  { id: 'mooer-shim-verb', marca: 'Mooer', nome: 'Shim Verb', v: 9, ma: 128, digital: true, dado: 'pedalpedia' },
  { id: 'mxr-carbon-copy', marca: 'MXR', nome: 'Carbon Copy Analog Delay', v: 9, ma: 26, digital: false, dado: 'pedalpedia' },
  { id: 'mxr-dyna-comp', marca: 'MXR', nome: 'Dyna Comp', v: 9, ma: 4, digital: false, dado: 'pedalpedia' },
  { id: 'strymon-timeline', marca: 'Strymon', nome: 'Timeline', v: 9, ma: 300, digital: true, dado: 'pedalpedia' },
  { id: 'tc-afterglow', marca: 'TC Electronic', nome: 'Afterglow Chorus', v: 9, ma: 20, digital: false, dado: 'manual', produto: 'tc-electronic-afterglow-chorus' },
  { id: 'tc-ditto-looper', marca: 'TC Electronic', nome: 'Ditto Looper', v: 9, ma: 100, digital: true, dado: 'pedalpedia' },
  { id: 'tc-flashback-2', marca: 'TC Electronic', nome: 'Flashback 2 Delay', v: 9, ma: 100, digital: true, dado: 'pedalpedia' },
  { id: 'tc-hall-of-fame-2', marca: 'TC Electronic', nome: 'Hall of Fame 2 Reverb', v: 9, ma: 100, digital: true, dado: 'pedalpedia' },
  { id: 'tc-polytune-3', marca: 'TC Electronic', nome: 'Polytune 3', v: 9, ma: 45, digital: true, dado: 'pedalpedia' },
  { id: 'tc-skysurfer', marca: 'TC Electronic', nome: 'Skysurfer Reverb', v: 9, ma: 120, digital: true, dado: 'pedalpedia', produto: 'tc-electronic-skysurfer-reverb' },
  { id: 'tc-skysurfer-mini', marca: 'TC Electronic', nome: 'Skysurfer Mini Reverb', v: 9, ma: 100, digital: true, dado: 'pedalpedia' },
  { id: 'xotic-ep-booster', marca: 'Xotic', nome: 'EP Booster', v: 9, ma: 5, digital: false, dado: 'pedalpedia', obs: 'Aceita de 9 a 18 V.' },

  // Pedaleiras e multiefeitos de outras marcas
  { id: 'line-6-hx-stomp', marca: 'Line 6', nome: 'HX Stomp', v: 9, ma: 3000, digital: true, pedaleira: true, alimentacao: 'propria', dado: 'manual', produto: 'line-6-hx-stomp', obs: 'A Line 6 pede fonte de 9 V e 3 A (a DC-3g, que vem na caixa).' },
  { id: 'line-6-helix-lt', marca: 'Line 6', nome: 'Helix LT', v: 0, ma: 0, digital: true, pedaleira: true, alimentacao: 'tomada', dado: 'manual', produto: 'line-6-helix-lt', obs: 'Tem fonte interna: liga direto na tomada com cabo de força.' },
  { id: 'm-vave-cube-baby', marca: 'M-Vave', nome: 'Cube Baby', v: 5, ma: 0, digital: true, pedaleira: true, alimentacao: 'usb', dado: 'manual', produto: 'm-vave-cube-baby', obs: 'Bateria interna, carrega pelo USB.' },
  { id: 'm-vave-tank-g', marca: 'M-Vave', nome: 'Tank-G', v: 5, ma: 0, digital: true, pedaleira: true, alimentacao: 'usb', dado: 'manual', produto: 'm-vave-tank-g', obs: 'Bateria interna, carrega pelo USB.' },
  { id: 'mooer-ge150', marca: 'Mooer', nome: 'GE150', v: 9, ma: 300, digital: true, pedaleira: true, dado: 'manual', produto: 'mooer-ge150' },
  { id: 'neural-dsp-quad-cortex', marca: 'Neural DSP', nome: 'Quad Cortex', v: 12, ma: 3000, digital: true, pedaleira: true, alimentacao: 'propria', dado: 'manual', produto: 'neural-dsp-quad-cortex', obs: 'O manual pede 12 V e no mínimo 3 A, centro negativo.' },
  { id: 'nux-mg-30', marca: 'Nux', nome: 'MG-30', v: 9, ma: 400, digital: true, pedaleira: true, dado: 'manual', produto: 'nux-mg-30-versatile-modeler' },
  { id: 'nux-mg-101', marca: 'Nux', nome: 'MG-101', v: 9, ma: 250, digital: true, pedaleira: true, dado: 'manual', produto: 'nux-mg-101', obs: 'Também funciona com 6 pilhas AA.' },
  { id: 'nux-mg-300', marca: 'Nux', nome: 'MG-300', v: 9, ma: 300, digital: true, pedaleira: true, dado: 'pedalpedia', produto: 'nux-mg-300' },
  { id: 'nux-mg-400', marca: 'Nux', nome: 'MG-400', v: 9, ma: 280, digital: true, pedaleira: true, dado: 'manual', produto: 'nux-mg-400' },
  { id: 'valeton-gp-50', marca: 'Valeton', nome: 'GP-50', v: 9, ma: 500, digital: true, pedaleira: true, dado: 'manual', produto: 'valeton-gp-50', obs: 'Tem bateria interna e também carrega pelo USB.' },
  { id: 'valeton-gp-200', marca: 'Valeton', nome: 'GP-200', v: 9, ma: 1000, digital: true, pedaleira: true, dado: 'manual', produto: 'valeton-gp-200' },
  { id: 'valeton-gp-200lt', marca: 'Valeton', nome: 'GP-200LT', v: 9, ma: 1000, digital: true, pedaleira: true, dado: 'pedalpedia', produto: 'valeton-gp-200lt' },
  { id: 'zoom-g6', marca: 'Zoom', nome: 'G6', v: 9, ma: 500, digital: true, pedaleira: true, dado: 'pedalpedia', produto: 'zoom-g6' },
];

/** Uma saída de fonte. `opcoes` lista as tensões possíveis, cada uma com a corrente que entrega. */
export interface SaidaFonte {
  opcoes: { v: number; ma: number }[];
  /** Plugues que dividem a mesma saída (seção da Landscape, cabo da Hayonik). */
  plugues?: number;
}

export interface FonteDados {
  /** id do produto no catálogo (src/data/produtos). */
  id: string;
  /** Nome curto para a calculadora. */
  curto: string;
  isolada: boolean;
  saidas: SaidaFonte[];
  usb?: number;
  tomadas?: number;
  /** Limite de corrente somando todas as saídas (mA), quando a entrada limita. */
  total?: number;
  obs?: string;
}

const s = (n: number, opcoes: { v: number; ma: number }[], plugues?: number): SaidaFonte[] =>
  Array.from({ length: n }, () => ({ opcoes, ...(plugues ? { plugues } : {}) }));
const v9 = (ma: number) => [{ v: 9, ma }];

export const FONTES: FonteDados[] = [
  {
    id: 'fonte-hayonik-9v-1000ma',
    curto: 'Hayonik 9V 1000 mA',
    isolada: false,
    saidas: s(1, v9(1000), 4),
    obs: 'Uma saída só, com cabo daisy chain de 4 pontas: os pedais dividem o mesmo circuito.',
  },
  {
    id: 'fonte-m-vave-para-pedais',
    curto: 'M-Vave VD-SK1',
    isolada: true,
    saidas: [...s(6, v9(100)), ...s(2, v9(300))],
    total: 900,
    obs: 'Liga num carregador USB-C de 5 V e 2 A (não vem na caixa). Com 10 W de entrada, estimamos uns 900 mA somando as 8 saídas.',
  },
  {
    id: 'fonte-boss-psa-120zs-9v',
    curto: 'Boss PSA-120ZS',
    isolada: false,
    saidas: s(1, v9(200)),
    obs: 'Fonte de um pedal só (9 V, 200 mA), a original da Boss.',
  },
  {
    id: 'fonte-caline-cp-204',
    curto: 'Caline CP-204',
    isolada: true,
    saidas: [...s(6, v9(100)), ...s(1, v9(500)), ...s(1, [{ v: 9, ma: 300 }, { v: 12, ma: 300 }])],
  },
  {
    id: 'joyo-jp-02-fonte-isolada',
    curto: 'Joyo JP-02',
    isolada: true,
    saidas: [...s(7, v9(100)), ...s(1, v9(500)), ...s(1, [{ v: 12, ma: 100 }]), ...s(1, [{ v: 18, ma: 100 }])],
  },
  {
    id: 'mosky-iso-10-fonte-isolada',
    curto: 'Mosky ISO-10',
    isolada: true,
    saidas: [...s(7, v9(300)), ...s(1, v9(500)), ...s(2, [{ v: 9, ma: 500 }, { v: 12, ma: 500 }, { v: 18, ma: 500 }])],
    usb: 1,
  },
  {
    id: 'fonte-landscape-isopower-3s',
    curto: 'Landscape Isopower 3S',
    isolada: true,
    saidas: s(3, v9(1000), 2),
    obs: 'Três seções isoladas de 1000 mA, com dois plugues em cada uma.',
  },
  {
    id: 'fonte-landscape-isopower-4s',
    curto: 'Landscape Isopower 4S',
    isolada: true,
    saidas: [
      ...s(2, v9(1000), 2),
      ...s(1, [{ v: 9, ma: 200 }, { v: 12, ma: 650 }], 2),
      ...s(1, [{ v: 9, ma: 100 }, { v: 18, ma: 500 }], 2),
    ],
    obs: 'Quatro seções isoladas, com dois plugues em cada uma.',
  },
  {
    id: 'fonte-landscape-isopower-10s',
    curto: 'Landscape Isopower 10S',
    isolada: true,
    saidas: [
      ...s(5, v9(1000)),
      ...s(3, [{ v: 9, ma: 200 }, { v: 12, ma: 650 }]),
      ...s(2, [{ v: 9, ma: 100 }, { v: 18, ma: 500 }]),
    ],
  },
  {
    id: 'fonte-vitoos-ad10s-sv4',
    curto: 'Vitoos AD10S-SV4',
    isolada: true,
    saidas: [...s(4, v9(250)), ...s(2, v9(500)), ...s(4, [{ v: 9, ma: 450 }, { v: 12, ma: 450 }, { v: 18, ma: 450 }])],
    usb: 1,
  },
  {
    id: 'fonte-voodoo-lab-iso-5',
    curto: 'Voodoo Lab ISO-5',
    isolada: true,
    saidas: [...s(3, v9(100)), ...s(1, [{ v: 9, ma: 400 }, { v: 12, ma: 400 }]), ...s(1, [{ v: 18, ma: 150 }])],
  },
  {
    id: 'fonte-joyo-jp-07',
    curto: 'Joyo JP-07',
    isolada: true,
    saidas: [...s(3, v9(500)), ...s(3, v9(100)), ...s(1, [{ v: 12, ma: 500 }]), ...s(1, [{ v: 18, ma: 500 }])],
    tomadas: 3,
    obs: 'Além das 8 saídas, tem 3 tomadas para a fonte de uma pedaleira ou de um amplificador.',
  },
];

export const ORIGEM_DADO: Record<OrigemDado, string> = {
  boss: 'site da Boss',
  manual: 'ficha técnica do fabricante',
  pedalpedia: 'PedalPedia (RockBoard)',
};
