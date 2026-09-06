/**
 * Banque de questions N5 rédigées à la main — particules et grammaire de base.
 * Le vocabulaire est généré automatiquement depuis `data/vocab.ts` (voir
 * `lib/quiz-session.ts`), pas ici.
 *
 * `answer` = index de la bonne réponse dans `options`. Les options sont
 * mélangées au moment de construire la session (l'index est recalculé).
 * Identifiants stables (historique des tentatives).
 */

export type QuizTheme = 'particules' | 'grammaire' | 'vocabulaire'

export interface QuizQuestion {
  id: string
  theme: QuizTheme
  /** Énoncé, avec ＿＿ à l'emplacement du trou le cas échéant. */
  prompt: string
  /** Aide facultative (lecture, glose) pour rester équitable au niveau N5. */
  hint?: string
  options: string[]
  answer: number
  explanation: string
}

export const QUIZ_N5: QuizQuestion[] = [
  // --- Particules -------------------------------------------------------------
  {
    id: 'p-wa',
    theme: 'particules',
    prompt: 'わたし＿＿ がくせいです。',
    hint: 'Je suis étudiant.',
    options: ['は', 'が', 'を', 'に'],
    answer: 0,
    explanation: 'は marque le thème de la phrase (« en ce qui me concerne… »).',
  },
  {
    id: 'p-wo',
    theme: 'particules',
    prompt: 'パン＿＿ たべます。',
    hint: 'Je mange du pain.',
    options: ['を', 'が', 'に', 'で'],
    answer: 0,
    explanation: 'を marque le complément d’objet direct (ce qu’on mange).',
  },
  {
    id: 'p-ni-time',
    theme: 'particules',
    prompt: 'まいあさ 7じ＿＿ おきます。',
    hint: 'Je me lève à 7 h chaque matin.',
    options: ['に', 'で', 'を', 'から'],
    answer: 0,
    explanation: 'に marque un moment précis (heure, jour, date).',
  },
  {
    id: 'p-de-moyen',
    theme: 'particules',
    prompt: 'でんしゃ＿＿ かいしゃに いきます。',
    hint: 'Je vais au travail en train.',
    options: ['で', 'に', 'を', 'と'],
    answer: 0,
    explanation: 'で marque le moyen (transport, outil, langue…).',
  },
  {
    id: 'p-de-lieu',
    theme: 'particules',
    prompt: 'としょかん＿＿ ほんを よみます。',
    hint: 'Je lis un livre à la bibliothèque.',
    options: ['で', 'に', 'を', 'へ'],
    answer: 0,
    explanation: 'で marque le lieu où se déroule une action.',
  },
  {
    id: 'p-ni-existence',
    theme: 'particules',
    prompt: 'つくえの うえ＿＿ ほんが あります。',
    hint: 'Il y a un livre sur le bureau.',
    options: ['に', 'で', 'を', 'へ'],
    answer: 0,
    explanation: 'に marque le lieu d’existence avec ある / いる.',
  },
  {
    id: 'p-to-accompagnement',
    theme: 'particules',
    prompt: 'ともだち＿＿ えいがを みました。',
    hint: 'J’ai vu un film avec un ami.',
    options: ['と', 'に', 'で', 'を'],
    answer: 0,
    explanation: 'と marque l’accompagnement (« avec quelqu’un »).',
  },
  {
    id: 'p-no-possessif',
    theme: 'particules',
    prompt: 'これは わたし＿＿ かさです。',
    hint: 'C’est mon parapluie.',
    options: ['の', 'は', 'が', 'を'],
    answer: 0,
    explanation: 'の relie deux noms (possession, appartenance).',
  },
  {
    id: 'p-kara-depart',
    theme: 'particules',
    prompt: 'うち＿＿ えきまで あるきます。',
    hint: 'Je marche de chez moi jusqu’à la gare.',
    options: ['から', 'まで', 'に', 'で'],
    answer: 0,
    explanation: 'から marque le point de départ ; まで le point d’arrivée.',
  },
  {
    id: 'p-ga-existence',
    theme: 'particules',
    prompt: 'きょうしつに がくせい＿＿ います。',
    hint: 'Il y a des étudiants dans la salle de classe.',
    options: ['が', 'は', 'を', 'に'],
    answer: 0,
    explanation: 'Avec ある / いる, ce qui existe est marqué par が.',
  },
  {
    id: 'p-ga-suki',
    theme: 'particules',
    prompt: 'わたしは にく＿＿ すきです。',
    hint: 'J’aime la viande.',
    options: ['が', 'を', 'は', 'に'],
    answer: 0,
    explanation: 'すき・きらい・じょうず・ほしい s’emploient avec が, pas を.',
  },
  {
    id: 'p-ga-potentiel',
    theme: 'particules',
    prompt: 'にほんご＿＿ すこし はなせます。',
    hint: 'Je peux parler un peu japonais.',
    options: ['が', 'を', 'は', 'に'],
    answer: 0,
    explanation: 'À la forme potentielle (はなせる), le を de l’objet devient souvent が.',
  },
  {
    id: 'p-mo',
    theme: 'particules',
    prompt: 'わたしは がくせいです。かれ＿＿ がくせいです。',
    hint: 'Je suis étudiant. Lui aussi est étudiant.',
    options: ['も', 'は', 'が', 'と'],
    answer: 0,
    explanation: 'も = « aussi », et remplace は ou が.',
  },
  {
    id: 'p-he-direction',
    theme: 'particules',
    prompt: 'らいねん にほん＿＿ いきたいです。',
    hint: 'L’an prochain, je veux aller au Japon.',
    options: ['へ', 'で', 'を', 'から'],
    answer: 0,
    explanation: 'へ (prononcé « e ») marque la direction. に est aussi possible ici.',
  },

  // --- Grammaire ------------------------------------------------------------
  {
    id: 'g-neg-ichidan',
    theme: 'grammaire',
    prompt: 'あさごはんを ＿＿。',
    hint: 'Je ne mange pas de petit-déjeuner. (たべる)',
    options: ['たべません', 'たべます', 'たべました', 'たべる'],
    answer: 0,
    explanation: 'Négation polie présent : radical + ません.',
  },
  {
    id: 'g-neg-godan',
    theme: 'grammaire',
    prompt: 'きょうは がっこうに ＿＿。',
    hint: 'Aujourd’hui, je ne vais pas à l’école. (いく)',
    options: ['いきません', 'いかません', 'いません', 'いくません'],
    answer: 0,
    explanation: 'いく → base ます « いき » + ません. « いかません » est une erreur fréquente.',
  },
  {
    id: 'g-adj-i-neg',
    theme: 'grammaire',
    prompt: 'この ほんは ＿＿ です。',
    hint: 'Ce livre n’est pas cher. (たかい)',
    options: ['たかくない', 'たかいじゃない', 'たかくじゃない', 'たかいくない'],
    answer: 0,
    explanation: 'Adjectif en い : on retire い et on ajoute くない (くありません à l’oral poli).',
  },
  {
    id: 'g-adj-na-neg',
    theme: 'grammaire',
    prompt: 'この へやは ＿＿ です。',
    hint: 'Cette pièce n’est pas calme. (しずか)',
    options: ['しずかじゃない', 'しずかくない', 'しずかない', 'しずくない'],
    answer: 0,
    explanation: 'Adjectif en な : じゃない (ではありません à l’oral poli).',
  },
  {
    id: 'g-desu-past',
    theme: 'grammaire',
    prompt: 'きのうは やすみ ＿＿。',
    hint: 'Hier, c’était congé.',
    options: ['でした', 'です', 'じゃない', 'ました'],
    answer: 0,
    explanation: 'Passé de です : でした.',
  },
  {
    id: 'g-sore',
    theme: 'grammaire',
    prompt: '（相手の近くの物を指して）＿＿ は なんですか。',
    hint: 'En montrant un objet près de votre interlocuteur : « Qu’est-ce que c’est ? »',
    options: ['それ', 'これ', 'あれ', 'どれ'],
    answer: 0,
    explanation: 'これ = près de moi, それ = près de toi, あれ = loin des deux.',
  },
  {
    id: 'g-tai',
    theme: 'grammaire',
    prompt: 'すしを ＿＿ です。',
    hint: 'Je veux manger des sushis. (たべる)',
    options: ['たべたい', 'たべたく', 'たべて', 'たべた'],
    answer: 0,
    explanation: 'Envie : base ます « たべ » + たい.',
  },
  {
    id: 'g-mashou',
    theme: 'grammaire',
    prompt: 'いっしょに ＿＿。',
    hint: 'Allons-y ensemble. (いく)',
    options: ['いきましょう', 'いきました', 'いきます', 'いって'],
    answer: 0,
    explanation: 'Proposition : base ます « いき » + ましょう.',
  },
  {
    id: 'g-kudasai',
    theme: 'grammaire',
    prompt: 'ちょっと まって ＿＿。',
    hint: 'Attendez un instant, s’il vous plaît.',
    options: ['ください', 'です', 'ます', 'たい'],
    answer: 0,
    explanation: 'Forme て + ください pour une demande polie.',
  },
  {
    id: 'g-iru-anime',
    theme: 'grammaire',
    prompt: 'つくえの うえに ねこが ＿＿。',
    hint: 'Il y a un chat sur le bureau.',
    options: ['います', 'あります', 'です', 'いります'],
    answer: 0,
    explanation: 'いる pour les êtres animés (personnes, animaux) ; ある pour le reste.',
  },
  {
    id: 'g-kuru',
    theme: 'grammaire',
    prompt: 'あした ともだちが ＿＿。',
    hint: 'Demain, un ami vient. (くる)',
    options: ['きます', 'くます', 'こます', 'いきます'],
    answer: 0,
    explanation: 'くる est irrégulier : présent poli = きます.',
  },
  {
    id: 'g-counter-mai',
    theme: 'grammaire',
    prompt: 'きってを ＿＿ かいました。',
    hint: 'J’ai acheté 5 timbres.',
    options: ['ごまい', 'いつつ', 'ごほん', 'ごこ'],
    answer: 0,
    explanation: 'まい compte les objets plats (feuilles, timbres, billets).',
  },
]
