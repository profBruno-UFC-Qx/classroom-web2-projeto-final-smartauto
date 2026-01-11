<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVeiculosStore } from '../../stores/veiculos'
import { useAuthStore } from '../../stores/auth'
import { Role } from '../../types/Auth'
import MainLayout from '../../layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const veiculosStore = useVeiculosStore()
const authStore = useAuthStore()

const error = ref<string | null>(null)

const veiculoId = computed(() => Number(route.params.id))
const veiculo = computed(() => veiculosStore.currentVeiculo)
const loading = computed(() => veiculosStore.loading)

const canEdit = computed(() => {
  const role = authStore.user?.role
  return role === Role.ADMIN || role === Role.LOCADOR
})

async function loadVeiculo() {
  try {
    error.value = null
    await veiculosStore.fetchById(veiculoId.value)
  } catch {
    error.value = 'Erro ao carregar dados do veículo'
  }
}

async function deleteVeiculo() {
  if (!confirm('Tem certeza que deseja excluir este veículo?')) {
    return
  }

  try {
    error.value = null
    await veiculosStore.remove(veiculoId.value)
    await router.push('/veiculos')
  } catch {
    error.value = 'Erro ao excluir veículo'
  }
}

onMounted(() => {
  loadVeiculo()
})
</script>

<template>
  <main-layout>
    <div class="detalhes-container">
      <div v-if="loading" class="loading">
        <p>Carregando informações do veículo...</p>
      </div>

      <div v-else-if="error" class="error-section">
        <div class="alert alert-error">
          {{ error }}
        </div>
        <router-link to="/veiculos" class="btn btn-secondary">
          ← Voltar
        </router-link>
      </div>

      <div v-else-if="veiculo" class="veiculo-details">
        <div class="header">
          <div>
            <h1>{{ veiculo.marca }} {{ veiculo.modelo }}</h1>
            <span :class="['status-badge', veiculo.disponivel ? 'available' : 'unavailable']">
              {{ veiculo.disponivel ? 'Disponível' : 'Indisponível' }}
            </span>
          </div>
          <div class="header-actions" v-if="canEdit">
            <router-link
              :to="`/veiculos/${veiculo.id}/editar`"
              class="btn btn-warning"
            >
              Editar
            </router-link>
            <button
              @click="deleteVeiculo"
              class="btn btn-danger"
            >
              Excluir
            </button>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-card">
            <h2>Informações do Veículo</h2>
            <div class="detail-row">
              <span class="label">ID:</span>
              <span class="value">{{ veiculo.id }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Marca:</span>
              <span class="value">{{ veiculo.marca }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Modelo:</span>
              <span class="value">{{ veiculo.modelo }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Ano:</span>
              <span class="value">{{ veiculo.ano }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Cor:</span>
              <span class="value">{{ veiculo.cor }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Valor da Diária:</span>
              <span class="value price">R$ {{ veiculo.valor_diaria.toFixed(2) }}</span>
            </div>
          </div>

          <div class="details-card">
            <h2>Ações</h2>
            <div class="actions-section">
              <p v-if="veiculo.disponivel" class="info-message">
                Este veículo está disponível para aluguel.
              </p>
              <p v-else class="warning-message">
                Este veículo não está disponível no momento.
              </p>
              <router-link to="/veiculos" class="btn btn-secondary">
                ← Voltar para Lista
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-data">
        <p>Veículo não encontrado.</p>
        <router-link to="/veiculos" class="btn btn-secondary">
          ← Voltar
        </router-link>
      </div>
    </div>
  </main-layout>
</template>

<style scoped>
.detalhes-container {
  padding: 0;
}

.loading,
.no-data {
  padding: 3rem;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
}

.error-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.veiculo-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #ddd;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 2rem;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.status-badge.available {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.unavailable {
  background-color: #f8d7da;
  color: #721c24;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.details-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.details-card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.2rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  font-weight: 600;
  color: #666;
}

.detail-row .value {
  color: #333;
  text-align: right;
}

.detail-row .price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #28a745;
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-message,
.warning-message {
  margin: 0;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.95rem;
}

.info-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.warning-message {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.btn {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.95rem;
  display: inline-block;
  text-align: center;
  transition: background-color 0.3s;
}

.btn-secondary {
  background-color: #17a2b8;
  color: white;
  width: 100%;
}

.btn-secondary:hover {
  background-color: #138496;
}

.btn-warning {
  background-color: #ffc107;
  color: #333;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .detail-row .value {
    text-align: left;
  }
}
</style>
