<script setup lang="ts">
defineProps<{ label: string; description?: string }>()
</script>

<template>
  <div class="space-y-2">
    <div>
      <span class="text-sm font-medium">{{ label }}</span>
      <span v-if="description" class="block text-xs text-neutral-400">{{ description }}</span>
    </div>
    <div><slot /></div>
  </div>
</template>
