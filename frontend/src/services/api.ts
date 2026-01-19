import type { ApiResponse } from '@/types'

interface ApiResponseWithPagination<T> extends ApiResponse<T> {
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export class ApiService {
  private baseURL: string = 'http://localhost:3000'
  private token: string | null = null

  constructor() {
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

      const json = await response.json().catch(() => undefined)

      if (json && typeof json === 'object' && ('success' in json || 'detail' in json || 'error' in json)) {
        const jsonObj = json as Record<string, unknown>
        const result: ApiResponseWithPagination<T> = {
          success: response.ok && (jsonObj.success as boolean | undefined) !== false,
          data: (jsonObj.data as T | undefined) || (json as T),
          message: jsonObj.message as string | undefined,
          detail: jsonObj.detail as string | undefined,
          error: jsonObj.error as string | undefined
        }
        if (jsonObj.pagination && typeof jsonObj.pagination === 'object') {
          result.pagination = jsonObj.pagination as ApiResponseWithPagination<T>['pagination']
        }
        return result
      }

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
