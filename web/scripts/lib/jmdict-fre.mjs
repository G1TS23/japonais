// Téléchargement du dump jmdict-fre (jmdict-simplified, CC BY-SA 4.0, via
// EDRDG) — partagé par merge-french-n5.mjs et build-dictionary.mjs. Le dump
// n'est jamais committé : il est récupéré dans un dossier temporaire à
// chaque exécution.

import { execSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const RELEASE_API = 'https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest'

/**
 * Télécharge et parse la dernière release de jmdict-fre.
 * @param {(...args: unknown[]) => void} [log] logger du script appelant (préfixe distinct par script).
 */
export function downloadJmdictFre(log = () => {}) {
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
