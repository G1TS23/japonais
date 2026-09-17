<script setup lang="ts">
import { useId } from 'vue'

interface Option {
  value: string
  label: string
}

defineProps<{ modelValue: string; options: Option[]; label?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()

// Groupe de radios natifs : id unique par instance (plusieurs contrôles sur
// la même page — Thème, Langue, Vitesse… — ne doivent pas partager un `name`).
const groupName = useId()
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="inline-flex rounded-lg border border-neutral-300 p-0.5 dark:border-neutral-700"
  >
    <label
      v-for="o in options"
      :key="o.value"
      class="has-[:focus-visible]:ring-brand-500 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition has-[:focus-visible]:ring-2"
      :class="
        o.value === modelValue
          ? 'bg-brand-500 text-white'
          : 'text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700/70 dark:hover:text-neutral-100'
      "
    >
      <input
        type="radio"
        :name="groupName"
        :value="o.value"
        :checked="o.value === modelValue"
        class="sr-only"
        @change="$emit('update:modelValue', o.value)"
      />
      {{ o.label }}
    </label>
  </div>
</template>
