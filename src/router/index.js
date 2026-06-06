import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import AuthView from '../views/AuthView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    component: AuthView,
    meta: { guestOnly: true }
  },
  {
    path: '/',
    component: () => import('../components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
      },
      {
        path: 'lanes',
        component: () => import('../views/LanesView.vue'),
      },
      {
        path: 'lanes/:id',
        component: () => import('../views/LaneDetailView.vue'),
      },
      {
        path: 'builder',
        component: () => import('../views/BuilderView.vue'),
        meta: { requiresWrite: true }
      },
      {
        path: 'caretakers',
        component: () => import('../views/CaretakersView.vue'),
      },
      {
        path: 'analytics',
        component: () => import('../views/AnalyticsView.vue'),
      },
      {
        path: 'admin',
        component: () => import('../views/AdminView.vue'),
        meta: { requiresAdmin: true }
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next('/login')
    return
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    next('/dashboard')
    return
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    next('/dashboard')
    return
  }

  if (to.meta.requiresWrite && !auth.canWrite) {
    next('/lanes')
    return
  }

  next()
})

export default router