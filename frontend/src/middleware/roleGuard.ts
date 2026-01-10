// Guard de autorização baseado em papéis
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { Role } from '../types/Auth'

export function roleGuard(allowedRoles: Role[]) {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    if (authStore.hasAnyRole(allowedRoles)) {
      next()
    } else {
      next({ name: 'dashboard' })
    }
  }
}
