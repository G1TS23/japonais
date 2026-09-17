import type { IconName } from '~/components/AppIcon.vue'

export interface NavLink {
  to: string
  label: string
  /** Libellé compact pour la barre basse de la section Apprentissage. */
  short: string
  icon: IconName
}

/**
 * Vrai si `path` correspond à `to` (page exacte ou une de ses sous-routes).
 * Partagé entre l'état actif de la nav et le suivi de la dernière section
 * d'apprentissage visitée, pour que les deux s'accordent toujours.
 */
export function matchesRoute(path: string, to: string): boolean {
  return path === to || path.startsWith(to + '/')
}

// Navigation à deux niveaux. Premier niveau : les quatre grandes zones de
// l'appli (voir `topLinks` ci-dessous). « Apprentissage » n'est pas une page
// mais un regroupement — on y entre par sa dernière section visitée, et une
// barre dédiée permet ensuite de passer d'une section à l'autre.
export const LEARNING_LINKS: NavLink[] = [
  { to: '/kana', label: 'Kana', short: 'Kana', icon: 'language' },
  { to: '/srs', label: 'Review', short: 'Review', icon: 'rectangle-stack' },
  { to: '/grammaire', label: 'Grammaire', short: 'Gram.', icon: 'book-open' },
  { to: '/quiz', label: 'Quiz', short: 'Quiz', icon: 'pencil-square' },
  { to: '/dictionnaire', label: 'Dictionnaire', short: 'Dico', icon: 'magnifying-glass' },
  { to: '/lecture', label: 'Lecture', short: 'Lecture', icon: 'document-text' },
  { to: '/kanji', label: 'Kanji', short: 'Kanji', icon: 'pencil' },
]

/** Clé de mémorisation de la dernière section d'apprentissage visitée. */
export const LAST_LEARNING_STORAGE_KEY = 'nav-last-learning'
export const DEFAULT_LEARNING_ROUTE = '/srs'

// Après « Apprentissage » dans la navigation. La racine « / » redirige vers
// l'apprentissage : le tableau de bord vit sur sa propre route.
export const TOP_LINKS: NavLink[] = [
  { to: '/tableau-de-bord', label: 'Tableau de bord', short: 'Tableau', icon: 'chart-bar' },
  { to: '/programme', label: 'Programme', short: 'Prog.', icon: 'map' },
  { to: '/settings', label: 'Réglages', short: 'Régl.', icon: 'cog-6-tooth' },
]
