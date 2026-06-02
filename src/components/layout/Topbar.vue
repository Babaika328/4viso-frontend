<template>
  <header class="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0">

    <!-- Page title -->
    <div class="text-sm font-semibold text-gray-800">{{ pageTitle }}</div>

    <!-- Right side -->
    <div class="flex items-center gap-3">

      <!-- Role badge -->
      <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
        :class="roleBadgeClass">
        {{ auth.role }}
      </span>

      <!-- Logout -->
      <button
        @click="handleLogout"
        :disabled="loggingOut"
        class="text-xs text-gray-400 hover:text-gray-700 transition px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50">
        {{ loggingOut ? 'Signing out...' : 'Sign out' }}
      </button>

    </div>
  </header>
</template>

<script setup>
import { ref, computed }       from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore }        from '../../stores/auth.js'

const auth       = useAuthStore()
const route      = useRoute()
const router     = useRouter()
const loggingOut = ref(false)

const TITLES = {
  '/dashboard':  'Dashboard',
  '/builder':    'Lane builder',
  '/lanes':      'My lanes',
  '/caretakers': 'Caretakers',
  '/analytics':  'Analytics',
  '/admin':      'Admin',
}

const pageTitle = computed(() => {
  for (const [path, title] of Object.entries(TITLES)) {
    if (route.path.startsWith(path)) return title
  }
  return '4Viso'
})

const roleBadgeClass = computed(() => {
  const map = {
    admin:   'bg-teal-50 text-teal-700',
    staff:   'bg-blue-50 text-blue-700',
    auditor: 'bg-purple-50 text-purple-700',
    port:    'bg-amber-50 text-amber-700',
    user:    'bg-gray-100 text-gray-600',
  }
  return map[auth.role] || 'bg-gray-100 text-gray-600'
})

async function handleLogout() {
  loggingOut.value = true
  try {
    await auth.logout()
  } finally {
    loggingOut.value = false
    await router.push('/login')
  }
}
</script>