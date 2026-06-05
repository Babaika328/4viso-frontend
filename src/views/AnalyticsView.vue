<template>
  <div class="p-6 space-y-5">

    <!-- Summary stats -->
    <div class="grid grid-cols-5 gap-4">
      <div
        v-for="stat in summaryStats"
        :key="stat.label"
        class="bg-white border border-gray-200 rounded-xl px-4 py-4"
      >
        <div class="text-xs text-gray-400 mb-1">{{ stat.label }}</div>
        <div class="text-2xl font-semibold" :class="stat.color || 'text-gray-800'">
          {{ stat.value }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-5">

      <!-- Risk distribution -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <div class="text-sm font-semibold text-gray-800 mb-4">Risk distribution</div>
        <div v-if="store.risk" class="space-y-4">
          <div v-for="item in riskDist" :key="item.label">
            <div class="flex justify-between text-xs mb-1.5">
              <span class="text-gray-500">{{ item.label }}</span>
              <div class="flex items-center gap-2">
                <span class="font-semibold" :class="item.color">{{ item.value }}</span>
                <span class="text-gray-300">{{ item.pct }}%</span>
              </div>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="item.barColor"
                :style="{ width: item.pct + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div v-else class="text-xs text-gray-400 text-center py-6">No data</div>
      </div>

      <!-- Transport modes -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <div class="text-sm font-semibold text-gray-800 mb-4">Transport modes</div>
        <div v-if="store.modes" class="space-y-4">
          <div v-for="item in modeDist" :key="item.label">
            <div class="flex justify-between text-xs mb-1.5">
              <span class="text-gray-500">{{ item.label }}</span>
              <div class="flex items-center gap-2">
                <span class="font-semibold" :class="item.color">{{ item.value }}</span>
                <span class="text-gray-300">{{ item.pct }}%</span>
              </div>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="item.barColor"
                :style="{ width: item.pct + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div v-else class="text-xs text-gray-400 text-center py-6">No data</div>
      </div>

      <!-- Cargo breakdown -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <div class="text-sm font-semibold text-gray-800 mb-4">Cargo types</div>
        <div v-if="store.cargo" class="space-y-4">
          <div v-for="item in cargoDist" :key="item.label">
            <div class="flex justify-between text-xs mb-1.5">
              <span class="text-gray-500">{{ item.label }}</span>
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-700">{{ item.value }}</span>
                <span class="text-gray-300">{{ item.pct }}%</span>
              </div>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full bg-teal-400 transition-all duration-700"
                :style="{ width: item.pct + '%' }"
              ></div>
            </div>
          </div>
          <div v-if="cargoDist.length === 0" class="text-xs text-gray-400 text-center py-4">
            No lanes yet
          </div>
        </div>
        <div v-else class="text-xs text-gray-400 text-center py-6">No data</div>
      </div>

    </div>

    <div class="grid grid-cols-2 gap-5">

      <!-- Lane compliance -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <div class="text-sm font-semibold text-gray-800 mb-4">Lane compliance</div>
        <div v-if="store.summary" class="space-y-3">
          <div
            v-for="item in complianceDist"
            :key="item.label"
            class="flex items-center gap-4 p-3 rounded-xl border"
            :class="item.borderClass"
          >
            <div class="flex-1">
              <div class="text-sm font-semibold" :class="item.color">{{ item.label }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ item.desc }}</div>
            </div>
            <div class="text-2xl font-bold" :class="item.color">{{ item.value }}</div>
            <div class="w-16">
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :class="item.barColor"
                  :style="{ width: item.pct + '%' }"
                ></div>
              </div>
              <div class="text-[10px] text-gray-400 text-right mt-0.5">{{ item.pct }}%</div>
            </div>
          </div>
        </div>
        <div v-else class="text-xs text-gray-400 text-center py-6">No data</div>
      </div>

      <!-- Caretaker breakdown -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <div class="text-sm font-semibold text-gray-800 mb-4">Caretakers by type</div>
        <div v-if="store.caretakers" class="space-y-3">
          <div
            v-for="item in caretakerDist"
            :key="item.label"
            class="flex items-center gap-3"
          >
            <div class="text-xs text-gray-500 w-36 flex-shrink-0">{{ item.label }}</div>
            <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :style="{ width: item.pct + '%', background: item.color }"
              ></div>
            </div>
            <div class="text-xs font-semibold text-gray-700 w-6 text-right flex-shrink-0">
              {{ item.value }}
            </div>
          </div>
          <div v-if="caretakerDist.length === 0" class="text-xs text-gray-400 text-center py-4">
            No caretakers yet
          </div>
        </div>
        <div v-else class="text-xs text-gray-400 text-center py-6">No data</div>
      </div>

    </div>

    <!-- Network stats -->
    <div class="bg-white border border-gray-200 rounded-xl p-5">
      <div class="text-sm font-semibold text-gray-800 mb-4">Network overview</div>
      <div class="grid grid-cols-4 gap-4">
        <div
          v-for="item in networkStats"
          :key="item.label"
          class="text-center p-4 bg-gray-50 rounded-xl border border-gray-100"
        >
          <div class="text-2xl font-bold text-gray-800">{{ item.value }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- World map -->
    <div class="bg-white border border-gray-200 rounded-xl p-5">
      <div class="text-sm font-semibold text-gray-800 mb-3">
        Network map — {{ nodesStore.nodes.length }} nodes
      </div>
      <WorldMap :nodes="nodesStore.nodes" />
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAnalyticsStore }   from '../stores/analytics.js'
import { useNodesStore }       from '../stores/nodes.js'
import WorldMap                from '../components/ui/WorldMap.vue'

