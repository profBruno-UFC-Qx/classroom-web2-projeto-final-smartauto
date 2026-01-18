<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRentalStore } from '@/stores/rentals'
import { useVehicleStore } from '@/stores/vehicles'
import { useUserStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { RentalStatus, UserRole } from '@/types'
import type { Locacao, CreateRentalData, UpdateRentalData, Veiculo, User } from '@/types'
import { debounce } from '@/utils/debounce'

const route = useRoute()
const rentalStore = useRentalStore()
const vehicleStore = useVehicleStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const showModal = ref(false)
const editingRental = ref<Locacao | null>(null)
const statusFilter = ref<RentalStatus | 'all'>('all')
const formTotal = ref(0)

// Busca de veículos e clientes
const vehicleSearchTerm = ref('')
const clienteSearchTerm = ref('')
const searchedVehicles = ref<Veiculo[]>([])
const searchedClientes = ref<User[]>([])
const vehicleSearchLoading = ref(false)
const clienteSearchLoading = ref(false)

const formData = ref({
  data_inicio: '',
  data_fim: '',
  cliente_id: 0,
  locador_id: 0,
  veiculo_id: 0,
  status: RentalStatus.PENDENTE
})

const canManageRentals = computed(() => authStore.isAdmin || authStore.isLocador)
const isCliente = computed(() => authStore.isCliente)

// Notificações
const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

const filteredRentals = computed(() => rentalStore.rentals)

const availableVehiclesForSelect = computed(() => {
  // Se está buscando, retorna os veículos da busca
  if (vehicleSearchTerm.value.trim()) {
    return searchedVehicles.value
  }

  // Caso contrário, retorna apenas veículos disponíveis do store
  const vehicles = [...vehicleStore.vehicles.filter(v => v.disponivel)]

  // Se está editando e o veículo selecionado não está disponível, adiciona ele
  if (editingRental.value) {
    const selectedVehicleId = formData.value.veiculo_id
    const hasSelectedVehicle = vehicles.some(v => v.id === selectedVehicleId)

    if (!hasSelectedVehicle && editingRental.value.veiculo) {
      vehicles.push(editingRental.value.veiculo)
    }
  }

  return vehicles
})

const clientesForSelect = computed(() => {
  let clientes: User[] = []

  // Se está buscando, retorna os clientes da busca
  if (clienteSearchTerm.value.trim()) {
    clientes = [...searchedClientes.value]
  } else {
    // Caso contrário, retorna clientes do store
    clientes = [...userStore.clienteUsers]
  }

  // Se está editando e o cliente selecionado não está na lista, adiciona ele
  if (editingRental.value && editingRental.value.cliente) {
    const selectedClienteId = formData.value.cliente_id
    const hasSelectedCliente = clientes.some(c => c.id === selectedClienteId)

    if (!hasSelectedCliente) {
      clientes.push(editingRental.value.cliente)
    }
  }

  return clientes
})

const searchVehicles = debounce(async (modelo: unknown) => {
  const searchTerm = typeof modelo === 'string' ? modelo : ''
  if (!searchTerm.trim()) {
    searchedVehicles.value = []
    return
  }

  vehicleSearchLoading.value = true
  try {
    const vehicles = await vehicleStore.searchAvailableVehiclesByModel(searchTerm)
    searchedVehicles.value = vehicles
  } finally {
    vehicleSearchLoading.value = false
  }
}, 500)

const searchClientes = debounce(async (nome: unknown) => {
  const searchTerm = typeof nome === 'string' ? nome : ''
  if (!searchTerm.trim()) {
    searchedClientes.value = []
    return
  }

  clienteSearchLoading.value = true
  try {
    const clientes = await userStore.searchClientesByName(searchTerm)
    searchedClientes.value = clientes
  } finally {
    clienteSearchLoading.value = false
  }
}, 500)

watch(() => vehicleSearchTerm.value, (newVal) => {
  searchVehicles(newVal)
})

watch(() => clienteSearchTerm.value, (newVal) => {
  searchClientes(newVal)
})

async function changePage(page: number) {
  await rentalStore.fetchRentals(page, statusFilter.value === 'all' ? null : statusFilter.value)
}

watch(() => statusFilter.value, () => {
  rentalStore.currentPage = 1
  changePage(1)
})

onMounted(async () => {
  await rentalStore.fetchRentals(1, statusFilter.value === 'all' ? null : statusFilter.value)
  // Carregar apenas veículos disponíveis
  await vehicleStore.fetchVehicles(1, { disponiveis: true })
  // Carregar clientes se não for cliente
  if (!isCliente.value) {
    await userStore.fetchUsers(1, UserRole.CLIENTE)
  }

  const veiculoId = route.query.veiculo
  if (veiculoId) {
    const id = typeof veiculoId === 'string' ? parseInt(veiculoId) : Number(veiculoId)
    if (!isNaN(id)) {
      openCreateModal(id)
      window.history.replaceState({}, '', '/locacoes')
    }
  }
})

async function openCreateModal(veiculoId?: number) {
  editingRental.value = null
  formData.value = {
    data_inicio: '',
    data_fim: '',
    cliente_id: isCliente.value && authStore.user?.id ? authStore.user.id : 0,
    locador_id: 0,
    veiculo_id: veiculoId || formData.value.veiculo_id || 0,
    status: RentalStatus.PENDENTE
  }
  vehicleSearchTerm.value = ''
  clienteSearchTerm.value = ''
  searchedVehicles.value = []
  searchedClientes.value = []
  showModal.value = true
  await updateFormTotal()
}

async function openEditModal(rental: Locacao) {
  editingRental.value = rental
  formData.value = {
    data_inicio: String(rental.data_inicio),
    data_fim: String(rental.data_fim),
    cliente_id: rental.cliente_id,
    locador_id: rental.locador_id || 0,
    veiculo_id: rental.veiculo_id,
    status: rental.status
  }
  vehicleSearchTerm.value = ''
  clienteSearchTerm.value = ''
  searchedVehicles.value = []
  searchedClientes.value = []

  // Se o cliente não veio no relacionamento, buscar pelo ID
  if (!rental.cliente && rental.cliente_id && !isCliente.value) {
    const cliente = await userStore.fetchUserById(rental.cliente_id)
    if (cliente) {
      // Adicionar ao store para que apareça no select
      const index = userStore.users.findIndex(u => u.id === cliente.id)
      if (index === -1) {
        userStore.users.push(cliente)
      }
    }
  }

  showModal.value = true
  await updateFormTotal()
}

function closeModal() {
  showModal.value = false
  editingRental.value = null
}

function showNotification(message: string, type: 'success' | 'error' = 'success') {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 4000)
}

