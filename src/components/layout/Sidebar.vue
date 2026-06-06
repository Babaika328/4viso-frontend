<template>
  <aside class="w-48 min-w-[192px] bg-white border-r border-gray-200 flex flex-col">

    <!-- Logo -->
    <div class="px-5 py-4 border-b border-gray-100">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-teal-500"></div>
        <span class="font-bold text-lg text-teal-700 tracking-tight">4Viso</span>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-2">
      <RouterLink
        v-for="item in visibleNav"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all duration-150 border-l-2"
        :class="isActive(item.path)
          ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'"
      >
        {{ item.label }}
        <span
          v-if="item.badge"
          class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600"
        >
          {{ item.badge }}
        </span>
      </RouterLink>
    </nav>

    <!-- User -->
    <div class="border-t border-gray-100 px-4 py-3">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {{ initials }}
        </div>
        <div class="min-w-0">
          <div class="text-xs font-medium text-gray-800 truncate">{{ auth.user?.email?.split('@')[0] }}</div>
          <div class="text-[10px] text-gray-400 capitalize">{{ auth.role }}</div>
        </div>
      </div>
    </div>

  </aside>
</template>

<script setup>
import { computed }     from 'vue'
import { useRoute }     from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'

const auth  = useAuthStore()
const route = useRoute()

const initials = computed(() => {
  const email = auth.user?.email || ''
  return email.slice(0, 2).toUpperCase()
})

const NAV = [
  { path: '/dashboard',  label: 'Dashboard'                           },
  { path: '/builder',    label: 'Lane builder', writeOnly: true       },
  { path: '/lanes',      label: 'My lanes'                            },
  { path: '/caretakers', label: 'Caretakers'                          },
  { path: '/analytics',  label: 'Analytics'                           },
  { path: '/admin',      label: 'Admin',        adminOnly: true       },
]

const visibleNav = computed(() =>
  NAV.filter(item => {
    if (item.adminOnly && !auth.isAdmin)   return false
    if (item.writeOnly && !auth.canWrite)  return false
    return true
  })
)

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>