<script setup lang="ts">
interface Option {
  value: string
  label: string
}

defineProps<{ modelValue: string; options: Option[]; label?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="inline-flex rounded-lg border border-neutral-300 p-0.5 dark:border-neutral-700"
  >
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      role="radio"
      :aria-checked="o.value === modelValue"
      class="rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
      :class="
        o.value === modelValue
          ? 'bg-brand-500 text-white'
          : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
      "
      @click="$emit('update:modelValue', o.value)"
    >
      {{ o.label }}
    </button>
  </div>
</template>
