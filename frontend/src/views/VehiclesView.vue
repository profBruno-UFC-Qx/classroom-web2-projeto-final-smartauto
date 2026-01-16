<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useVehicleStore } from '@/stores/vehicles'
import { useAuthStore } from '@/stores/auth'
import type { Veiculo } from '@/types'

const vehicleStore = useVehicleStore()
const authStore = useAuthStore()

const showModal = ref(false)
const editingVehicle = ref<Veiculo | null>(null)
const searchQuery = ref('')

const formData = ref({
  marca: '',
  modelo: '',
  ano: new Date().getFullYear(),
  cor: '',
  valor_diaria: 0,
  disponivel: true
})

const canManage = computed(() => authStore.isAdmin || authStore.isLocador)

const filteredVehicles = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return vehicleStore.vehicles.filter(v =>
    v.marca.toLowerCase().includes(query) ||
    v.modelo.toLowerCase().includes(query) ||
    v.cor?.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  await vehicleStore.fetchVehicles()
})

function openCreateModal() {
  editingVehicle.value = null
  formData.value = {
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    cor: '',
    valor_diaria: 0,
    disponivel: true
  }
  showModal.value = true
}

function openEditModal(vehicle: Veiculo) {
  editingVehicle.value = vehicle
  formData.value = {
    marca: vehicle.marca,
    modelo: vehicle.modelo,
    ano: vehicle.ano,
    cor: vehicle.cor,
    valor_diaria: vehicle.valor_diaria,
    disponivel: vehicle.disponivel
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingVehicle.value = null
}

async function handleSubmit() {
  if (!formData.value.marca || !formData.value.modelo) {
    alert('Preenchimento obrigatório: marca e modelo')
    return
  }

  if (editingVehicle.value && editingVehicle.value.id) {
    await vehicleStore.updateVehicle(editingVehicle.value.id, formData.value)
  } else {
    await vehicleStore.createVehicle(formData.value)
  }

  if (!vehicleStore.error) {
    closeModal()
  }
}

async function deleteVehicle(id: number) {
  if (confirm('Tem certeza que deseja deletar este veículo?')) {
    await vehicleStore.deleteVehicle(id)
  }
}
</script>

<template>
  <v-container class="py-8">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Veículos Disponíveis</h1>
        <p class="text-body2 text-disabled">Consulte nosso catálogo de veículos para aluguel</p>
      </v-col>
    </v-row>

    <!-- Filtros e Ações -->
    <v-row class="mb-4 align-center">
      <v-col cols="12" sm="6" md="8">
        <v-text-field
          v-model="searchQuery"
          placeholder="Buscar por marca, modelo ou cor..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-right">
        <v-btn
          v-if="canManage"
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateModal"
        >
          Novo Veículo
        </v-btn>
      </v-col>
    </v-row>

    <!-- Mensagens de Erro/Status -->
    <v-row v-if="vehicleStore.loading" class="mb-4">
      <v-col cols="12">
        <v-progress-linear indeterminate></v-progress-linear>
      </v-col>
    </v-row>

    <v-row v-if="vehicleStore.error" class="mb-4">
      <v-col cols="12">
        <v-alert type="error" closable>{{ vehicleStore.error }}</v-alert>
      </v-col>
    </v-row>

    <!-- Lista de Veículos em Grid -->
    <v-row v-if="filteredVehicles.length > 0">
      <v-col
        v-for="vehicle in filteredVehicles"
        :key="vehicle.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="h-100 d-flex flex-column" :class="{ 'opacity-50': !vehicle.disponivel }">
          <v-card-title class="pb-2">
            <div class="text-body2 text-disabled">{{ vehicle.marca }}</div>
            <div class="text-h6 font-weight-bold">{{ vehicle.modelo }}</div>
          </v-card-title>

          <v-card-text class="flex-grow-1">
            <div class="mb-2">
              <v-chip
                :color="vehicle.disponivel ? 'success' : 'error'"
                label
                size="small"
              >
                {{ vehicle.disponivel ? 'Disponível' : 'Indisponível' }}
              </v-chip>
            </div>
            <div class="text-body2 mb-1">
              <strong>Ano:</strong> {{ vehicle.ano }}
            </div>
            <div class="text-body2 mb-1">
              <strong>Cor:</strong> {{ vehicle.cor }}
            </div>
            <div class="text-body2 mb-2">
              <strong>Valor/dia:</strong> R$ {{ vehicle.valor_diaria.toFixed(2) }}
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="text-caption text-disabled">
              <div v-if="vehicle.categorias?.length">
                <strong>Categorias:</strong>
                <v-chip
                  v-for="cat in vehicle.categorias"
                  :key="cat.id"
                  size="x-small"
                  class="mr-1 mt-1"
                >
                  {{ cat.nome }}
                </v-chip>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="pt-0">
            <v-btn
              v-if="canManage"
              variant="outlined"
              size="small"
              @click="openEditModal(vehicle)"
            >
              Editar
            </v-btn>
            <v-btn
              v-if="canManage"
              color="error"
              variant="outlined"
              size="small"
              @click="deleteVehicle(vehicle.id!)"
            >
              Deletar
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              v-if="vehicle.disponivel"
              color="primary"
              size="small"
              @click="$router.push(`/locacoes?veiculo=${vehicle.id}`)"
            >
              Alugar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Vazio -->
    <v-row v-else>
      <v-col cols="12" class="text-center py-12">
        <v-icon size="48" class="text-disabled mb-4">mdi-car-off</v-icon>
        <p class="text-body1 text-disabled">
          {{ searchQuery ? 'Nenhum veículo encontrado' : 'Nenhum veículo disponível' }}
        </p>
      </v-col>
    </v-row>

    <!-- Modal de Criação/Edição -->
    <v-dialog v-model="showModal" max-width="500">
      <v-card>
        <v-card-title>
          {{ editingVehicle ? 'Editar Veículo' : 'Novo Veículo' }}
        </v-card-title>

        <v-card-text class="py-4">
          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="formData.marca"
              label="Marca"
              required
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formData.modelo"
              label="Modelo"
              required
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model.number="formData.ano"
              label="Ano"
              type="number"
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formData.cor"
              label="Cor"
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model.number="formData.valor_diaria"
              label="Valor Diária (R$)"
              type="number"
              step="0.01"
              required
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-checkbox
              v-model="formData.disponivel"
              label="Disponível para aluguel"
              class="mb-3"
            ></v-checkbox>

            <v-alert v-if="vehicleStore.error" type="error" class="mb-3">
              {{ vehicleStore.error }}
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="closeModal">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="handleSubmit"
            :loading="vehicleStore.loading"
          >
            {{ editingVehicle ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.opacity-50 {
  opacity: 0.5;
}
</style>
