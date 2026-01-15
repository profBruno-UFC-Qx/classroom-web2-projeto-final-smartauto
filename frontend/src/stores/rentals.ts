import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/api'
import type { Locacao } from '@/types'

export const useRentalStore = defineStore('rentals', () => {
  const rentals = ref<Locacao[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const totalPages = computed(() => Math.ceil(total.value / limit.value))
  const activeRentals = computed(() => rentals.value.filter(r => r.status === 'ativa'))

  async function fetchRentals(pageNum = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getList<Locacao>('/locacoes', pageNum, limit.value)
      if (response.success && response.data) {
        rentals.value = response.data.data
        total.value = response.data.total
        page.value = pageNum
      } else {
        error.value = response.message || 'Erro ao carregar locações'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar locações'
    } finally {
      loading.value = false
    }
  }

  async function createRental(rentalData: any) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.post<Locacao>('/locacoes', rentalData)
      if (response.success && response.data) {
        rentals.value.unshift(response.data)
        return response.data
      }
      error.value = response.message || 'Erro ao criar locação'
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar locação'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateRental(id: number, rentalData: any) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.put<Locacao>(`/locacoes/${id}`, rentalData)
      if (response.success && response.data) {
        const index = rentals.value.findIndex(r => r.id === id)
        if (index !== -1) rentals.value[index] = response.data
        return response.data
      }
      error.value = response.message || 'Erro ao atualizar locação'
      return null
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
      const response = await apiService.delete(`/locacoes/${id}`)
      if (response.success) {
        rentals.value = rentals.value.filter(r => r.id !== id)
        return true
      }
      error.value = response.message || 'Erro ao deletar locação'
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar locação'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    rentals,
    loading,
    error,
    total,
    page,
    limit,
    totalPages,
    activeRentals,
    fetchRentals,
    createRental,
    updateRental,
    deleteRental
  }
})
