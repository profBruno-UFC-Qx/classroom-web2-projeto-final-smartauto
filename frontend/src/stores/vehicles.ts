import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/api'
import type { Veiculo, Categoria, CreateVehicleData, UpdateVehicleData, ApiResponse } from '@/types'

export interface VehicleFilters {
  marca?: string | null
  modelo?: string | null
  ano?: number | null
  minPreco?: number | null
  maxPreco?: number | null
  categoria?: string | null
  disponiveis?: boolean
  orderBy?: 'id' | 'marca' | 'modelo' | 'ano' | 'valor_diaria' | 'cor'
  order?: 'asc' | 'desc'
}

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export const useVehicleStore = defineStore('vehicles', () => {
  const vehicles = ref<Veiculo[]>([])
  const categories = ref<Categoria[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(12)
  const pagination = ref<PaginationInfo | null>(null)
  const filters = ref<VehicleFilters>({
    disponiveis: true,
    orderBy: 'id',
    order: 'asc'
  })

  const availableVehicles = computed(() => vehicles.value.filter(v => v.disponivel))

  function buildQuery(pageNum: number, filterParams?: VehicleFilters) {
    const offset = (pageNum - 1) * itemsPerPage.value
    const params = new URLSearchParams()
    const activeFilters = filterParams || filters.value

    params.set('offset', String(offset))
    params.set('limit', String(itemsPerPage.value))

    if (activeFilters.marca) params.set('marca', activeFilters.marca)
    if (activeFilters.modelo) params.set('modelo', activeFilters.modelo)
    if (activeFilters.ano) params.set('ano', String(activeFilters.ano))
    if (activeFilters.minPreco !== null && activeFilters.minPreco !== undefined) {
      params.set('min_preco', String(activeFilters.minPreco))
    }
    if (activeFilters.maxPreco !== null && activeFilters.maxPreco !== undefined) {
      params.set('max_preco', String(activeFilters.maxPreco))
    }
    if (activeFilters.categoria) params.set('categoria', activeFilters.categoria)
    if (activeFilters.disponiveis !== undefined) {
      params.set('disponiveis', String(activeFilters.disponiveis))
    }
    if (activeFilters.orderBy) params.set('order_by', activeFilters.orderBy)
    if (activeFilters.order) params.set('order', activeFilters.order)

    return params.toString()
  }

  async function fetchVehicles(pageNum = 1, filterParams?: VehicleFilters) {
    loading.value = true
    error.value = null
    try {
      const query = buildQuery(pageNum, filterParams)
      const response = await apiService.get<Veiculo[]>(`/veiculos?${query}`) as ApiResponse<Veiculo[]> & { pagination?: PaginationInfo }

      if (response.success && response.data) {
        vehicles.value = response.data
        currentPage.value = pageNum

        if (response.pagination) {
          pagination.value = response.pagination
        } else {
          pagination.value = {
            total: vehicles.value.length,
            page: pageNum,
            limit: itemsPerPage.value,
            totalPages: Math.ceil(vehicles.value.length / itemsPerPage.value),
            hasNext: false,
            hasPrev: pageNum > 1
          }
        }
      } else {
        error.value = response.message || 'Erro ao buscar veículos'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar veículos'
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: Partial<VehicleFilters>) {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 1
  }

  function clearFilters() {
    filters.value = {
      disponiveis: true,
      orderBy: 'id',
      order: 'asc'
    }
    currentPage.value = 1
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

  async function searchAvailableVehiclesByModel(modelo?: string | null) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      params.set('disponiveis', 'true')
      params.set('limit', '50') // Limite maior para busca
      if (modelo && modelo.trim()) {
        params.set('modelo', modelo.trim())
      }

      const response = await apiService.get<Veiculo[]>(`/veiculos?${params.toString()}`) as ApiResponse<Veiculo[]> & { pagination?: PaginationInfo }

      if (response.success && response.data) {
        return response.data
      } else {
        error.value = response.message || 'Erro ao buscar veículos'
        return []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar veículos'
      return []
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
    pagination,
    filters,
    availableVehicles,
    fetchVehicles,
    fetchAllVehicles,
    fetchVehicleById,
    fetchCategories,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    setFilters,
    clearFilters,
    searchAvailableVehiclesByModel
  }
})
