<template>
  <div class="p-6 space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-400">{{ filtered.length }} lane{{ filtered.length !== 1 ? 's' : '' }}</span>
        <div class="flex gap-1.5">
          <button
            v-for="s in statusFilters"
            :key="s.value"
            @click="toggleStatus(s.value)"
            class="text-xs px-3 py-1 rounded-full border transition"
            :class="activeStatus === s.value
              ? s.activeClass
              : 'border-gray-200 text-gray-400 hover:text-gray-600'"
          >
            {{ s.label }} {{ s.count }}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <input
          v-model="search"
          placeholder="Search lanes..."
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-52 focus:outline-none focus:border-teal-400 transition"
        />
        <select
          v-model="cargoFilter"
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-400 transition text-gray-600"
        >
          <option value="">All cargo types</option>
          <option value="pharma">Pharmaceutical</option>
          <option value="hazmat">Hazardous</option>
          <option value="cold">Cold chain</option>
          <option value="air">Air cargo</option>
        </select>
        <label class="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
          <input type="checkbox" v-model="myLanes" class="accent-teal-500" />
          My lanes
        </label>
        <RouterLink
          v-if="auth.canWrite"
          to="/builder"
          class="text-sm bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 rounded-lg transition"
        >
          + New lane
        </RouterLink>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="lanesStore.loading" class="text-center py-16 text-sm text-gray-400">
      Loading lanes...
    </div>

    <!-- Empty -->
    <div
      v-else-if="filtered.length === 0"
      class="bg-white border-2 border-dashed border-gray-200 rounded-xl py-16 text-center"
    >
      <div class="text-sm text-gray-400 mb-3">
        {{ lanesStore.lanes.length === 0 ? 'No lanes yet' : 'No lanes match your filters' }}
      </div>
      <RouterLink
        v-if="auth.canWrite && lanesStore.lanes.length === 0"
        to="/builder"
        class="text-sm bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
      >
        Build first lane
      </RouterLink>
      <button
        v-else-if="lanesStore.lanes.length > 0"
        @click="clearFilters"
        class="text-sm text-teal-500 hover:text-teal-700 transition"
      >
        Clear filters
      </button>
    </div>

    <!-- Lane cards -->
    <div v-else class="space-y-3">
      <div
        v-for="lane in filtered"
        :key="lane.id"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition cursor-pointer"
        @click="router.push(`/lanes/${lane.id}`)"
      >
        <div class="flex items-stretch">
          <div class="w-1 flex-shrink-0" :class="statusBar(lane.status)"></div>
          <div class="flex-1 px-5 py-4 flex items-center gap-5">

            <!-- Main info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <span class="text-sm font-semibold text-gray-800 truncate">{{ lane.name }}</span>
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wider flex-shrink-0">
                  {{ CARGO_LABELS[lane.cargo_type] || lane.cargo_type }}
                </span>
                <TempBadge v-if="lane.temp_min" :min="lane.temp_min" :max="lane.temp_max" :unit="lane.temp_unit" />
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span>{{ originName(lane) }}</span>
                <span>→</span>
                <span>{{ destinationName(lane) }}</span>
                <span class="text-gray-200">·</span>
                <span>{{ lane.lane_nodes?.length }} stops</span>
                <span class="text-gray-200">·</span>
                <span>{{ lane.transit || '—' }}</span>
              </div>
              <!-- Risk factor tags -->
              <RiskFactorTags :factors="getLaneRiskFactors(lane)" />
            </div>

            <!-- Right side -->
            <div class="flex items-center gap-4 flex-shrink-0">
              <!-- Mode badges -->
              <div class="flex gap-1">
                <span
                  v-for="mode in laneModes(lane)"
                  :key="mode"
                  class="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                  :class="modeClass(mode)"
                >
                  {{ mode }}
                </span>
              </div>
              <RiskBadge :risk="lane.risk" />
              <StatusTag :status="lane.status" />
              <span class="text-xs text-gray-300">{{ timeAgo(lane.updated_at) }}</span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0" @click.stop>
              <button
                v-if="auth.canWrite"
                @click="handleDuplicate(lane.id)"
                class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition"
              >
                Duplicate
              </button>
              <button
                v-if="auth.canWrite"
                @click="confirmDelete(lane)"
                class="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
              >
                Delete
              </button>
              <span class="text-gray-300 text-xs">›</span>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <div
      v-if="deleteTarget"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="deleteTarget = null"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <div class="text-sm font-semibold text-gray-800 mb-2">Delete lane?</div>
        <div class="text-sm text-gray-500 mb-5">
          "{{ deleteTarget.name }}" will be removed. This cannot be undone.
        </div>
        <div class="flex justify-end gap-3">
          <button
            @click="deleteTarget = null"
            class="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="text-sm px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter }                from 'vue-router'
