import type { ApiResponse, PaginatedResponse } from '@/types'

export class ApiService {
  private baseURL: string = 'http://localhost:3000'
  private token: string | null = null

  constructor() {
    // Try to load token from localStorage on initialization
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    return headers
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined
      })

      // Parse response once
      const json = await response.json().catch(() => undefined)

      // Normalize response shape to ApiResponse
      if (json && typeof json === 'object' && ('success' in json || 'detail' in json || 'error' in json)) {
        // Already in ApiResponse format
        return {
          success: response.ok && (json as any)?.success !== false,
          data: (json as any)?.data || json,
          message: (json as any)?.message,
          detail: (json as any)?.detail,
          error: (json as any)?.error
        }
      }

      // Wrap plain response data
      return {
        success: response.ok,
        data: json as T,
        message: !response.ok ? 'Erro na requisição' : undefined
      }
    } catch (err) {
      return {
        success: false,
        message: 'Falha de conexão com o servidor. Verifique se o backend está em execução e acessível.',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint)
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body)
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body)
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint)
  }

  async getList<T>(endpoint: string, offset = 0, limit = 10): Promise<ApiResponse<T[]>> {
    return this.get<T[]>(`${endpoint}?offset=${offset}&limit=${limit}`)
  }
}

export const apiService = new ApiService()
