import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('@/views/HomeView.vue'), meta: { requiresAuth: false } },
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { requiresAuth: false } },
  { path: '/register', component: () => import('@/views/RegisterView.vue'), meta: { requiresAuth: false } },
  { path: '/about', component: () => import('@/views/AboutView.vue'), meta: { requiresAuth: false } },
  
  { path: '/veiculos', component: () => import('@/views/VehiclesView.vue'), meta: { requiresAuth: true } },
  { path: '/usuarios', component: () => import('@/views/VehiclesView.vue'), meta: { requiresAuth: true, roles: [UserRole.ADMIN, UserRole.FUNCIONARIO] } },
  { path: '/locacoes', component: () => import('@/views/VehiclesView.vue'), meta: { requiresAuth: true, roles: [UserRole.ADMIN, UserRole.FUNCIONARIO] } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth ?? true
  const allowedRoles = to.meta.roles as UserRole[] | undefined

  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({ path: '/login' })
      return
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!authStore.hasPermission(allowedRoles)) {
        next({ path: '/' })
        return
      }
    }
  } else {
    if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      next({ path: '/' })
      return
    }
  }

  next()
})

export default router
