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

## 🚧 3. Dictionnaire intégré (JMdict-FR)

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
- ⬜ Popover de définition au tap, branché dans le reste de l'app (SRS, quiz)
- ⬜ Segmenteur pour le tap sur texte libre (longest-match sur le dico, ou
  TinySegmenter) — surtout utile une fois la lecture graduée en place ; sans
  texte libre à segmenter pour l'instant, ce n'est pas bloquant

## ⬜ 4. Lecture graduée

Prend tout son sens avec le dictionnaire (lookup au tap). Contenu à
calibrer.

- ⬜ `data/reading/*.ts` — textes courts par palier {titre, palier, corps,
  vocab-clé}
- ⬜ Page `/lecture` (liste) + lecteur avec furigana à bascule
- ⬜ Lookup au tap (dépend de #3)
- ⬜ Audio du texte (dépend de #1)

## ⬜ 5. Tracé des kanji

Valeur plus ciblée. Données d'ordre des traits volumineuses.

- ⬜ Données KanjiVG (SVG ordre des traits) pour le sous-ensemble N5
- ⬜ `components/KanjiStroke.vue` — animation + canvas de tracé
- ⬜ Page `/kanji` ou intégration à une future fiche kanji

---

## ❄️ Parké — valeur limitée en solo

- ❄️ Shadowing / enregistrement (comparer sa voix à un modèle)
- ❄️ Journal en japonais sans correction

## 🚫 Hors périmètre (rappel `SPEC-V1.md` §8)

Compte / sync multi-appareils · sens de révision « production » · sentence
mining (import navigateur/Yomitan) · contenu natif sous copyright · tuteur /
correction humaine · accent de hauteur (module dédié).
