<template>
  <div class="p-6 space-y-5">

    <!-- Back + actions -->
    <div class="flex items-center justify-between">
      <button
        @click="router.push('/lanes')"
        class="text-sm text-gray-400 hover:text-gray-600 transition flex items-center gap-1.5"
      >
        ← My lanes
      </button>
      <div class="flex gap-2" v-if="lane">
        <button
          v-if="auth.canWrite"
          @click="handleDuplicate"
          class="text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          Duplicate
        </button>
        <button
          v-if="auth.canWrite"
          @click="confirmDelete = true"
          class="text-sm border border-red-200 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20 text-sm text-gray-400">
      Loading lane...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20 text-sm text-red-400">
      {{ error }}
    </div>

    <template v-else-if="lane">

      <!-- Title row -->
      <div class="bg-white border border-gray-200 rounded-xl px-6 py-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-lg font-semibold text-gray-800 mb-2">{{ lane.name }}</h1>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wider font-medium">
                {{ CARGO_LABELS[lane.cargo_type] || lane.cargo_type }}
              </span>
              <TempBadge v-if="lane.temp_min" :min="lane.temp_min" :max="lane.temp_max" :unit="lane.temp_unit" />
              <StatusTag :status="lane.status" />
              <RiskBadge :risk="lane.risk" />
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-center flex-shrink-0">
            <div>
              <div class="text-xs text-gray-400 mb-1">Transit</div>
              <div class="text-sm font-semibold text-gray-800">{{ lane.transit || '—' }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">Stops</div>
              <div class="text-sm font-semibold text-gray-800">{{ lane.lane_nodes?.length || '—' }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">Departure</div>
              <div class="text-sm font-semibold text-gray-800">{{ lane.departure || '—' }}</div>
            </div>
          </div>
        </div>
        <div v-if="lane.notes" class="mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
          {{ lane.notes }}
        </div>
      </div>

      <!-- Route canvas -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-gray-100">
          <span class="text-sm font-semibold text-gray-800">Route</span>
        </div>
        <div class="p-5 overflow-x-auto">
          <div class="flex items-start gap-0 min-w-max">
            <template v-for="(ln, i) in lane.lane_nodes" :key="ln.node.id">

              <!-- Node card -->
              <div class="w-44 flex-shrink-0">
                <div
                  class="rounded-xl border overflow-hidden"
                  :class="nodeCardClass(i)"
                >
                  <!-- Node header -->
                  <div class="px-3 py-2 border-b text-[10px] font-bold uppercase tracking-wider" :class="nodeHeaderClass(i)">
                    {{ i === 0 ? 'Origin' : i === lane.lane_nodes.length - 1 ? 'Destination' : `Stop ${i}` }}
                  </div>
                  <div class="px-3 py-2.5">
                    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {{ TYPE_ABBR[ln.node.type] || ln.node.type }}
                    </div>
                    <div class="text-xs font-semibold text-gray-800 leading-tight mb-1.5">
                      {{ ln.node.company }}
                    </div>
                    <div class="text-[10px] text-gray-400 mb-2">
                      {{ ln.node.country }} · {{ ln.node.region }}
                    </div>
                    <RiskBadge :risk="ln.node.risk" size="sm" />
                    <div class="mt-2 text-[10px] text-gray-400">
                      {{ ln.node.handling_time }}h handling · {{ ln.node.timezone }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Leg connector -->
              <div v-if="i < lane.lane_legs.length" class="flex flex-col items-center justify-center w-36 flex-shrink-0 pt-8">
                <div class="w-full flex items-center">
                  <div class="flex-1 h-px" :class="legLineClass(lane.lane_legs[i])"></div>
                  <div class="text-[8px] font-bold px-1.5 py-0.5 rounded mx-1 whitespace-nowrap" :class="legBadgeClass(lane.lane_legs[i])">
                    LEG {{ i + 1 }}
                  </div>
                  <div class="flex-1 h-px" :class="legLineClass(lane.lane_legs[i])"></div>
                  <div class="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent" :class="legArrowClass(lane.lane_legs[i])"></div>
                </div>
                <div v-if="lane.lane_legs[i].carrier" class="mt-2 text-center">
                  <div class="text-[10px] font-medium text-gray-600">{{ lane.lane_legs[i].carrier.company }}</div>
                  <div class="text-[9px] text-gray-400">{{ lane.lane_legs[i].carrier.mode }} · {{ lane.lane_legs[i].leg_time || lane.lane_legs[i].carrier.transit }}</div>
                </div>
                <div v-else class="mt-2 text-[9px] text-red-400 text-center">No carrier</div>
              </div>

            </template>
          </div>
        </div>
      </div>

      <!-- Nodes + Carriers detail -->
      <div class="grid grid-cols-2 gap-5">

        <!-- Nodes -->
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div class="px-5 py-3.5 border-b border-gray-100">
            <span class="text-sm font-semibold text-gray-800">Nodes ({{ lane.lane_nodes?.length }})</span>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="(ln, i) in lane.lane_nodes"
              :key="ln.node.id"
              class="px-5 py-3.5 flex items-center gap-4"
            >
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                :class="i === 0 ? 'bg-teal-100 text-teal-700' : i === lane.lane_nodes.length-1 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'">
                {{ i + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800">{{ ln.node.company }}</div>
                <div class="text-xs text-gray-400">{{ ln.node.type }} · {{ ln.node.country }}</div>
              </div>
              <RiskBadge :risk="ln.node.risk" size="sm" />
            </div>
          </div>
        </div>

        <!-- Carriers -->
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div class="px-5 py-3.5 border-b border-gray-100">
            <span class="text-sm font-semibold text-gray-800">Carriers ({{ lane.lane_legs?.length }})</span>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="(leg, i) in lane.lane_legs"
              :key="i"
              class="px-5 py-3.5 flex items-center gap-4"
            >
              <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
                {{ i + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <div v-if="leg.carrier" class="text-sm font-medium text-gray-800">{{ leg.carrier.company }}</div>
                <div v-else class="text-sm text-red-400">No carrier assigned</div>
                <div v-if="leg.carrier" class="text-xs text-gray-400">
                  {{ leg.carrier.mode }} · {{ leg.leg_time || leg.carrier.transit }} · cutoff {{ leg.carrier.cutoff }}
                </div>
              </div>
              <span
                v-if="leg.carrier"
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                :class="leg.carrier.mode === 'Air' ? 'bg-blue-50 text-blue-600' : leg.carrier.mode === 'Sea' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'"
              >
                {{ leg.carrier.mode }}
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- Caretakers -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-800">On-site caretakers</span>
          <RouterLink to="/caretakers" class="text-xs text-teal-500 hover:text-teal-700 transition">
            Manage caretakers
          </RouterLink>
        </div>
        <div v-if="caretakersLoading" class="px-5 py-6 text-sm text-gray-400 text-center">
          Loading caretakers...
        </div>
        <div v-else-if="nodeCaretakers.length === 0" class="px-5 py-6 text-sm text-gray-400 text-center">
          No caretakers assigned to nodes on this lane
        </div>
        <div v-else class="divide-y divide-gray-50">
          <div
            v-for="group in nodeCaretakers"
            :key="group.node.id"
            class="px-5 py-4"
          >
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs font-semibold text-gray-600">{{ group.node.company }}</span>
              <span class="text-[10px] text-gray-400">{{ group.node.country }}</span>
              <span class="text-[10px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full">
                {{ group.caretakers.length }} caretaker{{ group.caretakers.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="ct in group.caretakers"
                :key="ct.id"
                class="border border-gray-100 rounded-lg px-3 py-2.5 bg-gray-50"
              >
                <div class="flex items-start justify-between gap-2 mb-1">
                  <span class="text-xs font-medium text-gray-800">{{ ct.company }}</span>
                  <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    :style="{ background: ctTypeBg(ct.type), color: ctTypeColor(ct.type) }">
                    {{ ct.type }}
                  </span>
                </div>
                <div class="text-[10px] text-gray-400">{{ ct.contact_name }} · {{ ct.contact_phone }}</div>
                <div class="text-[10px] text-teal-600 mt-0.5">{{ ct.available }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- Delete modal -->
    <div
      v-if="confirmDelete"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="confirmDelete = false"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <div class="text-sm font-semibold text-gray-800 mb-2">Delete lane?</div>
        <div class="text-sm text-gray-500 mb-5">
          "{{ lane?.name }}" will be removed. This cannot be undone.
        </div>
        <div class="flex justify-end gap-3">
          <button @click="confirmDelete = false"
            class="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button @click="handleDelete"
            class="text-sm px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition">
            Delete
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter }      from 'vue-router'
import { useAuthStore }             from '../stores/auth.js'
import { lanesApi }                 from '../api/lanes.js'
import { caretakersApi }            from '../api/caretakers.js'
import RiskBadge                    from '../components/ui/RiskBadge.vue'
import StatusTag                    from '../components/ui/StatusTag.vue'
import TempBadge                    from '../components/ui/TempBadge.vue'
import { useLanesStore } from '../stores/lanes.js'

const lanesStore = useLanesStore()

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const lane              = ref(null)
const loading           = ref(true)
const error             = ref(null)
const confirmDelete     = ref(false)
const caretakers        = ref([])
const caretakersLoading = ref(false)

const CARGO_LABELS = {
  pharma: 'Pharmaceutical',
  hazmat: 'Hazardous',
  cold:   'Cold chain',
  air:    'Air cargo',
}

const TYPE_ABBR = {
  Warehouse:             'WH',
  Factory:               'FC',
  Airport:               'AP',
  Hub:                   'HB',
  Port:                  'PT',
  Handler:               'HA',
  'Distribution Center': 'DC',
}

const CT_COLORS = {
  'Stevedore':         { bg: '#EFF6FF', color: '#1D4ED8' },
  'Ground Handler':    { bg: '#F0FDF4', color: '#15803D' },
  'Terminal Operator': '#F0FDF4',
  'Warehouse Keeper':  { bg: '#FFFBEB', color: '#B45309' },
  'Customs Agent':     { bg: '#EEF2FF', color: '#4338CA' },
  'Cold Store':        { bg: '#E0F2FE', color: '#0369A1' },
}

onMounted(async () => {
  try {
    const res  = await lanesApi.get(route.params.id)
    lane.value = res.data
    await loadCaretakers()
  } catch (e) {
    error.value = 'Lane not found'
  } finally {
    loading.value = false
  }
})

async function loadCaretakers() {
  if (!lane.value?.lane_nodes?.length) return
  caretakersLoading.value = true
  try {
    const results = await Promise.all(
      lane.value.lane_nodes.map(ln =>
        caretakersApi.list({ node_id: ln.node.id })
      )
    )
    caretakers.value = results.map((res, i) => ({
      node:       lane.value.lane_nodes[i].node,
      caretakers: res.data,
    }))
  } finally {
    caretakersLoading.value = false
  }
}

const nodeCaretakers = computed(() =>
  caretakers.value.filter(g => g.caretakers.length > 0)
)

function nodeCardClass(i) {
  const last = lane.value.lane_nodes.length - 1
  if (i === 0)    return 'border-teal-200 bg-teal-50/30'
  if (i === last) return 'border-purple-200 bg-purple-50/30'
  return 'border-gray-200 bg-white'
}

function nodeHeaderClass(i) {
  const last = lane.value.lane_nodes.length - 1
  if (i === 0)    return 'bg-teal-50 text-teal-700 border-teal-100'
  if (i === last) return 'bg-purple-50 text-purple-700 border-purple-100'
  return 'bg-gray-50 text-gray-500 border-gray-100'
}

function legLineClass(leg) {
  if (!leg.carrier) return 'bg-red-200'
  return 'bg-gray-300'
}

function legBadgeClass(leg) {
  if (!leg.carrier) return 'bg-red-50 text-red-500'
  return 'bg-gray-100 text-gray-500'
}

function legArrowClass(leg) {
  if (!leg.carrier) return 'border-l-red-300'
  return 'border-l-gray-300'
}

function ctTypeBg(type)    { return CT_COLORS[type]?.bg    || '#F3F4F6' }
function ctTypeColor(type) { return CT_COLORS[type]?.color || '#6B7280' }

async function handleDuplicate() {
  await lanesApi.duplicate(lane.value.id)
  router.push('/lanes')
}

async function handleDelete() {
  try {
    await lanesApi.delete(lane.value.id)
    confirmDelete.value = false
    await lanesStore.deleteLane(lane.value.id)
    await router.push('/lanes')
  } catch (e) {
    console.error(e)
  }
}
</script>