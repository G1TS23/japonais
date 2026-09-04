/**
 * Jeu de données kana — hiragana + katakana.
 * Chaque entrée = une more, avec sa forme hiragana, sa forme katakana et sa
 * romanisation (Hepburn simplifiée). Utilisé par le module « Drill kana ».
 */

export type KanaGroup = 'base' | 'dakuten' | 'handakuten' | 'yoon'
export type KanaScript = 'hiragana' | 'katakana'

export interface KanaEntry {
  hira: string
  kata: string
  romaji: string
  /** Romanisations alternatives acceptées en saisie. */
  alt?: string[]
  group: KanaGroup
  /** Ligne du tableau (a, ka, sa, …) — pour la grille de chaleur. */
  row: string
}

type Row = [romaji: string, hira: string, kata: string, alt?: string[]]

const BASE: Record<string, Row[]> = {
  a: [
    ['a', 'あ', 'ア'],
    ['i', 'い', 'イ'],
    ['u', 'う', 'ウ'],
    ['e', 'え', 'エ'],
    ['o', 'お', 'オ'],
  ],
  ka: [
    ['ka', 'か', 'カ'],
    ['ki', 'き', 'キ'],
    ['ku', 'く', 'ク'],
    ['ke', 'け', 'ケ'],
    ['ko', 'こ', 'コ'],
  ],
  sa: [
    ['sa', 'さ', 'サ'],
    ['shi', 'し', 'シ', ['si']],
    ['su', 'す', 'ス'],
    ['se', 'せ', 'セ'],
    ['so', 'そ', 'ソ'],
  ],
  ta: [
    ['ta', 'た', 'タ'],
    ['chi', 'ち', 'チ', ['ti']],
    ['tsu', 'つ', 'ツ', ['tu']],
    ['te', 'て', 'テ'],
    ['to', 'と', 'ト'],
  ],
  na: [
    ['na', 'な', 'ナ'],
    ['ni', 'に', 'ニ'],
    ['nu', 'ぬ', 'ヌ'],
    ['ne', 'ね', 'ネ'],
    ['no', 'の', 'ノ'],
  ],
  ha: [
    ['ha', 'は', 'ハ'],
    ['hi', 'ひ', 'ヒ'],
    ['fu', 'ふ', 'フ', ['hu']],
    ['he', 'へ', 'ヘ'],
    ['ho', 'ほ', 'ホ'],
  ],
  ma: [
    ['ma', 'ま', 'マ'],
    ['mi', 'み', 'ミ'],
    ['mu', 'む', 'ム'],
    ['me', 'め', 'メ'],
    ['mo', 'も', 'モ'],
  ],
  ya: [
    ['ya', 'や', 'ヤ'],
    ['yu', 'ゆ', 'ユ'],
    ['yo', 'よ', 'ヨ'],
  ],
  ra: [
    ['ra', 'ら', 'ラ'],
    ['ri', 'り', 'リ'],
    ['ru', 'る', 'ル'],
    ['re', 'れ', 'レ'],
    ['ro', 'ろ', 'ロ'],
  ],
  wa: [
    ['wa', 'わ', 'ワ'],
    ['wo', 'を', 'ヲ', ['o']],
  ],
  n: [['n', 'ん', 'ン', ['nn']]],
}

const DAKUTEN: Row[] = [
  ['ga', 'が', 'ガ'],
  ['gi', 'ぎ', 'ギ'],
  ['gu', 'ぐ', 'グ'],
  ['ge', 'げ', 'ゲ'],
  ['go', 'ご', 'ゴ'],
  ['za', 'ざ', 'ザ'],
  ['ji', 'じ', 'ジ', ['zi']],
  ['zu', 'ず', 'ズ'],
  ['ze', 'ぜ', 'ゼ'],
  ['zo', 'ぞ', 'ゾ'],
  ['da', 'だ', 'ダ'],
  ['ji', 'ぢ', 'ヂ', ['di']],
  ['zu', 'づ', 'ヅ', ['du']],
  ['de', 'で', 'デ'],
  ['do', 'ど', 'ド'],
  ['ba', 'ば', 'バ'],
  ['bi', 'び', 'ビ'],
  ['bu', 'ぶ', 'ブ'],
  ['be', 'べ', 'ベ'],
  ['bo', 'ぼ', 'ボ'],
]

