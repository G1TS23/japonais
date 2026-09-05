/**
 * Portage structuré de PROGRAMME.md (6 phases + jalons transversaux), pour le
 * navigateur de programme (/programme). Contenu figé, jamais édité au
 * runtime — pas besoin d'un module de contenu (@nuxt/content) pour ça, une
 * simple donnée typée suffit et reste cohérente avec data/kana.ts et
 * data/vocab.ts.
 *
 * Les identifiants des critères de sortie et des jalons sont stables (ils
 * servent de clé de persistance dans lib/progress.ts) : ne pas les modifier
 * une fois publiés, ajouter plutôt que renuméroter.
 */

export interface ExitCriterion {
  id: string
  text: string
}

export interface PhaseSection {
  title: string
  items?: string[]
  text?: string
}

export interface Phase {
  id: string
  number: number
  title: string
  palier?: string
  cecr?: string
  duration: string
  cumul?: string
  summary: string
  sections: PhaseSection[]
  exitCriteria: ExitCriterion[]
}

export const PHASES: Phase[] = [
  {
    id: 'p0',
    number: 0,
    title: 'Fondations',
    duration: '2 à 6 semaines',
    summary:
      'Ne plus jamais avoir à réfléchir pour lire un kana, comprendre la mécanique de base de la langue, installer les outils.',
    sections: [
      {
        title: 'Contenu',
        items: [
          'Hiragana : les 46 de base + dérivés (dakuten だ, handakuten ぱ) + combinés (きゃ, しゅ, ちょ…) + petit っ (sokuon) + allongements. Lecture et écriture à la main.',
          'Katakana : idem, avec les combinaisons spécifiques aux emprunts (ファ, ティ, ウィ, ヴ…).',
          'Prononciation : les 5 voyelles, voyelles longues vs courtes, consonnes géminées, le son ん, le r japonais.',
          "Accent de hauteur : sensibilisation seulement (はし baguettes vs はし pont). Ne pas en faire une obsession maintenant.",
          "Mécanique de la langue : ordre Sujet-Objet-Verbe, pas d'articles, pas de pluriel, pas de genre, rôle des particules, registre poli/neutre.",
          'Abandonner le rōmaji dès que les kana sont lisibles.',
        ],
      },
      {
        title: 'Outils à installer',
        items: [
          'Le site (drill kana + SRS intégrés) — pas d\'appli tierce nécessaire pour la répétition espacée.',
          'Clavier japonais sur ordinateur et téléphone.',
          'Un dictionnaire : Jisho.org + extension Yomitan.',
        ],
      },
    ],
    exitCriteria: [
      { id: 'p0-1', text: 'Lire à voix haute une phrase en kana inconnue sans hésiter (< 2 s/mot).' },
      { id: 'p0-2', text: 'Écrire les deux syllabaires de mémoire.' },
      { id: 'p0-3', text: "Distinguer à l'oreille voyelle longue/courte et consonne géminée." },
      { id: 'p0-4', text: 'Routine quotidienne sur le site amorcée (drill kana).' },
    ],
  },
  {
    id: 'p1',
    number: 1,
    title: 'Débutant',
    palier: 'JLPT N5',
    cecr: 'A1 → A2',
    duration: '250–450 h',
    cumul: '~800 mots · ~100 kanji · ~80–100 points de grammaire',
    summary: 'Manuel pivot : Genki I (leçons 1–12), ou Minna no Nihongo I. Compléments : Tae Kim, Cure Dolly.',
    sections: [
      {
        title: 'Grammaire — points clés',
        items: [
          'Copule です / だ ; phrases nominales « X は Y です ».',
          'Particules : は, が, を, に, で, へ, と, も, から〜まで, の.',
          'Verbes : les 3 groupes (ichidan, godan, irréguliers) ; formes ます/ません/ました/ませんでした ; forme neutre.',
          'Forme て : demande (てください), action en cours (ています), enchaînement.',
          'Adjectifs en い et en な : épithète, attribut, négation, passé.',
          'Existence : あります / います ; localisation.',
          'Démonstratifs これ・それ・あれ・どれ / この・その… / ここ・そこ….',
          'Interrogatifs : なに, だれ, どこ, いつ, どうして, いくら, どう.',
          '～たい, ～ましょう / ましょうか, ～ませんか.',
          'Comparaisons より / のほうが / いちばん.',
          'Compteurs courants, expressions de temps, jours, heures, dates.',
          'Adverbes de fréquence, connecteurs そして・でも・だから・それから.',
        ],
      },
      {
        title: 'Vocabulaire / kanji',
        items: [
          'Deck N5 intégré au site (718 mots), ~10–15 nouvelles cartes/jour (réglable dans Réglages).',
          'Kanji de Genki I (~100), appris via le vocabulaire, pas en liste isolée.',
        ],
      },
      {
        title: 'Compétences visées (production incluse)',
        items: [
          'Se présenter, parler de sa famille, son travail, ses goûts.',
          "Acheter quelque chose, commander, demander un prix, l'heure, le chemin.",
          "Décrire sa journée et ses habitudes ; parler d'un événement passé simple.",
          'Écrire 5–8 phrases sur soi ; mini-journal de 3 phrases/jour.',
        ],
      },
      {
        title: 'Écoute (niveau très lent)',
        items: [
          'Comprehensible Japanese (Yuki) — Complete Beginner / Beginner.',
          'Nihongo con Teppei for Beginners.',
          'Dialogues audio du manuel, réécoutés sans le texte.',
        ],
      },
    ],
    exitCriteria: [
      { id: 'p1-1', text: 'Genki I terminé (ou équivalent), exercices faits.' },
      { id: 'p1-2', text: '~800 mots en SRS, ~100 kanji reconnus.' },
      { id: 'p1-3', text: 'Tenir 5 min de conversation ultra-basique.' },
      { id: 'p1-4', text: 'Comprendre un dialogue lent sur un sujet familier sans transcription.' },
      { id: 'p1-5', text: 'Passer un test blanc N5 au-dessus de 60 %.' },
    ],
  },
  {
    id: 'p2',
    number: 2,
    title: 'Élémentaire',
    palier: 'JLPT N4',
    cecr: 'A2 → B1',
    duration: '+300–500 h',
    cumul: '~1 500 mots · ~300 kanji · ~180–250 points de grammaire',
    summary: 'Manuel pivot : Genki II (leçons 13–23). Complément grammaire en SRS : Bunpro (parcours N4).',
    sections: [
      {
        title: 'Grammaire — points clés',
        items: [
          'Usages étendus de て : てもいい, てはいけない, てから, ている (résultat), てみる, ておく, てしまう, ていく/てくる.',
          'Potentiel (食べられる…) ; volitif neutre + volitif + と思う.',
          'Conditionnels : と, ば, たら, なら.',
          'Causatif (させる), passif (される), causatif-passif (introduit ici).',
          'Donner/recevoir : あげる・くれる・もらう ; esquisse de keigo (くださる, いただく).',
          'Suppositions : そう, よう/みたい, らしい.',
          'Verbes transitifs/intransitifs par paires.',
          'Propositions relatives.',
          'Subordonnées : とき, まえに, あとで, ながら, ので, のに, し, ても.',
          '～ことがある, ～ことができる, ～つもり, ～予定, ～なければならない, ～たほうがいい.',
          '～と言っていた / ～と思う.',
          'Adverbes de degré : きっと・たぶん・もし・ぜんぜん・あまり.',
        ],
      },
      {
        title: 'Vocabulaire / kanji',
        items: [
          "Terminer le deck N5 du site, puis un deck N4 (à ajouter au site) ou sentence mining (outil externe requis).",
          '~200 kanji de plus. Reconnaissance prioritaire.',
        ],
      },
      {
        title: 'Compétences visées',
        items: [
          'Raconter un souvenir, une anecdote au passé avec plusieurs phrases liées.',
          'Donner et justifier brièvement un avis.',
          'Faire des projets, proposer, inviter, refuser poliment.',
          'Gérer une situation imprévue simple.',
          'Écrire un paragraphe de 8–12 phrases ; e-mail amical simple.',
        ],
      },
      {
        title: 'Écoute / lecture (démarrage lecture)',
        items: [
          'Écoute : Nihongo con Teppei, Japanese with Shun, Sakura Tips.',
          'Lecture : NHK Easy News, Tadoku L0–L2, Satori Reader (début), よつばと！.',
        ],
      },
    ],
    exitCriteria: [
      { id: 'p2-1', text: 'Genki II terminé.' },
      { id: 'p2-2', text: '~1 500 mots en SRS, ~300 kanji.' },
      { id: 'p2-3', text: 'Conversation de 10–15 min sur des sujets familiers, avec un locuteur patient.' },
      { id: 'p2-4', text: "Lire un article NHK Easy et un chapitre de lecteur gradué L2 sans dictionnaire pour l'essentiel." },
      { id: 'p2-5', text: 'Test blanc N4 > 60 %.' },
    ],
  },
  {
    id: 'p3',
    number: 3,
    title: 'Intermédiaire — le palier charnière',
    palier: 'JLPT N3',
    cecr: 'B1',
    duration: '+450–900 h',
    cumul: '~3 700 mots · ~650 kanji · ~350–450 points de grammaire',
    summary:
      'Le « mur du N3 » : le vocabulaire triple, plus de manuel unique qui tienne la main. Bascule cours → immersion assistée + production sérieuse.',
    sections: [
      {
        title: 'Manuels pivots (en combiner deux)',
        items: [
          'Transition : Tobira: Gateway to Advanced Japanese ou Quartet I.',
          'Shin Kanzen Master N3 (grammaire, lecture, écoute, vocabulaire, kanji) ou Sou Matome N3.',
          'Grammaire en SRS : Bunpro parcours N3.',
        ],
      },
      {
        title: 'Grammaire — points clés',
        items: [
          'Keigo — introduction systématique : 丁寧語, 尊敬語, 謙譲語. Reconnaître et produire les formes courantes.',
          'Causatif-passif complet et nuances de contrainte.',
          'Nominalisations : こと/の, わけ, はず, べき, つもり, ため(に), よう(に), ということ.',
          'Modalité : だろう/でしょう, かもしれない, に違いない, みたい/らしい/っぽい, ようだ.',
          'Concessions : のに, くせに, ても/でも, にもかかわらず, ものの.',
          'Degré : ば〜ほど, ほど〜ない, くらい/ぐらい, さえ, まで, だけ/しか, ばかり.',
          'Tournures livresques : によって, について, において, に対して, として, とともに, にとって.',
          'Aspect : てある vs ている, ておく, たところ, まま, っぱなし, きり.',
          'Connecteurs : しかし, ただし, したがって, つまり, なお, ところが.',
        ],
      },
      {
        title: 'Vocabulaire / kanji',
        items: [
          '~2 200 mots de plus. Sentence mining recommandé (Yomitan + un outil externe type Anki, le site ne crée pas encore de cartes), complété par un deck N3 sur le site si besoin.',
          'Kanji : ~350 de plus (cumul ~650). Reconnaissance prioritaire sur écriture.',
        ],
      },
      {
        title: 'Compétences visées',
        items: [
          'Conversation suivie sur sujets familiers et quelques sujets abstraits, avec reformulations.',
          "Raconter en détail, décrire espoirs/projets, expliquer un point de vue.",
          'Comprendre l\'essentiel d\'émissions TV, podcasts avancés, chansons, manga.',
          'Lire des articles courts, nouvelles simples, billets de blog.',
          'Production : 1–2 séances de tuteur/mois minimum ; journal 4–5×/semaine corrigé.',
        ],
      },
      {
        title: 'Immersion (devient centrale)',
        items: [
          'Écoute : 日本語の森, Miku Real Japanese, YuYu Nihongo Podcast, dramas/anime sous-titres japonais.',
          'Lecture : Satori Reader en entier, Tadoku L2–L4, NHK normal avec Yomitan, manga.',
        ],
      },
    ],
    exitCriteria: [
      { id: 'p3-1', text: 'Un manuel de transition (Tobira / Quartet I) + une série N3 terminés.' },
      { id: 'p3-2', text: '~3 700 mots en SRS, ~650 kanji.' },
      { id: 'p3-3', text: 'Conversation de 30 min sur des sujets variés sans épuisement.' },
      { id: 'p3-4', text: 'Lire un article NHK « normal » avec dictionnaire ponctuel.' },
      { id: 'p3-5', text: 'Regarder un épisode d\'anime slice of life avec sous-titres JP et suivre l\'intrigue.' },
      { id: 'p3-6', text: 'Test blanc N3 > 65 %.' },
    ],
  },
  {
    id: 'p4',
    number: 4,
    title: 'Intermédiaire supérieur — cible du programme',
    palier: 'JLPT N2',
    cecr: 'B2',
    duration: '+600–1 200 h',
    cumul: '~6 000 mots · ~1 000 kanji · ~500–650 points de grammaire',
    summary: 'Quartet II / Tobira avancé + Shin Kanzen Master N2. Le manuel devient secondaire ; le gros du temps est immersion native choisie.',
    sections: [
      {
        title: 'Grammaire — points clés (registre écrit / formel dense)',
        items: [
          'Keigo complet et fluide : 尊敬語/謙譲語 spontanés, e-mails professionnels.',
          'Tournures N2 : ざるを得ない, かねない, にほかならない, をめぐって, に応じて, に際して, どころか, ないではいられない, あげく, 一方で, とはいえ, ものの.',
          'Nuances fines des particules et focus (は vs が en discours long, こそ, なんて).',
          'Style littéraire/journalistique : formes contractées, titres de presse, voix passive impersonnelle.',
        ],
      },
      {
        title: 'Vocabulaire / kanji',
        items: [
          '~2 300 mots de plus (cumul ~6 000), surtout via sentence mining + deck N2 ciblé.',
          "Kanji : cumul ~1 000. La lecture rapide compte plus que l'écriture manuscrite exhaustive.",
        ],
      },
      {
        title: 'Ce qui fait le B2 (et pas seulement le N2)',
        items: [
          "Oral : aisance et spontanéité, argumenter sur un sujet abstrait, comprendre un débat. Tuteur hebdomadaire, shadowing régulier.",
          'Écrit : textes structurés, e-mails formels en keigo, textes d\'opinion (作文) 400–600 caractères, corrections systématiques.',
          'Lecture : presse, essais, blogs, romans grand public — 20–30 min/jour minimum.',
          'Écoute : podcasts natifs à vitesse normale, JT, dramas sans sous-titres pour une partie du contenu.',
        ],
      },
      {
        title: 'Jalon externe',
        text: 'Envisager de passer le JLPT N2 (sessions de juillet et décembre) comme objectif motivant et preuve formelle.',
      },
    ],
    exitCriteria: [
      { id: 'p4-1', text: 'Quartet II / Tobira avancé + Shin Kanzen Master N2 (grammaire + lecture + écoute au minimum) terminés.' },
      { id: 'p4-2', text: '~6 000 mots en SRS, ~1 000 kanji.' },
      { id: 'p4-3', text: "Conversation d'1 h sur des sujets abstraits, avec argumentation, sans recours au français." },
      { id: 'p4-4', text: 'Lire un article de presse standard et un chapitre de roman grand public avec dictionnaire seulement ponctuel.' },
      { id: 'p4-5', text: 'Comprendre un podcast natif généraliste à vitesse normale (≥ 80 %).' },
      { id: 'p4-6', text: "Écrire un texte d'opinion structuré de ~500 caractères, corrigé, avec peu d'erreurs bloquantes." },
      { id: 'p4-7', text: 'N2 réussi (réel ou test blanc > 70 % sur les trois sections).' },
    ],
  },
  {
    id: 'p5',
    number: 5,
    title: 'Avancé (au-delà de la cible)',
    palier: 'JLPT N1',
    cecr: 'C1',
    duration: '+1 400–2 000 h',
    cumul: '~10 000+ mots · ~2 000 kanji (jōyō complet)',
    summary: "Esquisse, pour savoir où mène la suite. Plus de programme ici : un régime d'entretien et des objectifs personnels.",
    sections: [
      {
        title: 'Matériel',
        items: [
          'Shin Kanzen Master N1 (5 livres).',
          'Lecture massive de littérature et d\'essais, presse quotidienne, podcasts spécialisés.',
        ],
      },
      {
        title: 'Compétences C1',
        items: [
          "Comprendre à peu près tout ce qu'on lit ou entend.",
          'Restituer et argumenter de façon nuancée.',
          "Saisir l'implicite et l'humour, adapter finement le registre.",
        ],
      },
    ],
    exitCriteria: [],
  },
]

