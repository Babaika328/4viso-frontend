<template>
  <div class="min-h-screen bg-[#0d1f16] flex items-center justify-center p-4 relative overflow-hidden">

    <div class="absolute inset-0"
      style="background-image: radial-gradient(circle, rgba(74,222,128,0.07) 1px, transparent 1px); background-size: 28px 28px;">
    </div>

    <div class="absolute top-[-120px] left-[-60px] w-96 h-96 bg-emerald-900 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
    <div class="absolute bottom-[-100px] right-[-60px] w-80 h-80 bg-teal-900 rounded-full blur-3xl opacity-25 pointer-events-none"></div>

    <div class="relative z-10 w-full max-w-md">

      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 mb-2">
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="text-white text-2xl font-bold tracking-[0.2em] uppercase">4viso</span>
        </div>
        <p class="text-slate-400 text-xs tracking-widest uppercase">Cargo Intelligence Platform</p>
      </div>

      <!-- Tab switcher -->
      <div class="flex bg-white/5 rounded-xl p-1 mb-5 border border-white/10">
        <button
          @click="switchMode('login')"
          :class="mode === 'login' ? 'bg-emerald-700/80 text-white shadow-lg' : 'text-slate-300 hover:text-white'"
          class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200">
          Sign In
        </button>
        <button
          @click="switchMode('register')"
          :class="mode === 'register' ? 'bg-emerald-700/80 text-white shadow-lg' : 'text-slate-300 hover:text-white'"
          class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200">
          Register
        </button>
      </div>

      <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">

        <!-- Error -->
        <div v-if="error"
          class="mb-5 bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
          <span class="mt-0.5 flex-shrink-0">⚠</span>
          <span>{{ error }}</span>
        </div>

        <!-- Success -->
        <div v-if="success"
          class="mb-5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
          <span class="mt-0.5 flex-shrink-0">✓</span>
          <span>{{ success }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">

          <!-- Email -->
          <div>
            <label class="block text-slate-300 text-xs font-medium uppercase tracking-widest mb-2">
              Email address
            </label>
            <input
              v-model="form.email"
              :type="mode === 'register' ? 'email' : 'text'"
              required
              placeholder="you@company.com"
              class="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition" />
            <p v-if="mode === 'register' && form.email.length > 0 && !emailValid"
              class="mt-1.5 text-xs text-red-400">
              Please enter a valid email address
            </p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-slate-300 text-xs font-medium uppercase tracking-widest mb-2">
              Password
            </label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition" />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1">
                <!-- Eye open -->
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <!-- Eye closed -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>

            <!-- Live password requirements — register only -->
            <div v-if="mode === 'register' && form.password.length > 0" class="mt-3 grid grid-cols-2 gap-1.5">
              <div v-for="req in passwordRequirements" :key="req.label"
                class="flex items-center gap-1.5 text-xs transition-colors duration-200"
                :class="req.met ? 'text-emerald-400' : 'text-slate-500'">
                <span class="font-bold">{{ req.met ? '✓' : '○' }}</span>
                <span>{{ req.label }}</span>
              </div>
            </div>
          </div>

          <!-- Register only fields -->
          <template v-if="mode === 'register'">
            <div>
              <label class="block text-slate-300 text-xs font-medium uppercase tracking-widest mb-2">
                Organisation <span class="text-slate-500 normal-case font-normal">(optional)</span>
              </label>
              <input
                v-model="form.organisation"
                type="text"
                placeholder="Your company name"
                class="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition" />
            </div>

            <div class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></div>
              <p class="text-slate-300 text-xs leading-relaxed">
                Your account starts as <span class="text-white font-medium">User</span>. An admin will assign your role after verification.
              </p>
            </div>
          </template>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading || (mode === 'register' && (!passwordValid || !emailValid))"
            class="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm tracking-wide mt-1 shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2">
            <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span>{{ loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account' }}</span>
          </button>

        </form>
      </div>

      <!-- Footer -->
      <p class="text-slate-500 text-xs text-center mt-6 tracking-wide">
        Secure · GDPR compliant · {{ new Date().getFullYear() }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router    = useRouter()
const authStore = useAuthStore()

const mode         = ref('login')
const loading      = ref(false)
const error        = ref('')
const success      = ref('')
const showPassword = ref(false)

const form = reactive({
  email:        '',
  password:     '',
  organisation: '',
  role:         'user'
})

// ── Clear everything when switching tabs ──────────────────
function switchMode(newMode) {
  mode.value         = newMode
  error.value        = ''
  success.value      = ''
  form.email         = ''
  form.password      = ''
  form.organisation  = ''
  showPassword.value = false
}

// ── Email validation (register only) ─────────────────────
const emailValid = computed(() => {
  if (mode.value === 'login') return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
})

// ── Live password requirements ────────────────────────────
const passwordRequirements = computed(() => [
  { label: '8+ characters', met: form.password.length >= 8 },
  { label: 'Uppercase',     met: /[A-Z]/.test(form.password) },
  { label: 'Lowercase',     met: /[a-z]/.test(form.password) },
  { label: 'Number',        met: /\d/.test(form.password) },
  { label: 'Symbol',        met: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~';]/.test(form.password) },
])

const passwordValid = computed(() => passwordRequirements.value.every(r => r.met))

// ── API ───────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function handleSubmit() {
  error.value   = ''
  success.value = ''
  loading.value = true

  try {
    const endpoint = mode.value === 'login' ? '/auth/login' : '/auth/register'

    const body = mode.value === 'login'
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, organisation: form.organisation, role: form.role }

    const res = await fetch(`${API}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {
      if (res.status === 400 && data.detail === 'Email already registered') {
        error.value = 'This email is already registered. Try signing in instead.'
      } else if (res.status === 401) {
        error.value = 'Invalid email or password.'
      } else if (res.status === 422) {
        if (mode.value === 'login') {
          error.value = 'Invalid email or password.'
        } else {
          const msg = data.detail?.[0]?.msg || 'Validation error'
          error.value = msg.replace('Value error, ', '')
        }
      } else {
        error.value = data.detail || 'Something went wrong. Please try again.'
      }
      return
    }

    // store in Pinia
    authStore.setAuth(data)

    // clear form
    form.email         = ''
    form.password      = ''
    form.organisation  = ''
    showPassword.value = false

    // redirect to dashboard
    router.push('/dashboard')

  } catch (e) {
    error.value = 'Cannot reach server. Is the backend running?'
  } finally {
    loading.value = false
  }
}
</script>