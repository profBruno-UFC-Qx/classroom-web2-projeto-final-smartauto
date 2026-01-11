// Store de autenticação
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/authService'
import type { UserData, Role } from '../types/Auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserData | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isLocador = computed(() => user.value?.role === 'locador')
  const isCliente = computed(() => user.value?.role === 'cliente')

  function loadFromStorage() {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  async function login(usuario: string, senha: string) {
    try {
      loading.value = true
      error.value = null
      
      const response = await authService.login({ usuario, senha })
      
      token.value = response.token
      user.value = response.usuario
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.usuario))
      
      return true
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao fazer login'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(usuario: string, nome: string, email: string, senha: string) {
    try {
      loading.value = true
      error.value = null
      
      const response = await authService.register({ 
        usuario, 
        nome, 
        email, 
        senha,
        telefone: '',
        uf: '',
        cidade: '',
        logradouro: '',
        numero: 0
      })
      
      token.value = response.token
      user.value = response.usuario
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.usuario))
      
      return true
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao fazer cadastro'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    authService.logout()
    user.value = null
    token.value = null
  }

  function hasRole(role: Role): boolean {
    return user.value?.role === role
  }

  function hasAnyRole(roles: Role[]): boolean {
    return roles.some(role => user.value?.role === role)
  }

  loadFromStorage()

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userRole,
    isAdmin,
    isLocador,
    isCliente,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole
  }
})
