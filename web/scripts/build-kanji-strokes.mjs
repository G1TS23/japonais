#!/usr/bin/env node
// Construit app/data/kanji-strokes.json : l'ordre des traits (tracés SVG) des
// kanji du palier N5, depuis KanjiVG (licence CC BY-SA 3.0, Ulrich Apel —
// http://kanjivg.tagaini.net) et kanjidic2 (jmdict-simplified, pour la liste
// des kanji N5 — même source déjà utilisée pour le dictionnaire).
//
// Ni l'un ni l'autre n'est committé : ce script les télécharge dans un
// dossier temporaire à chaque exécution.
//
// Usage : node scripts/build-kanji-strokes.mjs

import { execSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, '../app/data/kanji-strokes.json')

function log(...args) {
  console.log('[build-kanji-strokes]', ...args)
}

/** Kanji du palier N5 : jlptLevel 4 dans kanjidic2 (ancienne numérotation JLPT — 4 = N5). */
async function fetchN5Kanji() {
  log('Récupération de kanjidic2 (jmdict-simplified)…')
  const release = await fetch('https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest').then((r) => r.json())
  const asset = release.assets.find((a) => /^kanjidic2-en-.*\.json\.tgz$/.test(a.name))
  if (!asset) throw new Error('Asset kanjidic2-en introuvable dans la dernière release.')
  const dir = mkdtempSync(join(tmpdir(), 'kanjidic2-'))
  const tgz = join(dir, asset.name)
  log(`Téléchargement ${asset.name} (${Math.round(asset.size / 1024 / 1024)} Mo)…`)
  execSync(`curl -sL "${asset.browser_download_url}" -o "${tgz}"`)
  execSync(`tar xzf "${tgz}" -C "${dir}"`)
  const jsonFile = execSync(`ls "${dir}"/*.json`).toString().trim()
  const data = JSON.parse(readFileSync(jsonFile, 'utf8'))
  return data.characters.filter((c) => c.misc.jlptLevel === 4).map((c) => c.literal)
}

/** Dossier contenant kanji/{codepoint}.svg, extrait de la dernière release KanjiVG. */
async function fetchKanjiVgDir() {
  log('Récupération de la dernière release KanjiVG…')
  const release = await fetch('https://api.github.com/repos/KanjiVG/kanjivg/releases/latest').then((r) => r.json())
  const asset = release.assets.find((a) => a.name.endsWith('-main.zip'))
  if (!asset) throw new Error('Asset "-main.zip" introuvable dans la dernière release KanjiVG.')
  const dir = mkdtempSync(join(tmpdir(), 'kanjivg-'))
  const zip = join(dir, asset.name)
  log(`Téléchargement ${asset.name} (${Math.round(asset.size / 1024 / 1024)} Mo)…`)
  execSync(`curl -sL "${asset.browser_download_url}" -o "${zip}"`)
  execSync(`unzip -q "${zip}" -d "${dir}"`)
  return join(dir, 'kanji')
}

/** Chemins de traits, dans l'ordre, extraits du SVG KanjiVG d'un kanji. */
function strokesFor(kanjiVgDir, kanji) {
  const hex = kanji.codePointAt(0).toString(16).padStart(5, '0')
  const svgPath = join(kanjiVgDir, `${hex}.svg`)
  if (!existsSync(svgPath)) return null
  const svg = readFileSync(svgPath, 'utf8')
  return [...svg.matchAll(/<path\s[^>]*\bd="([^"]+)"/g)].map((m) => m[1])
}

const n5Kanji = await fetchN5Kanji()
log(`${n5Kanji.length} kanji N5 (kanjidic2 jlptLevel=4).`)

const kanjiVgDir = await fetchKanjiVgDir()
const entries = []
const missing = []
for (const kanji of n5Kanji) {
  const strokes = strokesFor(kanjiVgDir, kanji)
  if (strokes?.length) entries.push({ kanji, strokes })
  else missing.push(kanji)
}

if (missing.length) log(`Sans tracé KanjiVG (${missing.length}) :`, missing.join(', '))
log(`${entries.length} kanji avec tracé construits.`)

writeFileSync(OUT_PATH, JSON.stringify(entries))
log(`Écrit dans ${OUT_PATH} (${(readFileSync(OUT_PATH).length / 1024).toFixed(0)} Ko).`)
