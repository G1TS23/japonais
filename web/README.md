# japonais-app

Compagnon d'apprentissage du japonais. Nuxt 4 (SPA), 100 % local (IndexedDB).

Voir [`../SPEC-V1.md`](../SPEC-V1.md) pour le périmètre et l'architecture.

## Commandes

```bash
npm install       # dépendances
npm run dev        # serveur de dev (http://localhost:3000)
npm run generate   # build statique -> .output/public
npm run preview    # prévisualiser le build
```

## État (plan de construction, SPEC §7)

- [x] **Étape 1 — Squelette** : Nuxt + Tailwind v4 + Pinia + Dexie, navigation
      (barre latérale desktop / barre basse mobile), tableau de bord, réglages
      (segmented + switch), export / import / reset JSON.
- [x] **Étape 2 — Drill kana** : config (syllabaire / groupes / sens / longueur /
      points faibles), session avec réinjection des ratés, saisie rōmaji + QCM,
      grille de chaleur par caractère, série quotidienne. Données :
      `app/data/kana.ts` (104 mores × 2 scripts).
- [ ] Étape 3 — SRS (FSRS)
- [ ] Étape 4 — Navigateur de programme (@nuxt/content)
- [ ] Étape 5 — Quiz par palier
- [ ] Étape 6 — Finitions (PWA / hors-ligne, thème, a11y)

## Structure

```
app/
  app.vue              # entrée : NuxtLayout > NuxtPage
  assets/css/main.css  # Tailwind v4 + tokens de thème
  components/           # PageHeader, StatCard, SegmentedControl, ToggleSwitch…
  components/kana/      # KanaDrill, KanaResults, KanaHeatmap
  composables/          # useLiveQuery (wrapper Dexie.liveQuery), useKanaStats
  data/kana.ts          # jeu de données hiragana + katakana
  layouts/default.vue   # coquille + navigation
  lib/db.ts             # schéma Dexie (IndexedDB)
  lib/backup.ts         # export / import / reset JSON
  lib/kana-session.ts   # pool / file de session / QCM (pur)
  lib/streak.ts         # série quotidienne (progress store)
  pages/                # /, /kana, /srs, /programme, /quiz, /settings
  plugins/theme.client.ts
  stores/settings.ts    # préférences (Pinia + Dexie)
```
