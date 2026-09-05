# japonais-app

Compagnon d'apprentissage du japonais. Nuxt 4 (SPA), 100 % local (IndexedDB).

Voir [`../SPEC-V1.md`](../SPEC-V1.md) pour le périmètre et l'architecture.

## Commandes

```bash
npm install       # dépendances
npm run dev        # serveur de dev (http://localhost:3000)
npm run test        # tests unitaires (Vitest)
npm run generate   # build statique -> .output/public
npm run preview    # prévisualiser le build
```

## Tests

**Vitest**, sur la logique pure et les modules de données (pas encore de tests de
composants). IndexedDB est simulé via `fake-indexeddb` (voir `test/setup.ts`).

| Fichier | Couvre |
|---|---|
| `app/data/kana.test.ts` | intégrité du jeu de données (pas de doublon, champs non vides, `matchesRomaji`) |
| `app/lib/kana-session.test.ts` | `pool`, `buildQueue` (longueur, `weakOnly`), `makeChoices` |
| `app/lib/backup.test.ts` | export/import round-trip, rejet des fichiers invalides, `resetAll` |
| `app/lib/streak.test.ts` | série quotidienne (incrément, plafond à un par jour, remise à zéro) |
| `app/lib/fsrs.test.ts` | carte neuve, aperçu des 4 notes (échéances croissantes), `lapses` sur "Again", effet de la rétention |
| `app/lib/srs-session.test.ts` | import du deck (idempotent), file du jour (dues/nouvelles/suspendues), plafond quotidien, journal de révision |
| `app/lib/progress.test.ts` | intégrité des données programme, calcul de la phase en cours et du % de critères validés, persistance critères/jalons/journal d'étude |

À étendre aux composants (`@vue/test-utils`) si besoin, plus tard.

## État (plan de construction, SPEC §7)

- [x] **Étape 1 — Squelette** : Nuxt + Tailwind v4 + Pinia + Dexie, navigation
      (barre latérale desktop / barre basse mobile), tableau de bord, réglages
      (segmented + switch), export / import / reset JSON.
- [x] **Étape 2 — Drill kana** : config (syllabaire / groupes / sens / longueur /
      points faibles), session avec réinjection des ratés, saisie rōmaji + QCM,
      grille de chaleur par caractère, série quotidienne. Données :
      `app/data/kana.ts` (104 mores × 2 scripts).
- [x] **Étape 3 — SRS (FSRS)** : moteur `ts-fsrs` (wrapper `lib/fsrs.ts`), file
      du jour (dues + nouvelles cartes plafonnées), révision recto/verso avec
      aperçu des 4 intervalles (Again/Hard/Good/Easy), séries quotidiennes.
      Deck N5 auto-importé au premier passage (718 mots, sens bilingues FR/EN,
      voir `scripts/README.md` pour la provenance).
- [x] **Étape 4 — Navigateur de programme** : les 6 phases de `PROGRAMME.md`
      portées dans `data/programme.ts` (pas `@nuxt/content`, voir `SPEC-V1.md`
      §3.3), critères de sortie et jalons en cases à cocher (persistés),
      journal d'étude léger, tableau de bord câblé sur la vraie phase en cours
      (calculée depuis les critères validés, plus de clé stockée à part).
- [ ] Étape 5 — Quiz par palier
- [ ] Étape 6 — Finitions (PWA / hors-ligne, thème, a11y)

## Structure

```
app/
  app.vue              # entrée : NuxtLayout > NuxtPage
  assets/css/main.css  # Tailwind v4 + tokens de thème
  components/            # PageHeader, StatCard, SegmentedControl, ToggleSwitch, SettingField…
  components/kana/       # KanaDrill, KanaResults, KanaHeatmap
  components/srs/        # SrsReview, SrsResults
  components/StudyLogForm.vue  # journal d'étude (/programme)
  composables/           # useLiveQuery (wrapper Dexie.liveQuery), useKanaStats
  data/kana.ts             # jeu de données hiragana + katakana
  data/vocab.ts             # type VocabEntry + export du deck N5
  data/vocab-n5.json         # 718 mots N5 (généré, voir scripts/)
  data/programme.ts          # les 6 phases + jalons, portés depuis PROGRAMME.md
  layouts/default.vue    # coquille + navigation
  lib/db.ts               # schéma Dexie (IndexedDB)
  lib/backup.ts           # export / import / reset JSON
  lib/kana-session.ts     # pool / file de session / QCM (pur)
  lib/streak.ts            # série quotidienne (progress store)
  lib/fsrs.ts               # wrapper ts-fsrs (aperçu des notes, application)
  lib/srs-session.ts        # import du deck, file du jour, journal de révision
  lib/progress.ts            # critères de sortie, jalons, journal d'étude, phase en cours
  pages/                 # /, /kana, /srs, /programme(+[id]), /quiz, /settings
  plugins/theme.client.ts
  stores/settings.ts     # préférences (Pinia + Dexie)
scripts/
  import-vocab-n5.mjs   # génère data/vocab-n5.json depuis scripts/sources/
  sources/jlpt-n5.csv   # source (MIT), voir scripts/README.md
```
