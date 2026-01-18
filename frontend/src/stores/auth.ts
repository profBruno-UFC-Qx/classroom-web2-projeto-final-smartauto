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
  const initializing = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isLocador = computed(() => user.value?.role === 'locador')
  const isCliente = computed(() => user.value?.role === 'cliente')

  function hasPermission(roles: UserRole | UserRole[]) {
    if (!user.value) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.value.role)
  }

  async function login(usuario: string, senha: string) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', { usuario, senha })
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        apiService.setToken(response.data.token)
        localStorage.setItem('auth_token', response.data.token)
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
      const response = await apiService.post('/auth/register', userData)
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

  async function initialize() {
    // Evita múltiplas inicializações simultâneas
    if (initializing.value || initialized.value) {
      return
    }

    // Verifica se há um token salvo no localStorage
    const savedToken = localStorage.getItem('auth_token')
    if (!savedToken) {
      initialized.value = true
      return
    }

    initializing.value = true

    // Configura o token no serviço de API
    token.value = savedToken
    apiService.setToken(savedToken)

    // Tenta obter os dados do usuário usando o token
    try {
      const response = await apiService.get<{ user: User }>('/auth/me')
      if (response.success && response.data?.user) {
        user.value = response.data.user
      } else {
        // Token inválido ou expirado, limpa a sessão
        logout()
      }
    } catch {
      // Erro ao validar token, limpa a sessão
      logout()
    } finally {
      initializing.value = false
      initialized.value = true
    }
  }

  function logout() {
    user.value = null
    token.value = null
    apiService.clearToken()
    localStorage.removeItem('auth_token')
    initialized.value = false
  }

  return {
    user,
    token,
    loading,
    error,
    initializing,
    initialized,
    isAuthenticated,
    isAdmin,
    isLocador,
    isCliente,
    hasPermission,
    login,
    register,
    logout,
    initialize
  }
})
