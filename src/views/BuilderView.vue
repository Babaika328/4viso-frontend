<template>
  <div class="flex flex-col h-full overflow-hidden">

    <!-- Top bar -->
    <div class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <div
            v-for="(s, i) in steps"
            :key="s.n"
            class="flex items-center gap-2"
          >
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition"
              :class="step === s.n
                ? 'bg-teal-500 text-white'
                : step > s.n
                  ? 'bg-teal-100 text-teal-600'
                  : 'bg-gray-100 text-gray-400'"
            >
              {{ s.n }}
            </div>
            <span class="text-sm" :class="step === s.n ? 'text-gray-800 font-medium' : 'text-gray-400'">
              {{ s.label }}
            </span>
            <span v-if="i < steps.length - 1" class="text-gray-200 text-xs">›</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button @click="resetBuilder" class="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
          Reset
        </button>
        <button
          v-if="step === 1"
          :disabled="!canProceedStep1"
          @click="goToStep2"
          class="text-sm bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg transition"
        >
          Build route →
        </button>
        <button
          v-if="step === 2"
          @click="step = 1"
          class="text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          ← Setup
        </button>
        <button
          v-if="step === 2"
          :disabled="selectedNodes.length < 2"
          @click="step = 3"
          class="text-sm bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg transition"
        >
          Review →
        </button>
        <button
          v-if="step === 3"
          @click="step = 2"
          class="text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          ← Route
        </button>
        <button
          v-if="step === 3"
          :disabled="!canPublish || publishing"
          @click="publishLane"
          class="text-sm bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg transition"
        >
          {{ publishing ? 'Publishing...' : 'Publish lane' }}
        </button>
      </div>
    </div>

    <!-- ── Step 1 — Setup ─────────────────────────────── -->
    <div v-if="step === 1" class="flex-1 overflow-auto p-6">
      <div class="max-w-2xl mx-auto space-y-5">

        <!-- Identity -->
        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Lane identity</div>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Lane name *</label>
              <input
                v-model="form.name"
                maxlength="300"
                placeholder="e.g. Cipla Mumbai to DB Schenker BRU"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Departure <span class="text-gray-300 font-normal">(optional)</span></label>
              <input
                v-model="form.departure"
                maxlength="100"
                placeholder="e.g. Day 1, 08:00 CET"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Notes <span class="text-gray-300 font-normal">(optional)</span></label>
              <input
                v-model="form.notes"
                maxlength="2000"
                placeholder="Optional notes"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition"
              />
            </div>
          </div>
        </div>

        <!-- Origin & Destination -->
        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Origin & Destination *</div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs font-semibold text-teal-600 mb-2">Origin</div>
              <NodeSearch
                :exclude-ids="form.destinationId ? [form.destinationId] : []"
                :selected-id="form.originId"
                @select="n => { form.originId = n.id; form.originNode = n }"
                @clear="() => { form.originId = null; form.originNode = null }"
              />
            </div>
            <div>
              <div class="text-xs font-semibold text-purple-600 mb-2">Destination</div>
              <NodeSearch
                :exclude-ids="form.originId ? [form.originId] : []"
                :selected-id="form.destinationId"
                @select="n => { form.destinationId = n.id; form.destinationNode = n }"
                @clear="() => { form.destinationId = null; form.destinationNode = null }"
              />
            </div>
          </div>
        </div>

        <!-- Cargo type -->
        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Cargo type *</div>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="ct in CARGO_TYPES"
              :key="ct.value"
              @click="selectCargo(ct.value)"
              class="border rounded-xl p-4 cursor-pointer transition"
              :class="form.cargoType === ct.value
                ? 'border-teal-400 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="text-sm font-semibold mb-2"
                :class="form.cargoType === ct.value ? 'text-teal-800' : 'text-gray-700'">
                {{ ct.label }}
              </div>
              <div class="flex gap-1.5 flex-wrap">
                <span
                  v-for="r in ct.reqs"
                  :key="r"
                  class="text-[10px] px-2 py-0.5 rounded-full"
                  :class="form.cargoType === ct.value ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ r }}
                </span>
                <span
                  v-if="ct.temp"
                  class="text-[10px] px-2 py-0.5 rounded-full"
                  :class="form.cargoType === ct.value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ ct.temp }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Temperature -->
        <div v-if="form.cargoType" class="bg-white border border-gray-200 rounded-xl p-5">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Temperature range</div>
          <div class="flex gap-2 flex-wrap mb-4">
            <button
              v-for="preset in TEMP_PRESETS"
              :key="preset.label"
              @click="applyTempPreset(preset)"
              class="text-xs px-3 py-1.5 rounded-lg border transition"
              :class="form.tempMin === preset.min && form.tempMax === preset.max
                ? 'border-teal-400 bg-teal-50 text-teal-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >
              {{ preset.label }}
            </button>
          </div>
          <div class="flex gap-3 items-end">
            <div class="flex-1">
              <label class="text-xs text-gray-400 block mb-1">Min</label>
              <input
                v-model="form.tempMin"
                type="number"
                placeholder="2"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition"
              />
            </div>
            <div class="pb-2 text-gray-300">–</div>
            <div class="flex-1">
              <label class="text-xs text-gray-400 block mb-1">Max</label>
              <input
                v-model="form.tempMax"
                type="number"
                placeholder="8"
                class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">Unit</label>
              <select
                v-model="form.tempUnit"
                class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 transition"
              >
                <option>°C</option>
                <option>°F</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Ready indicator -->
        <div
          class="rounded-xl px-4 py-3 text-sm flex items-center justify-between"
          :class="canProceedStep1
            ? 'bg-teal-50 border border-teal-200 text-teal-700'
            : 'bg-gray-50 border border-gray-200 text-gray-400'"
        >
          <span v-if="canProceedStep1">
            Ready — {{ form.originNode?.company }} → {{ form.destinationNode?.company }}
          </span>
          <span v-else>
            Still needed: {{ missingFields.join(', ') }}
          </span>
          <button
            v-if="canProceedStep1"
            @click="goToStep2"
            class="text-sm bg-teal-500 text-white px-4 py-1.5 rounded-lg hover:bg-teal-600 transition"
          >
            Build route →
          </button>
        </div>

      </div>
    </div>

    <!-- ── Step 2 — Route builder ──────────────────────── -->
    <div v-if="step === 2" class="flex-1 overflow-hidden flex flex-col bg-white">

      <!-- Canvas -->
      <div
        class="flex-1 overflow-auto p-8 bg-gray-50"
        style="background-image: radial-gradient(#e2e8f0 1px, transparent 1px); background-size: 20px 20px;"
      >
        <div class="flex items-start gap-0 w-fit min-w-full">
          <template v-for="(node, i) in selectedNodes" :key="node.id + '-' + i">

            <!-- Node card -->
            <div class="w-44 flex-shrink-0">
              <div
                class="rounded-xl border overflow-hidden shadow-sm bg-white"
                :style="{ borderColor: i === 0 ? '#0d9488' : i === selectedNodes.length - 1 ? '#7c3aed' : '#e2e8f0' }"
              >
                <!-- Header -->
                <div
                  class="px-3 py-2 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider"
                  :style="{
                    background: i === 0 ? '#f0fdf4' : i === selectedNodes.length - 1 ? '#faf5ff' : '#f8fafc',
                    color: i === 0 ? '#0d9488' : i === selectedNodes.length - 1 ? '#7c3aed' : '#64748b'
                  }"
                >
                  {{ i === 0 ? 'Origin' : i === selectedNodes.length - 1 ? 'Destination' : `Stop ${i}` }}
                </div>
                <div class="px-3 py-2.5">
                  <div class="text-[9px] font-bold uppercase tracking-wider mb-1 text-gray-400">
                    {{ TYPE_ABBR[node.type] || node.type }}
                  </div>
                  <div class="text-xs font-semibold leading-tight mb-1 text-gray-800">
                    {{ node.company }}
                  </div>
                  <div class="text-[10px] mb-2 text-gray-400">
                    {{ node.country }} · {{ node.region }}
                  </div>
                  <RiskBadge :risk="node.risk" size="sm" />
                  <div class="flex gap-2 mt-2.5" v-if="i !== 0 && i !== selectedNodes.length - 1">
                    <button
                      @click="removeStop(i)"
                      class="text-[10px] px-2 py-1 rounded border border-red-200 text-red-400 hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Leg connector -->
            <div
              v-if="i < selectedNodes.length - 1"
              class="w-40 flex-shrink-0 flex flex-col items-center pt-8"
            >
              <div class="w-full flex items-center gap-1">
                <div class="flex-1 h-px"
                  :style="{ background: selectedCarriers[i] ? '#0d9488' : '#e2e8f0' }">
                </div>
                <div
                  class="text-[8px] font-bold px-1.5 py-0.5 rounded"
                  :style="{
                    background: selectedCarriers[i] ? '#f0fdfa' : '#f8fafc',
                    color:      selectedCarriers[i] ? '#0d9488' : '#94a3b8'
                  }"
                >
                  LEG {{ i + 1 }}
                </div>
                <div class="flex-1 h-px"
                  :style="{ background: selectedCarriers[i] ? '#0d9488' : '#e2e8f0' }">
                </div>
              </div>

              <div class="mt-2 w-full px-1">
                <button
                  v-if="!selectedCarriers[i]"
                  @click="openCarrierPicker(i)"
                  class="w-full text-[10px] py-2 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:border-teal-300 hover:text-teal-500 transition text-center"
                >
                  + Assign carrier
                </button>
                <div v-else class="text-center">
                  <div class="text-[10px] font-medium mb-0.5 text-gray-700">
                    {{ selectedCarriers[i].company }}
                  </div>
                  <div class="text-[9px] mb-1.5 text-gray-400">
                    {{ selectedCarriers[i].mode }} · {{ selectedCarriers[i].transit }}
                  </div>
                  <div class="flex justify-center gap-1">
                    <button
                      @click="openCarrierPicker(i)"
                      class="text-[9px] px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                    >
                      Change
                    </button>
                    <button
                      @click="selectedCarriers[i] = null"
                      class="text-[9px] px-2 py-0.5 rounded border border-red-200 text-red-400 hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <button
                @click="openNodePicker(i + 1)"
                class="mt-3 text-[9px] px-3 py-1 rounded-full border border-gray-200 text-gray-400 hover:border-teal-300 hover:text-teal-500 transition"
              >
                + add stop
              </button>
            </div>

          </template>
        </div>
      </div>

      <!-- Summary bar -->
      <div class="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center gap-6">
        <div class="text-xs text-gray-400">
          <span class="text-gray-700 font-semibold">{{ selectedNodes.length }}</span> stops ·
          <span class="text-gray-700 font-semibold">{{ assignedCount }}/{{ legCount }}</span> carriers assigned
        </div>
        <div v-if="liveRisk !== null" class="flex items-center gap-2">
          <span class="text-xs text-gray-400">Live risk:</span>
          <RiskBadge :risk="liveRisk" size="sm" />
        </div>
        <div class="ml-auto flex gap-2">
          <button
            v-if="legCount > 0 && assignedCount < legCount"
            @click="autoAssignCarriers"
            class="text-xs px-3 py-1.5 rounded-lg border border-teal-500 text-teal-600 bg-teal-50 hover:bg-teal-100 transition"
          >
            Auto-assign carriers
          </button>
        </div>
      </div>
    </div>

    <!-- ── Step 3 — Review ────────────────────────────── -->
    <div v-if="step === 3" class="flex-1 overflow-auto p-6">
      <div class="max-w-2xl mx-auto space-y-5">

        <!-- Summary cards -->
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="s in reviewStats"
            :key="s.label"
            class="bg-white border border-gray-200 rounded-xl px-4 py-3"
          >
            <div class="text-xs text-gray-400 mb-1">{{ s.label }}</div>
            <div class="text-lg font-semibold text-gray-800">{{ s.value }}</div>
          </div>
        </div>

        <!-- Checklist -->
        <div class="bg-white border border-gray-200 rounded-xl p-5">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Checklist</div>
          <div class="space-y-1">
            <div
              v-for="check in checklist"
              :key="check.label"
              class="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
            >
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                :class="check.ok ? 'bg-green-100' : check.optional ? 'bg-gray-100' : 'bg-red-100'"
              >
                <span
                  class="text-[10px] font-bold"
                  :class="check.ok ? 'text-green-600' : check.optional ? 'text-gray-400' : 'text-red-500'"
                >
                  {{ check.ok ? '✓' : '○' }}
                </span>
              </div>
              <span
                class="text-sm flex-1"
                :class="check.ok ? 'text-gray-700' : check.optional ? 'text-gray-400' : 'text-red-600'"
              >
                {{ check.label }}
                <span v-if="check.optional && !check.ok" class="text-xs text-gray-300 ml-1">(optional)</span>
              </span>
              <span
                class="text-xs font-semibold"
                :class="check.ok ? 'text-green-500' : check.optional ? 'text-gray-300' : 'text-red-400'"
              >
                {{ check.ok ? 'Pass' : check.optional ? '—' : 'Fail' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Publish bar -->
        <div
          class="rounded-xl px-5 py-4 flex items-center justify-between"
          :class="canPublish ? 'bg-teal-50 border border-teal-200' : 'bg-red-50 border border-red-200'"
        >
          <div>
            <div class="text-sm font-semibold" :class="canPublish ? 'text-teal-800' : 'text-red-700'">
              {{ canPublish ? 'Ready to publish' : 'Cannot publish yet' }}
            </div>
            <div class="text-xs mt-0.5" :class="canPublish ? 'text-teal-600' : 'text-red-500'">
              {{ canPublish ? 'All required checks passed' : failedChecks.join(', ') }}
            </div>
          </div>
          <button
            v-if="!canPublish"
            @click="step = 2"
            class="text-sm border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
          >
            Fix issues
          </button>
          <button
            v-else
            @click="publishLane"
            :disabled="publishing"
            class="text-sm bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-lg transition disabled:opacity-40"
          >
            {{ publishing ? 'Publishing...' : 'Publish lane' }}
          </button>
        </div>

      </div>
    </div>

    <!-- ── Node picker modal ──────────────────────────── -->
    <div
      v-if="showNodePicker"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="showNodePicker = false"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div class="text-sm font-semibold">Add stop</div>
            <div class="text-xs text-gray-400 mt-0.5">Required: {{ requirements.join(', ') || 'none' }}</div>
          </div>
          <button @click="showNodePicker = false" class="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div class="px-4 py-3 border-b border-gray-100">
          <input
            v-model="nodeSearch"
            placeholder="Search nodes..."
            class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400"
          />
        </div>
        <div class="overflow-y-auto flex-1 p-3 grid grid-cols-2 gap-2">
          <div
            v-for="node in filteredPickerNodes"
            :key="node.id"
            @click="!selectedNodeIds.includes(node.id) && selectNode(node)"
            class="border rounded-xl p-3 transition"
            :class="selectedNodeIds.includes(node.id)
              ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50'
              : 'border-gray-200 cursor-pointer hover:border-teal-300 hover:bg-teal-50/50'"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <div>
                <div class="text-xs font-semibold text-gray-800">{{ node.company }}</div>
                <div class="text-[10px] text-gray-400">{{ node.type }} · {{ node.country }}</div>
              </div>
              <RiskBadge :risk="node.risk" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Carrier picker modal ───────────────────────── -->
    <div
      v-if="showCarrierPicker"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="showCarrierPicker = false"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div class="text-sm font-semibold">Assign carrier — Leg {{ activeLegIdx + 1 }}</div>
            <div class="text-xs text-gray-400 mt-0.5">
              {{ selectedNodes[activeLegIdx]?.company }} → {{ selectedNodes[activeLegIdx + 1]?.company }}
            </div>
          </div>
          <button @click="showCarrierPicker = false" class="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div class="px-4 py-3 border-b border-gray-100 flex gap-2">
          <input
            v-model="carrierSearch"
            placeholder="Search carriers..."
            class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400"
          />
          <div class="flex gap-1">
            <button
              v-for="m in ['All', 'Air', 'Road', 'Sea']"
              :key="m"
              @click="carrierModeFilter = m"
              class="text-xs px-2.5 py-1 rounded-lg border transition"
              :class="carrierModeFilter === m
                ? 'bg-teal-500 text-white border-teal-500'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'"
            >
              {{ m }}
            </button>
          </div>
        </div>
        <div class="overflow-y-auto flex-1 p-3 grid grid-cols-2 gap-2">
          <div
            v-for="carrier in filteredPickerCarriers"
            :key="carrier.id"
            @click="selectCarrier(carrier)"
            class="border rounded-xl p-3 cursor-pointer hover:border-teal-300 hover:bg-teal-50/50 transition"
            :class="selectedCarriers[activeLegIdx]?.id === carrier.id
              ? 'border-teal-400 bg-teal-50'
              : 'border-gray-200'"
          >
            <div class="flex items-start justify-between gap-2 mb-1.5">
              <div class="text-xs font-semibold text-gray-800">{{ carrier.company }}</div>
              <span
                class="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                :class="carrier.mode === 'Air'  ? 'bg-blue-50 text-blue-600'
                      : carrier.mode === 'Sea'  ? 'bg-teal-50 text-teal-600'
                      : 'bg-amber-50 text-amber-600'"
              >
                {{ carrier.mode }}
              </span>
            </div>
            <div class="text-[10px] text-gray-400 mb-2">{{ carrier.transit }} · cutoff {{ carrier.cutoff }}</div>
            <div class="flex items-center gap-1 mb-2">
              <span
                v-for="n in 5"
                :key="n"
                class="text-xs"
                :class="n <= Math.round(carrier.rating) ? 'text-yellow-400' : 'text-gray-200'"
              >★</span>
              <span class="text-[10px] text-gray-400 ml-1">{{ carrier.rating.toFixed(1) }}</span>
            </div>
            <div v-if="requirements.length > 0" class="flex gap-1 flex-wrap">
              <span
                v-for="req in requirements"
                :key="req"
                class="text-[9px] px-1.5 py-0.5 rounded-full"
                :class="carrier.certs.includes(req) && carrier.cert_statuses?.[req] !== 'bad'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-500'"
              >
                {{ carrier.certs.includes(req) && carrier.cert_statuses?.[req] !== 'bad' ? '✓' : '✗' }} {{ req }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter }                           from 'vue-router'
import { useNodesStore }                       from '../stores/nodes.js'
import { useCarriersStore }                    from '../stores/carriers.js'
import { useLanesStore }                       from '../stores/lanes.js'
import { lanesApi }                            from '../api/lanes.js'
import RiskBadge                               from '../components/ui/RiskBadge.vue'
import NodeSearch                              from '../components/nodes/NodeSearch.vue'

const router         = useRouter()
const nodesStore     = useNodesStore()
const carriersStore  = useCarriersStore()
const lanesStore     = useLanesStore()

// ── Steps ─────────────────────────────────────────────────
const step       = ref(1)
const publishing = ref(false)
const steps      = [
  { n: 1, label: 'Setup' },
  { n: 2, label: 'Build route' },
  { n: 3, label: 'Review' },
]

// ── Form ──────────────────────────────────────────────────
const form = reactive({
  name:            '',
  departure:       '',
  notes:           '',
  cargoType:       '',
  originId:        null,
  originNode:      null,
  destinationId:   null,
  destinationNode: null,
  tempMin:         '',
  tempMax:         '',
  tempUnit:        '°C',
})

// ── Route state ───────────────────────────────────────────
const selectedNodes    = ref([])
const selectedCarriers = ref([])

// ── Pickers ───────────────────────────────────────────────
const showNodePicker    = ref(false)
const showCarrierPicker = ref(false)
const insertAtIndex     = ref(null)
const activeLegIdx      = ref(null)
const nodeSearch        = ref('')
const carrierSearch     = ref('')
const carrierModeFilter = ref('All')

// ── Constants ─────────────────────────────────────────────
const CARGO_TYPES = [
  { value: 'pharma', label: 'Pharmaceutical', reqs: ['GDP'],        temp: '2–8°C'    },
  { value: 'hazmat', label: 'Hazardous',      reqs: ['ADR', 'GDP'], temp: null        },
  { value: 'cold',   label: 'Cold chain',     reqs: ['GDP'],        temp: '-25–-15°C' },
  { value: 'air',    label: 'Air cargo',      reqs: ['IATA'],       temp: null        },
]

const CARGO_REQS = {
  pharma: ['GDP'],
  hazmat: ['ADR', 'GDP'],
  cold:   ['GDP'],
  air:    ['IATA'],
}

const TEMP_PRESETS = [
  { label: 'Frozen',       min: '-25', max: '-15' },
  { label: 'Refrigerated', min: '2',   max: '8'   },
  { label: 'Cool',         min: '8',   max: '15'  },
  { label: 'Ambient',      min: '',    max: ''     },
]

const TYPE_ABBR = {
  Warehouse:             'WH',
  Factory:               'FC',
  Airport:               'AP',
  Hub:                   'HB',
  Port:                  'PT',
  Handler:               'HA',
  'Distribution Center': 'DC',
}

onMounted(async () => {
  await Promise.all([
    nodesStore.fetchNodes(),
    carriersStore.fetchCarriers(),
  ])
})

// ── Computed ──────────────────────────────────────────────
const requirements  = computed(() => CARGO_REQS[form.cargoType] || [])
const legCount      = computed(() => Math.max(0, selectedNodes.value.length - 1))
const assignedCount = computed(() => selectedCarriers.value.filter(Boolean).length)
const selectedNodeIds = computed(() => selectedNodes.value.map(n => n.id))

const canProceedStep1 = computed(() =>
  form.name.trim() && form.cargoType && form.originId && form.destinationId
)

const missingFields = computed(() => {
  const m = []
  if (!form.name.trim())   m.push('lane name')
  if (!form.originId)      m.push('origin')
  if (!form.destinationId) m.push('destination')
  if (!form.cargoType)     m.push('cargo type')
  return m
})

const liveRisk = computed(() => {
  if (selectedNodes.value.length < 2) return null
  const risks = selectedNodes.value.map(n => n.risk)
  const max   = Math.max(...risks)
  const avg   = risks.reduce((a, b) => a + b, 0) / risks.length
  return Math.round((0.6 * max + 0.4 * avg) * 10) / 10
})

const canPublish = computed(() =>
  selectedNodes.value.length >= 2 &&
  assignedCount.value === legCount.value
)

const failedChecks = computed(() =>
  checklist.value.filter(c => !c.ok && !c.optional).map(c => c.label)
)

const checklist = computed(() => [
  { label: 'All carriers assigned', ok: assignedCount.value === legCount.value },
  { label: 'At least 2 nodes',      ok: selectedNodes.value.length >= 2 },
  { label: 'Risk below High',       ok: liveRisk.value === null || liveRisk.value < 7 },
  { label: 'Departure set',         ok: !!form.departure, optional: true },
])

const reviewStats = computed(() => [
  { label: 'Cargo',     value: form.cargoType },
  { label: 'Stops',     value: selectedNodes.value.length },
  { label: 'Carriers',  value: `${assignedCount.value}/${legCount.value}` },
  { label: 'Est. risk', value: liveRisk.value ?? '—' },
])

const filteredPickerNodes = computed(() =>
  nodesStore.nodes
    .filter(n => {
      if (!nodeSearch.value) return true
      return n.company.toLowerCase().includes(nodeSearch.value.toLowerCase()) ||
             n.country.toLowerCase().includes(nodeSearch.value.toLowerCase())
    })
    .sort((a, b) => a.risk - b.risk)
)

const filteredPickerCarriers = computed(() =>
  carriersStore.carriers
    .filter(c => {
      if (carrierSearch.value && !c.company.toLowerCase().includes(carrierSearch.value.toLowerCase())) return false
      if (carrierModeFilter.value !== 'All' && c.mode !== carrierModeFilter.value) return false
      return true
    })
    .sort((a, b) => {
      const aOk = requirements.value.every(r => a.certs?.includes(r) && a.cert_statuses?.[r] !== 'bad')
      const bOk = requirements.value.every(r => b.certs?.includes(r) && b.cert_statuses?.[r] !== 'bad')
      if (aOk && !bOk) return -1
      if (!aOk && bOk) return 1
      return b.rating - a.rating
    })
)

// ── Actions ───────────────────────────────────────────────
function selectCargo(type) {
  form.cargoType = type
  if (type === 'pharma') { form.tempMin = '2';   form.tempMax = '8'   }
  if (type === 'cold')   { form.tempMin = '-25'; form.tempMax = '-15' }
  if (type === 'hazmat' || type === 'air') { form.tempMin = ''; form.tempMax = '' }
}

function applyTempPreset(preset) {
  form.tempMin = preset.min
  form.tempMax = preset.max
}

function goToStep2() {
  selectedNodes.value    = [form.originNode, form.destinationNode]
  selectedCarriers.value = [null]
  step.value = 2
}

function removeStop(index) {
  selectedNodes.value.splice(index, 1)
  const legIdx = Math.max(0, index - 1)
  selectedCarriers.value.splice(legIdx, 1)
}

function openNodePicker(index) {
  insertAtIndex.value  = index
  nodeSearch.value     = ''
  showNodePicker.value = true
}

function selectNode(node) {
  const idx = insertAtIndex.value
  selectedNodes.value.splice(idx, 0, node)
  selectedCarriers.value.splice(idx, 0, null)
  showNodePicker.value = false
}

function openCarrierPicker(legIdx) {
  activeLegIdx.value      = legIdx
  carrierSearch.value     = ''
  carrierModeFilter.value = 'All'
  showCarrierPicker.value = true
}

function selectCarrier(carrier) {
  selectedCarriers.value[activeLegIdx.value] = carrier
  showCarrierPicker.value = false
}

function autoAssignCarriers() {
  for (let i = 0; i < legCount.value; i++) {
    if (!selectedCarriers.value[i]) {
      const best = carriersStore.carriers
        .filter(c =>
          requirements.value.every(r =>
            c.certs.includes(r) && c.cert_statuses?.[r] !== 'bad'
          )
        )
        .sort((a, b) => b.rating - a.rating)[0]
      if (best) selectedCarriers.value[i] = best
    }
  }
}

function resetBuilder() {
  step.value             = 1
  form.name              = ''
  form.departure         = ''
  form.notes             = ''
  form.cargoType         = ''
  form.originId          = null
  form.originNode        = null
  form.destinationId     = null
  form.destinationNode   = null
  form.tempMin           = ''
  form.tempMax           = ''
  form.tempUnit          = '°C'
  selectedNodes.value    = []
  selectedCarriers.value = []
}

async function publishLane() {
  publishing.value = true
  try {
    const payload = {
      name:        form.name,
      cargo_type:  form.cargoType,
      node_ids:    selectedNodes.value.map(n => n.id),
      legs:        selectedCarriers.value.map(c => ({
        carrier_id: c?.id || null,
        leg_time:   c?.transit || null,
      })),
      departure:   form.departure || null,
      notes:       form.notes     || null,
      temp_min:    form.tempMin   || null,
      temp_max:    form.tempMax   || null,
      temp_unit:   form.tempUnit,
      extra_certs: [],
    }
    await lanesApi.create(payload)
    await lanesStore.fetchLanes()
    resetBuilder()
    router.push('/lanes')
  } catch (e) {
    console.error(e)
  } finally {
    publishing.value = false
  }
}
</script>