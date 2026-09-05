# Spécification — application web v1

> Version 0.1 — 2026-09-04 · à valider avant scaffolding.
> Compagnon d'apprentissage du japonais, basé sur [`PROGRAMME.md`](./PROGRAMME.md).

---

## 1. Portée de la v1 (décidée)

Quatre modules, tous dans la v1 :

1. **Drill kana** — reconnaissance hiragana + katakana.
2. **SRS vocabulaire** — répétition espacée, moteur **FSRS** complet.
3. **Navigateur de programme** — `PROGRAMME.md` rendu dans l'app, critères de
   sortie et jalons interactifs.
4. **Quiz par palier** — QCM grammaire / vocabulaire par niveau JLPT.

Reconnaissance seule : **pas de pratique de tracé** en v1 (ni ordre des traits,
ni reconnaissance d'écriture).

Contenu : **jeux de données curés fournis dans le repo**, palier N5 pour la v1,
extensibles ensuite (N4, N3…).

---

## 2. Choix techniques (confirmés)

| Sujet | Choix proposé |
|---|---|
| Framework | **Nuxt 3**, mode SPA (`ssr: false`), build statique (`nuxi generate`). |
| Hébergement | Statique — Cloudflare Pages / Netlify / GitHub Pages. Aucun serveur en v1. |
| Persistance | **100 % local** : IndexedDB via **Dexie**. Aucun compte, aucune synchro. Sauvegarde par **export / import JSON**. |
| État | Pinia. |
| Utilitaires | VueUse. |
| Style | Tailwind CSS + composants maison ; primitives accessibles via **Nuxt UI** (Reka UI). |
| Contenu programme | Données structurées (`data/programme.ts`), pas `@nuxt/content` — voir note étape 4 ci-dessous. |
| Jeux de données | JSON/YAML versionnés dans `content/` (kana, vocab, kanji, grammaire, quiz). |
| SRS | Bibliothèque **`ts-fsrs`** (implémentation FSRS maintenue) plutôt qu'un algo maison. |
| PWA / hors-ligne | Inclus (`@vite-pwa/nuxt`) — révision sans connexion. Peu coûteux, forte valeur. |
| Langue de l'interface | Français. |

### Langue des définitions — décidé : (c) bilingue FR + EN

Les jeux de données s'appuient sur des sources ouvertes : **JMdict/EDICT**
(lectures + sens en anglais), **JMdict-FR / dictionnaire français de JMdict**
quand disponible, **KANJIDIC2** (kanji), listes de grammaire N5 communautaires.

- Chaque entrée porte `sens_fr` **et** `sens_en`.
- `sens_en` vient directement de JMdict (fiable, non retouché).
- `sens_fr` vient de l'édition française de JMdict quand elle couvre l'entrée,
  sinon traduction à relire, avec un indicateur `sens_fr_source` (`jmdict` /
  `manuel`).
- L'interface affiche le français en principal, l'anglais en repli / secondaire
  (réglage possible).

---

## 3. Modules — détail fonctionnel

### 3.1 Drill kana — `/kana`

- **Sélection** : hiragana / katakana / mélange ; sous-ensembles activables —
  base (46), dakuten・handakuten (が, ぱ…), combinés yōon (きゃ, しゅ…).
- **Sens de l'exercice** : kana → saisir le rōmaji (principal) ; mode inverse
  rōmaji → choisir le kana (QCM).
- **Session** : longueur choisie (20 / 50 / tout) ou mode chronométré ; les items
  ratés sont **réinjectés en fin de session** et journalisés.
- **Statistiques par kana** : nombre de vues, taux de réussite, dernière vue →
  **grille de chaleur** (heatmap) sur le tableau des kana.
- **Mode « points faibles »** : ne tire que les kana sous un seuil de réussite.
- Pas de planification SRS ici : suivi par statistiques + streak quotidien.

### 3.2 SRS vocabulaire — `/srs`

- **Modèle de carte** : `terme` (kanji/kana), `lecture` (kana), `sens`,
  `exemple_jp`, `exemple_fr`, `tags[]` (palier, nature grammaticale, leçon
  d'origine), état FSRS, `suspendue`.
- **Sens de révision v1** : reconnaissance (JP → lecture + sens). Le sens
  production (sens → terme) est un réglage prévu pour plus tard.
- **File quotidienne** : révisions dues (FSRS) + nouvelles cartes plafonnées
  (défaut 10/j, configurable). Notes **Again / Hard / Good / Easy**.
- **FSRS** : `due`, `stability`, `difficulty`, `reps`, `lapses`, `state`,
  `last_review`. Cible de rétention réglable (défaut 0,9).
- **Journal de révision** persisté (statistiques + optimisation FSRS ultérieure).
- **Deck** = jeu N5 fourni, filtrable par tag. Suspendre / enterrer une carte.
- **Statistiques** : prévision des révisions à venir, révisions/jour, rétention,
  nombre de cartes matures.

### 3.3 Navigateur de programme — `/programme`, `/programme/[id]`

- Rendu des **6 phases**, portées depuis `PROGRAMME.md` dans `data/programme.ts`
  (données structurées typées, pas `@nuxt/content`) : à la construction, un
  contenu figé qui ne change jamais au runtime et doit piloter des cases à
  cocher à identifiants stables n'a pas besoin d'un module de contenu — même
  logique que `data/kana.ts` / `data/vocab.ts`. `@nuxt/content` v3 s'installe
  proprement (SQLite en WASM, pas de binaire natif), mais reste une dépendance
  lourde (shiki, isomorphic-git, socket.io…) pour ce gain-là.
- Par phase : points de grammaire, seuils vocab/kanji, compétences, et
  **critères de sortie en cases à cocher** (état persisté).
- **Jalons** transversaux : liste cochable + **date** enregistrée.
- **Journal d'étude** léger : saisie hebdomadaire rapide (minutes d'étude active,
  minutes d'immersion, note libre) — alimente le tableau de bord.
- Lien avec le tableau de bord : phase en cours, % de critères validés, compteurs
  (cartes matures et kanji connus tirés du module SRS ; heures depuis le journal).

### 3.4 Quiz par palier — `/quiz`

- **Banque de questions** taguée par palier + thème (point de grammaire, lot de
  vocab).
- **Types v1** : QCM (forme grammaticale correcte / bon sens / bonne particule),
  texte à trou à choix multiple.
- **Session** : palier + thèmes + longueur ; score, correction question par
  question **avec explication**, révision des erreurs en fin de session.
- **Historique** des tentatives persisté.
- *Nice-to-have* : envoyer le vocabulaire raté vers le SRS (peut passer en v1.1).

---

## 4. Transversal

- **Tableau de bord** `/` : révisions SRS du jour, streak de drill kana,
  progression de la phase en cours, accès rapides.
- **Réglages** `/settings` : plafond de nouvelles cartes, cible de rétention,
  thème clair/sombre, **export / import JSON**, réinitialisation.
- **Streak** : activité quotidienne (au moins une session de n'importe quel
  module).
- **Navigation** : `/`, `/kana`, `/srs`, `/programme`, `/programme/[phase]`,
  `/quiz`, `/settings`.

---

## 5. Modèle de données (IndexedDB / Dexie)

| Store | Champs clés |
|---|---|
| `cards` | id, terme, lecture, sens, exemple_jp, exemple_fr, tags[], due, stability, difficulty, reps, lapses, state, last_review, suspendue |
| `reviewLogs` | id, cardId, rating, state, elapsed_ms, scheduled_days, ts |
| `kanaStats` | kana, type, seen, correct, last_seen, streak |
| `quizAttempts` | id, palier, thèmes[], score, total, missed[], ts |
| `progress` | key, value (états de cases, dates de jalons) |
| `studyLog` | date, minutes_actives, minutes_immersion, note |
| `settings` | singleton (plafond nouvelles cartes, rétention, thème…) |
| `meta` | version de schéma (migrations) |

---

## 6. Contenu fourni dans le repo

| Fichier | Contenu | Source |
|---|---|---|
| `content/kana.json` | 46 base + dakuten + combinés, rōmaji, ligne/colonne pour la grille | rédigé |
| `content/vocab/n5.json` | ~800 entrées {terme, lecture, sens_fr, sens_fr_source, sens_en, exemple_jp, exemple_fr, nature, leçon} | JMdict (EN) + JMdict-FR + relecture |
| `content/kanji/n5.json` | ~100 entrées {kanji, on, kun, sens, exemples[], traits} | KANJIDIC2 |
| `content/grammar/n5.json` | ~80–100 points {id, titre, structure, sens, exemples[], notes} | listes N5 communautaires + relecture |
| `content/quiz/n5.json` | banque de questions {id, palier, thème, type, énoncé, options[], réponse, explication} | dérivée de grammar/vocab + rédigée |
| `content/programme/0x-*.md` | les 6 phases avec frontmatter (id, titre, palier, durée) | portage de `PROGRAMME.md` |

---

## 7. Ordre de construction proposé

1. **Squelette** : Nuxt + Tailwind + Pinia + Dexie, layout, navigation, tableau
   de bord vide, pipeline de contenu, export/import JSON.
2. **Drill kana** : autonome, résultat visible rapidement.
3. **SRS** : intégration `ts-fsrs`, modèle de carte, file de révision, import du
   jeu N5, statistiques.
4. **Navigateur de programme** : rendu des phases, cases à cocher, jalons,
   journal d'étude, câblage du tableau de bord.
5. **Quiz** : banque de questions, moteur de session, correction, historique.
6. **Finitions** : PWA / hors-ligne, thème sombre, polissage, contrôle d'accessibilité.

Chaque étape est utilisable seule ; la v1 est atteinte à la fin de l'étape 6.

---

## 7bis. Tests

**Vitest** pour la logique pure (pas de tests de composants pour l'instant) :
jeux de données (`data/`), moteurs de session (`lib/kana-session.ts`,
futur moteur FSRS), persistance (`lib/backup.ts`, `lib/streak.ts`) via
`fake-indexeddb`. Lancé en CI à chaque push/PR, avant le build. Priorité haute
sur le moteur FSRS de l'étape 3 : une erreur de planification y est silencieuse
et coûteuse (mauvais intervalles de révision) contrairement à un bug d'UI.

## 8. Hors périmètre v1 (pour mémoire)

- Compte utilisateur et synchronisation multi-appareils.
- Pratique de tracé / ordre des traits / reconnaissance d'écriture.
- Sens de révision « production » dans le SRS.
- Sentence mining (import depuis navigateur / Yomitan).
- Audio natif sur les cartes (TTS ou fichiers).
- Paliers N4+ (données), ajout incrémental après la v1.
- Accent de hauteur (module dédié).
