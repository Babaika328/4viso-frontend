<template>
  <div class="min-h-screen bg-[#0d1f16] flex items-center justify-center">
    <div class="text-center">
      <p class="text-slate-400 text-sm uppercase tracking-widest mb-2">Logged in as</p>
      <p class="text-white text-xl font-bold">{{ authStore.user?.email }}</p>
      <p class="text-emerald-400 text-sm mt-1 capitalize">{{ authStore.user?.role }}</p>
      <button
        @click="handleLogout"
        class="mt-8 px-6 py-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm transition">
        Sign out
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>