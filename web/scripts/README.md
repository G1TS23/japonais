# scripts/

Pipeline complet pour régénérer `app/data/vocab-n5.json` :

```bash
node scripts/import-vocab-n5.mjs    # 1. anglais, depuis la source committée
node scripts/merge-french-n5.mjs    # 2. français, depuis JMdict (télécharge)
```

## 1. import-vocab-n5.mjs

Convertit `sources/jlpt-n5.csv` en `app/data/vocab-n5.json` (terme, lecture,
sens en anglais). Écrase `sens_fr`/`sens_fr_source` à `null` — lancer
`merge-french-n5.mjs` juste après pour les repeupler.

### Source

`sources/jlpt-n5.csv` vient de
[jamsinclair/open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks)
(licence MIT), lui-même basé sur
[chyyran/jlpt-anki-decks](https://github.com/chyyran/jlpt-anki-decks) et les
listes de [tanos.co.uk](http://www.tanos.co.uk/jlpt/jlpt5/vocab/). 718 entrées.

Pour rafraîchir la source :

```bash
curl -s https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n5.csv \
  -o scripts/sources/jlpt-n5.csv
node scripts/import-vocab-n5.mjs
node scripts/merge-french-n5.mjs
```

## 2. merge-french-n5.mjs

Remplit `sens_fr` pour les entrées qui n'en ont pas encore, à partir de
l'édition française de JMdict
([jmdict-simplified](https://github.com/scriptin/jmdict-simplified), build
`jmdict-fre`, licence Creative Commons Attribution-ShareAlike 4.0 — via
[EDRDG](http://www.edrdg.org/)). Le dump (~8 Mo décompressé) est téléchargé à
la volée dans un dossier temporaire, **pas committé**.

Matching par (kanji, lecture), avec repli sur la lecture seule et découpage
des champs composés (`terme`/`lecture` séparés par `;`, préfixes/suffixes de
compteur `～`). Couverture actuelle : **711/718 depuis JMdict, 7 complétées à
la main** (`MANUAL_FR` en tête du script — mots absents de ce sous-ensemble de
JMdict-fre : いかが, ～月, 十, 何～, ゆっくりと, ラジオカセ, 私(わたくし)).
Chaque entrée porte `sens_fr_source` (`"jmdict"` ou `"manuel"`) pour tracer
l'origine.

Relancer ce script ne retraduit pas ce qui a déjà un `sens_fr` — pour tout
refaire, relancer d'abord `import-vocab-n5.mjs`.

### Qualité

Les gloses JMdict sont parfois verbeuses (mots grammaticaux comme あちら/その)
et peuvent contenir des indications d'usage entre parenthèses — c'est fidèle
à la source, pas une erreur du script. Une repasse de relecture manuelle
reste utile mais n'est pas bloquante pour l'usage courant.
