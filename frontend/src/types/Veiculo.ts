// Tipos/Interfaces do Veiculo

export interface Veiculo {
  id: number
  marca: string
  modelo: string
  ano: number
  cor: string
  disponivel: boolean
  valor_diaria: number
}

export interface CreateVeiculoRequest {
  marca: string
  modelo: string
  ano: number
  cor: string
  disponivel: boolean
  valor_diaria: number
}

export interface UpdateVeiculoRequest {
  marca?: string
  modelo?: string
  ano?: number
  cor?: string
  disponivel?: boolean
  valor_diaria?: number
}

export interface PaginatedVeiculos {
  veiculos: Veiculo[]
  total: number
  page: number
  limit: number
  totalPages: number
}
