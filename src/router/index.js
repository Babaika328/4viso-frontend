import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import ShipmentDetail from '../views/ShipmentDetail.vue'
import ShipmentForm from '../views/ShipmentForm.vue'
import AuditLog from '../views/AuditLog.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: Dashboard },
  { path: '/shipments/:id', component: ShipmentDetail },
  { path: '/shipments/new', component: ShipmentForm },
  { path: '/admin/audit-log', component: AuditLog },
  { path: '/:pathMatch(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router