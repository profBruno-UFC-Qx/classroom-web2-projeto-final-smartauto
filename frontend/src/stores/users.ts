import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/api'
import type { User, CreateUserData, UpdateUserData } from '@/types'

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const adminUsers = computed(() => users.value.filter(u => u.role === 'admin'))
  const locadorUsers = computed(() => users.value.filter(u => u.role === 'locador'))
  const clienteUsers = computed(() => users.value.filter(u => u.role === 'cliente'))

  function buildQuery(pageNum: number) {
    const offset = (pageNum - 1) * itemsPerPage.value
    const params = new URLSearchParams()
    params.set('offset', String(offset))
    params.set('limit', String(itemsPerPage.value))
    return params.toString()
  }

  async function fetchUsers(pageNum = 1) {
    loading.value = true
    error.value = null
    try {
      const query = buildQuery(pageNum)
      const response = await apiService.get<User[]>(`/usuarios?${query}`)

      if (response.success && response.data) {
        users.value = response.data
        currentPage.value = pageNum
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