async function handleSubmit() {
  if (!formData.value.data_inicio || !formData.value.data_fim || !formData.value.veiculo_id || !formData.value.cliente_id) {
    showNotification('Preencha todos os campos obrigatórios', 'error')
    return
  }

  const startDate = new Date(formData.value.data_inicio)
  const endDate = new Date(formData.value.data_fim)

  if (endDate <= startDate) {
    showNotification('Data de término deve ser após a data de início', 'error')
    return
  }

  if (editingRental.value && editingRental.value.id) {
    const updateData: UpdateRentalData & { locador_id?: number | null } = { ...formData.value }
    if (authStore.isAdmin) {
      if (updateData.locador_id === 0) {
        updateData.locador_id = null as unknown as number
      }
    } else {
      delete updateData.locador_id
    }
    await rentalStore.updateRental(editingRental.value.id, updateData as UpdateRentalData)
    if (!rentalStore.error) {
      showNotification('Locação atualizada com sucesso!', 'success')
      closeModal()
      await rentalStore.fetchRentals(rentalStore.currentPage, statusFilter.value === 'all' ? null : statusFilter.value)
    } else {
      showNotification(rentalStore.error, 'error')
    }
  } else {
    const locadorId = isCliente.value ? 0 : (authStore.user?.id || 0)

    const createData: Omit<CreateRentalData, 'status'> & { status?: RentalStatus } = {
      data_inicio: formData.value.data_inicio,
      data_fim: formData.value.data_fim,
      cliente_id: formData.value.cliente_id,
      locador_id: locadorId,
      veiculo_id: formData.value.veiculo_id
    }
    await rentalStore.createRental(createData as CreateRentalData)
    if (!rentalStore.error) {
      showNotification('Locação criada com sucesso!', 'success')
      closeModal()
      await rentalStore.fetchRentals(rentalStore.currentPage, statusFilter.value === 'all' ? null : statusFilter.value)
    } else {
      showNotification(rentalStore.error, 'error')
    }
  }
}

