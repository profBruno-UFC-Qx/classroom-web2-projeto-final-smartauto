import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/api'
import { UserRole } from '@/types'
import type { User, AuthResponse } from '@/types'

type CreateUserData = Omit<User, 'id'>

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.papel === 'admin')
  const isFuncionario = computed(() => user.value?.papel === 'funcionario')
  const isCliente = computed(() => user.value?.papel === 'cliente')

  function hasPermission(roles: UserRole | UserRole[]) {
    if (!user.value) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.value.papel)
  }

  async function login(email: string, senha: string) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.post<AuthResponse>('/usuarios/login', { email, senha })
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        apiService.setToken(response.data.token)
        return true
      }
      error.value = response.message || 'Erro ao fazer login'
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao fazer login'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(userData: CreateUserData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.post('/usuarios', userData)
      if (!response.success) {
        error.value = response.message || 'Erro ao registrar'
      }
      return response.success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao registrar'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    apiService.clearToken()
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isFuncionario,
    isCliente,
    hasPermission,
    login,
    register,
    logout
  }
})
