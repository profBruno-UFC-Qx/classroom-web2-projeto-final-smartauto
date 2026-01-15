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

function getStatusBadge(status: string) {
  const badges = {
    disponivel: { class: 'status-disponivel', text: 'Disponível' },
    locado: { class: 'status-locado', text: 'Locado' },
    manutencao: { class: 'status-manutencao', text: 'Manutenção' }
  }
  return badges[status as keyof typeof badges] || badges.disponivel
}

async function changePage(newPage: number) {
  await vehicleStore.fetchVehicles(newPage)
}
</script>

<template>
  <div class="vehicles-container">
    <header class="header">
      <h1>Veículos</h1>
      <button v-if="canManage" @click="openCreateModal" class="btn-primary">
        + Novo Veículo
      </button>
    </header>

    <div v-if="vehicleStore.loading" class="loading">
      Carregando veículos...
    </div>

    <div v-else-if="vehicleStore.error" class="error">
      {{ vehicleStore.error }}
    </div>

    <div v-else class="vehicles-grid">
      <div v-for="vehicle in vehicleStore.vehicles" :key="vehicle.id" class="vehicle-card">
        <div class="vehicle-header">
          <h3>{{ vehicle.marca }} {{ vehicle.modelo }}</h3>
          <span :class="['status-badge', getStatusBadge(vehicle.status).class]">
            {{ getStatusBadge(vehicle.status).text }}
          </span>
        </div>
        
        <div class="vehicle-details">
          <p><strong>Ano:</strong> {{ vehicle.ano }}</p>
          <p><strong>Placa:</strong> {{ vehicle.placa }}</p>
          <p v-if="vehicle.cor"><strong>Cor:</strong> {{ vehicle.cor }}</p>
          <p><strong>Diária:</strong> R$ {{ vehicle.valor_diaria.toFixed(2) }}</p>
        </div>

        <div v-if="canManage" class="vehicle-actions">
          <button @click="openEditModal(vehicle)" class="btn-edit">
            Editar
          </button>
          <button @click="vehicle.id && handleDelete(vehicle.id)" class="btn-delete" :disabled="!vehicle.id">
            Excluir
          </button>
        </div>
      </div>
    </div>

    <div v-if="vehicleStore.totalPages > 1" class="pagination">
      <button 
        @click="changePage(vehicleStore.page - 1)" 
        :disabled="vehicleStore.page === 1"
        class="btn-page"
      >
        Anterior
      </button>
      <span class="page-info">
        Página {{ vehicleStore.page }} de {{ vehicleStore.totalPages }}
      </span>
      <button 
        @click="changePage(vehicleStore.page + 1)" 
        :disabled="vehicleStore.page === vehicleStore.totalPages"
        class="btn-page"
      >
        Próxima
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ editingVehicle ? 'Editar Veículo' : 'Novo Veículo' }}</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label for="marca">Marca *</label>
              <input id="marca" v-model="formData.marca" required />
            </div>
            <div class="form-group">
              <label for="modelo">Modelo *</label>
              <input id="modelo" v-model="formData.modelo" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="ano">Ano *</label>
              <input id="ano" v-model.number="formData.ano" type="number" required />
            </div>
            <div class="form-group">
              <label for="placa">Placa *</label>
              <input id="placa" v-model="formData.placa" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="cor">Cor</label>
              <input id="cor" v-model="formData.cor" />
            </div>
            <div class="form-group">
              <label for="quilometragem">Quilometragem</label>
              <input id="quilometragem" v-model.number="formData.quilometragem" type="number" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="valor_diaria">Valor Diária *</label>
              <input id="valor_diaria" v-model.number="formData.valor_diaria" type="number" step="0.01" required />
            </div>
            <div class="form-group">
              <label for="status">Status *</label>
              <select id="status" v-model="formData.status" required>
                <option value="disponivel">Disponível</option>
                <option value="locado">Locado</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="categoria">Categoria *</label>
            <select id="categoria" v-model.number="formData.categoria_id" required>
              <option v-for="cat in vehicleStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.nome }}
              </option>
            </select>
          </div>

          <div v-if="vehicleStore.error" class="error-message">
            {{ vehicleStore.error }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-submit" :disabled="vehicleStore.loading">
              {{ vehicleStore.loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vehicles-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  color: #2d3748;
  margin: 0;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #5568d3;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.error {
  color: #c53030;
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.vehicle-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.vehicle-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.vehicle-header h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-disponivel {
  background: #c6f6d5;
  color: #22543d;
}

.status-locado {
  background: #fed7d7;
  color: #742a2a;
}

.status-manutencao {
  background: #feebc8;
  color: #7c2d12;
}

.vehicle-details {
  margin-bottom: 1rem;
}

.vehicle-details p {
  margin: 0.5rem 0;
  color: #4a5568;
}

.vehicle-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn-edit {
  background: #48bb78;
  color: white;
}

.btn-delete {
  background: #f56565;
  color: white;
}

.btn-edit:hover, .btn-delete:hover {
  opacity: 0.8;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-page {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #4a5568;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3748;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-cancel {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-submit {
  background: #667eea;
  color: white;
}

.btn-cancel:hover, .btn-submit:hover {
  opacity: 0.8;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
