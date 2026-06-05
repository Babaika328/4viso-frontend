<template>
  <div class="p-6 space-y-6">

    <!-- Stats row -->
    <div class="grid grid-cols-5 gap-4">
      <div
        v-for="stat in stats"
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

      <!-- Recent lanes -->
      <div class="col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-800">Recent lanes</span>
          <div class="flex gap-2">
            <RouterLink to="/lanes" class="text-xs text-gray-400 hover:text-gray-600 transition">
              View all
            </RouterLink>
            <RouterLink
              v-if="auth.canWrite"
              to="/builder"
              class="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg transition"
            >
              + New lane
            </RouterLink>
          </div>
        </div>

        <div v-if="lanesStore.loading" class="px-5 py-8 text-center text-sm text-gray-400">
          Loading lanes...
        </div>

        <div v-else-if="recentLanes.length === 0" class="px-5 py-10 text-center">
          <div class="text-sm text-gray-400 mb-3">No lanes yet</div>
          <RouterLink
            v-if="auth.canWrite"
            to="/builder"
            class="text-xs bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
          >
            Build first lane
          </RouterLink>
        </div>

        <div v-else>
          <div
            v-for="lane in recentLanes"
            :key="lane.id"
            class="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer last:border-0"
            @click="router.push(`/lanes/${lane.id}`)"
          >
            <div class="w-1 h-10 rounded-full flex-shrink-0" :class="statusBar(lane.status)"></div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-gray-800 truncate">{{ lane.name }}</span>
                <TempBadge
                  v-if="lane.temp_min"
                  :min="lane.temp_min"
                  :max="lane.temp_max"
                  :unit="lane.temp_unit"
                />
              </div>
              <div class="text-xs text-gray-400 mb-1.5">
                {{ originName(lane) }} → {{ destinationName(lane) }}
              </div>
              <RiskFactorTags :factors="getLaneRiskFactors(lane)" />
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <div class="flex gap-1">
                <span
                  v-for="mode in laneModes(lane)"
                  :key="mode"
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  :class="modeClass(mode)"
                >
                  {{ mode }}
                </span>
              </div>
              <RiskBadge :risk="lane.risk" size="sm" />
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="flex flex-col gap-5">

        <!-- Risk distribution -->
        <div class="bg-white border border-gray-200 rounded-xl px-5 py-4">
          <div class="text-sm font-semibold text-gray-800 mb-4">Risk distribution</div>
          <div v-if="analyticsStore.risk" class="space-y-3">
            <div v-for="item in riskDist" :key="item.label" class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">{{ item.label }}</span>
                <span class="font-medium" :class="item.color">{{ item.value }}</span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="item.barColor"
                  :style="{ width: item.pct + '%' }"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 text-center py-4">No data</div>
        </div>

        <!-- Transport modes -->
        <div class="bg-white border border-gray-200 rounded-xl px-5 py-4">
          <div class="text-sm font-semibold text-gray-800 mb-4">Transport modes</div>
          <div v-if="analyticsStore.modes" class="grid grid-cols-3 gap-2">
            <div
              v-for="item in modeDist"
              :key="item.label"
              class="rounded-lg px-2 py-3 text-center"
              :class="item.bg"
            >
              <div class="text-xl font-bold" :class="item.color">{{ item.value }}</div>
              <div class="text-[10px] mt-1" :class="item.color">{{ item.label }}</div>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 text-center py-4">No data</div>
        </div>

        <!-- Caretaker breakdown -->
        <div class="bg-white border border-gray-200 rounded-xl px-5 py-4">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-semibold text-gray-800">Caretakers</span>
            <RouterLink to="/caretakers" class="text-xs text-teal-500 hover:text-teal-700 transition">
              Manage
            </RouterLink>
          </div>
          <div v-if="analyticsStore.caretakers" class="space-y-2">
            <div
              v-for="item in caretakerDist"
              :key="item.label"
              class="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0"
            >
              <span class="text-xs text-gray-600">{{ item.label }}</span>
              <span class="text-sm font-semibold" :style="{ color: item.color }">{{ item.value }}</span>
            </div>
          </div>
          <div v-else class="text-xs text-gray-400 text-center py-4">No data</div>
        </div>

      </div>
    </div>

    <!-- World map + attention -->
    <div class="grid grid-cols-3 gap-5">
      <div class="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
        <div class="text-sm font-semibold text-gray-800 mb-3">Network — {{ nodesStore.nodes.length }} nodes</div>
        <WorldMap :nodes="nodesStore.nodes" />
      </div>

      <!-- Attention needed -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <span class="text-sm font-semibold text-gray-800">Needs attention</span>
        </div>
        <div v-if="badLanes.length === 0" class="px-5 py-8 text-center text-sm text-gray-400">
          No issues
        </div>
        <div v-else class="divide-y divide-gray-50">
          <div
            v-for="lane in badLanes"
            :key="lane.id"
            class="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 cursor-pointer transition"
            @click="router.push(`/lanes/${lane.id}`)"
          >
            <span class="text-sm text-gray-700 truncate flex-1">{{ lane.name }}</span>
            <RiskBadge :risk="lane.risk" size="sm" />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted }   from 'vue'
