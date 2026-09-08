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

## ⬜ 2. Grammaire — référence + SRS + quiz

Le vrai levier vers B2. Surtout du contenu à rédiger/porter.

- ⬜ `data/grammar-n5.ts` — ~80–100 points {id, titre, structure, sens,
  exemples[], notes, palier}
- ⬜ Pages `/grammaire` (liste par palier/leçon) + `/grammaire/[id]` (fiche)
- ⬜ Type de carte FSRS « phrase à trou » (cloze) branché sur ces points
- ⬜ Alimenter le quiz depuis la banque de grammaire (au lieu du seul
  `quiz-n5.ts` écrit à la main)
- ⬜ Tableau de bord : compteur « points de grammaire vus »
- ⬜ Retirer la mention « listes N5 communautaires » de `SPEC-V1.md` une fois
  le contenu relu

## ⬜ 3. Dictionnaire intégré (JMdict-FR)

Lookup au tap dans toute l'app. JMdict-FR déjà récupéré côté scripts.

- ⬜ Construire un sous-ensemble indexé (taille / perfs — viser < quelques Mo,
  index Dexie ou pré-généré)
- ⬜ `composables/useDictionary.ts` — recherche par terme / lecture / préfixe
- ⬜ `components/WordPopover.vue` — définition au tap
- ⬜ Segmenteur pour le tap sur texte libre (longest-match sur le dico, ou
  TinySegmenter) — nécessaire surtout pour la lecture graduée
- ⬜ Brancher : SRS, quiz, lecture graduée

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
