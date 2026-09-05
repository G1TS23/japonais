<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { downloadBackup, importAll, resetAll } from '~/lib/backup'

useHead({ title: 'Réglages — Japonais' })

const settings = useSettingsStore()
onMounted(() => settings.load())

const fileInput = ref<HTMLInputElement | null>(null)
const message = ref<{ kind: 'ok' | 'err'; text: string } | null>(null)

function flash(kind: 'ok' | 'err', text: string) {
  message.value = { kind, text }
  setTimeout(() => (message.value = null), 4000)
}

async function onExport() {
  try {
    await downloadBackup()
    flash('ok', 'Sauvegarde téléchargée.')
  } catch (e) {
    flash('err', `Échec de l’export : ${(e as Error).message}`)
  }
}

async function onImportFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!confirm('Importer remplacera toutes les données locales actuelles. Continuer ?')) {
    if (fileInput.value) fileInput.value.value = ''
    return
  }
  try {
    const res = await importAll(await file.text())
    settings.loaded = false
    await settings.load()
    const total = res.tables.reduce((n, t) => n + t.count, 0)
    flash('ok', `Import réussi : ${total} enregistrement(s) restauré(s).`)
  } catch (err) {
    flash('err', `Échec de l’import : ${(err as Error).message}`)
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function onReset() {
  if (!confirm('Effacer DÉFINITIVEMENT toutes les données locales (SRS, progression, quiz) ?')) return
  if (!confirm('Vraiment sûr ? Cette action est irréversible.')) return
  await resetAll()
  await settings.resetToDefaults()
  flash('ok', 'Données locales effacées.')
}
</script>

<template>
  <div>
    <PageHeader title="Réglages" />

    <div
      v-if="message"
      class="mb-4 rounded-lg px-4 py-2 text-sm"
      :class="
        message.kind === 'ok'
          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
      "
    >
      {{ message.text }}
    </div>

    <section class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 class="mb-4 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Préférences</h2>

      <div class="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <SettingField label="Thème">
          <SegmentedControl
            label="Thème"
            :model-value="settings.values.theme"
            :options="[
              { value: 'system', label: 'Système' },
              { value: 'light', label: 'Clair' },
              { value: 'dark', label: 'Sombre' },
            ]"
            @update:model-value="settings.set('theme', $event as any)"
          />
        </SettingField>

        <SettingField label="Langue des définitions">
          <SegmentedControl
            label="Langue des définitions"
            :model-value="settings.values.sensLang"
            :options="[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'Anglais' },
            ]"
            @update:model-value="settings.set('sensLang', $event as any)"
          />
        </SettingField>

        <SettingField label="Nouvelles cartes / jour" description="plafond dans la file SRS">
          <input
            type="number"
            min="0"
            max="100"
            :value="settings.values.newCardsPerDay"
            class="w-20 rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
            @change="settings.set('newCardsPerDay', Math.max(0, Number(($event.target as HTMLInputElement).value) || 0))"
          />
        </SettingField>

        <SettingField label="Cible de rétention" description="FSRS — probabilité de rappel visée">
          <input
            type="number"
            min="0.7"
            max="0.99"
            step="0.01"
            :value="settings.values.retention"
            class="w-20 rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
            @change="
              settings.set(
                'retention',
                Math.min(0.99, Math.max(0.7, Number(($event.target as HTMLInputElement).value) || 0.9)),
              )
            "
          />
        </SettingField>
      </div>
    </section>

    <section class="mt-5 space-y-4 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Données</h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Tout est stocké localement (IndexedDB). Aucune synchronisation : pense à exporter régulièrement.
      </p>
      <div class="flex flex-wrap gap-3">
        <button
          class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          @click="onExport"
        >
          Exporter (JSON)
        </button>
        <button
          class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          @click="fileInput?.click()"
        >
          Importer…
        </button>
        <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="onImportFile" />
        <button
          class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
          @click="onReset"
        >
          Tout effacer
        </button>
      </div>
    </section>
  </div>
</template>
