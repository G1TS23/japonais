<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { DEFAULT_LEARNING_ROUTE, LAST_LEARNING_STORAGE_KEY, LEARNING_LINKS } from '~/lib/nav-links'

// La racine mène directement à l'apprentissage — la dernière section visitée
// (SRS par défaut). Le tableau de bord reste accessible via /tableau-de-bord.
const lastLearning = useStorage(LAST_LEARNING_STORAGE_KEY, DEFAULT_LEARNING_ROUTE)
// Filet contre une valeur périmée en localStorage (route renommée/supprimée
// depuis) : on retombe sur la section par défaut plutôt que de rediriger vers
// une route morte.
const target = LEARNING_LINKS.some((l) => l.to === lastLearning.value)
  ? lastLearning.value
  : DEFAULT_LEARNING_ROUTE

await navigateTo(target, { replace: true })
</script>

<template>
  <div />
</template>
