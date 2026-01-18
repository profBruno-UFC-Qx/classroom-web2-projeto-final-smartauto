import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/WelcomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/veiculos',
    component: () => import('@/views/VehiclesView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/locacoes',
    component: () => import('@/views/RentalsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/usuarios',
    component: () => import('@/views/UsersView.vue'),
    meta: { requiresAuth: true, roles: [UserRole.ADMIN, UserRole.LOCADOR] }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/WelcomeView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth ?? true
  const allowedRoles = to.meta.roles as UserRole[] | undefined

  // Se ainda não foi inicializado e há um token, aguarda a inicialização
  if (!authStore.initialized && authStore.token) {
    await authStore.initialize()
  }

  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({ path: '/login', query: { redirect: to.fullPath } })
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

