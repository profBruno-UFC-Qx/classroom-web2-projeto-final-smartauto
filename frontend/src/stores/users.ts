import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/api'
import type { User, CreateUserData, UpdateUserData, ApiResponse } from '@/types'
import { UserRole } from '@/types'

export const useUserStore = defineStore('users', () => {
    type PaginationMeta = {
      total: number
      page: number
      limit: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
    type UsersApiResponse = ApiResponse<User[]> & { pagination?: PaginationMeta }
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const total = ref(0)
  const totalPages = ref(1)
  const hasNext = ref(false)
  const hasPrev = ref(false)

  const adminUsers = computed(() => users.value.filter(u => u.role === 'admin'))
  const locadorUsers = computed(() => users.value.filter(u => u.role === 'locador'))
  const clienteUsers = computed(() => users.value.filter(u => u.role === 'cliente'))

  function buildQuery(pageNum: number, role?: UserRole | 'all', nome?: string | null) {
    const offset = (pageNum - 1) * itemsPerPage.value
    const params = new URLSearchParams()
    params.set('offset', String(offset))
    params.set('limit', String(itemsPerPage.value))
    if (role && role !== 'all') {
      params.set('funcao', role)
    }
    if (nome && nome.trim()) {
      params.set('nome', nome.trim())
    }
    return params.toString()
  }

  async function fetchUsers(pageNum = 1, role?: UserRole | 'all', nome?: string | null) {
    loading.value = true
    error.value = null
    try {
      const query = buildQuery(pageNum, role, nome)
      const response = (await apiService.get<User[]>(`/usuarios?${query}`)) as UsersApiResponse

      if (response.success && response.data) {
        users.value = response.data
        currentPage.value = pageNum
        if (response.pagination) {
          total.value = response.pagination.total
          totalPages.value = response.pagination.totalPages
          hasNext.value = response.pagination.hasNext
          hasPrev.value = response.pagination.hasPrev
        }
      } else {
        error.value = response.message || 'Erro ao buscar usuários'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar usuários'
    } finally {
      loading.value = false
    }
  }

  async function fetchUserById(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.get<User>(`/usuarios/${id}`)

      if (response.success && response.data) {
        return response.data
      } else {
        error.value = response.message || 'Erro ao buscar usuário'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar usuário'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData: CreateUserData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.post<User>('/usuarios', userData)

      if (response.success && response.data) {
        users.value.unshift(response.data)
        return response.data
      } else {
        error.value = response.message || 'Erro ao criar usuário'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar usuário'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: number, userData: UpdateUserData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.put<User>(`/usuarios/${id}`, userData)

      if (response.success && response.data) {
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) {
          users.value[index] = response.data
        }
        return response.data
      } else {
        error.value = response.message || 'Erro ao atualizar usuário'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar usuário'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.delete<void>(`/usuarios/${id}`)

      if (response.success) {
        users.value = users.value.filter(u => u.id !== id)
        return true
      } else {
        error.value = response.message || 'Erro ao deletar usuário'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar usuário'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    currentPage,
    itemsPerPage,
    total,
    totalPages,
    hasNext,
    hasPrev,
    adminUsers,
    locadorUsers,
    clienteUsers,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser
  }
})