const store      = useAnalyticsStore()
const nodesStore = useNodesStore()

onMounted(() => {
  store.fetchAll()
  nodesStore.fetchNodes()
})

const CARGO_LABELS = {
  pharma: 'Pharmaceutical',
  hazmat: 'Hazardous',
  cold:   'Cold chain',
  air:    'Air cargo',
}

const CT_COLORS = {
  'Stevedore':         '#1D4ED8',
  'Ground Handler':    '#15803D',
  'Terminal Operator': '#0F766E',
  'Warehouse Keeper':  '#B45309',
  'Customs Agent':     '#4338CA',
  'Cold Store':        '#0369A1',
}

const summaryStats = computed(() => {
  const s = store.summary
  if (!s) return Array(5).fill({ label: '—', value: '—' })
  return [
    { label: 'Total lanes', value: s.total_lanes                                   },
    { label: 'Compliant',   value: s.ok_lanes,   color: 'text-green-600'           },
    { label: 'Warnings',    value: s.warn_lanes, color: 'text-amber-500'           },
    { label: 'Issues',      value: s.bad_lanes,  color: 'text-red-500'             },
    { label: 'Avg risk',    value: s.avg_risk ?? '—', color: riskColor(s.avg_risk) },
  ]
})

const riskDist = computed(() => {
  const r = store.risk
  if (!r) return []
  const total = (r.low + r.medium + r.high) || 1
  return [
    { label: 'Low risk',    value: r.low,    pct: pct(r.low, total),    color: 'text-green-600', barColor: 'bg-green-400' },
    { label: 'Medium risk', value: r.medium, pct: pct(r.medium, total), color: 'text-amber-500', barColor: 'bg-amber-400' },
    { label: 'High risk',   value: r.high,   pct: pct(r.high, total),   color: 'text-red-500',   barColor: 'bg-red-400'   },
  ]
})

const modeDist = computed(() => {
  const m = store.modes
  if (!m) return []
  const total = (m.Air + m.Road + m.Sea) || 1
  return [
    { label: 'Air',  value: m.Air,  pct: pct(m.Air, total),  color: 'text-blue-600',  barColor: 'bg-blue-400'  },
    { label: 'Road', value: m.Road, pct: pct(m.Road, total), color: 'text-amber-600', barColor: 'bg-amber-400' },
    { label: 'Sea',  value: m.Sea,  pct: pct(m.Sea, total),  color: 'text-teal-600',  barColor: 'bg-teal-400'  },
  ]
})

const cargoDist = computed(() => {
  const c = store.cargo
  if (!c) return []
  const total = Object.values(c).reduce((a, b) => a + b, 0) || 1
  return Object.entries(c)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      label: CARGO_LABELS[k] || k,
      value: v,
      pct:   pct(v, total),
    }))
})

const complianceDist = computed(() => {
  const s = store.summary
  if (!s) return []
  const total = s.total_lanes || 1
  return [
    { label: 'Compliant',     desc: 'All certs valid, no issues',  value: s.ok_lanes,   pct: pct(s.ok_lanes, total),   color: 'text-green-600', barColor: 'bg-green-400', borderClass: 'border-green-100 bg-green-50/30' },
    { label: 'Warning',       desc: 'Certs expiring or minor gaps', value: s.warn_lanes, pct: pct(s.warn_lanes, total), color: 'text-amber-600', barColor: 'bg-amber-400', borderClass: 'border-amber-100 bg-amber-50/30' },
    { label: 'Non-compliant', desc: 'Missing certs or high risk',   value: s.bad_lanes,  pct: pct(s.bad_lanes, total),  color: 'text-red-600',   barColor: 'bg-red-400',   borderClass: 'border-red-100 bg-red-50/30'    },
  ]
})

const caretakerDist = computed(() => {
  const c = store.caretakers
  if (!c) return []
  const total = Object.values(c).reduce((a, b) => a + b, 0) || 1
  return Object.entries(c)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      label: k,
      value: v,
      pct:   pct(v, total),
      color: CT_COLORS[k] || '#6B7280',
    }))
})

const networkStats = computed(() => {
  const s = store.summary
  if (!s) return []
  return [
    { label: 'Network nodes', value: s.total_nodes      },
    { label: 'Carriers',      value: s.total_carriers   },
    { label: 'Caretakers',    value: s.total_caretakers },
    { label: 'Users',         value: s.total_users      },
  ]
})

function pct(val, total) {
  return Math.round((val / total) * 100)
}

function riskColor(risk) {
  if (!risk) return 'text-gray-800'
  return risk <= 3 ? 'text-green-600' : risk <= 6 ? 'text-amber-500' : 'text-red-500'
}
</script>