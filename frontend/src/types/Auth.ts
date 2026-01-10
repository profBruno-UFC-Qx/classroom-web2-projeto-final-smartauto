// Tipos/Interfaces de autenticação

export enum Role {
  CLIENTE = 'cliente',
  LOCADOR = 'locador',
  ADMIN = 'admin'
}

export interface LoginRequest {
  usuario: string
  senha: string
}

export interface LoginResponse {
  token: string
  usuario: UserData
}

export interface UserData {
  id: number
  usuario: string
  nome: string
  email: string
  telefone: string
  role: Role
  uf: string
  cidade: string
  logradouro: string
  numero: number
}

export interface RegisterRequest {
  usuario: string
  senha: string
  nome: string
  email: string
  telefone: string
  uf: string
  cidade: string
  logradouro: string
  numero: number
  role?: Role
}
