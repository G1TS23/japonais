/**
 * Banque de textes de lecture graduée, palier N5, rédigée à la main.
 *
 * Chaque phrase est découpée en « mots » (`ReadingSegment`) : c'est la même
 * unité qui porte la furigana (si `reading` est renseigné) ET sert de cible
 * de tap pour le popover de définition (`lookup` — voir `lib/reading.ts`).
 * Un mot conjugué (verbe, adjectif) porte `lookup` avec sa forme dictionnaire
 * quand elle diffère du texte affiché ; sans `lookup`, le tap cherche `text`
 * tel quel (mots déjà à la forme dictionnaire : noms, particules...).
 */

export interface ReadingSegment {
  /** Texte affiché : kanji, kana ou ponctuation. */
  text: string
  /** Lecture kana, uniquement si `text` contient des kanji. */
  reading?: string
  /** Forme dictionnaire pour le lookup au tap, si différente de `text`. */
  lookup?: string
}

export type ReadingSentence = ReadingSegment[]

export interface ReadingText {
  /** Identifiant stable, préfixé par le palier (`n5-…`). */
  id: string
  palier: 'N5'
  titre: string
  /** Résumé d'une ligne, affiché dans la liste. */
  resume: string
  corps: ReadingSentence[]
  /** Mots-clés utiles avant de lire (formes dictionnaire, pour le popover). */
  vocabCle: string[]
}

