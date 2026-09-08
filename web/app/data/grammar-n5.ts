/**
 * Banque de points de grammaire N5, rédigée à la main (français).
 *
 * Sert de référence consultable (`/grammaire`) et, plus tard, de source pour
 * les cartes SRS « phrase à trou » et le quiz. Les `id` sont stables et
 * préfixés par le palier : ne pas les renommer une fois publiés.
 */

export type GrammarCategory =
  | 'particules'
  | 'copule'
  | 'demonstratifs'
  | 'verbes'
  | 'adjectifs'
  | 'existence'
  | 'comparaison'
  | 'compteurs'
  | 'temps'
  | 'connecteurs'
  | 'expressions'

export interface GrammarExample {
  jp: string
  /** Lecture en kana, quand l'exemple contient des kanji. */
  lecture?: string
  fr: string
}

export interface GrammarPoint {
  /** Identifiant stable, préfixé par le palier (`n5-…`). */
  id: string
  palier: 'N5'
  categorie: GrammarCategory
  /** Titre court : la forme japonaise, puis une glose. */
  titre: string
  /** Structure formelle, ex. « N は N です ». */
  structure: string
  /** Glose d'une ligne. */
  sens: string
  /** Explication en quelques phrases. */
  explication: string
  exemples: GrammarExample[]
  /** Pièges, contrastes, erreurs fréquentes. */
  notes?: string[]
  /** Points liés (ids de cette même banque). */
  voirAussi?: string[]
}

export const CATEGORY_LABELS: Record<GrammarCategory, string> = {
  particules: 'Particules',
  copule: 'Copule et phrases nominales',
  demonstratifs: 'Démonstratifs et interrogatifs',
  verbes: 'Verbes',
  adjectifs: 'Adjectifs',
  existence: 'Existence et localisation',
  comparaison: 'Comparaison',
  compteurs: 'Nombres et compteurs',
  temps: 'Temps et fréquence',
  connecteurs: 'Connecteurs',
  expressions: 'Tournures usuelles',
}

/** Ordre d'affichage des catégories (progression pédagogique). */
export const CATEGORY_ORDER: GrammarCategory[] = [
  'copule',
  'particules',
  'demonstratifs',
  'verbes',
  'adjectifs',
  'existence',
  'temps',
  'compteurs',
  'comparaison',
  'connecteurs',
  'expressions',
]

