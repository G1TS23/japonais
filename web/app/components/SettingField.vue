<script setup lang="ts">
// `inline` : label + contrôle côte à côte (adapté aux switches, compacts par
// nature). Par défaut : label au-dessus, contrôle en dessous.
defineProps<{ label: string; description?: string; inline?: boolean }>()
</script>

<template>
  <div v-if="inline" class="flex items-center gap-3">
    <div>
      <span class="text-sm font-medium">{{ label }}</span>
      <span v-if="description" class="block text-xs text-neutral-400">{{ description }}</span>
    </div>
    <slot />
  </div>
  <div v-else class="space-y-2">
    <div>
      <span class="text-sm font-medium">{{ label }}</span>
      <span v-if="description" class="block text-xs text-neutral-400">{{ description }}</span>
    </div>
    <div><slot /></div>
  </div>
</template>
