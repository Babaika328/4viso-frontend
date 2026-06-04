<template>
  <div class="p-6 space-y-5">

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="text-sm px-4 py-2 rounded-lg transition font-medium"
        :class="activeTab === tab.value
          ? 'bg-white text-gray-800 shadow-sm'
          : 'text-gray-400 hover:text-gray-600'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Users tab ──────────────────────────────────── -->
    <div v-if="activeTab === 'users'" class="space-y-4">

      <!-- Search -->
      <div class="flex items-center gap-3">
        <input
          v-model="userSearch"
          placeholder="Search users..."
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:border-teal-400 transition"
        />
        <select
          v-model="roleFilter"
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-400 transition text-gray-600"
        >
          <option value="">All roles</option>
          <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
        </select>
        <span class="text-xs text-gray-400">{{ filteredUsers.length }} user{{ filteredUsers.length !== 1 ? 's' : '' }}</span>
      </div>

      <!-- Loading -->
      <div v-if="usersLoading" class="text-center py-12 text-sm text-gray-400">Loading users...</div>

      <!-- Table -->
      <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="text-left text-xs font-semibold text-gray-400 px-5 py-3">User</th>
              <th class="text-left text-xs font-semibold text-gray-400 px-5 py-3">Role</th>
              <th class="text-left text-xs font-semibold text-gray-400 px-5 py-3">Organisation</th>
              <th class="text-left text-xs font-semibold text-gray-400 px-5 py-3">Status</th>
              <th class="text-left text-xs font-semibold text-gray-400 px-5 py-3">Last login</th>
              <th class="text-left text-xs font-semibold text-gray-400 px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50 transition"
            >
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold flex-shrink-0">
                    {{ user.email.slice(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">{{ user.email }}</div>
                    <div class="text-xs text-gray-400">#{{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <select
                  :value="user.role"
                  @change="updateRole(user, $event.target.value)"
                  class="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-teal-400 transition"
                  :class="roleBadgeClass(user.role)"
                >
                  <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
                </select>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-sm text-gray-500">{{ user.organisation || '—' }}</span>
              </td>
              <td class="px-5 py-3.5">
                <button
                  @click="toggleActive(user)"
                  class="text-xs px-2.5 py-1 rounded-full border font-medium transition"
                  :class="user.is_active
                    ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                    : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'"
                >
                  {{ user.is_active ? 'Active' : 'Disabled' }}
                </button>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-xs text-gray-400">
                  {{ user.last_login ? timeAgo(user.last_login) : 'Never' }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <button
                    @click="revokeTokens(user)"
                    class="text-xs text-amber-500 hover:text-amber-700 px-2 py-1 rounded hover:bg-amber-50 transition"
                  >
                    Revoke tokens
                  </button>
                  <button
                    v-if="user.id !== auth.user?.id"
                    @click="confirmDeleteUser = user"
                    class="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="px-5 py-8 text-center text-sm text-gray-400">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Logs tab ────────────────────────────────────── -->
    <div v-if="activeTab === 'logs'" class="space-y-4">

      <!-- Filters -->
      <div class="flex items-center gap-3 flex-wrap">
        <select
          v-model="logAction"
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-400 transition text-gray-600"
        >
          <option value="">All actions</option>
          <option value="login">Login</option>
          <option value="failed_login">Failed login</option>
          <option value="register">Register</option>
          <option value="logout">Logout</option>
        </select>
        <input
          v-model="logUserId"
          type="number"
          placeholder="User ID"
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-28 focus:outline-none focus:border-teal-400 transition"
        />
        <input
          v-model="logDateFrom"
          type="datetime-local"
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-400 transition text-gray-600"
        />
        <span class="text-xs text-gray-400">to</span>
        <input
          v-model="logDateTo"
          type="datetime-local"
          class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-400 transition text-gray-600"
        />
        <button
          @click="fetchLogs"
          class="text-sm bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 rounded-lg transition"
        >
          Filter
        </button>
        <button
          @click="clearLogFilters"
          class="text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 px-4 py-1.5 rounded-lg transition"
        >
          Clear
        </button>
        <span class="text-xs text-gray-400">{{ logs.length }} entries</span>
      </div>

      <!-- Loading -->
      <div v-if="logsLoading" class="text-center py-12 text-sm text-gray-400">Loading logs...</div>

      <!-- Table -->
      <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="text-left text-xs font-semibold text-gray-400 px-5 py-3">Time</th>
              <th class="text-left text-xs font-semibold text-gray-400 px-5 py-3">User ID</th>
              <th class="text-left text-xs font-semibold text-gray-400 px-5 py-3">Action</th>
              <th class="text-left text-xs font-semibold text-gray-400 px-5 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition">
              <td class="px-5 py-3 text-xs text-gray-500">{{ formatDate(log.timestamp) }}</td>
              <td class="px-5 py-3 text-xs text-gray-500">#{{ log.user_id }}</td>
              <td class="px-5 py-3">
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="actionClass(log.action)"
                >
                  {{ log.action }}
                </span>
              </td>
              <td class="px-5 py-3 text-xs text-gray-400 font-mono">{{ log.ip_address || '—' }}</td>
            </tr>
            <tr v-if="logs.length === 0">
              <td colspan="4" class="px-5 py-8 text-center text-sm text-gray-400">No logs found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Delete user confirm ────────────────────────── -->
    <div
      v-if="confirmDeleteUser"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="confirmDeleteUser = null"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <div class="text-sm font-semibold text-gray-800 mb-2">Delete user?</div>
        <div class="text-sm text-gray-500 mb-5">
          "{{ confirmDeleteUser.email }}" will be permanently deleted.
        </div>
        <div class="flex justify-end gap-3">
          <button
            @click="confirmDeleteUser = null"
            class="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            @click="handleDeleteUser"
            class="text-sm px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toast"
      class="fixed bottom-6 right-6 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50 transition"
    >
      {{ toast }}
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore }             from '../stores/auth.js'
import { adminApi }                 from '../api/admin.js'

const auth = useAuthStore()

const activeTab  = ref('users')
const tabs       = [
  { value: 'users', label: 'Users' },
  { value: 'logs',  label: 'Access logs' },
]

const ROLES = ['admin', 'auditor', 'staff', 'port', 'user']

// ── Users ─────────────────────────────────────────────────
const users        = ref([])
const usersLoading = ref(false)
const userSearch   = ref('')
const roleFilter   = ref('')
const confirmDeleteUser = ref(null)

// ── Logs ──────────────────────────────────────────────────
const logs        = ref([])
const logsLoading = ref(false)
const logAction   = ref('')
const logUserId   = ref('')
const logDateFrom = ref('')
const logDateTo   = ref('')

// ── Toast ─────────────────────────────────────────────────
const toast = ref('')
let toastTimer = null

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2800)
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchLogs()])
})

