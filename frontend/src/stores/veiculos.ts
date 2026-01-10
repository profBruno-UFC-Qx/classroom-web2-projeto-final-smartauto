// Store de veículos
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { veiculosService } from '../services/veiculosService'
import type { Veiculo, CreateVeiculoRequest, UpdateVeiculoRequest } from '../types/Veiculo'

export const useVeiculosStore = defineStore('veiculos', () => {
  const veiculos = ref<Veiculo[]>([])
  const currentVeiculo = ref<Veiculo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Paginação
  const currentPage = ref(1)
  const totalPages = ref(1)
  const total = ref(0)
  const limit = ref(10)

  async function fetchAll(page = 1, disponivel?: boolean) {
    try {
      loading.value = true
      error.value = null
      
      const response = await veiculosService.getAll(page, limit.value, disponivel)
      
      veiculos.value = response.veiculos
      currentPage.value = response.page
      totalPages.value = response.totalPages
      total.value = response.total
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao buscar veículos'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    try {
      loading.value = true
      error.value = null
      currentVeiculo.value = await veiculosService.getById(id)
      return currentVeiculo.value
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao buscar veículo'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function create(data: CreateVeiculoRequest) {
    try {
      loading.value = true
      error.value = null
      const newVeiculo = await veiculosService.create(data)
      await fetchAll(currentPage.value) // Recarrega a página atual
      return newVeiculo
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao criar veículo'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, data: UpdateVeiculoRequest) {
    try {
      loading.value = true
      error.value = null
      const updated = await veiculosService.update(id, data)
      await fetchAll(currentPage.value) // Recarrega a página atual
      return updated
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao atualizar veículo'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    try {
      loading.value = true
      error.value = null
      await veiculosService.delete(id)
      await fetchAll(currentPage.value) // Recarrega a página atual
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao excluir veículo'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    veiculos,
    currentVeiculo,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    limit,
    fetchAll,
    fetchById,
    create,
    update,
    remove
  }
})