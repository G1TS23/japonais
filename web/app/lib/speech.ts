/**
 * Aides pures pour la synthèse vocale (Web Speech API). La logique dépendante
 * du navigateur vit dans `composables/useSpeech.ts` ; ici, seulement du
 * testable.
 */

/**
 * Nettoie un énoncé avant lecture : les marqueurs de trou (« ＿＿ », « ___ »)
 * étaient lus « underscore underscore », et les parenthèses d'indication ne
 * font pas partie de la phrase à entendre.
 */
export function speechText(text: string): string {
  return text
    .replace(/[＿_]+/g, ' ')
    .replace(/（[^）]*）/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

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

/** Sous-ensemble japonais des voix, triées de la plus « fiable » à la moins. */
export function japaneseVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const score = (v: SpeechSynthesisVoice) =>
    (PREFERRED_VOICE.test(v.name) ? 10 : 0) + (v.localService ? 2 : 0) + (v.default ? 1 : 0)
  return voices
    .filter((v) => v.lang === 'ja-JP' || v.lang.toLowerCase().startsWith('ja'))
    .sort((a, b) => score(b) - score(a))
}

/**
 * Choisit la meilleure voix japonaise parmi celles exposées par le navigateur.
 * Ordre : voix connue-fiable > voix locale (hors-ligne) > voix par défaut.
 * Renvoie `null` si aucune voix japonaise.
 */
export function pickJapaneseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return japaneseVoices(voices)[0] ?? null
}

/**
 * Voix à utiliser : celle nommée `preferredName` si elle est présente, sinon le
 * meilleur choix automatique.
 */
export function resolveJapaneseVoice(
  voices: SpeechSynthesisVoice[],
  preferredName?: string | null,
): SpeechSynthesisVoice | null {
  if (preferredName) {
    const match = voices.find((v) => v.name === preferredName)
    if (match) return match
  }
  return pickJapaneseVoice(voices)
}
