// User Roles
export enum UserRole {
  ADMIN = 'admin',
  LOCADOR = 'locador',
  CLIENTE = 'cliente'
}

// Status de Locação
export enum RentalStatus {
  PENDENTE = 'pendente',
  APROVADA = 'aprovada',
  RECUSADA = 'recusada'
}

// Disponibilidade de Veículo
export enum VehicleStatus {
  DISPONIVEL = true,
  INDISPONIVEL = false
}

// User Interface - alinhado com backend
export interface User {
  id?: number
  nome: string
  usuario: string
  email: string
  senha?: string
  telefone: string
  uf: string
  cidade: string
  logradouro: string
  numero: number
  role: UserRole
}

// Auth Response
export interface AuthResponse {
  token: string
  user: User
}

// Categoria de Veículo
export interface Categoria {
  id?: number
  nome: string
}

// Vehicle Interface - alinhado com backend
export interface Veiculo {
  id?: number
  marca: string
  modelo: string
  ano: number
  cor: string
  disponivel: boolean
  valor_diaria: number
  categorias?: Categoria[]
}

// Rental Interface - alinhado com backend
export interface Locacao {
  id?: number
  data_inicio: Date | string
  data_fim: Date | string
  cliente_id: number
  locador_id: number
  veiculo_id: number
  status: RentalStatus
  cliente?: User
  locador?: User
  veiculo?: Veiculo
  valor_total?: number
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  detail?: string
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

// Type Utilities
export type CreateUserData = Omit<User, 'id'>
export type UpdateUserData = Partial<Omit<User, 'id'>>

export type CreateVehicleData = Omit<Veiculo, 'id'>
export type UpdateVehicleData = Partial<CreateVehicleData>

export type CreateRentalData = Omit<Locacao, 'id'>
export type UpdateRentalData = Partial<CreateRentalData>
