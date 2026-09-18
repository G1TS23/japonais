# Roadmap post-v1

La v1 (étapes 1→6 de `SPEC-V1.md`) est livrée : drill kana, SRS/FSRS,
navigateur de programme, quiz par palier, PWA / hors-ligne, thème, a11y.

Ce fichier suit ce qui vient ensuite — les pistes du §9 de `SPEC-V1.md`
(« Pistes post-v1 »), ordonnées par rapport valeur / coût. Une piste = une
branche + une PR.

Légende : ✅ fait · 🚧 en cours · ⬜ à faire · ❄️ parké (à trancher) · ❌ tenté puis abandonné

---

## ✅ 1. Audio — synthèse vocale (`SpeechSynthesis`)

Écouter la prononciation partout où il y a du japonais. API native, zéro
dépendance. Qualité de la voix JP selon l'OS (bonne macOS/iOS, variable
ailleurs — d'où l'interrupteur global).

Branches : `audio-synthese-vocale` (PR #2), `audio-finitions`.

- ✅ `lib/speech.ts` — `hasJapanese()`, `speechText()`, `pickJapaneseVoice()` /
  `resolveJapaneseVoice()` (+ tests)
- ✅ `composables/useSpeech.ts` — état partagé, résolution de voix, `speak/stop`,
  `voicesReady` / `hasJapaneseVoice`
- ✅ `components/SpeakButton.vue` — masqué si non supporté, audio désactivé ou
  aucune voix japonaise
- ✅ Réglages → section Audio : `audioEnabled`, `audioAutoplay`, `audioRate`,
  `audioVoice` (choix de la voix) + message si aucune voix JP
- ✅ Câblage : SRS (dos de carte + autoplay), drill kana (révélation + autoplay),
  quiz (énoncé japonais), écrans de résultats kana + quiz
- ✅ Sans voix JP installée : boutons masqués + note dans les réglages
- ❌ Mode « dictée » kana (audio → rōmaji) : tenté puis retiré — UI peu
  convaincante, faible valeur ajoutée par rapport au kana → rōmaji classique
- ⬜ (reporté) Câblage du détail de phase du programme — la donnée mélange
  français et fragments japonais dans un même item, pas de champ « exemple »
  isolé à lire

## ✅ 2. Grammaire — référence + SRS + quiz

Le vrai levier vers B2. Livré en deux temps : la référence consultable
d'abord, le branchement SRS/quiz ensuite.

**2a — Référence** (branche `grammaire-reference`)

- ✅ `data/grammar-n5.ts` — 73 points {id, palier, catégorie, titre, structure,
  sens, explication, exemples[], notes, voirAussi}
- ✅ `lib/grammar.ts` — regroupement par catégorie, recherche (accents tolérés,
  japonais inclus), résolution des renvois (+ tests d'intégrité de la banque)
- ✅ Pages `/grammaire` (recherche + catégories repliables) et
  `/grammaire/[id]` (fiche : structure, explication, exemples audio, à retenir,
  voir aussi)
- ✅ Entrée de navigation + icône `book-open`

**2b — SRS et quiz** (branche `grammaire-srs-quiz`)

- ✅ Champ `blank` sur `GrammarExample` (segment à transformer en trou) —
  renseigné sur 71 des 73 points (seuls « Les trois groupes de verbes » et
  「〜たり〜たりします」 n'ont pas de phrase unique adaptée à un trou)
- ✅ `lib/grammar-cloze.ts` (`buildClozeSeeds`) + `srs-session.ts`
  (`seedGrammarClozeCards`, dédup par `content_id`, appelable à chaque
  ouverture de /srs) : les cartes à trou rejoignent **la même file FSRS** que
  le vocabulaire, sans changement de schéma — `Card` gagne juste `kind` et
  `grammarId` optionnels, les champs vocab existants sont réutilisés (`terme`
  = phrase à trou, `lecture` = réponse, `sens_fr`/`sens_en` = glose)
- ✅ Quiz : `buildGrammarParticleQuestions()` génère des QCM depuis les cartes
  à trou de catégorie « particules » (pool de distracteurs fermé et sûr à
  tirer au hasard) — alimente le thème « particules » en plus de
  `quiz-n5.ts`. Les autres catégories (verbes, adjectifs…) restent à la main :
  leurs distracteurs demandent des formes conjuguées liées entre elles, pas
  génériques.
- ✅ Tableau de bord : « Points de grammaire vus » (points distincts dont une
  carte a été révisée au moins une fois), sur fond du nombre de points ayant
  au moins un exemple à trou
- ⬜ Compléter les `blank` manquants et pousser la banque vers ~100 points si
  des manques apparaissent à l'usage

## ✅ 3. Dictionnaire intégré (JMdict-FR)

Lookup au tap dans toute l'app. JMdict-FR déjà récupéré côté scripts.

- ✅ `scripts/build-dictionary.mjs` → `data/dictionary.json` : les ~15 300
  entrées de jmdict-fre (déjà le sous-ensemble « a une glose française », pas
  de filtre de fréquence supplémentaire) — ~1,6 Mo bruts, ~0,4 Mo compressés,
  chargés seulement à la visite de `/dictionnaire` (chunk séparé, pas dans le
  bundle initial)
- ✅ `lib/dictionary.ts` (`searchDictionary`, `lookupExact`) : recherche
  japonais (exact > préfixe > sous-texte, mots courants d'abord dans chaque
  groupe) ou français (sous-texte sur les gloses, accents/casse ignorés)
- ✅ Page `/dictionnaire` (recherche + résultats avec écoute audio), entrée de
  navigation dans Apprentissage (5ᵉ onglet — la grille de la barre du bas est
  désormais dynamique, plus figée à 4)
- ✅ Popover de définition au tap (`useDictionaryPopover` + `DictionaryPopover.vue`,
  `import()` dynamique — le poids du dico ne rejoint le chunk d'aucune page
  tant qu'on n'a pas tapé un mot) : terme + lecture au dos d'une carte SRS
  (jamais sur une phrase à trou de grammaire, pas de mot unique à chercher),
  énoncé et bonne réponse dans le récap de quiz. Volontairement absent du
  recto des cartes SRS et du quiz en cours : ce sont justement les mots
  qu'on teste, un raccourci de définition court-circuiterait l'effort de
  rappel actif.
- ⬜ Segmenteur pour le tap sur texte libre (longest-match sur le dico, ou
  TinySegmenter) — la lecture graduée (piste 4) contourne le besoin en
  segmentant à la main à l'écriture du contenu ; ne redevient utile que pour
  du texte importé/non pré-segmenté (pas de source de ce type pour l'instant)

## ✅ 4. Lecture graduée

Prend tout son sens avec le dictionnaire (lookup au tap). Contenu à
calibrer.

- ✅ `data/reading-n5.ts` — 14 textes N5 rédigés à la main (自己紹介, une
  journée type, un week-end, la météo, la famille, les courses, un
  restaurant, un anniversaire, un voyage, un loisir, une journée d'école, le
  train, être malade, les plats préférés), découpés en segments {text,
  reading?, lookup?} : `reading` porte la furigana, `lookup` la forme
  dictionnaire à chercher au tap quand elle diffère du texte affiché
  (verbe/adjectif conjugué) — un même segment sert donc à la fois de porteur
  de furigana et de cible de tap, pas besoin de segmenteur puisque le
  découpage est fait à la main à l'écriture du contenu. Chaque mot vérifié
  contre le vrai dictionnaire (`lookupLoose`) avant de committer ; les rares
  échecs restants sont des compteurs (七時, 四人…), noms propres ou mots hors
  du sous-ensemble jmdict-fre (会社員) — limitation déjà documentée, pas une
  erreur de contenu
- ✅ Page `/lecture` (liste) + `/lecture/[id]` (lecteur : furigana à bascule
  mémorisée, lookup au tap sur chaque mot et sur le vocabulaire clé, audio
  phrase par phrase et du texte entier)
- ✅ Lookup au tap — réutilise le popover de la piste 3 (`useDictionaryPopover`)
- ✅ Audio du texte — réutilise `SpeakButton`/`useSpeech` de la piste 1
- ⬜ Étoffer encore la banque (14 textes actuellement) si l'usage en montre
  le besoin ; envisager un palier au-delà de N5 quand le reste de l'app en aura

## ✅ 5. Tracé des kanji

Valeur plus ciblée. Données d'ordre des traits volumineuses.

- ✅ `scripts/build-kanji-strokes.mjs` → `data/kanji-strokes.json` : les 103
  kanji du palier N5 (kanjidic2, `jlptLevel === 4` — ancienne numérotation
  JLPT), tracés depuis KanjiVG (SVG, licence CC BY-SA 3.0), ~60 Ko
- ✅ `components/kanji/KanjiStroke.vue` — animation trait par trait
  (`stroke-dashoffset` + `pathLength="1"`, pas de dépendance externe) sur un
  fond pâle du kanji complet, plus un canevas de tracé libre par-dessus
  (`<canvas>`, pointer events) pour s'entraîner au geste ; pas de correction
  automatique du tracé (reconnaissance de forme hors de portée ici — la
  valeur est dans la répétition, pas dans une note)
- ✅ Page `/kanji` (grille des 103 kanji, du plus simple au plus complexe) +
  `/kanji/[kanji]` (tracé, définition au tap du kanji — réutilise le popover
  de la piste 3 —, kanji précédent/suivant)

---

## ❄️ Parké — valeur limitée en solo

- ❄️ Shadowing / enregistrement (comparer sa voix à un modèle)
- ❄️ Journal en japonais sans correction

## 🚫 Hors périmètre (rappel `SPEC-V1.md` §8)

Compte / sync multi-appareils · sens de révision « production » · sentence
mining (import navigateur/Yomitan) · contenu natif sous copyright · tuteur /
correction humaine · accent de hauteur (module dédié).