export const GRAMMAR_N5: GrammarPoint[] = [
  // --- Particules ---------------------------------------------------------
  {
    id: 'n5-wa',
    palier: 'N5',
    categorie: 'particules',
    titre: 'は — le thème',
    structure: 'N は …',
    sens: 'Pose ce dont on parle : « en ce qui concerne N… »',
    explication:
      'は (prononcé « wa » quand c\'est une particule) marque le thème de la phrase : l\'élément déjà connu, celui dont on va dire quelque chose. Ce n\'est pas un marqueur de sujet grammatical — le thème peut être le sujet, le complément, un lieu, un moment.',
    exemples: [
      { jp: 'わたしは がくせいです。', fr: 'Moi, je suis étudiant.' },
      { jp: 'この本は おもしろいです。', lecture: 'このほんは おもしろいです。', fr: 'Ce livre est intéressant.' },
      { jp: 'きょうは いそがしいです。', fr: 'Aujourd\'hui, je suis occupé.' },
    ],
    notes: [
      'S\'écrit は mais se lit « wa » dans ce rôle.',
      'は remplace が et を : on ne dit jamais 「〜はが」 ni 「〜はを」.',
    ],
    voirAussi: ['n5-ga-sujet', 'n5-mo'],
  },
  {
    id: 'n5-ga-sujet',
    palier: 'N5',
    categorie: 'particules',
    titre: 'が — le sujet',
    structure: 'N が V',
    sens: 'Marque le sujet grammatical, souvent une information nouvelle',
    explication:
      'が marque le sujet. On l\'emploie quand l\'information est nouvelle ou qu\'on veut la mettre en avant, ainsi qu\'après les interrogatifs et avec ある / いる.',
    exemples: [
      { jp: 'ねこが います。', fr: 'Il y a un chat.' },
      { jp: 'だれが 来ましたか。', lecture: 'だれが きましたか。', fr: 'Qui est venu ?' },
      { jp: '雨が ふっています。', lecture: 'あめが ふっています。', fr: 'Il pleut.' },
    ],
    notes: [
      'Avec un interrogatif sujet (だれ, なに, どれ…), c\'est が, jamais は.',
      'La réponse garde が : 「田中さんが 来ました。」',
    ],
    voirAussi: ['n5-wa', 'n5-aru-iru', 'n5-ga-suki'],
  },
  {
    id: 'n5-wo',
    palier: 'N5',
    categorie: 'particules',
    titre: 'を — le complément d\'objet direct',
    structure: 'N を V',
    sens: 'Marque ce sur quoi porte l\'action',
    explication:
      'を marque l\'objet direct du verbe. Elle sert aussi à marquer le lieu qu\'on traverse ou qu\'on quitte avec les verbes de mouvement (出る, 歩く, わたる).',
    exemples: [
      { jp: 'パンを 食べます。', lecture: 'パンを たべます。', fr: 'Je mange du pain.' },
      { jp: '音楽を 聞きます。', lecture: 'おんがくを ききます。', fr: 'J\'écoute de la musique.' },
      { jp: '公園を 散歩します。', lecture: 'こうえんを さんぽします。', fr: 'Je me promène dans le parc.' },
    ],
    notes: ['Le kana を ne sert quasiment qu\'à cette particule ; il se lit « o ».'],
    voirAussi: ['n5-ga-suki'],
  },
  {
    id: 'n5-ni-temps',
    palier: 'N5',
    categorie: 'particules',
    titre: 'に — le moment précis',
    structure: 'moment に V',
    sens: 'Situe l\'action à une heure, une date, un jour',
    explication:
      'に marque un moment repérable sur le calendrier ou l\'horloge : heure, jour, date, mois, année. On ne la met pas devant les expressions de temps relatives (きょう, あした, まいにち…).',
    exemples: [
      { jp: '七時に おきます。', lecture: 'しちじに おきます。', fr: 'Je me lève à sept heures.' },
      { jp: '日曜日に 行きます。', lecture: 'にちようびに いきます。', fr: 'J\'y vais dimanche.' },
      { jp: '2020年に 生まれました。', lecture: 'にせんにじゅうねんに うまれました。', fr: 'Je suis né en 2020.' },
    ],
    notes: [
      'Pas de に avec : きょう, あした, きのう, まいにち, いま, らいねん…',
      'Optionnelle avec les parties de journée : 「あさ（に）おきます」.',
    ],
    voirAussi: ['n5-ni-lieu', 'n5-de-lieu'],
  },
  {
    id: 'n5-ni-lieu',
    palier: 'N5',
    categorie: 'particules',
    titre: 'に — destination et lieu d\'existence',
    structure: 'lieu に 行く / ある / いる',
    sens: 'Indique où l\'on va, ou bien où quelque chose se trouve',
    explication:
      'に marque le point d\'arrivée d\'un déplacement (行く, 来る, 帰る) et le lieu où quelque chose existe avec ある / いる. Elle marque aussi le destinataire (あげる, 教える, 電話する).',
    exemples: [
      { jp: '学校に 行きます。', lecture: 'がっこうに いきます。', fr: 'Je vais à l\'école.' },
      { jp: 'つくえの上に 本が あります。', lecture: 'つくえのうえに ほんが あります。', fr: 'Il y a un livre sur le bureau.' },
      { jp: '友だちに 電話します。', lecture: 'ともだちに でんわします。', fr: 'Je téléphone à un ami.' },
    ],
    notes: ['Lieu d\'existence → に ; lieu d\'une action → で. 「へやに います」 vs 「へやで 本を読みます」.'],
    voirAussi: ['n5-de-lieu', 'n5-he', 'n5-aru-iru'],
  },
  {
    id: 'n5-de-lieu',
    palier: 'N5',
    categorie: 'particules',
    titre: 'で — le lieu de l\'action',
    structure: 'lieu で V',
    sens: 'Indique où se déroule une action',
    explication:
      'で marque l\'endroit où l\'action a lieu. À distinguer de に, qui marque une destination ou un lieu d\'existence statique.',
    exemples: [
      { jp: '図書館で 本を 読みます。', lecture: 'としょかんで ほんを よみます。', fr: 'Je lis un livre à la bibliothèque.' },
      { jp: 'うちで ごはんを 作ります。', lecture: 'うちで ごはんを つくります。', fr: 'Je cuisine à la maison.' },
    ],
    notes: ['「としょかんに います」 (je suis à la bibliothèque) vs 「としょかんで 読みます」 (j\'y lis).'],
    voirAussi: ['n5-ni-lieu', 'n5-de-moyen'],
  },
  {
    id: 'n5-de-moyen',
    palier: 'N5',
    categorie: 'particules',
    titre: 'で — le moyen',
    structure: 'moyen で V',
    sens: 'Indique avec quoi / par quel moyen',
    explication:
      'で marque l\'instrument, le moyen de transport, la langue, la matière — bref, « au moyen de ».',
    exemples: [
      { jp: '電車で 行きます。', lecture: 'でんしゃで いきます。', fr: 'J\'y vais en train.' },
      { jp: 'はしで 食べます。', lecture: 'はしで たべます。', fr: 'Je mange avec des baguettes.' },
      { jp: '日本語で 話します。', lecture: 'にほんごで はなします。', fr: 'Je parle en japonais.' },
    ],
    notes: ['À pied se dit あるいて, pas 「あしで」.'],
    voirAussi: ['n5-de-lieu'],
  },
  {
    id: 'n5-he',
    palier: 'N5',
    categorie: 'particules',
    titre: 'へ — la direction',
    structure: 'lieu へ V(mouvement)',
    sens: 'Indique vers où l\'on se dirige',
    explication:
      'へ (prononcé « e » comme particule) marque la direction d\'un déplacement. Dans la plupart des phrases N5 elle est interchangeable avec に ; へ insiste sur le trajet, に sur l\'arrivée.',
    exemples: [
      { jp: '日本へ 行きたいです。', lecture: 'にほんへ いきたいです。', fr: 'Je veux aller au Japon.' },
      { jp: 'うちへ 帰ります。', lecture: 'うちへ かえります。', fr: 'Je rentre à la maison.' },
    ],
    notes: ['S\'écrit へ mais se lit « e » dans ce rôle.'],
    voirAussi: ['n5-ni-lieu'],
  },
  {
    id: 'n5-to-et',
    palier: 'N5',
    categorie: 'particules',
    titre: 'と — « et » (liste close) / « avec »',
    structure: 'N と N ／ N と V',
    sens: 'Relie des noms de façon exhaustive, ou marque l\'accompagnement',
    explication:
      'と relie des noms en donnant une liste complète (« A et B, c\'est tout »). Devant un verbe, elle marque la personne avec qui on fait l\'action.',
    exemples: [
      { jp: 'パンと たまごを 買いました。', lecture: 'パンと たまごを かいました。', fr: 'J\'ai acheté du pain et des œufs.' },
      { jp: '友だちと 映画を 見ました。', lecture: 'ともだちと えいがを みました。', fr: 'J\'ai vu un film avec un ami.' },
    ],
    notes: ['Pour une liste non exhaustive (« entre autres »), c\'est や.'],
    voirAussi: ['n5-ya'],
  },
  {
    id: 'n5-ya',
    palier: 'N5',
    categorie: 'particules',
    titre: 'や — « et » (liste ouverte)',
    structure: 'N や N（など）',
    sens: 'Cite quelques exemples parmi d\'autres',
    explication:
      'や relie des noms en sous-entendant que la liste n\'est pas complète. On la renforce souvent avec など (« etc. ») à la fin.',
    exemples: [
      { jp: 'つくえの上に 本や ノートが あります。', lecture: 'つくえのうえに ほんや ノートが あります。', fr: 'Sur le bureau il y a des livres, des cahiers (entre autres).' },
      { jp: 'りんごや みかんなどを 買います。', lecture: 'りんごや みかんなどを かいます。', fr: 'J\'achète des pommes, des mandarines, etc.' },
    ],
    voirAussi: ['n5-to-et'],
  },
  {
    id: 'n5-mo',
    palier: 'N5',
    categorie: 'particules',
    titre: 'も — « aussi »',
    structure: 'N も …',
    sens: 'Ajoute un élément à ce qui vient d\'être dit',
    explication:
      'も signifie « aussi, également ». Elle remplace は, が et を (jamais 「はも」 ni 「をも」). Après une négation, elle donne « non plus ».',
    exemples: [
      { jp: 'わたしは 学生です。かれも 学生です。', lecture: 'わたしは がくせいです。かれも がくせいです。', fr: 'Je suis étudiant. Lui aussi est étudiant.' },
      { jp: 'コーヒーも 飲みません。', lecture: 'コーヒーも のみません。', fr: 'Je ne bois pas de café non plus.' },
    ],
    notes: ['Se combine avec に, で, と : 「学校にも 行きます」.'],
    voirAussi: ['n5-wa'],
  },
  {
    id: 'n5-no-lien',
    palier: 'N5',
    categorie: 'particules',
    titre: 'の — le lien entre deux noms',
    structure: 'N の N',
    sens: 'Possession, appartenance, qualification',
    explication:
      'の relie deux noms : le premier précise le second. Elle couvre la possession (« de »), l\'appartenance, l\'origine, la matière — bien plus large que le « de » français.',
    exemples: [
      { jp: 'わたしの かさ', fr: 'mon parapluie' },
      { jp: '日本語の 本', lecture: 'にほんごの ほん', fr: 'un livre de japonais' },
      { jp: '大学の 先生', lecture: 'だいがくの せんせい', fr: 'un professeur d\'université' },
    ],
    notes: ['L\'ordre est inverse du français : le déterminant vient en premier.'],
    voirAussi: ['n5-no-pronom'],
  },
  {
    id: 'n5-no-pronom',
    palier: 'N5',
    categorie: 'particules',
    titre: 'の — pronom (« celui de… »)',
    structure: 'A の',
    sens: 'Remplace un nom déjà connu',
    explication:
      'Quand le nom est évident d\'après le contexte, の peut le remplacer entièrement : 「わたしの」 = « le mien ».',
    exemples: [
      { jp: 'このかさは わたしのです。', fr: 'Ce parapluie est le mien.' },
      { jp: '赤いのを ください。', lecture: 'あかいのを ください。', fr: 'Donnez-moi le rouge.' },
    ],
    voirAussi: ['n5-no-lien'],
  },
  {
    id: 'n5-kara-made',
    palier: 'N5',
    categorie: 'particules',
    titre: 'から / まで — de… à…',
    structure: 'A から B まで',
    sens: 'Borne un trajet ou une durée',
    explication:
      'から marque le point de départ (lieu ou moment), まで le point d\'arrivée. Les deux s\'emploient ensemble ou séparément.',
    exemples: [
      { jp: '九時から 五時まで はたらきます。', lecture: 'くじから ごじまで はたらきます。', fr: 'Je travaille de neuf heures à cinq heures.' },
      { jp: 'うちから 駅まで あるきます。', lecture: 'うちから えきまで あるきます。', fr: 'Je marche de chez moi jusqu\'à la gare.' },
    ],
    voirAussi: ['n5-kara-cause'],
  },
  {
    id: 'n5-ka-question',
    palier: 'N5',
    categorie: 'particules',
    titre: 'か — la question',
    structure: '… です か。',
    sens: 'Transforme une affirmation en question',
    explication:
      'か en fin de phrase suffit à poser une question : l\'ordre des mots ne change pas. À l\'écrit, on met souvent un point 。 plutôt qu\'un point d\'interrogation.',
    exemples: [
      { jp: '学生ですか。', lecture: 'がくせいですか。', fr: 'Êtes-vous étudiant ?' },
      { jp: 'コーヒーを 飲みますか。', lecture: 'コーヒーを のみますか。', fr: 'Buvez-vous du café ?' },
    ],
    notes: ['Entre deux noms, か signifie « ou » : 「コーヒーか お茶」.'],
    voirAussi: ['n5-interrogatifs'],
  },
  {
    id: 'n5-ne-yo',
    palier: 'N5',
    categorie: 'particules',
    titre: 'ね / よ — les particules finales',
    structure: '… ね。／ … よ。',
    sens: 'ね cherche l\'accord, よ apporte une information',
    explication:
      'ね sollicite l\'accord de l\'interlocuteur (« n\'est-ce pas ? »). よ signale une information que l\'autre n\'a pas. Les omettre n\'est pas faux, mais le japonais sonne plat.',
    exemples: [
      { jp: 'いい天気ですね。', lecture: 'いいてんきですね。', fr: 'Il fait beau, n\'est-ce pas ?' },
      { jp: 'この店は 安いですよ。', lecture: 'このみせは やすいですよ。', fr: 'Ce magasin est bon marché, tu sais.' },
    ],
  },

  // --- Copule et phrases nominales ----------------------------------------
  {
    id: 'n5-desu',
    palier: 'N5',
    categorie: 'copule',
    titre: 'です — « être » (poli)',
    structure: 'N は N です。',
    sens: 'Relie deux noms : A est B',
    explication:
      'です est la copule polie. Elle se place en fin de phrase après un nom ou un adjectif. Le japonais n\'a pas d\'article : 「学生です」 peut vouloir dire « je suis étudiant » comme « c\'est un étudiant », selon le contexte.',
    exemples: [
      { jp: 'わたしは フランス人です。', lecture: 'わたしは フランスじんです。', fr: 'Je suis français.' },
      { jp: 'これは 本です。', lecture: 'これは ほんです。', fr: 'Ceci est un livre.' },
    ],
    notes: ['La forme neutre correspondante est だ, à réserver à l\'oral familier.'],
    voirAussi: ['n5-dewa-arimasen', 'n5-deshita'],
  },
  {
    id: 'n5-dewa-arimasen',
    palier: 'N5',
    categorie: 'copule',
    titre: 'じゃありません — négation de です',
    structure: 'N は N じゃありません。',
    sens: 'A n\'est pas B',
    explication:
      'La négation polie de です est ではありません, contractée en じゃありません à l\'oral. La forme en じゃ est la plus courante en conversation.',
    exemples: [
      { jp: 'わたしは 学生じゃありません。', lecture: 'わたしは がくせいじゃありません。', fr: 'Je ne suis pas étudiant.' },
      { jp: 'これは わたしのじゃありません。', fr: 'Ce n\'est pas à moi.' },
    ],
    notes: ['ではありません est plus formel (écrit, discours) ; じゃありません est neutre-poli courant.'],
    voirAussi: ['n5-desu'],
  },
  {
    id: 'n5-deshita',
    palier: 'N5',
    categorie: 'copule',
    titre: 'でした — passé de です',
    structure: 'N は N でした。',
    sens: 'A était B',
    explication:
      'Le passé poli de です est でした ; sa négation est じゃありませんでした.',
    exemples: [
      { jp: 'きのうは 休みでした。', lecture: 'きのうは やすみでした。', fr: 'Hier c\'était congé.' },
      { jp: 'テストは かんたんじゃありませんでした。', fr: 'Le test n\'était pas facile.' },
    ],
    voirAussi: ['n5-desu', 'n5-dewa-arimasen'],
  },

  // --- Démonstratifs et interrogatifs -------------------------------------
  {
    id: 'n5-kore-sore-are',
    palier: 'N5',
    categorie: 'demonstratifs',
    titre: 'これ・それ・あれ — ceci, cela',
    structure: 'これ／それ／あれ は …',
    sens: 'Désigne un objet selon sa distance',
    explication:
      'Système à trois termes, réglé sur la position des interlocuteurs : これ près de moi, それ près de toi, あれ loin de nous deux. どれ est l\'interrogatif (« lequel ? »). Ces mots remplacent le nom, ils ne l\'accompagnent pas.',
    exemples: [
      { jp: 'これは 何ですか。', lecture: 'これは なんですか。', fr: 'Qu\'est-ce que c\'est (près de moi) ?' },
      { jp: 'それは わたしのかばんです。', fr: 'Ça (près de toi), c\'est mon sac.' },
      { jp: 'あれは 学校です。', lecture: 'あれは がっこうです。', fr: 'Ça, là-bas, c\'est l\'école.' },
    ],
    notes: ['Pour accompagner un nom, il faut この／その／あの.'],
    voirAussi: ['n5-kono-sono-ano', 'n5-koko-soko-asoko'],
  },
  {
    id: 'n5-kono-sono-ano',
    palier: 'N5',
    categorie: 'demonstratifs',
    titre: 'この・その・あの — ce… -ci / -là',
    structure: 'この／その／あの ＋ N',
    sens: 'Détermine un nom selon la distance',
    explication:
      'Même logique de distance que これ／それ／あれ, mais ces formes se placent obligatoirement devant un nom. L\'interrogatif est どの (« quel ? »).',
    exemples: [
      { jp: 'この本は おもしろいです。', lecture: 'このほんは おもしろいです。', fr: 'Ce livre(-ci) est intéressant.' },
      { jp: 'あの人は だれですか。', lecture: 'あのひとは だれですか。', fr: 'Qui est cette personne là-bas ?' },
    ],
    notes: ['Erreur fréquente : 「これ本」. Il faut 「この本」.'],
    voirAussi: ['n5-kore-sore-are'],
  },
  {
    id: 'n5-koko-soko-asoko',
    palier: 'N5',
    categorie: 'demonstratifs',
    titre: 'ここ・そこ・あそこ — ici, là, là-bas',
    structure: 'ここ／そこ／あそこ は …',
    sens: 'Désigne un lieu selon la distance',
    explication:
      'Série des lieux : ここ ici (près de moi), そこ là (près de toi), あそこ là-bas, どこ où. Noter l\'irrégularité de あそこ (et non 「あこ」).',
    exemples: [
      { jp: 'トイレは どこですか。', fr: 'Où sont les toilettes ?' },
      { jp: '駅は あそこです。', lecture: 'えきは あそこです。', fr: 'La gare est là-bas.' },
    ],
    voirAussi: ['n5-kore-sore-are', 'n5-interrogatifs'],
  },
  {
    id: 'n5-interrogatifs',
    palier: 'N5',
    categorie: 'demonstratifs',
    titre: 'Les mots interrogatifs',
    structure: '何 / だれ / どこ / いつ / どう / いくら …',
    sens: 'Quoi, qui, où, quand, comment, combien',
    explication:
      'L\'interrogatif se met à la place de l\'élément questionné : l\'ordre des mots ne bouge pas. La phrase se termine par か. 何 se lit なに devant une pause, なん devant です et les compteurs.',
    exemples: [
      { jp: 'これは 何ですか。', lecture: 'これは なんですか。', fr: 'Qu\'est-ce que c\'est ?' },
      { jp: 'いつ 来ますか。', lecture: 'いつ きますか。', fr: 'Quand viens-tu ?' },
      { jp: 'いくらですか。', fr: 'Combien ça coûte ?' },
      { jp: 'どうして 来ませんでしたか。', lecture: 'どうして きませんでしたか。', fr: 'Pourquoi n\'es-tu pas venu ?' },
    ],
    notes: ['Le sujet interrogatif prend が, pas は : 「だれが 来ましたか」.'],
    voirAussi: ['n5-ka-question', 'n5-ga-sujet'],
  },

  // --- Verbes -------------------------------------------------------------
  {
    id: 'n5-groupes-verbes',
    palier: 'N5',
    categorie: 'verbes',
    titre: 'Les trois groupes de verbes',
    structure: 'ichidan / godan / irréguliers',
    sens: 'La classification qui commande toutes les conjugaisons',
    explication:
      'Les verbes ichidan (groupe 2) finissent par -iru ou -eru et perdent simplement る : 食べる → 食べます. Les godan (groupe 1) changent la voyelle finale : 書く → 書きます. Deux irréguliers seulement : する → します, 来る → きます. Attention aux faux ichidan (帰る, 入る, 走る… sont godan).',
    exemples: [
      { jp: '食べる → 食べます', lecture: 'たべる → たべます', fr: 'manger (ichidan)' },
      { jp: '書く → 書きます', lecture: 'かく → かきます', fr: 'écrire (godan)' },
      { jp: '来る → きます', lecture: 'くる → きます', fr: 'venir (irrégulier)' },
    ],
    notes: ['帰る（かえる）est godan malgré sa finale : 帰ります, pas 「帰えます」.'],
    voirAussi: ['n5-masu', 'n5-te-forme'],
  },
  {
    id: 'n5-masu',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜ます — présent poli',
    structure: 'base ます ＋ ます',
    sens: 'Action habituelle ou à venir, registre poli',
    explication:
      'La forme en ます couvre le présent et le futur : le contexte tranche. C\'est le registre standard pour parler à quelqu\'un qu\'on ne tutoie pas.',
    exemples: [
      { jp: '毎日 本を 読みます。', lecture: 'まいにち ほんを よみます。', fr: 'Je lis un livre tous les jours.' },
      { jp: 'あした 東京に 行きます。', lecture: 'あした とうきょうに いきます。', fr: 'Demain je vais à Tokyo.' },
    ],
    voirAussi: ['n5-masen', 'n5-mashita', 'n5-groupes-verbes'],
  },
  {
    id: 'n5-masen',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜ません — négation polie',
    structure: 'base ます ＋ ません',
    sens: 'Ne fait pas / ne fera pas',
    explication:
      'On remplace ます par ません. La base reste la même : 行きます → 行きません.',
    exemples: [
      { jp: '朝ごはんを 食べません。', lecture: 'あさごはんを たべません。', fr: 'Je ne prends pas de petit-déjeuner.' },
      { jp: 'きょうは 学校に 行きません。', lecture: 'きょうは がっこうに いきません。', fr: 'Aujourd\'hui je ne vais pas à l\'école.' },
    ],
    notes: ['Erreur fréquente : 「行かません」. La base ます de 行く est 行き, donc 行きません.'],
    voirAussi: ['n5-masu'],
  },
  {
    id: 'n5-mashita',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜ました / 〜ませんでした — passé poli',
    structure: 'base ます ＋ ました / ませんでした',
    sens: 'A fait / n\'a pas fait',
    explication:
      'ます → ました pour l\'affirmatif passé, ません → ませんでした pour le négatif passé.',
    exemples: [
      { jp: 'きのう 映画を 見ました。', lecture: 'きのう えいがを みました。', fr: 'Hier j\'ai vu un film.' },
      { jp: '何も 買いませんでした。', lecture: 'なにも かいませんでした。', fr: 'Je n\'ai rien acheté.' },
    ],
    voirAussi: ['n5-masu', 'n5-masen'],
  },
  {
    id: 'n5-te-forme',
    palier: 'N5',
    categorie: 'verbes',
    titre: 'La forme en て',
    structure: 'V-て',
    sens: 'La forme pivot : enchaînement, demande, aspect',
    explication:
      'La forme en て ne porte ni temps ni politesse : elle sert de socle à de nombreuses tournures. Ichidan : る → て (食べて). Godan : selon la finale — く→いて, ぐ→いで, む/ぶ/ぬ→んで, う/つ/る→って, す→して. Irréguliers : して, きて. Exception : 行く → 行って.',
    exemples: [
      { jp: '朝 起きて、ごはんを 食べます。', lecture: 'あさ おきて、ごはんを たべます。', fr: 'Le matin je me lève et je mange.' },
      { jp: '書いて ください。', lecture: 'かいて ください。', fr: 'Écrivez, s\'il vous plaît.' },
    ],
    notes: ['行く est irrégulier en て : 行って (et non 「行いて」).'],
    voirAussi: ['n5-te-kudasai', 'n5-te-imasu', 'n5-te-mo-ii'],
  },
  {
    id: 'n5-te-kudasai',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜てください — demande polie',
    structure: 'V-て ＋ ください',
    sens: 'Veuillez faire…',
    explication:
      'Formule standard pour demander quelque chose poliment. Pour demander de ne pas faire, on emploie la forme en ない : 〜ないでください.',
    exemples: [
      { jp: 'ちょっと 待って ください。', lecture: 'ちょっと まって ください。', fr: 'Attendez un instant, s\'il vous plaît.' },
      { jp: 'ここに 名前を 書いて ください。', lecture: 'ここに なまえを かいて ください。', fr: 'Écrivez votre nom ici.' },
    ],
    voirAussi: ['n5-te-forme', 'n5-nai-de-kudasai'],
  },
  {
    id: 'n5-te-imasu',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜ています — action en cours / état',
    structure: 'V-て ＋ います',
    sens: 'Est en train de… / est dans l\'état de…',
    explication:
      'Deux valeurs selon le verbe. Avec un verbe d\'action : « être en train de ». Avec un verbe de changement d\'état (結婚する, 住む, 知る), le résultat persiste : 「結婚しています」 = « je suis marié », pas « je suis en train de me marier ».',
    exemples: [
      { jp: 'いま ごはんを 食べています。', lecture: 'いま ごはんを たべています。', fr: 'Je suis en train de manger.' },
      { jp: '東京に 住んでいます。', lecture: 'とうきょうに すんでいます。', fr: 'J\'habite à Tokyo.' },
    ],
    notes: ['À l\'oral on contracte souvent en 〜てます.'],
    voirAussi: ['n5-te-forme'],
  },
  {
    id: 'n5-te-mo-ii',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜てもいいです — permission',
    structure: 'V-て ＋ もいいです',
    sens: 'On peut… / c\'est permis de…',
    explication:
      'Sert à demander ou accorder une permission. En question : 「〜てもいいですか」.',
    exemples: [
      { jp: 'ここで 写真を とっても いいですか。', lecture: 'ここで しゃしんを とっても いいですか。', fr: 'Puis-je prendre des photos ici ?' },
      { jp: '帰っても いいですよ。', lecture: 'かえっても いいですよ。', fr: 'Tu peux rentrer.' },
    ],
    voirAussi: ['n5-te-forme', 'n5-te-wa-ikemasen'],
  },
  {
    id: 'n5-te-wa-ikemasen',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜てはいけません — interdiction',
    structure: 'V-て ＋ はいけません',
    sens: 'Il ne faut pas… / c\'est interdit',
    explication:
      'Interdiction ferme. À l\'oral, ては se contracte souvent en ちゃ : 「食べちゃいけません」.',
    exemples: [
      { jp: 'ここで たばこを すっては いけません。', fr: 'Il est interdit de fumer ici.' },
      { jp: '入っては いけません。', lecture: 'はいっては いけません。', fr: 'Défense d\'entrer.' },
    ],
    voirAussi: ['n5-te-mo-ii'],
  },
  {
    id: 'n5-nai-forme',
    palier: 'N5',
    categorie: 'verbes',
    titre: 'La forme en ない',
    structure: 'V-ない',
    sens: 'Négation neutre',
    explication:
      'Négation de la forme neutre. Ichidan : る → ない (食べない). Godan : la voyelle finale passe en -a puis ない (書く → 書かない) ; les verbes en う donnent わない (買う → 買わない). する → しない, 来る → こない. Irrégulier : ある → ない.',
    exemples: [
      { jp: '肉を 食べない。', lecture: 'にくを たべない。', fr: 'Je ne mange pas de viande.' },
      { jp: 'お金が ない。', lecture: 'おかねが ない。', fr: 'Je n\'ai pas d\'argent.' },
    ],
    notes: ['買う → 買わない, et non 「買あない」.'],
    voirAussi: ['n5-nai-de-kudasai', 'n5-nakereba'],
  },
  {
    id: 'n5-nai-de-kudasai',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜ないでください — demande négative',
    structure: 'V-ない ＋ でください',
    sens: 'Veuillez ne pas…',
    explication: 'Pendant négatif de 〜てください.',
    exemples: [
      { jp: 'ここに 車を とめないで ください。', lecture: 'ここに くるまを とめないで ください。', fr: 'Ne garez pas votre voiture ici.' },
      { jp: '心配しないで ください。', lecture: 'しんぱいしないで ください。', fr: 'Ne vous inquiétez pas.' },
    ],
    voirAussi: ['n5-nai-forme', 'n5-te-kudasai'],
  },
  {
    id: 'n5-nakereba',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜なければなりません — obligation',
    structure: 'V-ない（→なければ）＋ なりません',
    sens: 'Il faut / on doit…',
    explication:
      'On remplace le ない final par なければ, puis なりません. Variante courante à l\'oral : 〜なきゃ. Synonyme fréquent : 〜ないといけません.',
    exemples: [
      { jp: '毎日 勉強しなければ なりません。', lecture: 'まいにち べんきょうしなければ なりません。', fr: 'Je dois étudier tous les jours.' },
      { jp: '八時に 行かなければ なりません。', lecture: 'はちじに いかなければ なりません。', fr: 'Je dois y aller à huit heures.' },
    ],
    voirAussi: ['n5-nai-forme'],
  },
  {
    id: 'n5-tai',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜たい — l\'envie',
    structure: 'base ます ＋ たい',
    sens: 'Vouloir faire quelque chose',
    explication:
      'S\'ajoute à la base ます et se comporte ensuite comme un adjectif en い (たかった, たくない). L\'objet peut prendre が au lieu de を. Ne s\'emploie pas pour parler du désir d\'un tiers.',
    exemples: [
      { jp: 'すしを 食べたいです。', lecture: 'すしを たべたいです。', fr: 'Je veux manger des sushis.' },
      { jp: '日本に 行きたかったです。', lecture: 'にほんに いきたかったです。', fr: 'Je voulais aller au Japon.' },
    ],
    notes: ['Pour une tierce personne : 〜たがっている.'],
    voirAussi: ['n5-hoshii', 'n5-adj-i'],
  },
  {
    id: 'n5-mashou',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜ましょう / 〜ませんか — proposer',
    structure: 'base ます ＋ ましょう / ませんか',
    sens: 'Allons-y / on y va ?',
    explication:
      'ましょう propose une action commune (« faisons… »). ませんか est une invitation plus douce (« vous ne voudriez pas… ? »). ましょうか offre un service (« je le fais ? »).',
    exemples: [
      { jp: 'いっしょに 行きましょう。', lecture: 'いっしょに いきましょう。', fr: 'Allons-y ensemble.' },
      { jp: 'お茶を 飲みませんか。', lecture: 'おちゃを のみませんか。', fr: 'Et si on prenait un thé ?' },
      { jp: '手伝いましょうか。', lecture: 'てつだいましょうか。', fr: 'Je vous aide ?' },
    ],
    voirAussi: ['n5-masu'],
  },
  {
    id: 'n5-koto-ga-dekiru',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜ことができます — la capacité',
    structure: 'V-dictionnaire ＋ ことができます',
    sens: 'Pouvoir / savoir faire',
    explication:
      'Tournure analytique pour exprimer la capacité, à partir de la forme du dictionnaire. Avec un nom, on emploie 「N が できます」.',
    exemples: [
      { jp: '日本語を 話すことが できます。', lecture: 'にほんごを はなすことが できます。', fr: 'Je sais parler japonais.' },
      { jp: 'ピアノが できます。', fr: 'Je sais jouer du piano.' },
    ],
    notes: ['Le japonais courant préfère souvent la forme potentielle (話せます), vue au N4.'],
    voirAussi: ['n5-groupes-verbes'],
  },

  // --- Adjectifs ----------------------------------------------------------
  {
    id: 'n5-adj-i',
    palier: 'N5',
    categorie: 'adjectifs',
    titre: 'Les adjectifs en い',
    structure: 'Adj-い ＋ N ／ … Adj-い です',
    sens: 'Adjectifs qui se conjuguent eux-mêmes',
    explication:
      'Ils se placent directement devant le nom et portent le temps et la négation. です ne fait qu\'ajouter la politesse — il ne se conjugue pas ici.',
    exemples: [
      { jp: '高い 本', lecture: 'たかい ほん', fr: 'un livre cher' },
      { jp: 'この本は 高いです。', lecture: 'このほんは たかいです。', fr: 'Ce livre est cher.' },
    ],
    notes: ['きれい, ゆうめい, きらい finissent par い mais sont des adjectifs en な.'],
    voirAussi: ['n5-adj-i-neg', 'n5-adj-na'],
  },
  {
    id: 'n5-adj-i-neg',
    palier: 'N5',
    categorie: 'adjectifs',
    titre: 'Adjectifs en い — négation et passé',
    structure: 'Adj(-い) ＋ くない / かった / くなかった',
    sens: 'N\'est pas… / était… / n\'était pas…',
    explication:
      'On retire le い final et on ajoute la terminaison : 高い → 高くない, 高かった, 高くなかった. En registre poli on garde です après, ou on emploie 〜くありません. Irrégulier : いい → よくない, よかった.',
    exemples: [
      { jp: 'この本は 高くないです。', lecture: 'このほんは たかくないです。', fr: 'Ce livre n\'est pas cher.' },
      { jp: 'テストは むずかしかったです。', fr: 'Le test était difficile.' },
      { jp: '天気が よくなかったです。', lecture: 'てんきが よくなかったです。', fr: 'Le temps n\'était pas bon.' },
    ],
    notes: ['いい se conjugue sur よい : 「いくない」 est faux.'],
    voirAussi: ['n5-adj-i'],
  },
  {
    id: 'n5-adj-na',
    palier: 'N5',
    categorie: 'adjectifs',
    titre: 'Les adjectifs en な',
    structure: 'Adj-な ＋ N ／ … Adj です',
    sens: 'Adjectifs qui s\'appuient sur la copule',
    explication:
      'Ils prennent な devant un nom, mais rien devant です. C\'est la copule qui porte le temps et la négation : 静かです → 静かじゃありません → 静かでした.',
    exemples: [
      { jp: '静かな へや', lecture: 'しずかな へや', fr: 'une pièce calme' },
      { jp: 'この へやは 静かです。', lecture: 'この へやは しずかです。', fr: 'Cette pièce est calme.' },
      { jp: 'あまり 静かじゃありません。', lecture: 'あまり しずかじゃありません。', fr: 'Ce n\'est pas très calme.' },
    ],
    notes: ['Erreur fréquente : 「静かなです」. Devant です, pas de な.'],
    voirAussi: ['n5-adj-i', 'n5-desu'],
  },
  {
    id: 'n5-adj-relier',
    palier: 'N5',
    categorie: 'adjectifs',
    titre: 'Enchaîner deux adjectifs — くて / で',
    structure: 'Adj(-い)くて ＋ Adj ／ Adj-な で ＋ Adj',
    sens: 'Relie deux qualités : « … et … »',
    explication:
      'Adjectif en い : い → くて. Adjectif en な : on ajoute で. On ne relie pas deux adjectifs avec そして à l\'intérieur d\'une même phrase.',
    exemples: [
      { jp: 'この部屋は 広くて 明るいです。', lecture: 'このへやは ひろくて あかるいです。', fr: 'Cette pièce est grande et lumineuse.' },
      { jp: 'かのじょは きれいで やさしいです。', fr: 'Elle est jolie et gentille.' },
    ],
    notes: ['いい → よくて.'],
    voirAussi: ['n5-adj-i', 'n5-adj-na'],
  },
  {
    id: 'n5-adj-adverbe',
    palier: 'N5',
    categorie: 'adjectifs',
    titre: 'Adjectif → adverbe (く / に)',
    structure: 'Adj(-い)く ＋ V ／ Adj-な に ＋ V',
    sens: 'Modifie le verbe : « … -ment »',
    explication:
      'Adjectif en い : い → く. Adjectif en な : on ajoute に. La forme obtenue modifie le verbe.',
    exemples: [
      { jp: '早く 起きます。', lecture: 'はやく おきます。', fr: 'Je me lève tôt.' },
      { jp: '静かに 話して ください。', lecture: 'しずかに はなして ください。', fr: 'Parlez doucement.' },
    ],
    voirAussi: ['n5-naru'],
  },
  {
    id: 'n5-naru',
    palier: 'N5',
    categorie: 'adjectifs',
    titre: '〜くなる / 〜になる — le changement',
    structure: 'Adj(-い)く ／ Adj-な に ／ N に ＋ なる',
    sens: 'Devenir…',
    explication:
      'なる exprime le passage à un nouvel état. Il se construit sur la forme adverbiale de l\'adjectif, ou sur に après un nom.',
    exemples: [
      { jp: '寒く なりました。', lecture: 'さむく なりました。', fr: 'Il a fait froid (c\'est devenu froid).' },
      { jp: '元気に なりました。', lecture: 'げんきに なりました。', fr: 'Je me suis rétabli.' },
      { jp: '先生に なりたいです。', lecture: 'せんせいに なりたいです。', fr: 'Je veux devenir professeur.' },
    ],
    voirAussi: ['n5-adj-adverbe'],
  },

  // --- Existence et localisation ------------------------------------------
  {
    id: 'n5-aru-iru',
    palier: 'N5',
    categorie: 'existence',
    titre: 'あります / います — il y a',
    structure: '場所に N が あります／います',
    sens: 'Exprime l\'existence ou la présence',
    explication:
      'います pour les êtres animés (personnes, animaux), あります pour tout le reste — objets, plantes, événements. Ce qui existe prend が, le lieu prend に.',
    exemples: [
      { jp: '部屋に ねこが います。', lecture: 'へやに ねこが います。', fr: 'Il y a un chat dans la pièce.' },
      { jp: 'つくえの上に 本が あります。', lecture: 'つくえのうえに ほんが あります。', fr: 'Il y a un livre sur le bureau.' },
      { jp: 'あした テストが あります。', fr: 'Demain il y a un test.' },
    ],
    notes: ['Négations : ありません / いません.'],
    voirAussi: ['n5-ni-lieu', 'n5-ga-sujet', 'n5-positions'],
  },
  {
    id: 'n5-positions',
    palier: 'N5',
    categorie: 'existence',
    titre: 'Les mots de position',
    structure: 'N の 上/下/中/前/後ろ/となり/そば に',
    sens: 'Sur, sous, dans, devant, derrière, à côté',
    explication:
      'Ce sont des noms, pas des prépositions : ils se relient au nom précédent par の et prennent ensuite に ou で. Ordre inverse du français.',
    exemples: [
      { jp: 'いすの 下に かばんが あります。', lecture: 'いすの したに かばんが あります。', fr: 'Il y a un sac sous la chaise.' },
      { jp: '駅の となりに コンビニが あります。', lecture: 'えきの となりに コンビニが あります。', fr: 'Il y a une supérette à côté de la gare.' },
    ],
    voirAussi: ['n5-aru-iru', 'n5-no-lien'],
  },

  // --- Temps et fréquence --------------------------------------------------
  {
    id: 'n5-toki',
    palier: 'N5',
    categorie: 'temps',
    titre: '〜とき — quand…',
    structure: 'V-dictionnaire / Adj / N の ＋ とき',
    sens: 'Situe une action dans le temps par rapport à une autre',
    explication:
      'とき est un nom (« moment ») : ce qui le précède le qualifie. Le temps de la subordonnée est relatif à la principale — verbe au dictionnaire pour « avant/pendant », au passé pour « après ».',
    exemples: [
      { jp: '子どもの とき、よく 泳ぎました。', lecture: 'こどもの とき、よく およぎました。', fr: 'Quand j\'étais enfant, je nageais souvent.' },
      { jp: '日本に 行くとき、カメラを 買います。', lecture: 'にほんに いくとき、カメラを かいます。', fr: 'Quand j\'irai au Japon (avant d\'y être), j\'achèterai un appareil photo.' },
    ],
    voirAussi: ['n5-mae-ni', 'n5-ato-de'],
  },
  {
    id: 'n5-mae-ni',
    palier: 'N5',
    categorie: 'temps',
    titre: '〜前に — avant de…',
    structure: 'V-dictionnaire / N の ＋ 前に',
    sens: 'L\'action a lieu avant une autre',
    explication:
      'Le verbe reste toujours à la forme du dictionnaire devant 前に, même si la phrase est au passé.',
    exemples: [
      { jp: '寝る前に 歯を みがきます。', lecture: 'ねるまえに はを みがきます。', fr: 'Je me brosse les dents avant de dormir.' },
      { jp: '食事の前に 手を あらいます。', lecture: 'しょくじのまえに てを あらいます。', fr: 'Je me lave les mains avant le repas.' },
    ],
    voirAussi: ['n5-ato-de', 'n5-toki'],
  },
  {
    id: 'n5-ato-de',
    palier: 'N5',
    categorie: 'temps',
    titre: '〜あとで — après avoir…',
    structure: 'V-た / N の ＋ あとで',
    sens: 'L\'action a lieu après une autre',
    explication:
      'Le verbe est obligatoirement à la forme neutre passée (た) devant あとで. Avec un nom, on relie par の.',
    exemples: [
      { jp: '食べたあとで 散歩します。', lecture: 'たべたあとで さんぽします。', fr: 'Après avoir mangé, je me promène.' },
      { jp: '仕事のあとで 会いましょう。', lecture: 'しごとのあとで あいましょう。', fr: 'Retrouvons-nous après le travail.' },
    ],
    voirAussi: ['n5-mae-ni'],
  },
  {
    id: 'n5-mada-mou',
    palier: 'N5',
    categorie: 'temps',
    titre: 'まだ / もう — encore, déjà',
    structure: 'まだ … ／ もう …',
    sens: 'Pas encore / déjà fait',
    explication:
      'もう + passé = « déjà ». まだ + négation = « pas encore » ; la réponse type est 「まだです」. まだ + affirmatif = « encore, toujours ».',
    exemples: [
      { jp: 'もう 食べました。', lecture: 'もう たべました。', fr: 'J\'ai déjà mangé.' },
      { jp: 'まだ 食べていません。', lecture: 'まだ たべていません。', fr: 'Je n\'ai pas encore mangé.' },
      { jp: 'まだ 学生です。', lecture: 'まだ がくせいです。', fr: 'Je suis encore étudiant.' },
    ],
    voirAussi: ['n5-te-imasu'],
  },
  {
    id: 'n5-frequence',
    palier: 'N5',
    categorie: 'temps',
    titre: 'Les adverbes de fréquence',
    structure: 'いつも / よく / ときどき / あまり〜ない / ぜんぜん〜ない',
    sens: 'Toujours, souvent, parfois, rarement, jamais',
    explication:
      'Ils se placent avant le verbe. あまり et ぜんぜん appellent obligatoirement une négation : « pas beaucoup » et « pas du tout ».',
    exemples: [
      { jp: 'よく 映画を 見ます。', lecture: 'よく えいがを みます。', fr: 'Je regarde souvent des films.' },
      { jp: 'あまり テレビを 見ません。', lecture: 'あまり テレビを みません。', fr: 'Je ne regarde pas beaucoup la télévision.' },
      { jp: 'ぜんぜん わかりません。', fr: 'Je ne comprends pas du tout.' },
    ],
    notes: ['「あまり 見ます」 est agrammatical : あまり exige la négation.'],
  },
  {
    id: 'n5-goro-gurai',
    palier: 'N5',
    categorie: 'temps',
    titre: 'ごろ / ぐらい — approximation',
    structure: 'moment ごろ ／ quantité ぐらい',
    sens: 'Vers (une heure) / environ (une quantité)',
    explication:
      'ごろ s\'emploie après un point du temps (heure, date). ぐらい (ou くらい) après une quantité ou une durée.',
    exemples: [
      { jp: '三時ごろ 来ます。', lecture: 'さんじごろ きます。', fr: 'Je viendrai vers trois heures.' },
      { jp: '一時間ぐらい かかります。', lecture: 'いちじかんぐらい かかります。', fr: 'Ça prend environ une heure.' },
    ],
    notes: ['Pas de に après ごろ : 「三時ごろ 来ます」.'],
  },

  // --- Nombres et compteurs ------------------------------------------------
  {
    id: 'n5-compteurs',
    palier: 'N5',
    categorie: 'compteurs',
    titre: 'Les compteurs',
    structure: 'nombre ＋ compteur',
    sens: 'On ne compte pas un objet sans classificateur',
    explication:
      'Le japonais impose un compteur adapté à la nature de l\'objet : 〜まい (objets plats), 〜本 (objets longs), 〜人 (personnes), 〜さつ (livres), 〜だい (machines), 〜ひき (petits animaux). La série générique 〜つ (ひとつ, ふたつ…) dépanne jusqu\'à dix.',
    exemples: [
      { jp: 'きってを 五まい 買いました。', lecture: 'きってを ごまい かいました。', fr: 'J\'ai acheté cinq timbres.' },
      { jp: '学生が 三人 います。', lecture: 'がくせいが さんにん います。', fr: 'Il y a trois étudiants.' },
      { jp: 'りんごを ふたつ ください。', fr: 'Deux pommes, s\'il vous plaît.' },
    ],
    notes: ['Le compteur se place après le nom et sa particule, pas devant le nom.'],
    voirAussi: ['n5-heure'],
  },
  {
    id: 'n5-heure',
    palier: 'N5',
    categorie: 'compteurs',
    titre: 'L\'heure et la durée',
    structure: '〜時 / 〜分 ／ 〜時間 / 〜分間',
    sens: 'Dire l\'heure ou une durée',
    explication:
      '〜時（じ）pour l\'heure, 〜分（ふん/ぷん）pour les minutes. Pour une durée, on ajoute 間（かん）: 二時間 = deux heures de temps. Attention aux lectures irrégulières : 四時（よじ）, 七時（しちじ）, 九時（くじ）.',
    exemples: [
      { jp: 'いま 何時ですか。', lecture: 'いま なんじですか。', fr: 'Quelle heure est-il ?' },
      { jp: '二時間 勉強しました。', lecture: 'にじかん べんきょうしました。', fr: 'J\'ai étudié deux heures.' },
    ],
    voirAussi: ['n5-compteurs', 'n5-ni-temps'],
  },

  // --- Comparaison ---------------------------------------------------------
  {
    id: 'n5-hou-ga',
    palier: 'N5',
    categorie: 'comparaison',
    titre: '〜のほうが〜より — comparatif',
    structure: 'A のほうが B より Adj',
    sens: 'A est plus … que B',
    explication:
      'より marque l\'élément de référence (« que »). のほうが met en avant celui qu\'on juge supérieur. L\'ordre des deux membres est libre.',
    exemples: [
      { jp: '電車のほうが バスより 速いです。', lecture: 'でんしゃのほうが バスより はやいです。', fr: 'Le train est plus rapide que le bus.' },
      { jp: '夏より 冬のほうが 好きです。', lecture: 'なつより ふゆのほうが すきです。', fr: 'Je préfère l\'hiver à l\'été.' },
    ],
    voirAussi: ['n5-ichiban', 'n5-dochira'],
  },
  {
    id: 'n5-dochira',
    palier: 'N5',
    categorie: 'comparaison',
    titre: 'A と B と どちらが — lequel des deux ?',
    structure: 'A と B と どちらが Adj ですか',
    sens: 'Question de comparaison entre deux éléments',
    explication:
      'Pour comparer deux choses on emploie どちら (どっち à l\'oral), même pour des objets. La réponse reprend のほうが.',
    exemples: [
      { jp: 'コーヒーと お茶と どちらが 好きですか。', lecture: 'コーヒーと おちゃと どちらが すきですか。', fr: 'Vous préférez le café ou le thé ?' },
      { jp: 'コーヒーのほうが 好きです。', lecture: 'コーヒーのほうが すきです。', fr: 'Je préfère le café.' },
    ],
    voirAussi: ['n5-hou-ga'],
  },
  {
    id: 'n5-ichiban',
    palier: 'N5',
    categorie: 'comparaison',
    titre: '一番 — le superlatif',
    structure: '（範囲）で 一番 Adj',
    sens: 'Le plus … / le meilleur',
    explication:
      '一番（いちばん）devant l\'adjectif donne le superlatif. Le domaine de comparaison prend で ; avec un interrogatif, le japonais emploie souvent 「〜の中で」.',
    exemples: [
      { jp: '日本で 一番 高い山です。', lecture: 'にほんで いちばん たかいやまです。', fr: 'C\'est la plus haute montagne du Japon.' },
      { jp: 'くだものの中で 何が 一番 好きですか。', lecture: 'くだもののなかで なにが いちばん すきですか。', fr: 'Quel fruit préférez-vous ?' },
    ],
    voirAussi: ['n5-hou-ga'],
  },

  // --- Connecteurs ---------------------------------------------------------
  {
    id: 'n5-connecteurs',
    palier: 'N5',
    categorie: 'connecteurs',
    titre: 'そして・でも・だから・それから',
    structure: 'Phrase。 Connecteur、 Phrase。',
    sens: 'Et / mais / donc / puis',
    explication:
      'Ces mots relient deux phrases complètes, en début de seconde phrase. そして « et (aussi) », それから « puis, ensuite », でも « mais », だから « donc, c\'est pourquoi ».',
    exemples: [
      { jp: '朝ごはんを 食べました。それから 学校に 行きました。', lecture: 'あさごはんを たべました。それから がっこうに いきました。', fr: 'J\'ai déjeuné. Puis je suis allé à l\'école.' },
      { jp: '安いです。でも おいしくないです。', lecture: 'やすいです。でも おいしくないです。', fr: 'C\'est bon marché. Mais ce n\'est pas bon.' },
    ],
    notes: ['Pour relier à l\'intérieur d\'une même phrase, on utilise la forme en て ou が.'],
    voirAussi: ['n5-ga-mais', 'n5-kara-cause', 'n5-te-forme'],
  },
  {
    id: 'n5-ga-mais',
    palier: 'N5',
    categorie: 'connecteurs',
    titre: 'が — « mais » (à l\'intérieur d\'une phrase)',
    structure: 'Phrase1 が、Phrase2',
    sens: 'Oppose deux propositions',
    explication:
      'En fin de proposition, が introduit une opposition. À ne pas confondre avec la particule が qui marque le sujet. Sert aussi d\'introduction polie : 「すみませんが…」.',
    exemples: [
      { jp: '高いですが、おいしいです。', lecture: 'たかいですが、おいしいです。', fr: 'C\'est cher, mais c\'est bon.' },
      { jp: 'すみませんが、駅は どこですか。', lecture: 'すみませんが、えきは どこですか。', fr: 'Excusez-moi, où est la gare ?' },
    ],
    voirAussi: ['n5-connecteurs', 'n5-ga-sujet'],
  },
  {
    id: 'n5-kara-cause',
    palier: 'N5',
    categorie: 'connecteurs',
    titre: '〜から — parce que',
    structure: 'Raison から、Conséquence',
    sens: 'Introduit la cause',
    explication:
      'から se place après la proposition qui donne la raison — donc avant la conséquence, à l\'inverse du français. La réponse à どうして se termine souvent par 「〜からです」.',
    exemples: [
      { jp: '寒いから、うちに います。', lecture: 'さむいから、うちに います。', fr: 'Comme il fait froid, je reste à la maison.' },
      { jp: '時間が ないからです。', lecture: 'じかんが ないからです。', fr: 'Parce que je n\'ai pas le temps.' },
    ],
    voirAussi: ['n5-kara-made', 'n5-connecteurs'],
  },

  // --- Tournures usuelles --------------------------------------------------
  {
    id: 'n5-ga-suki',
    palier: 'N5',
    categorie: 'expressions',
    titre: '〜が好きです — goûts et aptitudes',
    structure: 'N が 好き／きらい／上手／下手 です',
    sens: 'Aimer, détester, être doué, être mauvais',
    explication:
      'Ces adjectifs en な décrivent un état, pas une action : leur complément prend が et non を. Même logique pour 上手（じょうず）, 下手（へた）, ほしい.',
    exemples: [
      { jp: 'わたしは 肉が 好きです。', lecture: 'わたしは にくが すきです。', fr: 'J\'aime la viande.' },
      { jp: '料理が 上手です。', lecture: 'りょうりが じょうずです。', fr: 'Il cuisine bien.' },
    ],
    notes: ['Erreur fréquente : 「肉を 好きです」. C\'est が.'],
    voirAussi: ['n5-hoshii', 'n5-adj-na'],
  },
  {
    id: 'n5-hoshii',
    palier: 'N5',
    categorie: 'expressions',
    titre: '〜がほしいです — vouloir un objet',
    structure: 'N が ほしいです',
    sens: 'Je veux (quelque chose)',
    explication:
      'ほしい porte sur un nom (un objet désiré) et se comporte comme un adjectif en い. Pour vouloir *faire* quelque chose, c\'est 〜たい. Ne s\'emploie pas tel quel pour une tierce personne.',
    exemples: [
      { jp: '新しい車が ほしいです。', lecture: 'あたらしいくるまが ほしいです。', fr: 'Je veux une nouvelle voiture.' },
      { jp: '何も ほしくないです。', lecture: 'なにも ほしくないです。', fr: 'Je ne veux rien.' },
    ],
    voirAussi: ['n5-tai', 'n5-ga-suki'],
  },
  {
    id: 'n5-mada-arimasen',
    palier: 'N5',
    categorie: 'expressions',
    titre: '〜がいります / 〜がわかります',
    structure: 'N が いります／わかります',
    sens: 'Avoir besoin de / comprendre',
    explication:
      'Comme 好き, ces verbes décrivent un état et prennent が. わかる signifie « comprendre » au sens de « être clair pour moi ».',
    exemples: [
      { jp: 'お金が いります。', lecture: 'おかねが いります。', fr: 'J\'ai besoin d\'argent.' },
      { jp: '日本語が わかります。', lecture: 'にほんごが わかります。', fr: 'Je comprends le japonais.' },
    ],
    voirAussi: ['n5-ga-suki'],
  },
  {
    id: 'n5-onegai-kudasai',
    palier: 'N5',
    categorie: 'expressions',
    titre: '〜をください / お願いします',
    structure: 'N を ください ／ N を お願いします',
    sens: 'Demander un objet ou un service',
    explication:
      'ください demande un objet concret. お願いします est plus large et plus poli : il couvre aussi les services et les démarches.',
    exemples: [
      { jp: 'コーヒーを ください。', fr: 'Un café, s\'il vous plaît.' },
      { jp: 'チェックインを お願いします。', lecture: 'チェックインを おねがいします。', fr: 'Je voudrais faire l\'enregistrement.' },
    ],
    voirAussi: ['n5-te-kudasai'],
  },
  {
    id: 'n5-ageru-morau-kureru',
    palier: 'N5',
    categorie: 'expressions',
    titre: 'あげる・もらう・くれる — donner et recevoir',
    structure: 'A は B に N を あげる ／ A は B に N を もらう ／ A は わたしに N を くれる',
    sens: 'Le sens du don dépend du point de vue',
    explication:
      'あげる : je donne (ou un tiers donne à un autre tiers). もらう : je reçois de quelqu\'un — le donneur prend に ou から. くれる : quelqu\'un me donne, à moi ou à mon groupe. On ne dit jamais 「わたしに あげる」.',
    exemples: [
      { jp: '友だちに 花を あげました。', lecture: 'ともだちに はなを あげました。', fr: 'J\'ai offert des fleurs à un ami.' },
      { jp: '父に 時計を もらいました。', lecture: 'ちちに とけいを もらいました。', fr: 'J\'ai reçu une montre de mon père.' },
      { jp: '兄が 本を くれました。', lecture: 'あにが ほんを くれました。', fr: 'Mon frère m\'a donné un livre.' },
    ],
    notes: ['Le choix entre くれる et あげる dépend de la direction par rapport à « moi », pas de la politesse.'],
    voirAussi: ['n5-ni-lieu'],
  },
  {
    id: 'n5-to-omoimasu',
    palier: 'N5',
    categorie: 'expressions',
    titre: '〜と思います — je pense que…',
    structure: 'Phrase (forme neutre) ＋ と思います',
    sens: 'Exprime une opinion ou une supposition',
    explication:
      'La proposition citée passe obligatoirement à la forme neutre avant と, même si la phrase principale est polie. Avec un nom ou un adjectif en な, on ajoute だ.',
    exemples: [
      { jp: 'あした 雨が ふると思います。', lecture: 'あした あめが ふるとおもいます。', fr: 'Je pense qu\'il pleuvra demain.' },
      { jp: 'これは 便利だと思います。', lecture: 'これは べんりだとおもいます。', fr: 'Je trouve ça pratique.' },
    ],
    notes: ['Erreur fréquente : 「ふりますと思います」. Il faut la forme neutre : 「ふると思います」.'],
    voirAussi: ['n5-to-iimasu', 'n5-deshou'],
  },
  {
    id: 'n5-to-iimasu',
    palier: 'N5',
    categorie: 'expressions',
    titre: '〜と言います — s\'appeler, dire que…',
    structure: 'N と 言います ／ Phrase(neutre) と 言いました',
    sens: 'Cite un nom ou des paroles',
    explication:
      'と marque le contenu cité. Pour se présenter : 「〜と言います」. Pour demander le nom d\'une chose : 「これは 日本語で 何と言いますか」.',
    exemples: [
      { jp: 'たなかと 言います。', lecture: 'たなかと いいます。', fr: 'Je m\'appelle Tanaka.' },
      { jp: 'これは 日本語で 何と言いますか。', lecture: 'これは にほんごで なんといいますか。', fr: 'Comment dit-on ça en japonais ?' },
    ],
    voirAussi: ['n5-to-omoimasu'],
  },
  {
    id: 'n5-deshou',
    palier: 'N5',
    categorie: 'expressions',
    titre: '〜でしょう — probablement',
    structure: 'Phrase (neutre) ＋ でしょう',
    sens: 'Atténue une affirmation : « sans doute »',
    explication:
      'でしょう marque une supposition. Prononcé avec une intonation montante, il cherche l\'accord de l\'interlocuteur. Très fréquent dans les bulletins météo.',
    exemples: [
      { jp: 'あした 晴れるでしょう。', lecture: 'あした はれるでしょう。', fr: 'Il fera sans doute beau demain.' },
      { jp: 'たかいでしょう？', fr: 'C\'est cher, non ?' },
    ],
    voirAussi: ['n5-to-omoimasu'],
  },
  {
    id: 'n5-dake',
    palier: 'N5',
    categorie: 'particules',
    titre: 'だけ — seulement',
    structure: 'N だけ',
    sens: 'Restreint à un seul élément',
    explication:
      'だけ se place après le nom et signifie « seulement, ne… que ». Il remplace は, が et を, mais se combine avec に et で.',
    exemples: [
      { jp: '水だけ 飲みます。', lecture: 'みずだけ のみます。', fr: 'Je ne bois que de l\'eau.' },
      { jp: '一人だけ 来ました。', lecture: 'ひとりだけ きました。', fr: 'Une seule personne est venue.' },
    ],
    voirAussi: ['n5-mo'],
  },
  {
    id: 'n5-te-kara',
    palier: 'N5',
    categorie: 'temps',
    titre: '〜てから — après avoir… (enchaînement)',
    structure: 'V-て ＋ から',
    sens: 'Insiste sur l\'ordre des deux actions',
    explication:
      'Proche de 〜あとで, mais souligne l\'enchaînement : la seconde action ne peut avoir lieu qu\'une fois la première terminée.',
    exemples: [
      { jp: '宿題を してから 遊びます。', lecture: 'しゅくだいを してから あそびます。', fr: 'Je joue une fois mes devoirs finis.' },
      { jp: '手を あらってから 食べて ください。', lecture: 'てを あらってから たべて ください。', fr: 'Lavez-vous les mains avant de manger.' },
    ],
    voirAussi: ['n5-ato-de', 'n5-te-forme'],
  },
  {
    id: 'n5-tari',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜たり〜たりします — énumérer des actions',
    structure: 'V-た（→たり）… V-た（→たり）＋ します',
    sens: 'Faire ceci, cela, entre autres',
    explication:
      'On forme たり sur la forme neutre passée (た → たり) et on termine par します. La liste est ouverte : ce sont des exemples d\'activités, pas une séquence ordonnée.',
    exemples: [
      { jp: '日曜日は 本を 読んだり 音楽を 聞いたり します。', lecture: 'にちようびは ほんを よんだり おんがくを きいたり します。', fr: 'Le dimanche, je lis, j\'écoute de la musique, ce genre de choses.' },
    ],
    notes: ['Ne pas oublier le します final.'],
    voirAussi: ['n5-te-forme'],
  },
  {
    id: 'n5-nagara',
    palier: 'N5',
    categorie: 'verbes',
    titre: '〜ながら — en même temps',
    structure: 'base ます ＋ ながら',
    sens: 'Faire deux choses simultanément',
    explication:
      'La base ます + ながら indique l\'action secondaire ; l\'action principale est celle du verbe final. Les deux actions doivent avoir le même sujet.',
    exemples: [
      { jp: '音楽を 聞きながら 勉強します。', lecture: 'おんがくを ききながら べんきょうします。', fr: 'J\'étudie en écoutant de la musique.' },
    ],
    notes: ['L\'action importante est la seconde : ici, c\'est « étudier ».'],
    voirAussi: ['n5-masu'],
  },
  {
    id: 'n5-dates',
    palier: 'N5',
    categorie: 'compteurs',
    titre: 'Jours et dates',
    structure: '〜曜日 ／ 〜月〜日',
    sens: 'Dire le jour et la date',
    explication:
      'Les jours de la semaine se terminent par 曜日（ようび）. Les mois sont réguliers (〜がつ), mais les jours du mois ont des lectures irrégulières du 1er au 10, plus 14, 20 et 24 : ついたち, ふつか, みっか… はつか.',
    exemples: [
      { jp: 'きょうは 月曜日です。', lecture: 'きょうは げつようびです。', fr: 'Aujourd\'hui on est lundi.' },
      { jp: '四月一日に 来ます。', lecture: 'しがつついたちに きます。', fr: 'Je viendrai le 1er avril.' },
    ],
    notes: ['二十日 se lit はつか, pas 「にじゅうにち」.'],
    voirAussi: ['n5-compteurs', 'n5-ni-temps'],
  },
]
