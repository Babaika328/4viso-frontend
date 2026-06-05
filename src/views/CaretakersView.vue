<template>
  <div class="p-6 space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-400">
          {{ filtered.length }} caretaker{{ filtered.length !== 1 ? 's' : '' }}
        </span>
        <div class="flex gap-1.5">
          <button
            v-for="t in typeFilters"
            :key="t.value"
            @click="toggleType(t.value)"
            class="text-xs px-3 py-1 rounded-full border transition"
            :class="activeType === t.value
              ? 'border-teal-400 bg-teal-50 text-teal-700'
              : 'border-gray-200 text-gray-400 hover:text-gray-600'"
          >
            {{ t.label }} {{ t.count }}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <input
          v-model="search"
          placeholder="Search caretakers..."
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-52 focus:outline-none focus:border-teal-400 transition"
        />
        <select
          v-model="nodeFilter"
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-400 transition text-gray-600"
        >
          <option value="">All locations</option>
          <option v-for="n in uniqueNodes" :key="n.id" :value="n.id">
            {{ n.company }} ({{ n.country }})
          </option>
        </select>
        <button
          v-if="auth.canWrite"
          @click="openForm(null)"
          class="text-sm bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 rounded-lg transition"
        >
          + Add caretaker
        </button>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-6 gap-3">
      <div
        v-for="t in CT_TYPES"
        :key="t.value"
        @click="toggleType(t.value)"
        class="bg-white border rounded-xl px-3 py-3 cursor-pointer transition"
        :class="activeType === t.value ? 'border-teal-300 bg-teal-50' : 'border-gray-200 hover:border-gray-300'"
      >
        <div class="text-lg font-semibold text-gray-800">
          {{ store.caretakers.filter(c => c.type === t.value).length }}
        </div>
        <div class="text-[10px] text-gray-400 mt-0.5 leading-tight">{{ t.label }}</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-16 text-sm text-gray-400">
      Loading caretakers...
    </div>

    <!-- Empty -->
    <div
      v-else-if="filtered.length === 0"
      class="bg-white border-2 border-dashed border-gray-200 rounded-xl py-16 text-center"
    >
      <div class="text-sm text-gray-400 mb-3">
        {{ store.caretakers.length === 0 ? 'No caretakers yet' : 'No caretakers match your filters' }}
      </div>
      <button
        v-if="store.caretakers.length === 0 && auth.canWrite"
        @click="openForm(null)"
        class="text-sm bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
      >
        Add first caretaker
      </button>
      <button
        v-else-if="store.caretakers.length > 0"
        @click="clearFilters"
        class="text-sm text-teal-500 hover:text-teal-700 transition"
      >
        Clear filters
      </button>
    </div>

    <!-- Cards grid -->
    <div v-else class="grid grid-cols-2 gap-4">
      <div
        v-for="ct in filtered"
        :key="ct.id"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition"
        :style="{ borderTop: `2px solid ${typeColor(ct.type)}` }"
      >
        <div class="px-5 py-4">

          <!-- Top row -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex-1 min-w-0">
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
                :style="{ background: typeBg(ct.type), color: typeColor(ct.type) }"
              >
                {{ ct.type }}
              </span>
              <div class="text-sm font-semibold text-gray-800 truncate">{{ ct.company }}</div>
              <div class="text-xs text-gray-400 mt-0.5" v-if="nodeMap[ct.node_id]">
                {{ nodeMap[ct.node_id].company }} · {{ ct.country }}
              </div>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <span v-for="n in 5" :key="n" class="text-xs"
                :class="n <= Math.round(ct.rating) ? 'text-yellow-400' : 'text-gray-200'">★</span>
              <span class="text-[10px] text-gray-400 ml-1">{{ ct.rating.toFixed(1) }}</span>
            </div>
          </div>

          <!-- Contact -->
          <div class="bg-gray-50 rounded-lg px-3 py-2.5 mb-3 grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <div class="text-[9px] text-gray-400 uppercase tracking-wider">Contact</div>
              <div class="text-xs font-medium text-gray-700 mt-0.5">{{ ct.contact_name || '—' }}</div>
            </div>
            <div>
              <div class="text-[9px] text-gray-400 uppercase tracking-wider">Available</div>
              <div class="text-xs font-medium text-teal-600 mt-0.5">{{ ct.available || '—' }}</div>
            </div>
            <div class="col-span-2">
              <div class="text-[9px] text-gray-400 uppercase tracking-wider">Phone</div>
              <div class="text-xs text-gray-600 mt-0.5">{{ ct.contact_phone || '—' }}</div>
            </div>
          </div>

          <!-- Responsibilities -->
          <div class="mb-3">
            <div class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Responsibilities</div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="r in ct.responsibilities.slice(0, 4)"
                :key="r"
                class="text-[10px] px-2 py-0.5 rounded-full"
                :style="{ background: typeBg(ct.type), color: typeColor(ct.type) }"
              >
                {{ r }}
              </span>
              <span v-if="ct.responsibilities.length > 4" class="text-[10px] text-gray-400">
                +{{ ct.responsibilities.length - 4 }} more
              </span>
              <span v-if="ct.responsibilities.length === 0" class="text-[10px] text-gray-400 italic">
                None listed
              </span>
            </div>
          </div>

          <!-- Certs -->
          <div v-if="ct.certs.length > 0" class="flex flex-wrap gap-1.5 mb-3">
            <span
              v-for="c in ct.certs"
              :key="c"
              class="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100"
            >
              {{ c }}
            </span>
          </div>

        </div>

        <!-- Footer -->
        <div class="border-t border-gray-100 bg-gray-50 px-5 py-2.5 flex items-center justify-between">
          <button
            v-if="auth.canWrite"
            @click="confirmDeleteTarget = ct"
            class="text-xs text-red-400 hover:text-red-600 transition"
          >
            Remove
          </button>
          <div class="flex gap-2 ml-auto">
            <button
              v-if="auth.canWrite"
              @click="openForm(ct)"
              class="text-xs border border-gray-200 px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              Edit
            </button>
            <button
              @click="openDetail(ct)"
              class="text-xs bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg text-teal-700 hover:bg-teal-100 transition"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Detail modal ───────────────────────────────── -->
    <div
      v-if="detailTarget"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="detailTarget = null"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">

        <!-- Header -->
        <div
          class="px-6 py-5 border-b"
          :style="{ background: typeBg(detailTarget.type), borderColor: typeColor(detailTarget.type) + '33' }"
        >
          <div class="flex items-start justify-between">
            <div>
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
                :style="{ background: 'white', color: typeColor(detailTarget.type) }"
              >
                {{ detailTarget.type }}
              </span>
              <div class="text-base font-semibold text-gray-800 mt-1">{{ detailTarget.company }}</div>
              <div class="text-xs text-gray-500 mt-0.5" v-if="nodeMap[detailTarget.node_id]">
                {{ nodeMap[detailTarget.node_id].company }} · {{ detailTarget.country }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1">
                <span v-for="n in 5" :key="n" class="text-sm"
                  :class="n <= Math.round(detailTarget.rating) ? 'text-yellow-400' : 'text-gray-200'">★</span>
                <span class="text-xs text-gray-400 ml-1">{{ detailTarget.rating.toFixed(1) }}</span>
              </div>
              <button @click="detailTarget = null" class="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2">×</button>
            </div>
          </div>
        </div>

        <div class="overflow-y-auto flex-1 p-6 grid grid-cols-2 gap-4">

          <!-- Contact -->
          <div class="bg-gray-50 rounded-xl p-4">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact</div>
            <div class="space-y-2">
              <div>
                <div class="text-[10px] text-gray-400">Name</div>
                <div class="text-sm font-medium">{{ detailTarget.contact_name || '—' }}</div>
              </div>
              <div>
                <div class="text-[10px] text-gray-400">Phone</div>
                <div class="text-sm text-teal-600">{{ detailTarget.contact_phone || '—' }}</div>
              </div>
              <div>
                <div class="text-[10px] text-gray-400">Email</div>
                <div class="text-sm text-teal-600 break-all">{{ detailTarget.contact_email || '—' }}</div>
              </div>
              <div>
                <div class="text-[10px] text-gray-400">Available</div>
                <div class="text-sm font-medium text-green-600">{{ detailTarget.available || '—' }}</div>
              </div>
            </div>
          </div>

          <!-- Responsibilities -->
          <div class="bg-gray-50 rounded-xl p-4">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Responsibilities</div>
            <div class="space-y-1.5">
              <div
                v-for="r in detailTarget.responsibilities"
                :key="r"
                class="flex items-center gap-2 text-sm text-gray-700"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  :style="{ background: typeColor(detailTarget.type) }"
                ></div>
                {{ r }}
              </div>
              <div v-if="detailTarget.responsibilities.length === 0" class="text-sm text-gray-400 italic">
                None listed
              </div>
            </div>
          </div>

          <!-- Certifications -->
          <div class="bg-gray-50 rounded-xl p-4">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Certifications</div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="c in detailTarget.certs"
                :key="c"
                class="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100"
              >{{ c }}</span>
              <span v-if="detailTarget.certs.length === 0" class="text-sm text-gray-400 italic">
                None listed
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="detailTarget.notes" class="bg-gray-50 rounded-xl p-4">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notes</div>
            <div class="text-sm text-gray-600 leading-relaxed">{{ detailTarget.notes }}</div>
          </div>

          <!-- Assigned lanes -->
          <div class="bg-gray-50 rounded-xl p-4 col-span-2">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Lanes through this location
            </div>
            <div v-if="detailLanesLoading" class="text-xs text-gray-400 text-center py-3">
              Loading...
            </div>
            <div v-else-if="detailLanes.length === 0" class="text-xs text-gray-400 italic">
              No lanes pass through this node
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="lane in detailLanes"
                :key="lane.id"
                class="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
              >
                <span class="text-sm text-gray-700 truncate flex-1">{{ lane.name }}</span>
                <div class="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span
                    class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    :class="lane.status === 'ok'
                      ? 'bg-green-50 text-green-700'
                      : lane.status === 'warn'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'"
                  >
                    {{ lane.status === 'ok' ? 'Compliant' : lane.status === 'warn' ? 'Warning' : 'Issues' }}
                  </span>
                  <span class="text-xs text-gray-400">{{ lane.transit || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="border-t border-gray-100 px-6 py-3 flex justify-end gap-2">
          <button
            @click="detailTarget = null"
            class="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            v-if="auth.canWrite"
            @click="() => { openForm(detailTarget); detailTarget = null }"
            class="text-sm px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition"
          >
            Edit
          </button>
        </div>
      </div>
    </div>

    <!-- ── Add / Edit form modal ──────────────────────── -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="showForm = false"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50">
          <div class="text-sm font-semibold text-indigo-800">
            {{ editTarget ? 'Edit caretaker' : 'Add caretaker' }}
          </div>
          <button @click="showForm = false" class="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          <!-- Company + Type -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Company name *</label>
              <input
                v-model="formData.company"
                maxlength="200"
                placeholder="Company name"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Type *</label>
              <select
                v-model="formData.type"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition"
              >
                <option v-for="t in CT_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
          </div>

          <!-- Location -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Location / Node *</label>
              <select
                v-model="formData.node_id"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition"
              >
                <option value="">Select node...</option>
                <option v-for="n in nodesStore.nodes" :key="n.id" :value="n.id">
                  {{ n.company }} ({{ n.country }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Country *</label>
              <input
                v-model="formData.country"
                maxlength="2"
                placeholder="BE"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition"
              />
            </div>
          </div>

          <!-- Contact -->
          <div>
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact</div>
            <div class="grid grid-cols-2 gap-3">
              <input v-model="formData.contact_name"  maxlength="200" placeholder="Contact person"
                class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition" />
              <input v-model="formData.contact_phone" maxlength="50"  placeholder="Phone number"
                class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition" />
              <input v-model="formData.contact_email" maxlength="200" placeholder="Email address"
                class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition" />
              <input v-model="formData.available"     maxlength="100" placeholder="e.g. 24/7"
                class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition" />
            </div>
            <div class="flex gap-2 mt-2 flex-wrap">
              <button
                v-for="p in AVAIL_PRESETS"
                :key="p"
                @click="formData.available = p"
                class="text-xs px-2.5 py-1 rounded-full border transition"
                :class="formData.available === p
                  ? 'border-teal-400 bg-teal-50 text-teal-700'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300'"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <!-- Responsibilities -->
          <div>
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Responsibilities</div>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <button
                v-for="r in COMMON_RESP"
                :key="r"
                @click="toggleResp(r)"
                class="text-xs px-2.5 py-1 rounded-full border transition"
                :class="formData.responsibilities.includes(r)
                  ? 'border-teal-400 bg-teal-500 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'"
              >
                {{ r }}
              </button>
            </div>
          </div>

          <!-- Certs -->
          <div>
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Certifications</div>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <button
                v-for="c in COMMON_CERTS"
                :key="c"
                @click="toggleCert(c)"
                class="text-xs px-2.5 py-1 rounded-full border transition"
                :class="formData.certs.includes(c)
                  ? 'border-teal-400 bg-teal-500 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'"
              >
                {{ c }}
              </button>
            </div>
          </div>

          <!-- Rating -->
          <div>
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rating</div>
            <div class="flex items-center gap-1">
              <button
                v-for="n in 5"
                :key="n"
                @click="formData.rating = n"
                class="text-xl transition"
                :class="n <= formData.rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'"
              >★</button>
              <span class="text-sm text-gray-400 ml-2">{{ formData.rating }}/5</span>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
            <textarea
              v-model="formData.notes"
              maxlength="2000"
              rows="2"
              placeholder="Operating hours, special procedures..."
              class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition resize-none"
            ></textarea>
          </div>

        </div>
        <div class="border-t border-gray-100 px-6 py-3 flex items-center justify-between">
          <span v-if="formError" class="text-xs text-red-500">{{ formError }}</span>
          <div class="flex gap-2 ml-auto">
            <button
              @click="showForm = false"
              class="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              @click="submitForm"
              :disabled="formSubmitting || !canSubmitForm"
              class="text-sm px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition disabled:opacity-40"
            >
              {{ formSubmitting ? 'Saving...' : editTarget ? 'Save changes' : 'Add caretaker' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Delete confirm ─────────────────────────────── -->
    <div
      v-if="confirmDeleteTarget"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="confirmDeleteTarget = null"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <div class="text-sm font-semibold text-gray-800 mb-2">Remove caretaker?</div>
        <div class="text-sm text-gray-500 mb-5">
          "{{ confirmDeleteTarget.company }}" will be removed.
        </div>
        <div class="flex justify-end gap-3">
          <button
            @click="confirmDeleteTarget = null"
            class="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="text-sm px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore }        from '../stores/auth.js'
import { useCaretakersStore }  from '../stores/caretakers.js'
import { useNodesStore }       from '../stores/nodes.js'
import { caretakersApi }       from '../api/caretakers.js'

const auth       = useAuthStore()
const store      = useCaretakersStore()
const nodesStore = useNodesStore()

const search              = ref('')
const activeType          = ref('')
const nodeFilter          = ref('')
const detailTarget        = ref(null)
const detailLanes         = ref([])
const detailLanesLoading  = ref(false)
const confirmDeleteTarget = ref(null)
const showForm            = ref(false)
const editTarget          = ref(null)
const formSubmitting      = ref(false)
const formError           = ref('')

const CT_TYPES = [
  { value: 'Stevedore',         label: 'Stevedore'         },
  { value: 'Ground Handler',    label: 'Ground Handler'    },
  { value: 'Terminal Operator', label: 'Terminal Operator' },
  { value: 'Warehouse Keeper',  label: 'Warehouse Keeper'  },
  { value: 'Customs Agent',     label: 'Customs Agent'     },
  { value: 'Cold Store',        label: 'Cold Store'        },
]

const CT_COLORS = {
  'Stevedore':         { color: '#1D4ED8', bg: '#EFF6FF' },
  'Ground Handler':    { color: '#15803D', bg: '#F0FDF4' },
  'Terminal Operator': { color: '#0F766E', bg: '#F0FDFA' },
  'Warehouse Keeper':  { color: '#B45309', bg: '#FFFBEB' },
  'Customs Agent':     { color: '#4338CA', bg: '#EEF2FF' },
  'Cold Store':        { color: '#0369A1', bg: '#E0F2FE' },
}

const COMMON_RESP = [
  'Vessel unloading', 'Container handling', 'Storage', 'Reefer monitoring',
  'Documentation', 'Customs liaison', 'Ramp handling', 'Cool room management',
  'Loading / unloading', 'Quality check', 'Gate control', 'Transit handling',
  'Export acceptance', 'Build-up / breakdown', 'Temp monitoring', 'Segregation',
]

const COMMON_CERTS = [
  'GDP', 'GMP', 'HACCP', 'ISO 9001', 'ISO 28000',
  'IATA', 'IATA CASS', 'ADR', 'IMDG', 'AEO', 'C-TPAT',
]

const AVAIL_PRESETS = [
  '24/7', 'Mon–Fri 08:00–18:00', 'Mon–Fri 07:00–20:00',
  'Mon–Sun 06:00–22:00', 'Daily 05:00–23:00',
]

const blankForm = () => ({
  company:          '',
  type:             'Ground Handler',
  node_id:          '',
  country:          '',
  contact_name:     '',
  contact_phone:    '',
  contact_email:    '',
  available:        '',
  notes:            '',
  rating:           4,
  responsibilities: [],
  certs:            [],
})

const formData = reactive(blankForm())

onMounted(async () => {
  await Promise.all([
    store.fetchCaretakers(),
    nodesStore.fetchNodes(),
  ])
})

const nodeMap = computed(() => {
  const m = {}
  nodesStore.nodes.forEach(n => { m[n.id] = n })
  return m
})

const uniqueNodes = computed(() => {
  const ids = [...new Set(store.caretakers.map(c => c.node_id))]
  return ids.map(id => nodeMap.value[id]).filter(Boolean)
})

const filtered = computed(() => {
  let list = [...store.caretakers]
  if (search.value)
    list = list.filter(c =>
      c.company.toLowerCase().includes(search.value.toLowerCase()) ||
      c.type.toLowerCase().includes(search.value.toLowerCase())
    )
  if (activeType.value)
    list = list.filter(c => c.type === activeType.value)
  if (nodeFilter.value)
    list = list.filter(c => c.node_id === nodeFilter.value)
  return list
})

const typeFilters = computed(() => [
  { value: '', label: 'All', count: store.caretakers.length },
  ...CT_TYPES.map(t => ({
    value: t.value,
    label: t.label,
    count: store.caretakers.filter(c => c.type === t.value).length,
  }))
])

const canSubmitForm = computed(() =>
  formData.company.trim() && formData.type && formData.node_id && formData.country.trim()
)

function typeColor(type) { return CT_COLORS[type]?.color || '#6B7280' }
function typeBg(type)    { return CT_COLORS[type]?.bg    || '#F3F4F6' }

function toggleType(val) {
  activeType.value = activeType.value === val ? '' : val
}

function clearFilters() {
  search.value      = ''
  activeType.value  = ''
  nodeFilter.value  = ''
}

async function openDetail(ct) {
  detailTarget.value       = ct
  detailLanes.value        = []
  detailLanesLoading.value = true
  try {
    const res         = await caretakersApi.lanes(ct.id)
    detailLanes.value = res.data
  } catch {
    detailLanes.value = []
  } finally {
    detailLanesLoading.value = false
  }
}

function openForm(ct) {
  editTarget.value = ct
  if (ct) {
    Object.assign(formData, {
      company:          ct.company,
      type:             ct.type,
      node_id:          ct.node_id,
      country:          ct.country,
      contact_name:     ct.contact_name  || '',
      contact_phone:    ct.contact_phone || '',
      contact_email:    ct.contact_email || '',
      available:        ct.available     || '',
      notes:            ct.notes         || '',
      rating:           ct.rating,
      responsibilities: [...ct.responsibilities],
      certs:            [...ct.certs],
    })
  } else {
    Object.assign(formData, blankForm())
  }
  formError.value = ''
  showForm.value  = true
}

function toggleResp(r) {
  const idx = formData.responsibilities.indexOf(r)
  if (idx === -1) formData.responsibilities.push(r)
  else formData.responsibilities.splice(idx, 1)
}

function toggleCert(c) {
  const idx = formData.certs.indexOf(c)
  if (idx === -1) formData.certs.push(c)
  else formData.certs.splice(idx, 1)
}

async function submitForm() {
  formError.value      = ''
  formSubmitting.value = true
  try {
    const payload = { ...formData }
    if (editTarget.value) {
      await store.updateCaretaker(editTarget.value.id, payload)
    } else {
      await store.createCaretaker(payload)
    }
    showForm.value = false
  } catch (e) {
    formError.value = e.response?.data?.detail || 'Something went wrong'
  } finally {
    formSubmitting.value = false
  }
}

async function handleDelete() {
  await store.deleteCaretaker(confirmDeleteTarget.value.id)
  confirmDeleteTarget.value = null
}
</script>