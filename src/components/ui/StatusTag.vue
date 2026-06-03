<template>
  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap" :class="cls">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: null }
})

const label = computed(() => ({
  ok:   'Compliant',
  warn: 'Warning',
  bad:  'Non-compliant',
})[props.status] || 'Unknown')

const cls = computed(() => ({
  ok:   'bg-green-50 text-green-700 border-green-100',
  warn: 'bg-amber-50 text-amber-700 border-amber-100',
  bad:  'bg-red-50   text-red-700   border-red-100',
})[props.status] || 'bg-gray-100 text-gray-500 border-gray-200')
</script>