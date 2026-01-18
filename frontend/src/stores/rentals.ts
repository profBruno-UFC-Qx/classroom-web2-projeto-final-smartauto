import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/api'
import { RentalStatus } from '@/types'
import type { Locacao, CreateRentalData, UpdateRentalData } from '@/types'

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export const useRentalStore = defineStore('rentals', () => {
  const rentals = ref<Locacao[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const pagination = ref<PaginationInfo | null>(null)

  const pendingRentals = computed(() => rentals.value.filter(r => r.status === RentalStatus.PENDENTE))
  const approvedRentals = computed(() => rentals.value.filter(r => r.status === RentalStatus.APROVADA))



  async function fetchRentals(pageNum = 1, status?: RentalStatus | null) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      const offset = (pageNum - 1) * itemsPerPage.value
      params.set('offset', String(offset))
      params.set('limit', String(itemsPerPage.value))
      if (status && status !== null && status !== undefined) {
        params.set('status', status)
      }

      const query = params.toString()
      const response = await apiService.get<Locacao[]>(`/locacoes?${query}`) as { success: boolean; data?: Locacao[]; message?: string; pagination?: PaginationInfo }

      if (response.success && response.data) {
        rentals.value = response.data
        currentPage.value = pageNum

        if (response.pagination) {
          pagination.value = response.pagination
        } else {
          pagination.value = {
            total: rentals.value.length,
            page: pageNum,
            limit: itemsPerPage.value,
            totalPages: Math.ceil(rentals.value.length / itemsPerPage.value),
            hasNext: false,
            hasPrev: pageNum > 1
          }
        }
      } else {
        error.value = response.message || 'Erro ao buscar locações'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar locações'
    } finally {
      loading.value = false
    }
  }

  async function fetchRentalById(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.get<Locacao>(`/locacoes/${id}`)

      if (response.success && response.data) {
        return response.data
      } else {
        error.value = response.message || 'Erro ao buscar locação'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar locação'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createRental(rentalData: CreateRentalData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.post<Locacao>('/locacoes', rentalData)

      if (response.success && response.data) {
        rentals.value.unshift(response.data)
        return response.data
      } else {
        error.value = response.message || response.detail || 'Erro ao criar locação'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar locação'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateRental(id: number, rentalData: UpdateRentalData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.put<Locacao>(`/locacoes/${id}`, rentalData)

      if (response.success && response.data) {
        const index = rentals.value.findIndex(r => r.id === id)
        if (index !== -1) {
          rentals.value[index] = response.data
        }
        return response.data
      } else {
        error.value = response.message || 'Erro ao atualizar locação'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar locação'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteRental(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.delete<void>(`/locacoes/${id}`)

      if (response.success) {
        rentals.value = rentals.value.filter(r => r.id !== id)
        return true
      } else {
        error.value = response.message || 'Erro ao deletar locação'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar locação'
      return false
    } finally {
      loading.value = false
    }
  }

  async function approveRental(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.put<Locacao>(`/locacoes/${id}/aprovar`, {})

      if (response.success && response.data) {
        const index = rentals.value.findIndex(r => r.id === id)
        if (index !== -1) {
          rentals.value[index] = response.data
        }
        return response.data
      } else {
        error.value = response.message || response.detail || 'Erro ao aprovar locação'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao aprovar locação'
      return null
    } finally {
      loading.value = false
    }
  }

  async function rejectRental(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.put<Locacao>(`/locacoes/${id}/recusar`, {})

      if (response.success && response.data) {
        const index = rentals.value.findIndex(r => r.id === id)
        if (index !== -1) {
          rentals.value[index] = response.data
        }
        return response.data
      } else {
        error.value = response.message || response.detail || 'Erro ao recusar locação'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao recusar locação'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    rentals,
    loading,
    error,
    currentPage,
    itemsPerPage,
    pagination,
    pendingRentals,
    approvedRentals,
    fetchRentals,
    fetchRentalById,
    createRental,
    updateRental,
    deleteRental,
    approveRental,
    rejectRental
  }
})