async function deleteRental(id: number) {
  if (confirm('Tem certeza que deseja deletar esta locação?')) {
    await rentalStore.deleteRental(id)
    if (!rentalStore.error) {
      showNotification('Locação deletada com sucesso!', 'success')
      await rentalStore.fetchRentals(rentalStore.currentPage, statusFilter.value === 'all' ? null : statusFilter.value)
    } else {
      showNotification(rentalStore.error, 'error')
    }
  }
}

async function approveRental(id: number) {
  if (confirm('Aprovar esta locação?')) {
    await rentalStore.approveRental(id)
    if (!rentalStore.error) {
      showNotification('Locação aprovada com sucesso!', 'success')
      await rentalStore.fetchRentals(rentalStore.currentPage, statusFilter.value === 'all' ? null : statusFilter.value)
    } else {
      showNotification(rentalStore.error, 'error')
    }
  }
}

async function rejectRental(id: number) {
  if (confirm('Recusar esta locação?')) {
    await rentalStore.rejectRental(id)
    if (!rentalStore.error) {
      showNotification('Locação recusada com sucesso!', 'success')
      await rentalStore.fetchRentals(rentalStore.currentPage, statusFilter.value === 'all' ? null : statusFilter.value)
    } else {
      showNotification(rentalStore.error, 'error')
    }
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

async function getVehicleValorDiaria(veiculo_id: number): Promise<number> {
  const vehicleFromStore = vehicleStore.vehicles.find(v => v.id === veiculo_id)
  if (vehicleFromStore) {
    return vehicleFromStore.valor_diaria
  }

  const vehicleFromBackend = await vehicleStore.fetchVehicleById(veiculo_id)
  if (vehicleFromBackend) {
    return vehicleFromBackend.valor_diaria
  }

  return 0
}

async function updateFormTotal() {
  if (!formData.value.veiculo_id || !formData.value.data_inicio || !formData.value.data_fim) {
    formTotal.value = 0
    return
  }

  const valorDiaria = await getVehicleValorDiaria(formData.value.veiculo_id)
  if (valorDiaria === 0) {
    formTotal.value = 0
    return
  }

  const days = calculateDays(formData.value.data_inicio, formData.value.data_fim)
  formTotal.value = days * valorDiaria
}

function calculateTotal(veiculo_id: number, dataInicio: Date | string, dataFim: Date | string, veiculo?: { valor_diaria: number }): number {
  if (veiculo?.valor_diaria) {
    const days = calculateDays(dataInicio, dataFim)
    return days * veiculo.valor_diaria
  }

  const vehicle = vehicleStore.vehicles.find(v => v.id === veiculo_id)
  if (vehicle) {
    const days = calculateDays(dataInicio, dataFim)
    return days * vehicle.valor_diaria
  }

  return 0
}

function getRentalTotal(rental: Locacao): number {
  if (rental.valor_total) {
    return rental.valor_total
  }

  if (rental.veiculo?.valor_diaria) {
    return calculateTotal(rental.veiculo_id, rental.data_inicio, rental.data_fim, rental.veiculo)
  }

  return calculateTotal(rental.veiculo_id, rental.data_inicio, rental.data_fim)
}

watch([() => formData.value.veiculo_id, () => formData.value.data_inicio, () => formData.value.data_fim], () => {
  updateFormTotal()
})
</script>

<template>
  <v-container class="py-8">
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Locações de Veículos</h1>
          <p class="text-body2 text-disabled">Gerencie as solicitações e aprovações de aluguel</p>
        </div>
        <v-btn
          to="/"
          variant="outlined"
          prepend-icon="mdi-home"
          density="compact"
        >
          Home
        </v-btn>
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
          color="primary"
          prepend-icon="mdi-plus"
          density="compact"
          @click="openCreateModal"
        >
          {{ isCliente ? 'Nova Solicitação' : 'Nova Locação' }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Mensagens de Erro/Status -->
    <v-row v-if="rentalStore.loading" class="mb-4">
      <v-col cols="12">
        <v-progress-linear indeterminate></v-progress-linear>
      </v-col>
    </v-row>

    <!-- Notificação de Feedback -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type === 'success' ? 'success' : 'error'"
      location="top"
    >
      {{ notification.message }}
    </v-snackbar>

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
                R$ {{ getRentalTotal(rental).toFixed(2) }}
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
                <div class="d-flex gap-2" style="gap: 12px;">
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

    <v-row v-if="rentalStore.pagination && rentalStore.pagination.totalPages > 1" class="mt-4">
      <v-col cols="12" class="d-flex justify-center">
        <v-pagination
          v-model="rentalStore.currentPage"
          :length="rentalStore.pagination.totalPages"
          :total-visible="7"
          first-icon="mdi-chevron-double-left"
          prev-icon="mdi-chevron-left"
          next-icon="mdi-chevron-right"
          last-icon="mdi-chevron-double-right"
          @update:model-value="changePage"
        ></v-pagination>
      </v-col>
      <v-col cols="12" class="text-center">
        <p class="text-body2 text-disabled">
          Mostrando {{ ((rentalStore.currentPage - 1) * rentalStore.itemsPerPage) + 1 }} -
          {{ Math.min(rentalStore.currentPage * rentalStore.itemsPerPage, rentalStore.pagination?.total || 0) }}
          de {{ rentalStore.pagination?.total || 0 }} locações
        </p>
      </v-col>
    </v-row>

    <v-row v-else-if="filteredRentals.length === 0 && !rentalStore.loading">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="48" class="text-disabled mb-4">mdi-calendar-off</v-icon>
        <p class="text-body1 text-disabled">Nenhuma locação encontrada</p>
      </v-col>
    </v-row>

    <v-dialog v-model="showModal" max-width="600">
      <v-card>
        <v-card-title>
          {{ editingRental ? 'Editar Locação' : 'Nova Locação' }}
        </v-card-title>

        <v-card-text class="py-4">
          <v-form @submit.prevent="handleSubmit">
            <!-- Busca e Seleção de Veículo -->
            <v-text-field
              v-model="vehicleSearchTerm"
              label="Buscar veículo por modelo"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              placeholder="Digite o modelo do veículo"
              class="mb-2"
              :loading="vehicleSearchLoading"
            ></v-text-field>
            <v-select
              v-model.number="formData.veiculo_id"
              :items="availableVehiclesForSelect"
              item-title="modelo"
              item-value="id"
              label="Veículo"
              required
              density="compact"
              class="mb-3"
              :disabled="availableVehiclesForSelect.length === 0"
            >
              <template v-slot:selection="{ item }">
                {{ item.raw.marca }} {{ item.raw.modelo }}
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:title>
                    {{ item.raw.marca }} {{ item.raw.modelo }} - R$ {{ item.raw.valor_diaria.toFixed(2) }}/dia
                  </template>
                </v-list-item>
              </template>
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-title>
                    {{ vehicleSearchTerm ? 'Nenhum veículo encontrado' : 'Carregue veículos disponíveis' }}
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-select>

            <!-- Busca e Seleção de Cliente -->
            <template v-if="!isCliente">
              <v-text-field
                v-model="clienteSearchTerm"
                label="Buscar cliente por nome"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                placeholder="Digite o nome do cliente"
                class="mb-2"
                :loading="clienteSearchLoading"
              ></v-text-field>
              <v-select
                v-model.number="formData.cliente_id"
                :items="clientesForSelect"
                item-title="nome"
                item-value="id"
                label="Cliente"
                required
                density="compact"
                class="mb-3"
                :disabled="clientesForSelect.length === 0"
              >
                <template v-slot:selection="{ item }">
                  {{ item.raw.nome }}
                </template>
                <template v-slot:item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template v-slot:title>
                      {{ item.raw.nome }}
                    </template>
                    <template v-slot:subtitle v-if="item.raw.email">
                      {{ item.raw.email }}
                    </template>
                  </v-list-item>
                </template>
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-title>
                      {{ clienteSearchTerm ? 'Nenhum cliente encontrado' : 'Carregue clientes' }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </template>
            <v-text-field
              v-else
              :model-value="authStore.user?.nome || 'Cliente'"
              label="Cliente"
              readonly
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-select
              v-if="authStore.isAdmin && editingRental"
              v-model.number="formData.locador_id"
              :items="[{ id: 0, nome: 'Nenhum' }, ...userStore.locadorUsers, ...userStore.adminUsers.filter(u => u.id !== authStore.user?.id)]"
              item-title="nome"
              item-value="id"
              label="Locador"
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

            <v-card v-if="formData.veiculo_id && formData.data_inicio && formData.data_fim" class="mb-3" variant="outlined">
              <v-card-text>
                <div class="text-body2 mb-1">
                  <strong>Dias:</strong> {{ calculateDays(formData.data_inicio, formData.data_fim) }}
                </div>
                <div class="text-body2 font-weight-bold text-primary">
                  <strong>Total:</strong> R$ {{ formTotal.toFixed(2) }}
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
