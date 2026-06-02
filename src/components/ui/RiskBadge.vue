<template>
  <span
    class="inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap"
    :class="[sizeClass, colorClass]"
  >
    <span class="rounded-full" :class="dotClass"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  risk: { type: Number, default: null },
  size: { type: String, default: 'md' },
})

const level = computed(() => {
  if (props.risk === null || props.risk === undefined) return 'unknown'
  if (props.risk <= 3) return 'low'
  if (props.risk <= 6) return 'medium'
  return 'high'
})

const label = computed(() => {
  return { low: 'Low', medium: 'Medium', high: 'High', unknown: 'Unknown' }[level.value]
})

const sizeClass = computed(() =>
  props.size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
)

const colorClass = computed(() => ({
  low:     'bg-green-50 text-green-700 border border-green-100',
  medium:  'bg-amber-50 text-amber-700 border border-amber-100',
  high:    'bg-red-50   text-red-700   border border-red-100',
  unknown: 'bg-gray-100 text-gray-500  border border-gray-200',
})[level.value])

const dotClass = computed(() => ({
  low:     'w-1.5 h-1.5 bg-green-500',
  medium:  'w-1.5 h-1.5 bg-amber-500',
  high:    'w-1.5 h-1.5 bg-red-500',
  unknown: 'w-1.5 h-1.5 bg-gray-400',
})[level.value])
</script>