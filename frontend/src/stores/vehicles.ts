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
  const hasNext = ref(false)

  const filters = ref({
    modelo: '',
    marca: '',
    ano: '' as string | number,
    minPreco: '' as string | number,
    maxPreco: '' as string | number,
    categoria: '',
    disponiveis: 'true' as 'true' | 'false' | 'all'
  })

  const totalPages = computed(() => {
    // Quando o backend não retorna total, estimamos: se houve próxima página, acrescenta 1
    const base = Math.ceil(total.value / limit.value) || 1
    return hasNext.value ? base + 1 : base
  })
  const availableVehicles = computed(() => vehicles.value.filter(v => v.status === 'disponivel'))

  function buildQuery(pageNum: number) {
    const params = new URLSearchParams()
    const offset = (pageNum - 1) * limit.value
    params.set('offset', String(offset))
    params.set('limit', String(limit.value))

    if (filters.value.modelo) params.set('modelo', filters.value.modelo)
    if (filters.value.marca) params.set('marca', filters.value.marca)
    if (filters.value.ano) params.set('ano', String(filters.value.ano))
    if (filters.value.minPreco) params.set('min_preco', String(filters.value.minPreco))
    if (filters.value.maxPreco) params.set('max_preco', String(filters.value.maxPreco))
    if (filters.value.categoria) params.set('categoria', filters.value.categoria)
    if (filters.value.disponiveis !== 'all') params.set('disponiveis', filters.value.disponiveis)

    return params.toString()
  }

  async function fetchVehicles(pageNum = 1) {
    loading.value = true
    error.value = null
    try {
      const queryString = buildQuery(pageNum)
      const response = await apiService.get<Veiculo[]>(`/veiculos?${queryString}`)
      if (response.success && response.data) {
        vehicles.value = response.data
        total.value = (pageNum - 1) * limit.value + response.data.length
        page.value = pageNum
        hasNext.value = response.data.length === limit.value
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
    hasNext,
    totalPages,
    availableVehicles,
    filters,
    fetchVehicles,
    fetchCategories,
    createVehicle,
    updateVehicle,
    deleteVehicle
  }
})
