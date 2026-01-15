import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/api'
import type { Veiculo, CategoriaVeiculo, CreateVehicleData, UpdateVehicleData } from '@/types'

export const useVehicleStore = defineStore('vehicles', () => {
  const vehicles = ref<Veiculo[]>([])
  const categories = ref<CategoriaVeiculo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const totalPages = computed(() => Math.ceil(total.value / limit.value))
  const availableVehicles = computed(() => vehicles.value.filter(v => v.status === 'disponivel'))

  async function fetchVehicles(pageNum = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getList<Veiculo>('/veiculos', pageNum, limit.value)
      if (response.success && response.data) {
        vehicles.value = response.data.data
        total.value = response.data.total
        page.value = pageNum
      } else {
        error.value = response.message || 'Erro ao carregar veículos'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar veículos'
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      const response = await apiService.get<CategoriaVeiculo[]>('/categorias-veiculo')
      if (response.success && response.data) {
        categories.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar categorias'
    }
  }

  async function createVehicle(vehicleData: CreateVehicleData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.post<Veiculo>('/veiculos', vehicleData)
      if (response.success && response.data) {
        vehicles.value.unshift(response.data)
        return response.data
      }
      error.value = response.message || 'Erro ao criar veículo'
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar veículo'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateVehicle(id: number, vehicleData: UpdateVehicleData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.put<Veiculo>(`/veiculos/${id}`, vehicleData)
      if (response.success && response.data) {
        const index = vehicles.value.findIndex(v => v.id === id)
        if (index !== -1) vehicles.value[index] = response.data
        return response.data
      }
      error.value = response.message || 'Erro ao atualizar veículo'
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar veículo'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteVehicle(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.delete(`/veiculos/${id}`)
      if (response.success) {
        vehicles.value = vehicles.value.filter(v => v.id !== id)
        return true
      }
      error.value = response.message || 'Erro ao deletar veículo'
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar veículo'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    vehicles,
    categories,
    loading,
    error,
    total,
    page,
    limit,
    totalPages,
    availableVehicles,
    fetchVehicles,
    fetchCategories,
    createVehicle,
    updateVehicle,
    deleteVehicle
  }
})
