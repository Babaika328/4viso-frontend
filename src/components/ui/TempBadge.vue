<template>
  <span class="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap" :class="cls">
    {{ min }}–{{ max }}{{ unit }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  min:  { type: [String, Number], default: null },
  max:  { type: [String, Number], default: null },
  unit: { type: String, default: '°C' },
})

const frozen = computed(() => parseFloat(props.min) < 0)
const cls    = computed(() =>
  frozen.value
    ? 'bg-blue-50 text-blue-700'
    : 'bg-cyan-50 text-cyan-700'
)
</script>