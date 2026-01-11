<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useVeiculosStore } from '../../stores/veiculos'
import { useAuthStore } from '../../stores/auth'
import { Role } from '../../types/Auth'
import MainLayout from '../../layouts/MainLayout.vue'
import Pagination from '../../components/Pagination.vue'

const veiculosStore = useVeiculosStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const filterDisponivel = ref('')
const error = ref<string | null>(null)

const loading = computed(() => veiculosStore.loading)
const currentPage = computed(() => veiculosStore.currentPage)
const totalPages = computed(() => veiculosStore.totalPages)
const total = computed(() => veiculosStore.total)
const limit = computed(() => veiculosStore.limit)

const filteredVeiculos = computed(() => {
  let result = veiculosStore.veiculos

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      v =>
        v.marca.toLowerCase().includes(query) ||
        v.modelo.toLowerCase().includes(query)
    )
  }

  return result
})

const canCreate = computed(() => {
  const role = authStore.user?.role
  return role === Role.ADMIN || role === Role.LOCADOR
})

const canEdit = computed(() => {
  const role = authStore.user?.role
  return role === Role.ADMIN || role === Role.LOCADOR
})

async function loadVeiculos(page = 1) {
  try {
    error.value = null
    const disponivel = filterDisponivel.value === '' ? undefined : filterDisponivel.value === 'true'
    await veiculosStore.fetchAll(page, disponivel)
  } catch {
    error.value = veiculosStore.error || 'Erro ao carregar veículos'
  }
}

function changePage(page: number) {
  loadVeiculos(page)
}

async function deleteVeiculo(id: number) {
  if (!confirm('Tem certeza que deseja excluir este veículo?')) {
    return
  }

  try {
    error.value = null
    await veiculosStore.remove(id)
  } catch {
    error.value = 'Erro ao excluir veículo'
  }
}

function handleSearch() {
  // O filtro de busca é feito localmente via computed property
}

function handleFilterChange() {
  loadVeiculos(1)
}

onMounted(() => {
  loadVeiculos()
})
</script>

<template>
  <main-layout>
    <v-row class="mb-4">
      <v-col cols="12" sm="8">
        <h1 class="text-h4 mb-0">Veículos</h1>
      </v-col>
      <v-col cols="12" sm="4" class="text-right">
        <v-btn
          v-if="canCreate"
          to="/veiculos/novo"
          color="success"
          prepend-icon="mdi-plus"
        >
          Novo Veículo
        </v-btn>
      </v-col>
    </v-row>

    <v-alert
      v-if="error"
      type="error"
      closable
      class="mb-4"
      @update:model-value="error = null"
    >
      {{ error }}
    </v-alert>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="searchQuery"
              label="Buscar por marca ou modelo"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              @input="handleSearch"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterDisponivel"
              :items="[
                { title: 'Todos', value: '' },
                { title: 'Disponíveis', value: 'true' },
                { title: 'Indisponíveis', value: 'false' }
              ]"
              label="Status"
              variant="outlined"
              density="compact"
              @update:model-value="handleFilterChange"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-progress-linear
      v-if="loading"
      indeterminate
      class="mb-4"
    />

    <v-empty-state
      v-else-if="filteredVeiculos.length === 0"
      icon="mdi-car-off"
      headline="Nenhum veículo encontrado"
      text="Não há veículos disponíveis no momento"
    />

    <v-row v-else class="mb-4">
      <v-col
        v-for="veiculo in filteredVeiculos"
        :key="veiculo.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="h-100">
          <v-card-title class="d-flex justify-space-between align-start">
            <div>{{ veiculo.marca }} {{ veiculo.modelo }}</div>
            <v-chip
              :color="veiculo.disponivel ? 'success' : 'error'"
              text-color="white"
              label
              size="small"
            >
              {{ veiculo.disponivel ? 'Disponível' : 'Indisponível' }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-calendar</v-icon>
                </template>
                <v-list-item-title>Ano</v-list-item-title>
                <v-list-item-subtitle>{{ veiculo.ano }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-palette</v-icon>
                </template>
                <v-list-item-title>Cor</v-list-item-title>
                <v-list-item-subtitle>{{ veiculo.cor }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-currency-brl</v-icon>
                </template>
                <v-list-item-title>Diária</v-list-item-title>
                <v-list-item-subtitle>R$ {{ veiculo.valor_diaria.toFixed(2) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions>
            <v-btn
              :to="`/veiculos/${veiculo.id}`"
              color="info"
              variant="text"
              size="small"
            >
              Detalhes
            </v-btn>
            <v-spacer />
            <v-btn
              v-if="canEdit"
              :to="`/veiculos/${veiculo.id}/editar`"
              icon="mdi-pencil"
              size="small"
              color="warning"
            />
            <v-btn
              v-if="canEdit"
              @click="deleteVeiculo(veiculo.id)"
              icon="mdi-delete"
              size="small"
              color="error"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total="total"
      :limit="limit"
      @change-page="changePage"
    />
  </main-layout>
</template>
