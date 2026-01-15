import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/api'
import type { User } from '@/types'

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const totalPages = computed(() => Math.ceil(total.value / limit.value))

  async function fetchUsers(pageNum = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getList<User>('/usuarios', pageNum, limit.value)
      if (response.success && response.data) {
        users.value = response.data.data
        total.value = response.data.total
        page.value = pageNum
      } else {
        error.value = response.message || 'Erro ao carregar usuários'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar usuários'
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData: any) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.post<User>('/usuarios', userData)
      if (response.success && response.data) {
        users.value.unshift(response.data)
        return response.data
      }
      error.value = response.message || 'Erro ao criar usuário'
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar usuário'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: number, userData: any) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.put<User>(`/usuarios/${id}`, userData)
      if (response.success && response.data) {
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) users.value[index] = response.data
        return response.data
      }
      error.value = response.message || 'Erro ao atualizar usuário'
      return null
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
      const response = await apiService.delete(`/usuarios/${id}`)
      if (response.success) {
        users.value = users.value.filter(u => u.id !== id)
        return true
      }
      error.value = response.message || 'Erro ao deletar usuário'
      return false
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
    total,
    page,
    limit,
    totalPages,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
})
