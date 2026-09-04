# scripts/

## import-vocab-n5.mjs

Convertit `sources/jlpt-n5.csv` en `app/data/vocab-n5.json`, consommé par le
module SRS.

```bash
node scripts/import-vocab-n5.mjs
```

### Source

`sources/jlpt-n5.csv` vient de
[jamsinclair/open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks)
(licence MIT), lui-même basé sur
[chyyran/jlpt-anki-decks](https://github.com/chyyran/jlpt-anki-decks) et les
listes de [tanos.co.uk](http://www.tanos.co.uk/jlpt/jlpt5/vocab/). 718 entrées :
terme, lecture (kana), sens en anglais.

Pour rafraîchir la source :

```bash
curl -s https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n5.csv \
  -o scripts/sources/jlpt-n5.csv
node scripts/import-vocab-n5.mjs
```

### Sens en français

Le jeu de données généré ne contient **que l'anglais** (`sens_en`) — `sens_fr`
est `null` pour toutes les entrées. L'app affiche l'anglais en repli tant que
le français manque (voir `useSettingsStore` / `sensLang`). Compléter
`sens_fr` (avec `sens_fr_source: "jmdict"` ou `"manuel"`) est un travail de
contenu séparé, pas fait dans ce script — voir `SPEC-V1.md` §2.
