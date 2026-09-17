#!/usr/bin/env node
// Complète app/data/vocab-n5.json avec des sens en français, à partir de
// l'édition française de JMdict (jmdict-simplified, "jmdict-fre").
// Le dump JMdict-fre n'est PAS committé (~8 Mo décompressé) : ce script le
// télécharge dans un dossier temporaire, matche par (kanji, lecture), et
// écrit le résultat dans app/data/vocab-n5.json. Les entrées non trouvées
// (formes composées, préfixes/suffixes de compteurs, lectures rares)
// restent à null et doivent être complétées à la main dans MANUAL_FR
// ci-dessous.
//
// Usage : node scripts/merge-french-n5.mjs

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { downloadJmdictFre } from './lib/jmdict-fre.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VOCAB_PATH = join(__dirname, '../app/data/vocab-n5.json')

/** Sens complétés à la main pour les quelques entrées que JMdict-fre ne couvre pas. */
const MANUAL_FR = {
  'いかが|いかが': 'comment, de quelle manière (poli)',
  '～月|～がつ': 'mois (de l’année)',
  '十|(〜を) とお': 'dix',
  '何～|なん～': 'quel genre de ~, quel ~',
  'ゆっくりと|ゆっくりと': 'lentement, tranquillement',
  'ラジオカセ|ラジオカセ': 'radio-cassette (lecteur)',
  '私|わたくし': 'je, moi (registre très poli)',
}

function log(...args) {
  console.log('[merge-french-n5]', ...args)
}

/** Retire les doublons casse-insensible en gardant l'ordre d'apparition. */
function dedupe(strings) {
  const seen = new Set()
  const out = []
  for (const s of strings) {
    const key = s.trim().toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
  }
  return out
}

/** Sens français combiné d'un mot JMdict (2 premiers sens, 3 gloses max chacun), ou `null` si aucun. */
function combinedSense(word) {
  const senseStrings = []
  for (const sense of word.sense) {
    const texts = sense.gloss.filter((g) => g.lang === 'fre').map((g) => g.text)
    if (texts.length) senseStrings.push(dedupe(texts.slice(0, 3)).join(', '))
  }
  if (!senseStrings.length) return null
  return dedupe(senseStrings.slice(0, 2)).join(' ; ')
}

/** Indexe un mot JMdict déjà résolu (`combined` non nul) dans les deux maps, sans écraser une entrée existante. */
function registerWord(pairMap, kanaMap, word, combined) {
  const kanaTexts = word.kana.map((k) => k.text)
  const kanjiTexts = word.kanji.map((k) => k.text)

  for (const kana of kanaTexts) {
    if (!kanaMap.has(kana)) kanaMap.set(kana, combined)
    const selfKey = `${kana}|${kana}`
    if (!pairMap.has(selfKey)) pairMap.set(selfKey, combined)
  }
  for (const kanji of kanjiTexts) {
    for (const kana of kanaTexts) {
      const key = `${kanji}|${kana}`
      if (!pairMap.has(key)) pairMap.set(key, combined)
    }
  }
}

function buildLookup(words) {
  const pairMap = new Map()
  const kanaMap = new Map()
  for (const w of words) {
    const combined = combinedSense(w)
    if (combined) registerWord(pairMap, kanaMap, w, combined)
  }
  return { pairMap, kanaMap }
}

function variants(s) {
  const out = new Set([s])
  out.add(s.replace(/^～/, ''))
  out.add(s.replace(/～$/, ''))
  out.add(s.replace(/^～|～$/g, ''))
  out.add(s.replace(/^お/, ''))
  out.add(s.replace(/\(する\)\s*$/, '').trim())
  out.add(s.replace(/する$/, ''))
  return [...out].filter(Boolean)
}

function splitParts(s) {
  return s.split(/；|;\s*/).map((p) => p.trim()).filter(Boolean)
}

/** Toutes les clés `terme|lecture` à essayer (produit des variantes de chaque partie). */
function variantPairKeys(termeParts, lectureParts) {
  const keys = []
  for (const t of termeParts) {
    for (const l of lectureParts) {
      for (const tv of variants(t)) {
        for (const lv of variants(l)) keys.push(`${tv}|${lv}`)
      }
    }
  }
  return keys
}

function findPairHit(pairMap, termeParts, lectureParts) {
  for (const key of variantPairKeys(termeParts, lectureParts)) {
    const hit = pairMap.get(key)
    if (hit) return hit
  }
  return null
}

function findKanaHit(kanaMap, lectureParts) {
  for (const l of lectureParts) {
    for (const lv of variants(l)) {
      const hit = kanaMap.get(lv)
      if (hit) return hit
    }
  }
  return null
}

function lookup({ pairMap, kanaMap }, terme, lecture) {
  const termeParts = splitParts(terme)
  const lectureParts = splitParts(lecture)
  return findPairHit(pairMap, termeParts, lectureParts) ?? findKanaHit(kanaMap, lectureParts)
}

function main() {
  if (!existsSync(VOCAB_PATH)) throw new Error(`${VOCAB_PATH} introuvable — lance d'abord import-vocab-n5.mjs.`)
  const vocab = JSON.parse(readFileSync(VOCAB_PATH, 'utf8'))

  const { words } = downloadJmdictFre(log)
  const index = buildLookup(words)

  let fromJmdict = 0
  let fromManual = 0
  let stillMissing = []

  for (const entry of vocab) {
    if (entry.sens_fr) continue // déjà rempli (ré-exécution du script)
    const manual = MANUAL_FR[entry.content_id]
    if (manual) {
      entry.sens_fr = manual
      entry.sens_fr_source = 'manuel'
      fromManual++
      continue
    }
    const hit = lookup(index, entry.terme, entry.lecture)
    if (hit) {
      entry.sens_fr = hit
      entry.sens_fr_source = 'jmdict'
      fromJmdict++
    } else {
      stillMissing.push(entry.content_id)
    }
  }

  writeFileSync(VOCAB_PATH, JSON.stringify(vocab, null, 2) + '\n')
  log(`Français ajouté : ${fromJmdict} depuis JMdict, ${fromManual} manuels.`)
  if (stillMissing.length) {
    log(`Toujours sans français (${stillMissing.length}) :`, stillMissing.join(', '))
  } else {
    log('Toutes les entrées ont un sens français. ✔')
  }
}

main()
