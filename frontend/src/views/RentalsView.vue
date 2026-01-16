<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRentalStore } from '@/stores/rentals'
import { useVehicleStore } from '@/stores/vehicles'
import { useUserStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { RentalStatus } from '@/types'
import type { Locacao } from '@/types'

const rentalStore = useRentalStore()
const vehicleStore = useVehicleStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const showModal = ref(false)
const editingRental = ref<Locacao | null>(null)
const statusFilter = ref<RentalStatus | 'all'>('all')

const formData = ref({
  data_inicio: '',
  data_fim: '',
  cliente_id: 0,
  locador_id: authStore.user?.id || 0,
  veiculo_id: 0,
  status: RentalStatus.PENDENTE
})

const canManageRentals = computed(() => authStore.isAdmin || authStore.isLocador)

const filteredRentals = computed(() => {
  if (statusFilter.value === 'all') {
    return rentalStore.rentals
  }
  return rentalStore.rentals.filter(r => r.status === statusFilter.value)
})

onMounted(async () => {
  await rentalStore.fetchRentals()
  await vehicleStore.fetchAllVehicles()
  await userStore.fetchUsers()
})

function openCreateModal() {
  editingRental.value = null
  formData.value = {
    data_inicio: '',
    data_fim: '',
    cliente_id: 0,
    locador_id: authStore.user?.id || 0,
    veiculo_id: 0,
    status: RentalStatus.PENDENTE
  }
  showModal.value = true
}

function openEditModal(rental: Locacao) {
  editingRental.value = rental
  formData.value = {
    data_inicio: String(rental.data_inicio),
    data_fim: String(rental.data_fim),
    cliente_id: rental.cliente_id,
    locador_id: rental.locador_id,
    veiculo_id: rental.veiculo_id,
    status: rental.status
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingRental.value = null
}

async function handleSubmit() {
  if (!formData.value.data_inicio || !formData.value.data_fim || !formData.value.veiculo_id || !formData.value.cliente_id) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  const startDate = new Date(formData.value.data_inicio)
  const endDate = new Date(formData.value.data_fim)

  if (endDate <= startDate) {
    alert('Data de término deve ser após a data de início')
    return
  }

  if (editingRental.value && editingRental.value.id) {
    await rentalStore.updateRental(editingRental.value.id, formData.value)
  } else {
    await rentalStore.createRental(formData.value)
  }

  if (!rentalStore.error) {
    closeModal()
  }
}

async function deleteRental(id: number) {
  if (confirm('Tem certeza que deseja deletar esta locação?')) {
    await rentalStore.deleteRental(id)
  }
}

async function approveRental(id: number) {
  if (confirm('Aprovar esta locação?')) {
    await rentalStore.approveRental(id)
  }
}

async function rejectRental(id: number) {
  if (confirm('Recusar esta locação?')) {
    await rentalStore.rejectRental(id)
  }
}

function getStatusColor(status: RentalStatus): string {
  const colors: Record<RentalStatus, string> = {
    [RentalStatus.PENDENTE]: 'warning',
    [RentalStatus.APROVADA]: 'success',
    [RentalStatus.RECUSADA]: 'error'
  }
  return colors[status] || 'info'
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

function calculateDays(dataInicio: Date | string, dataFim: Date | string): number {
  const start = new Date(dataInicio)
  const end = new Date(dataFim)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function calculateTotal(veiculo_id: number, dataInicio: Date | string, dataFim: Date | string): number {
  const vehicle = vehicleStore.vehicles.find(v => v.id === veiculo_id)
  if (!vehicle) return 0
  const days = calculateDays(dataInicio, dataFim)
  return days * vehicle.valor_diaria
}
</script>

<template>
  <v-container class="py-8">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Locações de Veículos</h1>
        <p class="text-body2 text-disabled">Gerencie as solicitações e aprovações de aluguel</p>
      </v-col>
    </v-row>

    <!-- Filtros e Ações -->
    <v-row class="mb-4 align-center">
      <v-col cols="12" sm="6" md="8">
        <v-select
          v-model="statusFilter"
          :items="[
            { title: 'Todas', value: 'all' },
            { title: 'Pendentes', value: RentalStatus.PENDENTE },
            { title: 'Aprovadas', value: RentalStatus.APROVADA },
            { title: 'Recusadas', value: RentalStatus.RECUSADA }
          ]"
          label="Filtrar por status"
          variant="outlined"
          density="compact"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-right">
        <v-btn
          v-if="canManageRentals"
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateModal"
        >
          Nova Locação
        </v-btn>
      </v-col>
    </v-row>

    <!-- Mensagens de Erro/Status -->
    <v-row v-if="rentalStore.loading" class="mb-4">
      <v-col cols="12">
        <v-progress-linear indeterminate></v-progress-linear>
      </v-col>
    </v-row>

    <v-row v-if="rentalStore.error" class="mb-4">
      <v-col cols="12">
        <v-alert type="error" closable>{{ rentalStore.error }}</v-alert>
      </v-col>
    </v-row>

    <!-- Tabela de Locações -->
    <v-row v-if="filteredRentals.length > 0">
      <v-col cols="12">
        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Veículo</th>
              <th>Cliente</th>
              <th>Período</th>
              <th>Dias</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rental in filteredRentals" :key="rental.id">
              <td class="text-body2">#{{ rental.id }}</td>
              <td class="text-body2">
                {{ rental.veiculo?.marca }} {{ rental.veiculo?.modelo }}
              </td>
              <td class="text-body2">
                {{ rental.cliente?.nome }}
              </td>
              <td class="text-body2">
                {{ formatDate(rental.data_inicio) }} a {{ formatDate(rental.data_fim) }}
              </td>
              <td class="text-body2 font-weight-bold">
                {{ calculateDays(rental.data_inicio, rental.data_fim) }}
              </td>
              <td class="text-body2 font-weight-bold text-primary">
                R$ {{ calculateTotal(rental.veiculo_id, rental.data_inicio, rental.data_fim).toFixed(2) }}
              </td>
              <td>
                <v-chip
                  :color="getStatusColor(rental.status)"
                  label
                  size="small"
                >
                  {{ rental.status }}
                </v-chip>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <v-btn
                    v-if="canManageRentals && rental.status === RentalStatus.PENDENTE"
                    color="success"
                    icon="mdi-check"
                    size="x-small"
                    @click="approveRental(rental.id!)"
                  ></v-btn>
                  <v-btn
                    v-if="canManageRentals && rental.status === RentalStatus.PENDENTE"
                    color="error"
                    icon="mdi-close"
                    size="x-small"
                    @click="rejectRental(rental.id!)"
                  ></v-btn>
                  <v-btn
                    v-if="canManageRentals"
                    variant="outlined"
                    size="x-small"
                    @click="openEditModal(rental)"
                  >
                    Editar
                  </v-btn>
                  <v-btn
                    v-if="canManageRentals"
                    color="error"
                    variant="outlined"
                    size="x-small"
                    @click="deleteRental(rental.id!)"
                  >
                    Deletar
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>

    <!-- Vazio -->
    <v-row v-else>
      <v-col cols="12" class="text-center py-12">
        <v-icon size="48" class="text-disabled mb-4">mdi-calendar-off</v-icon>
        <p class="text-body1 text-disabled">Nenhuma locação encontrada</p>
      </v-col>
    </v-row>

    <!-- Modal de Criação/Edição -->
    <v-dialog v-model="showModal" max-width="600">
      <v-card>
        <v-card-title>
          {{ editingRental ? 'Editar Locação' : 'Nova Locação' }}
        </v-card-title>

        <v-card-text class="py-4">
          <v-form @submit.prevent="handleSubmit">
            <v-select
              v-model.number="formData.veiculo_id"
              :items="vehicleStore.vehicles.filter(v => v.disponivel)"
              item-title="modelo"
              item-value="id"
              label="Veículo"
              required
              density="compact"
              class="mb-3"
            >
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:title>
                    {{ item.raw.marca }} {{ item.raw.modelo }} - R$ {{ item.raw.valor_diaria.toFixed(2) }}/dia
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <v-select
              v-model.number="formData.cliente_id"
              :items="userStore.clienteUsers"
              item-title="nome"
              item-value="id"
              label="Cliente"
              required
              density="compact"
              class="mb-3"
            ></v-select>

            <v-text-field
              v-model="formData.data_inicio"
              label="Data de Início"
              type="date"
              required
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formData.data_fim"
              label="Data de Término"
              type="date"
              required
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-select
              v-model="formData.status"
              :items="[
                { title: 'Pendente', value: RentalStatus.PENDENTE },
                { title: 'Aprovada', value: RentalStatus.APROVADA },
                { title: 'Recusada', value: RentalStatus.RECUSADA }
              ]"
              label="Status"
              required
              density="compact"
              class="mb-3"
            ></v-select>

            <!-- Resumo -->
            <v-card v-if="formData.veiculo_id && formData.data_inicio && formData.data_fim" class="mb-3" variant="outlined">
              <v-card-text>
                <div class="text-body2 mb-1">
                  <strong>Dias:</strong> {{ calculateDays(formData.data_inicio, formData.data_fim) }}
                </div>
                <div class="text-body2 font-weight-bold text-primary">
                  <strong>Total:</strong> R$ {{ calculateTotal(formData.veiculo_id, formData.data_inicio, formData.data_fim).toFixed(2) }}
                </div>
              </v-card-text>
            </v-card>

            <v-alert v-if="rentalStore.error" type="error" class="mb-3">
              {{ rentalStore.error }}
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="closeModal">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="handleSubmit"
            :loading="rentalStore.loading"
          >
            {{ editingRental ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