export const READING_N5: ReadingText[] = [
  {
    id: 'n5-jikoshoukai',
    palier: 'N5',
    titre: '自己紹介',
    resume: 'Se présenter : nom, nationalité, ville, ce qu’on étudie.',
    vocabCle: ['私', '人', '住む', '勉強する'],
    corps: [
      [{ text: 'はじめまして。' }],
      [{ text: '私', reading: 'わたし' }, { text: 'は' }, { text: 'アンナです。' }],
      [{ text: 'フランス' }, { text: '人', reading: 'じん' }, { text: 'です。' }],
      [
        { text: '東京', reading: 'とうきょう' },
        { text: 'に' },
        { text: '住んでいます', reading: 'すんでいます', lookup: '住む' },
        { text: '。' },
      ],
      [
        { text: '日本語', reading: 'にほんご' },
        { text: 'を' },
        { text: '勉強しています', reading: 'べんきょうしています', lookup: '勉強する' },
        { text: '。' },
      ],
      [{ text: 'どうぞよろしく' }, { text: 'お願いします', reading: 'おねがいします' }, { text: '。' }],
    ],
  },
  {
    id: 'n5-watashi-no-ichinichi',
    palier: 'N5',
    titre: '私の一日',
    resume: 'La journée type d’un(e) étudiant(e) : réveil, cours, repas, soirée.',
    vocabCle: ['起きる', '朝ご飯', '学校', '図書館', '家族'],
    corps: [
      [
        { text: '毎朝', reading: 'まいあさ' },
        { text: '七時', reading: 'しちじ' },
        { text: 'に' },
        { text: '起きます', reading: 'おきます', lookup: '起きる' },
        { text: '。' },
      ],
      [
        { text: '朝ご飯', reading: 'あさごはん' },
        { text: 'を' },
        { text: '食べてから', reading: 'たべてから', lookup: '食べる' },
        { text: '、' },
        { text: '学校', reading: 'がっこう' },
        { text: 'に' },
        { text: '行きます', reading: 'いきます', lookup: '行く' },
        { text: '。' },
      ],
      [
        { text: '学校', reading: 'がっこう' },
        { text: 'で' },
        { text: '日本語', reading: 'にほんご' },
        { text: 'を' },
        { text: '勉強します', reading: 'べんきょうします', lookup: '勉強する' },
        { text: '。' },
      ],
      [
        { text: '午後', reading: 'ごご' },
        { text: '、' },
        { text: '友達', reading: 'ともだち' },
        { text: 'と' },
        { text: '図書館', reading: 'としょかん' },
        { text: 'で' },
        { text: '本', reading: 'ほん' },
        { text: 'を' },
        { text: '読みます', reading: 'よみます', lookup: '読む' },
        { text: '。' },
      ],
      [
        { text: '夜', reading: 'よる' },
        { text: '、' },
        { text: '家族', reading: 'かぞく' },
        { text: 'と' },
        { text: '晩ご飯', reading: 'ばんごはん' },
        { text: 'を' },
        { text: '食べます', reading: 'たべます', lookup: '食べる' },
        { text: '。' },
      ],
      [
        { text: 'それから' },
        { text: '、' },
        { text: '少し', reading: 'すこし' },
        { text: 'テレビ' },
        { text: 'を' },
        { text: '見て', reading: 'みて', lookup: '見る' },
        { text: '、' },
        { text: '寝ます', reading: 'ねます', lookup: '寝る' },
        { text: '。' },
      ],
    ],
  },
  {
    id: 'n5-shuumatsu-no-yotei',
    palier: 'N5',
    titre: '週末の予定',
    resume: 'Prévoir son week-end : achats, cinéma, repos.',
    vocabCle: ['週末', '買い物', 'デパート', '映画'],
    corps: [
      [
        { text: '今週', reading: 'こんしゅう' },
        { text: 'の' },
        { text: '週末', reading: 'しゅうまつ' },
        { text: '、' },
        { text: '友達', reading: 'ともだち' },
        { text: 'と' },
        { text: '買い物', reading: 'かいもの' },
        { text: 'に' },
        { text: '行きます', reading: 'いきます', lookup: '行く' },
        { text: '。' },
      ],
      [
        { text: 'デパート' },
        { text: 'で' },
        { text: '新しい', reading: 'あたらしい', lookup: '新しい' },
        { text: '靴', reading: 'くつ' },
        { text: 'を' },
        { text: '買いたいです', reading: 'かいたいです', lookup: '買う' },
        { text: '。' },
      ],
      [
        { text: 'それから' },
        { text: '、' },
        { text: '映画', reading: 'えいが' },
        { text: 'を' },
        { text: '見ます', reading: 'みます', lookup: '見る' },
        { text: '。' },
      ],
      [
        { text: '日曜日', reading: 'にちようび' },
        { text: 'は' },
        { text: '家', reading: 'いえ' },
        { text: 'で' },
        { text: 'ゆっくり' },
        { text: '休みます', reading: 'やすみます', lookup: '休む' },
        { text: '。' },
      ],
    ],
  },
  {
    id: 'n5-tenki',
    palier: 'N5',
    titre: '天気',
    resume: 'Parler du temps qu’il fait aujourd’hui et demain.',
    vocabCle: ['天気', '空', '雨'],
    corps: [
      [
        { text: '今日', reading: 'きょう' },
        { text: 'は' },
        { text: '天気', reading: 'てんき' },
        { text: 'が' },
        { text: 'いいです。' },
      ],
      [
        { text: '空', reading: 'そら' },
        { text: 'が' },
        { text: '青くて', reading: 'あおくて', lookup: '青い' },
        { text: '、' },
        { text: 'とても' },
        { text: '暑いです', reading: 'あついです', lookup: '暑い' },
        { text: '。' },
      ],
      [
        { text: '明日', reading: 'あした' },
        { text: 'は' },
        { text: '雨', reading: 'あめ' },
        { text: 'が' },
        { text: '降るかもしれません', reading: 'ふるかもしれません', lookup: '降る' },
        { text: '。' },
      ],
      [
        { text: 'だから' },
        { text: '、' },
        { text: '今日', reading: 'きょう' },
        { text: '公園', reading: 'こうえん' },
        { text: 'に' },
        { text: '行きます', reading: 'いきます', lookup: '行く' },
        { text: '。' },
      ],
    ],
  },
]
