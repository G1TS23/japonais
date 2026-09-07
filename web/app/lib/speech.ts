/**
 * Aides pures pour la synthèse vocale (Web Speech API). La logique dépendante
 * du navigateur vit dans `composables/useSpeech.ts` ; ici, seulement du
 * testable.
 */

/** Vrai si la chaîne contient au moins un caractère japonais (kana ou kanji). */
export function hasJapanese(text: string): boolean {
  // Hiragana + katakana (U+3040–30FF), kanji (U+3400–4DBF, U+4E00–9FAF),
  // katakana demi-chasse (U+FF66–FF9F).
  return /[぀-ヿ㐀-䶿一-龯ｦ-ﾟ]/.test(text)
}

/**
 * Choisit la meilleure voix japonaise parmi celles exposées par le navigateur.
 * Préfère une voix locale (fonctionne hors-ligne), puis les voix « améliorées »,
 * puis la voix par défaut. Renvoie `null` si aucune voix japonaise.
 */
export function pickJapaneseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const jp = voices.filter((v) => v.lang === 'ja-JP' || v.lang.toLowerCase().startsWith('ja'))
  if (!jp.length) return null

  const score = (v: SpeechSynthesisVoice) =>
    (v.localService ? 2 : 0) +
    (/(enhanced|premium|natural|siri|kyoko|o-ren|otoya)/i.test(v.name) ? 1 : 0) +
    (v.default ? 0.5 : 0)

  return [...jp].sort((a, b) => score(b) - score(a))[0] ?? null
}
