<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useVehicleStore } from '@/stores/vehicles'
import { useAuthStore } from '@/stores/auth'
import type { Veiculo } from '@/types'

const vehicleStore = useVehicleStore()
const authStore = useAuthStore()

const showModal = ref(false)
const editingVehicle = ref<Veiculo | null>(null)

const formData = ref({
  modelo: '',
  marca: '',
  ano: new Date().getFullYear(),
  placa: '',
  cor: '',
  quilometragem: 0,
  valor_diaria: 0,
  status: 'disponivel' as 'disponivel' | 'locado' | 'manutencao',
  categoria_id: 0
})

const canManage = computed(() => authStore.isAdmin || authStore.isFuncionario)

const statusOptions = [
  { title: 'Disponível', value: 'disponivel' },
  { title: 'Locado', value: 'locado' },
  { title: 'Manutenção', value: 'manutencao' }
]

function applyFilters() {
  vehicleStore.fetchVehicles(1)
}

function clearFilters() {
  vehicleStore.filters.modelo = ''
  vehicleStore.filters.marca = ''
  vehicleStore.filters.ano = ''
  vehicleStore.filters.minPreco = ''
  vehicleStore.filters.maxPreco = ''
  vehicleStore.filters.categoria = ''
  vehicleStore.filters.disponiveis = 'true'
  vehicleStore.fetchVehicles(1)
}

onMounted(async () => {
  await vehicleStore.fetchVehicles()
  await vehicleStore.fetchCategories()
})

function openCreateModal() {
  editingVehicle.value = null
  formData.value = {
    modelo: '',
    marca: '',
    ano: new Date().getFullYear(),
    placa: '',
    cor: '',
    quilometragem: 0,
    valor_diaria: 0,
    status: 'disponivel',
    categoria_id: vehicleStore.categories[0]?.id || 0
  }
  showModal.value = true
}

function openEditModal(vehicle: Veiculo) {
  editingVehicle.value = vehicle
  formData.value = {
    modelo: vehicle.modelo,
    marca: vehicle.marca,
    ano: vehicle.ano,
    placa: vehicle.placa,
    cor: vehicle.cor || '',
    quilometragem: vehicle.quilometragem || 0,
    valor_diaria: vehicle.valor_diaria,
    status: vehicle.status,
    categoria_id: vehicle.categoria_id
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingVehicle.value = null
}

async function handleSubmit() {
  if (editingVehicle.value && editingVehicle.value.id) {
    await vehicleStore.updateVehicle(editingVehicle.value.id, formData.value)
  } else {
    await vehicleStore.createVehicle(formData.value)
  }
  
  if (!vehicleStore.error) {
    closeModal()
  }
}

async function handleDelete(id: number) {
  if (confirm('Tem certeza que deseja excluir este veículo?')) {
    await vehicleStore.deleteVehicle(id)
  }
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    disponivel: 'success',
    locado: 'error',
    manutencao: 'warning'
  }
  return colors[status] || 'info'
}

async function changePage(newPage: number) {
  await vehicleStore.fetchVehicles(newPage)
}
</script>

