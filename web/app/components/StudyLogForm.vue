<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { StudyLogEntry } from '~/lib/db'
import { getStudyLog, recentStudyLogs, upsertStudyLog } from '~/lib/progress'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const date = ref(today())
const minutesActives = ref(0)
const minutesImmersion = ref(0)
const note = ref('')
const recent = ref<StudyLogEntry[]>([])
const saved = ref(false)

async function loadDate() {
  const existing = await getStudyLog(date.value)
  minutesActives.value = existing?.minutes_actives ?? 0
  minutesImmersion.value = existing?.minutes_immersion ?? 0
  note.value = existing?.note ?? ''
}

async function loadRecent() {
  recent.value = await recentStudyLogs(8)
}

onMounted(async () => {
  await loadDate()
  await loadRecent()
})

watch(date, loadDate)

async function save() {
  await upsertStudyLog({
    date: date.value,
    minutes_actives: minutesActives.value,
    minutes_immersion: minutesImmersion.value,
    note: note.value || undefined,
  })
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
  await loadRecent()
}
</script>

<template>
  <section class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
    <h2 class="mb-4 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Journal d'étude</h2>

    <div class="grid gap-5 sm:grid-cols-2">
      <SettingField label="Date">
        <input
          v-model="date"
          type="date"
          :max="today()"
          class="rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
        />
      </SettingField>

      <SettingField label="Minutes actives" description="manuel, grammaire, SRS…">
        <input
          v-model.number="minutesActives"
          type="number"
          min="0"
          class="w-24 rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
        />
      </SettingField>

      <SettingField label="Minutes immersion" description="écoute, lecture native…">
        <input
          v-model.number="minutesImmersion"
          type="number"
          min="0"
          class="w-24 rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
        />
      </SettingField>

      <SettingField label="Note" class="sm:col-span-2">
        <input
          v-model="note"
          type="text"
          placeholder="Genki L5, 20 min NHK Easy…"
          class="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
        />
      </SettingField>
    </div>

    <button
      class="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
      @click="save"
    >
      {{ saved ? 'Enregistré ✓' : 'Enregistrer' }}
    </button>

    <div v-if="recent.length" class="mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-800">
      <h3 class="mb-2 text-xs font-medium tracking-wide text-neutral-400 uppercase">Historique récent</h3>
      <ul class="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
        <li v-for="r in recent" :key="r.date" class="flex flex-wrap justify-between gap-x-3">
          <span class="shrink-0">{{ r.date }}</span>
          <span class="text-right">
            {{ r.minutes_actives }} min actif · {{ r.minutes_immersion }} min immersion
            <span v-if="r.note">— {{ r.note }}</span>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>
