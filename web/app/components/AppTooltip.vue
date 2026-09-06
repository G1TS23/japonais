<script setup lang="ts">
// Infobulle légère en CSS : apparaît tout de suite au survol / focus (pas le
// délai ~1 s de l'attribut `title` natif). Enrobe l'élément déclencheur.
withDefaults(defineProps<{ label: string; placement?: 'left' | 'right' | 'top' | 'bottom' }>(), {
  placement: 'top',
})
</script>

<template>
  <span class="group pointer-events-auto relative inline-flex shrink-0">
    <slot />
    <span
      role="tooltip"
      class="pointer-events-none absolute z-30 hidden whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity duration-100 group-hover:opacity-100 group-focus-within:opacity-100 md:block dark:bg-neutral-700"
      :class="{
        'top-1/2 right-full mr-2 -translate-y-1/2': placement === 'left',
        'top-1/2 left-full ml-2 -translate-y-1/2': placement === 'right',
        'bottom-full left-1/2 mb-2 -translate-x-1/2': placement === 'top',
        'top-full left-1/2 mt-2 -translate-x-1/2': placement === 'bottom',
      }"
    >
      {{ label }}
    </span>
  </span>
</template>