<template>
  <v-container fluid class="py-6 px-md-6 px-3">
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap gap-4">
        <h1 class="text-h4 text-md-h3">Veículos</h1>
        <v-btn
          v-if="canManage"
          color="primary"
          @click="openCreateModal"
          size="large"
          class="d-none d-sm-flex"
        >
          <v-icon>mdi-plus</v-icon>
          Novo Veículo
        </v-btn>
        <v-btn
          v-if="canManage"
          color="primary"
          @click="openCreateModal"
          icon="mdi-plus"
          size="small"
          class="d-sm-none"
        ></v-btn>
      </v-col>
    </v-row>

    <v-card class="mb-6" variant="outlined">
      <v-card-text>
        <v-row class="gy-2">
          <v-col cols="12" sm="6" md="4">
            <v-text-field v-model="vehicleStore.filters.modelo" label="Modelo" density="compact" clearable></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field v-model="vehicleStore.filters.marca" label="Marca" density="compact" clearable></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field v-model="vehicleStore.filters.ano" label="Ano" type="number" density="compact" clearable></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field v-model="vehicleStore.filters.minPreco" label="Preço mín." type="number" density="compact" clearable></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field v-model="vehicleStore.filters.maxPreco" label="Preço máx." type="number" density="compact" clearable></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="vehicleStore.filters.categoria"
              :items="vehicleStore.categories"
              item-title="nome"
              item-value="nome"
              label="Categoria"
              density="compact"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="vehicleStore.filters.disponiveis"
              :items="[
                { title: 'Apenas disponíveis', value: 'true' },
                { title: 'Indisponíveis', value: 'false' },
                { title: 'Todos', value: 'all' }
              ]"
              label="Disponibilidade"
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" class="d-flex gap-3 justify-end">
            <v-btn variant="outlined" color="secondary" @click="clearFilters">Limpar</v-btn>
            <v-btn color="primary" @click="applyFilters">Filtrar</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="vehicleStore.loading" indeterminate></v-progress-linear>

    <v-alert v-if="vehicleStore.error" type="error" class="mb-4">
      {{ vehicleStore.error }}
    </v-alert>

    <v-row v-if="!vehicleStore.loading && vehicleStore.vehicles.length > 0" class="mb-8">
      <v-col v-for="vehicle in vehicleStore.vehicles" :key="vehicle.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="h-100" hover>
          <v-card-title class="text-subtitle2 text-sm-h6">
            {{ vehicle.marca }} {{ vehicle.modelo }}
          </v-card-title>
          <v-chip :color="getStatusColor(vehicle.status)" text-color="white" class="ma-4" size="small">
            {{ vehicle.status }}
          </v-chip>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-subtitle class="text-caption text-sm-body2">Ano: {{ vehicle.ano }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-subtitle class="text-caption text-sm-body2">Placa: {{ vehicle.placa }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-subtitle class="text-caption text-sm-body2">Cor: {{ vehicle.cor || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-subtitle class="text-caption text-sm-body2">Km: {{ vehicle.quilometragem }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-subtitle class="text-primary font-weight-bold text-caption text-sm-body2">R$ {{ vehicle.valor_diaria.toFixed(2) }}/dia</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions v-if="canManage" class="gap-2 pa-4 flex-column flex-sm-row">
            <v-btn color="primary" variant="outlined" @click="openEditModal(vehicle)" block class="text-caption text-sm-body2">Editar</v-btn>
            <v-btn color="error" variant="outlined" @click="vehicle.id && handleDelete(vehicle.id)" block class="text-caption text-sm-body2" :disabled="!vehicle.id">Excluir</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="!vehicleStore.loading && vehicleStore.vehicles.length === 0" class="text-center py-8">
      <p class="text-grey">Nenhum veículo encontrado</p>
    </div>

    <v-row v-if="vehicleStore.totalPages > 1" class="mt-8 justify-center">
      <v-col cols="auto" class="d-flex gap-4 align-center">
        <v-btn
          @click="changePage(vehicleStore.page - 1)"
          :disabled="vehicleStore.page === 1"
        >
          Anterior
        </v-btn>
        <span class="text-subtitle-2">
          Página {{ vehicleStore.page }}
        </span>
        <v-btn
          @click="changePage(vehicleStore.page + 1)"
          :disabled="!vehicleStore.hasNext"
        >
          Próxima
        </v-btn>
      </v-col>
    </v-row>

    <!-- Modal -->
    <v-dialog v-model="showModal" max-width="600">
      <v-card>
        <v-card-title class="text-h5 pa-6">
          {{ editingVehicle ? 'Editar Veículo' : 'Novo Veículo' }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form @submit.prevent="handleSubmit">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.marca"
                  label="Marca *"
                  outlined
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.modelo"
                  label="Modelo *"
                  outlined
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="formData.ano"
                  label="Ano *"
                  type="number"
                  outlined
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.placa"
                  label="Placa *"
                  outlined
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.cor"
                  label="Cor"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="formData.quilometragem"
                  label="Quilometragem"
                  type="number"
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="formData.valor_diaria"
                  label="Valor Diária *"
                  type="number"
                  step="0.01"
                  outlined
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.status"
                  label="Status *"
                  :items="statusOptions"
                  outlined
                  required
                ></v-select>
              </v-col>
            </v-row>

            <v-select
              v-model.number="formData.categoria_id"
              label="Categoria *"
              :items="vehicleStore.categories"
              item-title="nome"
              item-value="id"
              outlined
              required
              class="mb-4"
            ></v-select>

            <v-alert v-if="vehicleStore.error" type="error" class="mb-4">
              {{ vehicleStore.error }}
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 gap-4">
          <v-btn @click="closeModal" variant="outlined">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="handleSubmit"
            :loading="vehicleStore.loading"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
