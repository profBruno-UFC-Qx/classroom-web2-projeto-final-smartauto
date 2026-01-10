// Serviço de veículos
import api from './api'
import type { Veiculo, CreateVeiculoRequest, UpdateVeiculoRequest, PaginatedVeiculos } from '../types/Veiculo'

export const veiculosService = {
  async getAll(page = 1, limit = 10, disponivel?: boolean): Promise<PaginatedVeiculos> {
    const params: Record<string, number | boolean> = { page, limit }
    if (disponivel !== undefined) {
      params.disponivel = disponivel
    }
    const response = await api.get<PaginatedVeiculos>('/veiculos', { params })
    return response.data
  },

  async getById(id: number): Promise<Veiculo> {
    const response = await api.get<Veiculo>(`/veiculos/${id}`)
    return response.data
  },

  async create(data: CreateVeiculoRequest): Promise<Veiculo> {
    const response = await api.post<Veiculo>('/veiculos', data)
    return response.data
  },

  async update(id: number, data: UpdateVeiculoRequest): Promise<Veiculo> {
    const response = await api.put<Veiculo>(`/veiculos/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/veiculos/${id}`)
  }
}
