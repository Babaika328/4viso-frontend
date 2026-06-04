<template>
  <div class="flex gap-1.5 flex-wrap">
    <span
      v-for="(f, i) in factors"
      :key="i"
      class="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap border"
      :class="sevClass(f.severity)"
    >
      {{ RF[f.type]?.label || f.type }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  factors: { type: Array, default: () => [] }
})

const RF = {
  temp:    { label: 'Temperature' },
  cert:    { label: 'Compliance'  },
  carrier: { label: 'Carrier'     },
  geo:     { label: 'Geographic'  },
  transit: { label: 'Transit'     },
}

function sevClass(sev) {
  if (sev === 'high')   return 'bg-red-50 text-red-700 border-red-100'
  if (sev === 'medium') return 'bg-amber-50 text-amber-700 border-amber-100'
  return 'bg-green-50 text-green-700 border-green-100'
}
</script>