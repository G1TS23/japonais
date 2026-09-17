#!/usr/bin/env node
// Construit app/data/dictionary.json depuis l'édition française de JMdict
// (jmdict-simplified, build "jmdict-fre", licence CC BY-SA 4.0 — via EDRDG).
// Le dump n'est PAS committé : ce script le télécharge dans un dossier
// temporaire à chaque exécution, comme scripts/merge-french-n5.mjs.
//
// jmdict-fre ne contient QUE les entrées ayant au moins une glose française
// (~15 000, sur les ~200 000 de JMdict complet) : c'est déjà le sous-ensemble
// pertinent pour un dictionnaire orienté apprenant francophone, pas besoin de
// filtrer davantage.
//
// Usage : node scripts/build-dictionary.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { downloadJmdictFre } from './lib/jmdict-fre.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, '../app/data/dictionary.json')

function log(...args) {
  console.log('[build-dictionary]', ...args)
}

/** Forme à afficher : la variante marquée "common" si il y en a une, sinon la première. */
function pick(forms) {
  if (!forms.length) return null
  return (forms.find((f) => f.common) ?? forms[0]).text
}

function buildEntries(dump) {
  const entries = []
  for (const w of dump.words) {
    const kanji = pick(w.kanji)
    const reading = pick(w.kana)
    if (!reading) continue // pas de forme kana = entrée inexploitable pour nous

    const common = w.kanji.some((k) => k.common) || w.kana.some((k) => k.common)

    // Au plus 3 sens, au plus 3 gloses par sens : les mots grammaticaux/très
    // polysémiques peuvent en avoir des dizaines dans JMdict, inutile pour un
    // lookup rapide.
    const senses = w.sense
      .slice(0, 3)
      .map((s) =>
        s.gloss
          .filter((g) => g.lang === 'fre' && g.text)
          .slice(0, 3)
          .map((g) => g.text)
          .join(', '),
      )
      .filter(Boolean)
    if (!senses.length) continue

    entries.push({
      id: w.id,
      kanji: kanji || undefined,
      reading,
      common: common || undefined,
      gloss: senses.join(' ; '),
    })
  }
  return entries
}

const dump = downloadJmdictFre(log)
const entries = buildEntries(dump)
log(`${entries.length} entrées construites (source : ${dump.words.length} mots jmdict-fre v${dump.version}).`)

writeFileSync(OUT_PATH, JSON.stringify(entries))
log(`Écrit dans ${OUT_PATH} (${(readFileSync(OUT_PATH).length / 1024 / 1024).toFixed(2)} Mo).`)
