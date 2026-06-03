<template>
  <div>
    <!-- Selected state -->
    <div
      v-if="selectedNode"
      class="border rounded-xl p-3 flex items-start justify-between gap-3"
      :style="{ borderColor: riskColor(selectedNode.risk), background: riskBg(selectedNode.risk) }"
    >
      <div class="flex-1 min-w-0">
        <div class="text-xs font-semibold text-gray-800 mb-0.5">{{ selectedNode.company }}</div>
        <div class="text-[10px] text-gray-500">{{ selectedNode.type }} · {{ selectedNode.country }} · {{ selectedNode.region }}</div>
        <RiskBadge :risk="selectedNode.risk" size="sm" class="mt-1.5" />
      </div>
      <button
        @click="$emit('clear')"
        class="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-1 rounded-lg transition flex-shrink-0"
      >
        Change
      </button>
    </div>

    <!-- Search state -->
    <div v-else class="relative" ref="containerRef">
      <div
        class="border rounded-xl overflow-hidden transition"
        :class="open ? 'border-teal-400' : 'border-gray-200'"
      >
        <div class="flex items-center gap-2 px-3 py-2.5">
          <span class="text-gray-400 text-sm">⌕</span>
          <input
            v-model="query"
            @focus="open = true"
            placeholder="Search nodes..."
            class="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
          <button v-if="query" @click="query = ''" class="text-gray-400 hover:text-gray-600 text-base leading-none">×</button>
        </div>
        <div v-if="open" class="border-t border-gray-100 max-h-56 overflow-y-auto">
          <div v-if="results.length === 0" class="px-4 py-4 text-sm text-gray-400 text-center">
            No nodes found
          </div>
          <div
            v-for="node in results"
            :key="node.id"
            @click="pick(node)"
            class="px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between gap-3"
            :class="excludeIds.includes(node.id) ? 'opacity-40 pointer-events-none' : ''"
          >
            <div>
              <div class="text-xs font-medium text-gray-800">{{ node.company }}</div>
              <div class="text-[10px] text-gray-400">{{ node.type }} · {{ node.country }}</div>
            </div>
            <RiskBadge :risk="node.risk" size="sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useNodesStore } from '../../stores/nodes.js'
import RiskBadge         from '../ui/RiskBadge.vue'

const props = defineProps({
  selectedId:  { type: Number, default: null },
  excludeIds:  { type: Array,  default: () => [] },
})
const emit = defineEmits(['select', 'clear'])

const nodesStore   = useNodesStore()
const query        = ref('')
const open         = ref(false)
const containerRef = ref(null)

const selectedNode = computed(() =>
  props.selectedId ? nodesStore.nodes.find(n => n.id === props.selectedId) : null
)

const results = computed(() =>
  nodesStore.nodes
    .filter(n => {
      if (props.excludeIds.includes(n.id)) return false
      if (query.value) return n.company.toLowerCase().includes(query.value.toLowerCase()) ||
                              n.country.toLowerCase().includes(query.value.toLowerCase())
      return true
    })
    .sort((a, b) => a.risk - b.risk)
    .slice(0, 8)
)

function pick(node) {
  emit('select', node)
  open.value  = false
  query.value = ''
}

function riskColor(risk) {
  return risk <= 3 ? '#16a34a' : risk <= 6 ? '#d97706' : '#dc2626'
}

function riskBg(risk) {
  return risk <= 3 ? '#f0fdf4' : risk <= 6 ? '#fffbeb' : '#fef2f2'
}

function handleOutside(e) {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutside))
</script>