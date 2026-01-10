// Tipos/Interfaces do Usuario
import { Role } from './Auth'

export interface Usuario {
  id: number
  usuario: string
  nome: string
  email: string
  telefone: string
  uf: string
  cidade: string
  logradouro: string
  numero: number
  role: Role
}

export interface CreateUsuarioRequest {
  usuario: string
  senha: string
  nome: string
  email: string
  telefone: string
  uf: string
  cidade: string
  logradouro: string
  numero: number
  role: Role
}

export interface UpdateUsuarioRequest {
  usuario?: string
  senha?: string
  nome?: string
  email?: string
  telefone?: string
  uf?: string
  cidade?: string
  logradouro?: string
  numero?: number
  role?: Role
}