const HANDAKUTEN: Row[] = [
  ['pa', 'ぱ', 'パ'],
  ['pi', 'ぴ', 'ピ'],
  ['pu', 'ぷ', 'プ'],
  ['pe', 'ぺ', 'ペ'],
  ['po', 'ぽ', 'ポ'],
]

const YOON: Row[] = [
  ['kya', 'きゃ', 'キャ'],
  ['kyu', 'きゅ', 'キュ'],
  ['kyo', 'きょ', 'キョ'],
  ['sha', 'しゃ', 'シャ', ['sya']],
  ['shu', 'しゅ', 'シュ', ['syu']],
  ['sho', 'しょ', 'ショ', ['syo']],
  ['cha', 'ちゃ', 'チャ', ['tya']],
  ['chu', 'ちゅ', 'チュ', ['tyu']],
  ['cho', 'ちょ', 'チョ', ['tyo']],
  ['nya', 'にゃ', 'ニャ'],
  ['nyu', 'にゅ', 'ニュ'],
  ['nyo', 'にょ', 'ニョ'],
  ['hya', 'ひゃ', 'ヒャ'],
  ['hyu', 'ひゅ', 'ヒュ'],
  ['hyo', 'ひょ', 'ヒョ'],
  ['mya', 'みゃ', 'ミャ'],
  ['myu', 'みゅ', 'ミュ'],
  ['myo', 'みょ', 'ミョ'],
  ['rya', 'りゃ', 'リャ'],
  ['ryu', 'りゅ', 'リュ'],
  ['ryo', 'りょ', 'リョ'],
  ['gya', 'ぎゃ', 'ギャ'],
  ['gyu', 'ぎゅ', 'ギュ'],
  ['gyo', 'ぎょ', 'ギョ'],
  ['ja', 'じゃ', 'ジャ', ['jya', 'zya']],
  ['ju', 'じゅ', 'ジュ', ['jyu', 'zyu']],
  ['jo', 'じょ', 'ジョ', ['jyo', 'zyo']],
  ['bya', 'びゃ', 'ビャ'],
  ['byu', 'びゅ', 'ビュ'],
  ['byo', 'びょ', 'ビョ'],
  ['pya', 'ぴゃ', 'ピャ'],
  ['pyu', 'ぴゅ', 'ピュ'],
  ['pyo', 'ぴょ', 'ピョ'],
]

function rowsToEntries(rows: Row[], group: KanaGroup, rowName: string): KanaEntry[] {
  return rows.map(([romaji, hira, kata, alt]) => ({ romaji, hira, kata, alt, group, row: rowName }))
}

export const KANA: KanaEntry[] = [
  ...Object.entries(BASE).flatMap(([rowName, rows]) => rowsToEntries(rows, 'base', rowName)),
  ...rowsToEntries(DAKUTEN, 'dakuten', 'dakuten'),
  ...rowsToEntries(HANDAKUTEN, 'handakuten', 'handakuten'),
  ...rowsToEntries(YOON, 'yoon', 'yoon'),
]

export function kanaChar(e: KanaEntry, script: KanaScript): string {
  return script === 'hiragana' ? e.hira : e.kata
}

/** Vérifie une saisie romaji contre l'entrée (romaji principal ou alternatives). */
export function matchesRomaji(e: KanaEntry, input: string): boolean {
  const norm = input.trim().toLowerCase()
  return norm === e.romaji || (e.alt?.includes(norm) ?? false)
}