import { useAuthStore }             from '../stores/auth.js'
import { useLanesStore }            from '../stores/lanes.js'
import { lanesApi }                 from '../api/lanes.js'
import { getLaneRiskFactors }       from '../utils/riskFactors.js'
import RiskBadge                    from '../components/ui/RiskBadge.vue'
import StatusTag                    from '../components/ui/StatusTag.vue'
import TempBadge                    from '../components/ui/TempBadge.vue'
import RiskFactorTags               from '../components/ui/RiskFactorTags.vue'

const router     = useRouter()
const auth       = useAuthStore()
const lanesStore = useLanesStore()

const search       = ref('')
const cargoFilter  = ref('')
const activeStatus = ref('')
const myLanes      = ref(false)
const deleteTarget = ref(null)

const CARGO_LABELS = {
  pharma: 'Pharmaceutical',
  hazmat: 'Hazardous',
  cold:   'Cold chain',
  air:    'Air cargo',
}

onMounted(() => lanesStore.fetchLanes())

const filtered = computed(() => {
  let list = [...lanesStore.lanes]
  if (search.value)
    list = list.filter(l => l.name.toLowerCase().includes(search.value.toLowerCase()))
  if (cargoFilter.value)
    list = list.filter(l => l.cargo_type === cargoFilter.value)
  if (activeStatus.value)
    list = list.filter(l => l.status === activeStatus.value)
  return list
})

const statusFilters = computed(() => [
  { value: '',     label: 'All',       count: lanesStore.lanes.length,                              activeClass: 'border-gray-400 text-gray-600 bg-gray-50'   },
  { value: 'ok',   label: 'Compliant', count: lanesStore.lanes.filter(l=>l.status==='ok').length,   activeClass: 'border-green-400 text-green-600 bg-green-50' },
  { value: 'warn', label: 'Warning',   count: lanesStore.lanes.filter(l=>l.status==='warn').length, activeClass: 'border-amber-400 text-amber-600 bg-amber-50' },
  { value: 'bad',  label: 'Issues',    count: lanesStore.lanes.filter(l=>l.status==='bad').length,  activeClass: 'border-red-400 text-red-600 bg-red-50'       },
])

function toggleStatus(val) {
  activeStatus.value = activeStatus.value === val ? '' : val
}

function clearFilters() {
  search.value       = ''
  cargoFilter.value  = ''
  activeStatus.value = ''
  myLanes.value      = false
}

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
  if (mode === 'Air')  return 'bg-blue-50 text-blue-600 border-blue-100'
  if (mode === 'Sea')  return 'bg-teal-50 text-teal-600 border-teal-100'
  return 'bg-amber-50 text-amber-600 border-amber-100'
}

function statusBar(status) {
  return status === 'ok' ? 'bg-green-400' : status === 'warn' ? 'bg-amber-400' : 'bg-red-400'
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function confirmDelete(lane) {
  deleteTarget.value = lane
}

async function handleDelete() {
  if (!deleteTarget.value) return
  await lanesStore.deleteLane(deleteTarget.value.id)
  deleteTarget.value = null
}

async function handleDuplicate(id) {
  await lanesApi.duplicate(id)
  await lanesStore.fetchLanes()
}
</script>