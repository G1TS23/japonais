<script setup lang="ts">
import { COUNTERS, numberReading } from '~/data/numbers'

useHead({ title: 'Chiffres — Japonais' })

/** Exemples illustrant les irrégularités de 百/千, générés depuis `numberReading` pour rester exacts. */
const HUNDREDS_EXAMPLES = [100, 200, 300, 600, 800]
const THOUSANDS_EXAMPLES = [1000, 3000, 6000, 8000]

/**
 * 万 est hors de l'intervalle géré par `numberReading` (0–9999, portée retenue pour ce lot) :
 * ces deux exemples sont donc rédigés à la main plutôt que calculés.
 */
const MAN_EXAMPLES = [
  { kanji: '一万', kana: 'いちまん' },
  { kanji: '二万', kana: 'にまん' },
]

function reading(n: number) {
  return numberReading(n)
}
</script>

<template>
  <div>
    <PageHeader
      title="Chiffres"
      subtitle="Pense-bête : nombres cardinaux et compteurs courants, avec leurs lectures irrégulières."
    />

    <section class="mb-6 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 class="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
        Règles de lecture — 百 (centaines), 千 (milliers), 万 (dix-milliers)
      </h2>
      <p class="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
        Les dizaines (十) sont régulières. 百 et 千 ont chacun leurs propres exceptions de voisement/gémination — deux
        tables distinctes, qui ne se recoupent pas (ex. 6 géminé sur 百 mais pas sur 千).
      </p>
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <h3 class="jp mb-1 text-xs font-semibold text-neutral-400">百</h3>
          <ul class="jp space-y-0.5 text-sm">
            <li v-for="n in HUNDREDS_EXAMPLES" :key="n">{{ reading(n).kanji }} — {{ reading(n).kana }}</li>
          </ul>
        </div>
        <div>
          <h3 class="jp mb-1 text-xs font-semibold text-neutral-400">千</h3>
          <ul class="jp space-y-0.5 text-sm">
            <li v-for="n in THOUSANDS_EXAMPLES" :key="n">{{ reading(n).kanji }} — {{ reading(n).kana }}</li>
          </ul>
        </div>
        <div>
          <h3 class="jp mb-1 text-xs font-semibold text-neutral-400">万</h3>
          <ul class="jp space-y-0.5 text-sm">
            <li v-for="m in MAN_EXAMPLES" :key="m.kanji">{{ m.kanji }} — {{ m.kana }}</li>
          </ul>
          <p class="mt-1 text-xs text-neutral-400">一万 garde son いち, contrairement à 百/千 (百, せん sans いち).</p>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 class="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Compteurs</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-neutral-200 text-left text-xs text-neutral-400 dark:border-neutral-800">
              <th class="py-2 pr-3 font-medium">Compteur</th>
              <th v-for="n in 10" :key="n" class="px-1.5 py-2 text-center font-medium tabular-nums">{{ n }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
            <tr v-for="c in COUNTERS" :key="c.id">
              <td class="jp py-2 pr-3 whitespace-nowrap">
                <div class="font-medium">{{ c.kanji }}</div>
                <div class="text-xs text-neutral-400">{{ c.label }}</div>
              </td>
              <td v-for="(r, i) in c.readings" :key="i" class="jp px-1.5 py-2 text-center whitespace-nowrap">
                {{ r }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul class="mt-4 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
        <li v-for="c in COUNTERS.filter((c) => c.notes?.length)" :key="c.id">
          <span class="jp font-medium">{{ c.kanji }}</span> — {{ c.notes!.join(' ') }}
        </li>
      </ul>
    </section>
  </div>
</template>
