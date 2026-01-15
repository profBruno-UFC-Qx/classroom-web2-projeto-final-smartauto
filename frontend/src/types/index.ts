export enum UserRole {
  ADMIN = 'admin',
  FUNCIONARIO = 'funcionario',
  CLIENTE = 'cliente'
}

export interface User {
  id?: number
  nome: string
  email: string
  senha?: string
  cpf: string
  telefone: string
  endereco: string
  papel: UserRole
}

export interface AuthResponse {
  token: string
  user: User
}

export interface CategoriaVeiculo {
  id?: number
  nome: string
  descricao: string
  precoDiaria: number
}

export interface Veiculo {
  id?: number
  marca: string
  modelo: string
  ano: number
  placa: string
  status: 'disponivel' | 'locado' | 'manutencao'
  categoriaVeiculoId: number
}

export interface Locacao {
  id?: number
  dataInicio: string
  dataFim: string
  dataFimReal?: string
  valorTotal: number
  status: 'ativa' | 'finalizada' | 'cancelada'
  usuarioId: number
  veiculoId: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}
