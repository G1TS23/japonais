<script setup lang="ts">
import { useStorage } from '@vueuse/core'

// La racine mène directement à l'apprentissage — la dernière section visitée
// (SRS par défaut). Le tableau de bord reste accessible via /tableau-de-bord.
const lastLearning = useStorage('nav-last-learning', '/srs')
await navigateTo(lastLearning.value, { replace: true })
</script>

<template>
  <div />
</template>
