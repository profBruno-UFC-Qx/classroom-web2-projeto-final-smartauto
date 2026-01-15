import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('@/views/HomeView.vue'), meta: { requiresAuth: false } },
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { requiresAuth: false } },
  { path: '/register', component: () => import('@/views/RegisterView.vue'), meta: { requiresAuth: false } },
  
  { path: '/dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
  
  { path: '/admin', component: () => import('@/views/AdminView.vue'), meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/admin/usuarios', component: () => import('@/views/UsersView.vue'), meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/admin/veiculos', component: () => import('@/views/VehiclesView.vue'), meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/admin/locacoes', component: () => import('@/views/RentalsView.vue'), meta: { requiresAuth: true, roles: ['admin'] } },
  
  { path: '/veiculos', component: () => import('@/views/ListVehiclesView.vue'), meta: { requiresAuth: true, roles: ['cliente'] } },
  { path: '/minhas-locacoes', component: () => import('@/views/MyRentalsView.vue'), meta: { requiresAuth: true, roles: ['cliente'] } },
  
  { path: '/unauthorized', component: () => import('@/views/UnauthorizedView.vue'), meta: { requiresAuth: false } },
  { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue'), meta: { requiresAuth: false } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth ?? true
  const allowedRoles = to.meta.roles as string[] | undefined

  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({ path: '/login' })
      return
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!authStore.hasPermission(allowedRoles as any)) {
        next({ path: '/unauthorized' })
        return
      }
    }
  } else {
    if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      next({ path: '/dashboard' })
      return
    }
  }

  next()
})

export default router
