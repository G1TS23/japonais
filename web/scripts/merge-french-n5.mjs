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

import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VOCAB_PATH = join(__dirname, '../app/data/vocab-n5.json')

const RELEASE_API = 'https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest'

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

function downloadJmdictFre() {
  log('Récupération de la dernière release jmdict-simplified…')
  const release = JSON.parse(execSync(`curl -sL ${RELEASE_API}`).toString())
  const asset = release.assets.find((a) => /^jmdict-fre-.*\.json\.tgz$/.test(a.name))
  if (!asset) throw new Error('Asset jmdict-fre introuvable dans la dernière release.')

  const dir = mkdtempSync(join(tmpdir(), 'jmdict-fre-'))
  const tgz = join(dir, asset.name)
  log(`Téléchargement ${asset.name} (${Math.round(asset.size / 1024)} Ko)…`)
  execSync(`curl -sL "${asset.browser_download_url}" -o "${tgz}"`)
  execSync(`tar xzf "${tgz}" -C "${dir}"`)
  const jsonFile = execSync(`ls "${dir}"/*.json`).toString().trim()
  log('Extrait ->', jsonFile)
  return JSON.parse(readFileSync(jsonFile, 'utf8'))
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

function buildLookup(words) {
  const pairMap = new Map()
  const kanaMap = new Map()

  for (const w of words) {
    const senseStrings = []
    for (const sense of w.sense) {
      const texts = sense.gloss.filter((g) => g.lang === 'fre').map((g) => g.text)
      if (texts.length) senseStrings.push(dedupe(texts.slice(0, 3)).join(', '))
    }
    if (!senseStrings.length) continue
    const combined = dedupe(senseStrings.slice(0, 2)).join(' ; ')

    const kanaTexts = w.kana.map((k) => k.text)
    const kanjiTexts = w.kanji.map((k) => k.text)

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
  return { pairMap, kanaMap }
}

function variants(s) {
  const out = new Set([s])
  out.add(s.replace(/^～/, ''))
  out.add(s.replace(/～$/, ''))
  out.add(s.replace(/^～|～$/g, ''))
  out.add(s.replace(/^お/, ''))
  out.add(s.replace(/\s*\(する\)\s*$/, ''))
  out.add(s.replace(/する$/, ''))
  return [...out].filter(Boolean)
}

function lookup({ pairMap, kanaMap }, terme, lecture) {
  const termeParts = terme.split(/；|;\s*/).map((s) => s.trim()).filter(Boolean)
  const lectureParts = lecture.split(/；|;\s*/).map((s) => s.trim()).filter(Boolean)
  for (const t of termeParts) {
    for (const l of lectureParts) {
      for (const tv of variants(t)) {
        for (const lv of variants(l)) {
          const hit = pairMap.get(`${tv}|${lv}`)
          if (hit) return hit
        }
      }
    }
  }
  for (const l of lectureParts) {
    for (const lv of variants(l)) {
      const hit = kanaMap.get(lv)
      if (hit) return hit
    }
  }
  return null
}

function main() {
  if (!existsSync(VOCAB_PATH)) throw new Error(`${VOCAB_PATH} introuvable — lance d'abord import-vocab-n5.mjs.`)
  const vocab = JSON.parse(readFileSync(VOCAB_PATH, 'utf8'))

  const { words } = downloadJmdictFre()
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
