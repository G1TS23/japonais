#!/usr/bin/env node
// Convertit scripts/sources/jlpt-n5.csv (open-anki-jlpt-decks, MIT) en
// app/data/vocab-n5.json, au format consommé par l'app.
// Voir scripts/README.md pour la provenance et comment rafraîchir la source.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dirname, 'sources/jlpt-n5.csv')
const OUT = join(__dirname, '../app/data/vocab-n5.json')

/** Parseur CSV minimal (RFC4180, sans guillemets échappés — suffisant ici). */
function parseCsvLine(line) {
  const fields = []
  let cur = ''
  let inQuotes = false
  for (const c of line) {
    if (c === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (c === ',' && !inQuotes) {
      fields.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  fields.push(cur)
  return fields
}

const text = readFileSync(SRC, 'utf8')
const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
const rows = lines.slice(1).map(parseCsvLine) // ignore l'en-tête

const seen = new Set()
const entries = []
let skipped = 0

for (const row of rows) {
  const [terme, lecture, meaning] = row
  if (!terme?.trim() || !lecture?.trim()) {
    skipped++
    continue
  }
  const content_id = `${terme}|${lecture}`
  if (seen.has(content_id)) {
    skipped++
    continue
  }
  seen.add(content_id)
  entries.push({
    content_id,
    terme: terme.trim(),
    lecture: lecture.trim(),
    sens_en: (meaning ?? '').trim(),
    sens_fr: null,
    sens_fr_source: null,
    tags: ['n5'],
  })
}

writeFileSync(OUT, JSON.stringify(entries, null, 2) + '\n')
console.log(`Écrit ${entries.length} entrées -> ${OUT}${skipped ? ` (${skipped} lignes ignorées)` : ''}`)