export interface Milestone {
  id: string
  text: string
}

export const MILESTONES: Milestone[] = [
  { id: 'm1', text: 'Kana automatiques (Phase 0)' },
  { id: 'm2', text: 'Premier journal de 3 phrases en japonais' },
  { id: 'm3', text: 'Genki I terminé · 100 kanji' },
  { id: 'm4', text: 'Première conversation de 5 min' },
  { id: 'm5', text: 'Test blanc N5 > 60 %' },
  { id: 'm6', text: 'Genki II terminé · 300 kanji' },
  { id: 'm7', text: 'Premier article NHK Easy lu sans dictionnaire' },
  { id: 'm8', text: 'Conversation de 15 min' },
  { id: 'm9', text: 'Test blanc N4 > 60 %' },
  { id: 'm10', text: 'Première carte de sentence mining' },
  { id: 'm11', text: "Premier épisode d'anime suivi avec sous-titres JP" },
  { id: 'm12', text: 'Manuel de transition (Tobira / Quartet I) terminé' },
  { id: 'm13', text: 'Conversation de 30 min · tuteur régulier' },
  { id: 'm14', text: 'Test blanc N3 > 65 %' },
  { id: 'm15', text: 'Premier roman grand public commencé' },
  { id: 'm16', text: 'Premier podcast natif suivi à vitesse normale' },
  { id: 'm17', text: "Texte d'opinion de 500 caractères corrigé, peu d'erreurs" },
  { id: 'm18', text: 'Tuteur hebdomadaire' },
  { id: 'm19', text: 'N2 réussi (ou test blanc > 70 %) → B2 atteint' },
]
