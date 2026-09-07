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
 * Voix japonaises réputées stables et fluides (Chrome bégaie sur certaines des
 * nouvelles voix « neuronales » macOS : Eddy, Flo, Rocko…). On les privilégie
 * fortement quand elles sont là.
 */
const PREFERRED_VOICE = /\b(kyoko|otoya|o-?ren|hattori|haruka|ichiro|sayaka)\b/i

/**
 * Choisit la meilleure voix japonaise parmi celles exposées par le navigateur.
 * Ordre : voix connue-fiable > voix locale (hors-ligne) > voix par défaut.
 * Renvoie `null` si aucune voix japonaise.
 */
export function pickJapaneseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const jp = voices.filter((v) => v.lang === 'ja-JP' || v.lang.toLowerCase().startsWith('ja'))
  if (!jp.length) return null

  const score = (v: SpeechSynthesisVoice) =>
    (PREFERRED_VOICE.test(v.name) ? 10 : 0) + (v.localService ? 2 : 0) + (v.default ? 1 : 0)

  return [...jp].sort((a, b) => score(b) - score(a))[0] ?? null
}
