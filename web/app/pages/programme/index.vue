<script setup lang="ts">
import { computed } from 'vue'
import { MILESTONES, PHASES } from '~/data/programme'
import { useLiveQuery } from '~/composables/useLiveQuery'
import {
  currentPhase,
  getCheckedCriteria,
  getMilestoneStates,
  milestonesDone,
  milestoneState,
  phaseCompletion,
  setMilestoneChecked,
} from '~/lib/progress'

useHead({ title: 'Programme — Japonais' })

const checked = useLiveQuery(() => getCheckedCriteria(), new Set<string>())
const milestoneStates = useLiveQuery(() => getMilestoneStates(), new Map())

const active = computed(() => currentPhase(checked.value))
const activeCompletion = computed(() => phaseCompletion(active.value, checked.value))
const doneMilestones = computed(() => milestonesDone(milestoneStates.value))

function toggleMilestone(id: string) {
  const isChecked = milestoneState(milestoneStates.value, id).checked
  setMilestoneChecked(id, !isChecked)
}
</script>

<template>
  <div>
    <PageHeader
      title="Programme"
      subtitle="Débutant → B2, par paliers JLPT. Voir PROGRAMME.md pour la version complète."
    />

    <section class="mb-6 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div class="text-xs font-medium tracking-wide text-neutral-400 uppercase">Phase en cours</div>
      <div class="mt-1 text-lg font-semibold">Phase {{ active.number }} — {{ active.title }}</div>
      <div v-if="activeCompletion.total" class="mt-2 max-w-xs">
        <div class="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div class="h-full bg-brand-500" :style="{ width: `${activeCompletion.pct}%` }" />
        </div>
        <div class="mt-1 text-xs text-neutral-400">
          {{ activeCompletion.done }} / {{ activeCompletion.total }} critères de sortie
        </div>
      </div>
    </section>

    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink
        v-for="phase in PHASES"
        :key="phase.id"
        :to="`/programme/${phase.id}`"
        class="rounded-xl border p-4 transition hover:border-brand-400 hover:shadow-sm dark:hover:border-brand-600"
        :class="
          phase.id === active.id
            ? 'border-brand-400 bg-brand-100 dark:border-brand-600 dark:bg-brand-500/15'
            : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
        "
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Phase {{ phase.number }}</span>
          <span v-if="phase.palier" class="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {{ phase.palier }}
          </span>
        </div>
        <h3 class="mt-1 font-semibold">{{ phase.title }}</h3>
        <p class="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{{ phase.summary }}</p>
        <div v-if="phase.exitCriteria.length" class="mt-3">
          <div class="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div class="h-full bg-brand-500" :style="{ width: `${phaseCompletion(phase, checked).pct}%` }" />
          </div>
          <div class="mt-1 text-xs text-neutral-400">
            {{ phaseCompletion(phase, checked).done }} / {{ phaseCompletion(phase, checked).total }} critères
          </div>
        </div>
      </NuxtLink>
    </div>

    <section class="mt-8 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Jalons</h2>
        <span class="text-xs text-neutral-400">{{ doneMilestones }} / {{ MILESTONES.length }}</span>
      </div>
      <ul class="space-y-2">
        <li v-for="m in MILESTONES" :key="m.id">
          <label class="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              class="mt-0.5 h-4 w-4 shrink-0 rounded accent-brand-500"
              :checked="milestoneState(milestoneStates, m.id).checked"
              @change="toggleMilestone(m.id)"
            />
            <span :class="milestoneState(milestoneStates, m.id).checked ? 'text-neutral-400 line-through' : ''">
              {{ m.text }}
            </span>
            <span v-if="milestoneState(milestoneStates, m.id).date" class="ml-auto shrink-0 text-xs text-neutral-400">
              {{ milestoneState(milestoneStates, m.id).date }}
            </span>
          </label>
        </li>
      </ul>
    </section>

    <StudyLogForm class="mt-6" />
  </div>
</template>
