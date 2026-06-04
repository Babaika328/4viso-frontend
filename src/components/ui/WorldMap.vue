<template>
  <div class="w-full rounded-lg overflow-hidden border border-gray-100" style="background:#D6EBF5">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full block">
      <!-- Continents -->
      <path v-for="(d, i) in CONTINENTS" :key="i" :d="d" fill="#C8DEB8" stroke="#A8CC96" stroke-width="0.8"/>

      <!-- Nodes -->
      <g
        v-for="node in nodes"
        :key="node.id"
        @mouseenter="hovered = node.id"
        @mouseleave="hovered = null"
        style="cursor:pointer"
      >
        <circle
          :cx="toX(node.lng)"
          :cy="toY(node.lat)"
          :r="hovered === node.id ? 7 : 5"
          :fill="riskColor(node.risk)"
          stroke="#fff"
          stroke-width="1.5"
        />
        <!-- Tooltip -->
        <g v-if="hovered === node.id">
          <rect
            :x="toX(node.lng) + 10"
            :y="toY(node.lat) - 20"
            :width="node.company.length * 5.8"
            height="26"
            rx="4"
            fill="rgba(0,0,0,.75)"
          />
          <text
            :x="toX(node.lng) + 15"
            :y="toY(node.lat) - 4"
            font-size="9.5"
            fill="#fff"
            font-family="sans-serif"
            font-weight="500"
          >{{ node.company }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  nodes: { type: Array, default: () => [] }
})

const W = 560
const H = 265
const hovered = ref(null)

const CONTINENTS = [
  "M55,42 L110,35 L148,48 L162,72 L155,108 L130,130 L90,145 L55,140 L30,115 L22,88 L35,60Z",
  "M90,148 L140,138 L160,165 L162,205 L148,240 L120,255 L92,246 L72,220 L68,178Z",
  "M230,38 L270,32 L295,40 L300,58 L285,72 L260,78 L240,72 L228,58Z",
  "M228,78 L295,72 L316,88 L320,130 L308,182 L280,218 L252,220 L228,195 L216,148 L220,108Z",
  "M290,32 L430,22 L500,38 L520,60 L508,105 L478,140 L420,152 L355,148 L320,130 L300,88Z",
  "M440,148 L510,140 L525,168 L520,198 L498,208 L462,202 L440,178Z",
  "M460,210 L530,218 L545,248 L520,258 L475,252 L455,232Z",
]

function toX(lng) { return ((lng + 180) / 360) * 540 + 10 }
function toY(lat) { return ((90 - lat) / 180) * 240 + 10 }

function riskColor(risk) {
  if (risk <= 3) return '#22c55e'
  if (risk <= 6) return '#f59e0b'
  return '#ef4444'
}
</script>