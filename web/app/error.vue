<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 p-6 text-center dark:bg-neutral-950 dark:text-neutral-100"
  >
    <div class="text-4xl">🍜</div>
    <h1 class="text-lg font-semibold">{{ error.statusCode }} — une erreur est survenue</h1>
    <p class="max-w-md text-sm text-neutral-500 dark:text-neutral-400">{{ error.message }}</p>
    <button
      class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      @click="clearError({ redirect: '/' })"
    >
      Retour au tableau de bord
    </button>
  </div>
</template>
