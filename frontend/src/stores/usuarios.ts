// Store de usuários
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usuariosService } from '../services/usuariosService'
import type { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../types/Usuario'

export const useUsuariosStore = defineStore('usuarios', () => {
  const usuarios = ref<Usuario[]>([])
  const currentUsuario = ref<Usuario | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    try {
      loading.value = true
      error.value = null
      usuarios.value = await usuariosService.getAll()
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao buscar usuários'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number) {
    try {
      loading.value = true
      error.value = null
      currentUsuario.value = await usuariosService.getById(id)
      return currentUsuario.value
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao buscar usuário'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function create(data: CreateUsuarioRequest) {
    try {
      loading.value = true
      error.value = null
      const newUsuario = await usuariosService.create(data)
      usuarios.value.push(newUsuario)
      return newUsuario
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao criar usuário'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, data: UpdateUsuarioRequest) {
    try {
      loading.value = true
      error.value = null
      const updated = await usuariosService.update(id, data)
      const index = usuarios.value.findIndex(u => u.id === id)
      if (index !== -1) {
        usuarios.value[index] = updated
      }
      return updated
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao atualizar usuário'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    try {
      loading.value = true
      error.value = null
      await usuariosService.delete(id)
      usuarios.value = usuarios.value.filter(u => u.id !== id)
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao excluir usuário'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    usuarios,
    currentUsuario,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove
  }
})