async function fetchUsers() {
  usersLoading.value = true
  try {
    const res  = await adminApi.users()
    users.value = res.data
  } finally {
    usersLoading.value = false
  }
}

async function fetchLogs() {
  logsLoading.value = true
  try {
    const params = {}
    if (logAction.value)   params.action    = logAction.value
    if (logUserId.value)   params.user_id   = logUserId.value
    if (logDateFrom.value) params.date_from = new Date(logDateFrom.value).toISOString()
    if (logDateTo.value)   params.date_to   = new Date(logDateTo.value).toISOString()
    const res  = await adminApi.logs(params)
    logs.value = res.data
  } finally {
    logsLoading.value = false
  }
}

function clearLogFilters() {
  logAction.value   = ''
  logUserId.value   = ''
  logDateFrom.value = ''
  logDateTo.value   = ''
  fetchLogs()
}

const filteredUsers = computed(() => {
  let list = [...users.value]
  if (userSearch.value)
    list = list.filter(u => u.email.toLowerCase().includes(userSearch.value.toLowerCase()))
  if (roleFilter.value)
    list = list.filter(u => u.role === roleFilter.value)
  return list
})

async function updateRole(user, role) {
  try {
    await adminApi.updateRole(user.id, { role })
    user.role = role
    showToast(`Role updated to ${role}`)
  } catch {
    showToast('Failed to update role')
  }
}

async function toggleActive(user) {
  try {
    await adminApi.setActive(user.id, { is_active: !user.is_active })
    user.is_active = !user.is_active
    showToast(`User ${user.is_active ? 'enabled' : 'disabled'}`)
  } catch {
    showToast('Failed to update status')
  }
}

async function revokeTokens(user) {
  try {
    await adminApi.revokeTokens(user.id)
    showToast(`Tokens revoked for ${user.email}`)
  } catch {
    showToast('Failed to revoke tokens')
  }
}

async function handleDeleteUser() {
  try {
    await adminApi.deleteUser(confirmDeleteUser.value.id)
    users.value = users.value.filter(u => u.id !== confirmDeleteUser.value.id)
    showToast('User deleted')
    confirmDeleteUser.value = null
  } catch {
    showToast('Failed to delete user')
  }
}

function roleBadgeClass(role) {
  const map = {
    admin:   'text-teal-700 border-teal-200 bg-teal-50',
    staff:   'text-blue-700 border-blue-200 bg-blue-50',
    auditor: 'text-purple-700 border-purple-200 bg-purple-50',
    port:    'text-amber-700 border-amber-200 bg-amber-50',
    user:    'text-gray-600 border-gray-200 bg-gray-50',
  }
  return map[role] || ''
}

function actionClass(action) {
  if (action === 'login')        return 'bg-green-50 text-green-700'
  if (action === 'failed_login') return 'bg-red-50 text-red-600'
  if (action === 'register')     return 'bg-blue-50 text-blue-600'
  if (action === 'logout')       return 'bg-gray-100 text-gray-500'
  return 'bg-gray-100 text-gray-500'
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>