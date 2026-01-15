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
  telefone?: string
  endereco?: string
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
  cor?: string
  quilometragem?: number
  valor_diaria: number
  status: 'disponivel' | 'locado' | 'manutencao'
  categoria_id: number
  categoriaVeiculoId?: number
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

export type CreateUserData = Omit<User, 'id'>
export type UpdateUserData = Partial<CreateUserData>

export type CreateVehicleData = Omit<Veiculo, 'id'>
export type UpdateVehicleData = Partial<CreateVehicleData>

export type CreateRentalData = Omit<Locacao, 'id'>
export type UpdateRentalData = Partial<CreateRentalData>
