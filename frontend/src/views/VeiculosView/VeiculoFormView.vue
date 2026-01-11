<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVeiculosStore } from '../../stores/veiculos'
import type { CreateVeiculoRequest, UpdateVeiculoRequest } from '../../types/Veiculo'
import MainLayout from '../../layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const veiculosStore = useVeiculosStore()

const loading = computed(() => veiculosStore.loading)
const error = ref<string | null>(null)

const isEditing = computed(() => !!route.params.id)
const veiculoId = computed(() => route.params.id ? Number(route.params.id) : null)

const form = reactive({
  marca: '',
  modelo: '',
  ano: new Date().getFullYear(),
  cor: '',
  disponivel: true,
  valor_diaria: 0
})

const errors = reactive({
  marca: '',
  modelo: '',
  ano: '',
  cor: '',
  valor_diaria: ''
})

function validateForm(): boolean {
  let isValid = true

  // Marca
  if (!form.marca.trim()) {
    errors.marca = 'Marca é obrigatória'
    isValid = false
  } else if (form.marca.trim().length < 2) {
    errors.marca = 'Marca deve ter ao menos 2 caracteres'
    isValid = false
  } else {
    errors.marca = ''
  }

  // Modelo
  if (!form.modelo.trim()) {
    errors.modelo = 'Modelo é obrigatório'
    isValid = false
  } else if (form.modelo.trim().length < 2) {
    errors.modelo = 'Modelo deve ter ao menos 2 caracteres'
    isValid = false
  } else {
    errors.modelo = ''
  }

  // Ano
  if (!form.ano) {
    errors.ano = 'Ano é obrigatório'
    isValid = false
  } else if (form.ano < 1900 || form.ano > new Date().getFullYear()) {
    errors.ano = `Ano deve estar entre 1900 e ${new Date().getFullYear()}`
    isValid = false
  } else {
    errors.ano = ''
  }

  // Cor
  if (!form.cor.trim()) {
    errors.cor = 'Cor é obrigatória'
    isValid = false
  } else if (form.cor.trim().length < 2) {
    errors.cor = 'Cor deve ter ao menos 2 caracteres'
    isValid = false
  } else {
    errors.cor = ''
  }

  // Valor Diária
  if (!form.valor_diaria) {
    errors.valor_diaria = 'Valor da diária é obrigatório'
    isValid = false
  } else if (form.valor_diaria < 0) {
    errors.valor_diaria = 'Valor deve ser positivo'
    isValid = false
  } else {
    errors.valor_diaria = ''
  }

  return isValid
}

async function submitForm() {
  if (!validateForm()) {
    return
  }

  try {
    error.value = null

    if (isEditing.value && veiculoId.value) {
      const data: UpdateVeiculoRequest = {
        marca: form.marca,
        modelo: form.modelo,
        ano: form.ano,
        cor: form.cor,
        disponivel: form.disponivel,
        valor_diaria: form.valor_diaria
      }
      await veiculosStore.update(veiculoId.value, data)
    } else {
      const data: CreateVeiculoRequest = {
        marca: form.marca,
        modelo: form.modelo,
        ano: form.ano,
        cor: form.cor,
        disponivel: form.disponivel,
        valor_diaria: form.valor_diaria
      }
      await veiculosStore.create(data)
    }

    await router.push('/veiculos')
  } catch {
    error.value = veiculosStore.error || 'Erro ao salvar veículo'
  }
}

async function loadVeiculo() {
  if (!isEditing.value || !veiculoId.value) {
    return
  }

  try {
    error.value = null
    const veiculo = await veiculosStore.fetchById(veiculoId.value)
    if (veiculo) {
      form.marca = veiculo.marca
      form.modelo = veiculo.modelo
      form.ano = veiculo.ano
      form.cor = veiculo.cor
      form.disponivel = veiculo.disponivel
      form.valor_diaria = veiculo.valor_diaria
    }
  } catch {
    error.value = 'Erro ao carregar dados do veículo'
  }
}

onMounted(() => {
  if (isEditing.value) {
    loadVeiculo()
  }
})
</script>

<template>
  <main-layout>
    <v-container class="py-8">
      <v-row>
        <v-col cols="12" md="8" lg="6" class="mx-auto">
          <h1 class="text-h4 mb-6">{{ isEditing ? 'Editar Veículo' : 'Novo Veículo' }}</h1>

          <v-alert
            v-if="error"
            type="error"
            closable
            class="mb-6"
            @update:model-value="error = null"
          >
            {{ error }}
          </v-alert>

          <v-form @submit.prevent="submitForm">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.marca"
                  label="Marca *"
                  placeholder="Ex: Toyota"
                  :error-messages="errors.marca"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.modelo"
                  label="Modelo *"
                  placeholder="Ex: Corolla"
                  :error-messages="errors.modelo"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="form.ano"
                  label="Ano *"
                  placeholder="Ex: 2023"
                  :error-messages="errors.ano"
                  type="number"
                  :min="1900"
                  :max="new Date().getFullYear()"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.cor"
                  label="Cor *"
                  placeholder="Ex: Preto"
                  :error-messages="errors.cor"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="form.valor_diaria"
                  label="Valor Diária (R$) *"
                  placeholder="Ex: 150.00"
                  :error-messages="errors.valor_diaria"
                  type="number"
                  :min="0"
                  step="0.01"
                  prefix="R$"
                  required
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.disponivel"
                  label="Status"
                  :items="[
                    { title: 'Disponível', value: true },
                    { title: 'Indisponível', value: false }
                  ]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" class="d-flex gap-3">
                <v-btn
                  type="submit"
                  color="success"
                  :loading="loading"
                  class="flex-grow-1"
                >
                  {{ isEditing ? 'Atualizar' : 'Criar' }}
                </v-btn>
                <v-btn
                  to="/veiculos"
                  color="secondary"
                  variant="outlined"
                  class="flex-grow-1"
                >
                  Cancelar
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </main-layout>
</template>
