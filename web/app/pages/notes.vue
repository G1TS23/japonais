<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getDb, type Card } from '~/lib/db'
import { createNote, deleteNote, PERSO_TAG, updateNote, type NoteInput } from '~/lib/notes'
import { useLiveQuery } from '~/composables/useLiveQuery'

useHead({ title: 'Mes notes — Japonais' })

const db = getDb()
const notes = useLiveQuery(
  async () => (await db.cards.where('tags').equals(PERSO_TAG).toArray()).sort((a, b) => b.created_at - a.created_at),
  [] as Card[],
)

const message = ref<{ kind: 'ok' | 'err'; text: string } | null>(null)
function flash(kind: 'ok' | 'err', text: string) {
  message.value = { kind, text }
  setTimeout(() => (message.value = null), 4000)
}

function emptyInput(): NoteInput {
  return { type: 'vocab', terme: '', lecture: '', sensFr: '', exempleJp: '', exempleFr: '', seance: '' }
}

const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<NoteInput>(emptyInput())

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyInput())
  showForm.value = true
}

function openEdit(card: Card) {
  editingId.value = card.id
  Object.assign(form, {
    type: card.kind === 'perso-note' ? 'grammaire' : 'vocab',
    terme: card.terme,
    lecture: card.lecture,
    sensFr: card.sens_fr ?? '',
    exempleJp: card.exemple_jp ?? '',
    exempleFr: card.exemple_fr ?? '',
    seance: card.tags.find((t) => t.startsWith('seance:'))?.slice('seance:'.length) ?? '',
  })
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
}

async function onSubmit() {
  if (!form.terme.trim() || !form.sensFr.trim()) {
    flash('err', 'Terme et sens sont obligatoires.')
    return
  }
  const input: NoteInput = {
    ...form,
    exempleJp: form.exempleJp?.trim() || undefined,
    exempleFr: form.exempleFr?.trim() || undefined,
    seance: form.seance?.trim() || undefined,
  }
  if (editingId.value) {
    await updateNote(editingId.value, input)
    flash('ok', 'Note modifiée.')
  } else {
    await createNote(input)
    flash('ok', 'Note ajoutée.')
  }
  closeForm()
}

async function onDelete(card: Card) {
  if (!confirm(`Supprimer la note « ${card.terme} » ?`)) return
  await deleteNote(card.id)
  flash('ok', 'Note supprimée.')
}
</script>

<template>
  <div>
    <PageHeader title="Mes notes" subtitle="Vocabulaire et grammaire de tes cours — révisés dans la file quotidienne (/srs)." />

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

    <section
      v-if="showForm"
      class="mb-5 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2 class="mb-4 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
        {{ editingId ? 'Modifier la note' : 'Ajouter une note' }}
      </h2>

      <div class="space-y-5">
        <SettingField label="Type">
          <SegmentedControl
            label="Type"
            :model-value="form.type"
            :options="[
              { value: 'vocab', label: 'Vocabulaire' },
              { value: 'grammaire', label: 'Grammaire' },
            ]"
            @update:model-value="form.type = $event as 'vocab' | 'grammaire'"
          />
        </SettingField>

        <div class="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <SettingField :label="form.type === 'vocab' ? 'Terme' : 'Titre / structure'">
            <input
              id="note-terme"
              v-model="form.terme"
              type="text"
              :aria-label="form.type === 'vocab' ? 'Terme' : 'Titre / structure'"
              class="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-base dark:border-neutral-700"
            />
          </SettingField>

          <SettingField :label="form.type === 'vocab' ? 'Lecture' : 'Sens court'">
            <input
              id="note-lecture"
              v-model="form.lecture"
              type="text"
              :aria-label="form.type === 'vocab' ? 'Lecture' : 'Sens court'"
              class="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-base dark:border-neutral-700"
            />
          </SettingField>
        </div>

        <SettingField :label="form.type === 'vocab' ? 'Sens' : 'Explication'">
          <textarea
            id="note-sens-fr"
            v-model="form.sensFr"
            rows="3"
            :aria-label="form.type === 'vocab' ? 'Sens' : 'Explication'"
            class="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-base dark:border-neutral-700"
          />
        </SettingField>

        <div class="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <SettingField label="Exemple (japonais)" description="optionnel">
            <input
              id="note-exemple-jp"
              v-model="form.exempleJp"
              type="text"
              aria-label="Exemple (japonais)"
              class="jp w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-base dark:border-neutral-700"
            />
          </SettingField>
          <SettingField label="Exemple (français)" description="optionnel">
            <input
              id="note-exemple-fr"
              v-model="form.exempleFr"
              type="text"
              aria-label="Exemple (français)"
              class="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-base dark:border-neutral-700"
            />
          </SettingField>
        </div>

        <SettingField label="Date de séance" description="optionnel">
          <input
            id="note-seance"
            v-model="form.seance"
            type="date"
            aria-label="Date de séance"
            class="rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-base dark:border-neutral-700 dark:bg-neutral-900"
          />
        </SettingField>
      </div>

      <div class="mt-5 flex gap-3">
        <button
          class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          @click="onSubmit"
        >
          {{ editingId ? 'Enregistrer' : 'Ajouter' }}
        </button>
        <button
          class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          @click="closeForm"
        >
          Annuler
        </button>
      </div>
    </section>

    <button
      v-else
      class="mb-5 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
      @click="openCreate"
    >
      Ajouter une note
    </button>

    <section class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 class="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
        {{ notes.length }} note{{ notes.length === 1 ? '' : 's' }}
      </h2>
      <p v-if="!notes.length" class="text-sm text-neutral-400">
        Aucune note pour l'instant — ajoute du vocabulaire ou un point de grammaire vus en cours.
      </p>
      <ul v-else class="divide-y divide-neutral-100 dark:divide-neutral-800">
        <li v-for="n in notes" :key="n.id" class="flex items-center justify-between gap-3 py-2.5">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="jp truncate font-medium">{{ n.terme }}</span>
              <span
                class="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {{ n.kind === 'perso-note' ? 'Grammaire' : 'Vocabulaire' }}
              </span>
            </div>
            <div class="truncate text-sm text-neutral-500 dark:text-neutral-400">{{ n.sens_fr }}</div>
          </div>
          <div class="flex shrink-0 gap-2">
            <button
              class="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              @click="openEdit(n)"
            >
              Modifier
            </button>
            <button
              class="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
              @click="onDelete(n)"
            >
              Supprimer
            </button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