import { useRouter }             from 'vue-router'
import { useAuthStore }          from '../stores/auth.js'
import { useAnalyticsStore }     from '../stores/analytics.js'
import { useLanesStore }         from '../stores/lanes.js'
import { useNodesStore }         from '../stores/nodes.js'
import { getLaneRiskFactors }    from '../utils/riskFactors.js'
import RiskBadge                 from '../components/ui/RiskBadge.vue'
import TempBadge                 from '../components/ui/TempBadge.vue'
import RiskFactorTags            from '../components/ui/RiskFactorTags.vue'
import WorldMap                  from '../components/ui/WorldMap.vue'

const router         = useRouter()
const auth           = useAuthStore()
const analyticsStore = useAnalyticsStore()
const lanesStore     = useLanesStore()
const nodesStore     = useNodesStore()

const CT_COLORS = {
  'Stevedore':         '#1D4ED8',
  'Ground Handler':    '#15803D',
  'Terminal Operator': '#0F766E',
  'Warehouse Keeper':  '#B45309',
  'Customs Agent':     '#4338CA',
  'Cold Store':        '#0369A1',
}

onMounted(async () => {
  await Promise.all([
    analyticsStore.fetchAll(),
    lanesStore.fetchLanes({ limit: 10 }),
    nodesStore.fetchNodes(),
  ])
})

const recentLanes = computed(() => lanesStore.lanes.slice(0, 6))
const badLanes    = computed(() => lanesStore.lanes.filter(l => l.status === 'bad').slice(0, 6))

const stats = computed(() => {
  const s = analyticsStore.summary
  if (!s) return Array(5).fill({ label: '—', value: '—' })
  return [
    { label: 'Total lanes',  value: s.total_lanes },
    { label: 'Compliant',    value: s.ok_lanes,         color: 'text-green-600' },
    { label: 'Warnings',     value: s.warn_lanes,        color: 'text-amber-500' },
    { label: 'Issues',       value: s.bad_lanes,         color: 'text-red-500'   },
    { label: 'Avg risk',     value: s.avg_risk ?? '—',   color: riskColor(s.avg_risk) },
  ]
})

const riskDist = computed(() => {
  const r = analyticsStore.risk
  if (!r) return []
  const total = r.low + r.medium + r.high || 1
  return [
    { label: 'Low',    value: r.low,    pct: pct(r.low,    total), color: 'text-green-600', barColor: 'bg-green-400' },
    { label: 'Medium', value: r.medium, pct: pct(r.medium, total), color: 'text-amber-500', barColor: 'bg-amber-400' },
    { label: 'High',   value: r.high,   pct: pct(r.high,   total), color: 'text-red-500',   barColor: 'bg-red-400'   },
  ]
})

const modeDist = computed(() => {
  const m = analyticsStore.modes
  if (!m) return []
  return [
    { label: 'Air',  value: m.Air,  bg: 'bg-blue-50',  color: 'text-blue-600'  },
    { label: 'Road', value: m.Road, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Sea',  value: m.Sea,  bg: 'bg-teal-50',  color: 'text-teal-600'  },
  ]
})

const caretakerDist = computed(() => {
  const c = analyticsStore.caretakers
  if (!c) return []
  return Object.entries(c)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ label: k, value: v, color: CT_COLORS[k] || '#6B7280' }))
})

function originName(lane) {
  return lane.lane_nodes?.[0]?.node?.company || '—'
}

function destinationName(lane) {
  return lane.lane_nodes?.[lane.lane_nodes.length - 1]?.node?.company || '—'
}

function laneModes(lane) {
  return [...new Set(lane.lane_legs?.filter(l => l.carrier).map(l => l.carrier.mode) || [])]
}

function modeClass(mode) {
  if (mode === 'Air')  return 'bg-blue-50 text-blue-600'
  if (mode === 'Sea')  return 'bg-teal-50 text-teal-600'
  return 'bg-amber-50 text-amber-600'
}

function statusBar(status) {
  return status === 'ok' ? 'bg-green-400' : status === 'warn' ? 'bg-amber-400' : 'bg-red-400'
}

function riskColor(risk) {
  if (!risk) return 'text-gray-800'
  return risk <= 3 ? 'text-green-600' : risk <= 6 ? 'text-amber-500' : 'text-red-500'
}

function pct(val, total) {
  return Math.round((val / total) * 100)
}
</script>