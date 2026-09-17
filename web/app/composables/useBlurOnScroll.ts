import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Referme le clavier virtuel dès que la page défile.
 *
 * Sur iOS Safari, la nav en `position: fixed` se met à « flotter » de façon
 * erratique pendant un scroll tant que le clavier reste ouvert (viewport
 * visuel ≠ viewport de layout) — reproduit en scrollant les résultats du
 * dictionnaire avec le clavier encore affiché. Blur() sur un champ non
 * focus est un no-op, donc l'écouteur peut rester actif en permanence.
 */
export function useBlurOnScroll(target: Ref<HTMLElement | null>): void {
  function onScroll() {
    target.value?.blur()
  }
  onMounted(() => {
    // 'touchmove' se déclenche dès le début du geste de scroll, avant que le
    // navigateur n'ait recalculé la position de la nav fixed — plus efficace
    // que 'scroll' seul, qui n'arrive qu'une fois le défilement déjà entamé.
    window.addEventListener('touchmove', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
  })
  onUnmounted(() => {
    window.removeEventListener('touchmove', onScroll)
    window.removeEventListener('scroll', onScroll)
  })
}
