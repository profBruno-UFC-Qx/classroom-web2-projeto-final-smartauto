<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useVeiculosStore } from '../stores/veiculos'
import { Role } from '../types/Auth'
import MainLayout from '../layouts/MainLayout.vue'

const authStore = useAuthStore()
const veiculosStore = useVeiculosStore()

const isAdmin = computed(() => authStore.user?.role === Role.ADMIN)
const canCreate = computed(() => {
  const role = authStore.user?.role
  return role === Role.ADMIN || role === Role.LOCADOR
})

const userRole = computed(() => {
  const role = authStore.user?.role
  switch (role) {
    case Role.ADMIN:
      return 'Administrador'
    case Role.LOCADOR:
      return 'Locador'
    case Role.CLIENTE:
      return 'Cliente'
    default:
      return 'Desconhecido'
  }
})

// Dados fictícios - em uma aplicação real, viriam do backend
const totalVeiculos = computed(() => veiculosStore.total || 0)
const veiculosDisponiveis = computed(() => {
  return veiculosStore.veiculos.filter(v => v.disponivel).length
})

const percentualDisponibilidade = computed(() => {
  if (totalVeiculos.value === 0) return 0
  return Math.round((veiculosDisponiveis.value / totalVeiculos.value) * 100)
})

// Dados fictícios para usuários
const totalUsuarios = 15
</script>

<template>
  <main-layout>
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <p class="welcome-message">Bem-vindo, {{ authStore.user?.nome }}!</p>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total de Veículos</h3>
          <p class="stat-value">{{ totalVeiculos }}</p>
          <router-link to="/veiculos" class="stat-link">
            Ver Veículos →
          </router-link>
        </div>

        <div class="stat-card">
          <h3>Veículos Disponíveis</h3>
          <p class="stat-value available">{{ veiculosDisponiveis }}</p>
          <p class="stat-percentage">{{ percentualDisponibilidade }}%</p>
        </div>

        <div v-if="isAdmin" class="stat-card">
          <h3>Total de Usuários</h3>
          <p class="stat-value">{{ totalUsuarios }}</p>
          <router-link to="/usuarios" class="stat-link">
            Gerenciar Usuários →
          </router-link>
        </div>

        <div class="stat-card">
          <h3>Seu Perfil</h3>
          <p class="stat-value">{{ userRole }}</p>
          <p class="stat-info">{{ authStore.user?.email }}</p>
        </div>
      </div>

      <div class="actions-section">
        <h2>Ações Rápidas</h2>
        <div class="actions-grid">
          <router-link to="/veiculos" class="action-card">
            <h3>📋 Listar Veículos</h3>
            <p>Visualize todos os veículos cadastrados</p>
          </router-link>
          <router-link to="/veiculos/novo" class="action-card" v-if="canCreate">
            <h3>➕ Novo Veículo</h3>
            <p>Cadastre um novo veículo no sistema</p>
          </router-link>
          <router-link to="/usuarios" class="action-card" v-if="isAdmin">
            <h3>👥 Gerenciar Usuários</h3>
            <p>Controle os usuários do sistema</p>
          </router-link>
          <router-link to="/usuarios/novo" class="action-card" v-if="isAdmin">
            <h3>➕ Novo Usuário</h3>
            <p>Adicione um novo usuário</p>
          </router-link>
        </div>
      </div>
    </div>
  </main-layout>
</template>

<style scoped>
.dashboard-container {
  padding: 0;
}

.dashboard-container h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.welcome-message {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3498db;
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.available {
  color: #28a745;
}

.stat-percentage {
  margin: 0.5rem 0 0 0;
  color: #95a5a6;
  font-size: 0.9rem;
}

.stat-info {
  margin: 0.5rem 0 0 0;
  color: #95a5a6;
  font-size: 0.85rem;
}

.stat-link {
  display: inline-block;
  margin-top: 1rem;
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.stat-link:hover {
  color: #2980b9;
}

.actions-section {
  margin-top: 3rem;
}

.actions-section h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s, box-shadow 0.3s;
  border-top: 4px solid #3498db;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.action-card h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 1.1rem;
}

.action-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
