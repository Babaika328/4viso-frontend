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
              class="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg transition">
              + New lane
            </RouterLink>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="lanesStore.loading" class="px-5 py-8 text-center text-sm text-gray-400">
          Loading lanes...
        </div>

        <!-- Empty -->
        <div v-else-if="recentLanes.length === 0" class="px-5 py-10 text-center">
          <div class="text-sm text-gray-400 mb-3">No lanes yet</div>
          <RouterLink
            v-if="auth.canWrite"
            to="/builder"
            class="text-xs bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition">
            Build first lane
          </RouterLink>
        </div>

        <!-- List -->
        <div v-else>
          <div
            v-for="lane in recentLanes"
            :key="lane.id"
            class="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer last:border-0"
            @click="router.push(`/lanes/${lane.id}`)"
          >
            <div
              class="w-1 h-8 rounded-full flex-shrink-0"
              :class="statusBar(lane.status)"
            ></div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800 truncate">{{ lane.name }}</div>
              <div class="text-xs text-gray-400 mt-0.5">
                {{ lane.origin?.company || lane.lane_nodes?.[0]?.node?.company }}
                →
                {{ lane.destination?.company || lane.lane_nodes?.[lane.lane_nodes.length - 1]?.node?.company }}
              </div>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <span class="text-xs text-gray-400">{{ lane.transit || '—' }}</span>
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

        <!-- Attention needed -->
        <div
          v-if="badLanes.length > 0"
          class="bg-red-50 border border-red-100 rounded-xl px-5 py-4"
        >
          <div class="text-sm font-semibold text-red-800 mb-3">Needs attention</div>
          <div
            v-for="lane in badLanes"
            :key="lane.id"
            class="flex items-center justify-between py-2 border-b border-red-100 last:border-0 cursor-pointer"
            @click="router.push(`/lanes/${lane.id}`)"
          >
            <span class="text-xs text-red-700 truncate flex-1">{{ lane.name }}</span>
            <RiskBadge :risk="lane.risk" size="sm" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter }           from 'vue-router'
import { useAuthStore }        from '../stores/auth.js'
import { useAnalyticsStore }   from '../stores/analytics.js'
import { useLanesStore }       from '../stores/lanes.js'
import RiskBadge               from '../components/ui/RiskBadge.vue'

const router         = useRouter()
const auth           = useAuthStore()
const analyticsStore = useAnalyticsStore()
const lanesStore     = useLanesStore()

onMounted(async () => {
  await Promise.all([
    analyticsStore.fetchAll(),
    lanesStore.fetchLanes({ limit: 10 }),
  ])
})

const recentLanes = computed(() => lanesStore.lanes.slice(0, 6))
const badLanes    = computed(() => lanesStore.lanes.filter(l => l.status === 'bad').slice(0, 4))

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
    { label: 'Low',    value: r.low,    pct: (r.low    / total * 100).toFixed(0), color: 'text-green-600', barColor: 'bg-green-400' },
    { label: 'Medium', value: r.medium, pct: (r.medium / total * 100).toFixed(0), color: 'text-amber-500', barColor: 'bg-amber-400' },
    { label: 'High',   value: r.high,   pct: (r.high   / total * 100).toFixed(0), color: 'text-red-500',   barColor: 'bg-red-400'   },
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

function statusBar(status) {
  return status === 'ok'   ? 'bg-green-400'
       : status === 'warn' ? 'bg-amber-400'
       : 'bg-red-400'
}

function riskColor(risk) {
  if (!risk) return 'text-gray-800'
  return risk <= 3 ? 'text-green-600' : risk <= 6 ? 'text-amber-500' : 'text-red-500'
}
</script>