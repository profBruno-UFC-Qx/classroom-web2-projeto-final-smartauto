import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/api'
import type { Veiculo, Categoria, CreateVehicleData, UpdateVehicleData } from '@/types'

export const useVehicleStore = defineStore('vehicles', () => {
  const vehicles = ref<Veiculo[]>([])
  const categories = ref<Categoria[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  const availableVehicles = computed(() => vehicles.value.filter(v => v.disponivel))

  function buildQuery(pageNum: number) {
    const offset = (pageNum - 1) * itemsPerPage.value
    const params = new URLSearchParams()
    params.set('offset', String(offset))
    params.set('limit', String(itemsPerPage.value))
    params.set('disponiveis', 'true')
    return params.toString()
  }

  async function fetchVehicles(pageNum = 1) {
    loading.value = true
    error.value = null
    try {
      const query = buildQuery(pageNum)
      const response = await apiService.get<Veiculo[]>(`/veiculos?${query}`)

      if (response.success && response.data) {
        vehicles.value = response.data
        currentPage.value = pageNum
      } else {
        error.value = response.message || 'Erro ao buscar veículos'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar veículos'
    } finally {
      loading.value = false
    }
  }

  async function fetchAllVehicles() {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.get<Veiculo[]>('/veiculos?limit=1000')

      if (response.success && response.data) {
        vehicles.value = response.data
      } else {
        error.value = response.message || 'Erro ao buscar veículos'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar veículos'
    } finally {
      loading.value = false
    }
  }

  async function fetchVehicleById(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.get<Veiculo>(`/veiculos/${id}`)

      if (response.success && response.data) {
        return response.data
      } else {
        error.value = response.message || 'Erro ao buscar veículo'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar veículo'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.get<Categoria[]>('/categorias')

      if (response.success && response.data) {
        categories.value = response.data
      } else {
        error.value = response.message || 'Erro ao buscar categorias'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar categorias'
    } finally {
      loading.value = false
    }
  }

  async function createVehicle(data: CreateVehicleData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.post<Veiculo>('/veiculos', data)

      if (response.success && response.data) {
        vehicles.value.push(response.data)
        return response.data
      } else {
        error.value = response.message || 'Erro ao criar veículo'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar veículo'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateVehicle(id: number, data: UpdateVehicleData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.put<Veiculo>(`/veiculos/${id}`, data)

      if (response.success && response.data) {
        const index = vehicles.value.findIndex(v => v.id === id)
        if (index !== -1) {
          vehicles.value[index] = response.data
        }
        return response.data
      } else {
        error.value = response.message || 'Erro ao atualizar veículo'
        return null
      }
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
      const response = await apiService.delete<void>(`/veiculos/${id}`)

      if (response.success) {
        vehicles.value = vehicles.value.filter(v => v.id !== id)
        return true
      } else {
        error.value = response.message || 'Erro ao deletar veículo'
        return false
      }
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
    currentPage,
    itemsPerPage,
    availableVehicles,
    fetchVehicles,
    fetchAllVehicles,
    fetchVehicleById,
    fetchCategories,
    createVehicle,
    updateVehicle,
    deleteVehicle
  }
})
