<template>
  <main-layout>
    <v-container fluid class="pa-0 h-100">
      <!-- Hero Section -->
      <v-row class="hero-section" no-gutters>
        <v-col cols="12" class="d-flex align-center justify-center">
          <div class="hero-content text-center">
            <h1 class="text-h2 text-white mb-4">Bem-vindo ao SmartAuto</h1>
            <p class="text-h6 text-white mb-6">Sistema de Gerenciamento de Locação de Veículos</p>
            <div class="hero-actions">
              <template v-if="!isAuthenticated">
                <v-btn to="/login" color="success" size="large" class="mr-3">
                  Fazer Login
                </v-btn>
                <v-btn to="/register" color="info" size="large">
                  Criar Conta
                </v-btn>
              </template>
              <template v-else>
                <v-btn to="/veiculos" color="success" size="large" class="mr-3">
                  Ver Veículos
                </v-btn>
                <v-btn v-if="isAdmin" to="/usuarios" color="info" size="large">
                  Gerenciar Usuários
                </v-btn>
              </template>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Features Section -->
      <v-row class="py-12 px-4">
        <v-col cols="12" class="text-center mb-8">
          <h2 class="text-h3 text-grey-darken-3">Características</h2>
        </v-col>

        <v-col v-for="(feature, index) in features" :key="index" cols="12" md="6" lg="4" class="mb-4">
          <v-card class="h-100 feature-card" elevation="1">
            <v-card-title class="text-h6">{{ feature.title }}</v-card-title>
            <v-card-text>{{ feature.description }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- CTA Section -->
      <v-row v-if="!isAuthenticated" class="cta-section py-12 px-4" no-gutters>
        <v-col cols="12" class="text-center">
          <h2 class="text-h3 mb-4">Comece Agora</h2>
          <p class="text-h6 mb-6">Junte-se a milhares de usuários que usam o SmartAuto para gerenciar seus veículos.</p>
          <v-btn to="/register" color="primary" size="x-large">
            Criar Conta Grátis
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </main-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { Role } from '../types/Auth'
import MainLayout from '../layouts/MainLayout.vue'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.user?.role === Role.ADMIN)

const features = [
  {
    title: '🚗 Gerenciamento de Veículos',
    description: 'Cadastre, edite e visualize todos os seus veículos em um único lugar. Mantenha informações atualizadas sobre marca, modelo, cor e disponibilidade.'
  },
  {
    title: '👥 Controle de Usuários',
    description: 'Gerencie diferentes tipos de usuários com diferentes níveis de permissão. Apenas administradores podem acessar recursos avançados.'
  },
  {
    title: '🔐 Autenticação Segura',
    description: 'Sua conta é protegida com autenticação JWT. Faça login e acesse de forma segura seus dados e serviços.'
  },
  {
    title: '💰 Pricing Dinâmico',
    description: 'Defina preços de diária para cada veículo. O sistema permite gerenciar valores de aluguel de forma flexível.'
  },
  {
    title: '📱 Interface Responsiva',
    description: 'Acesse o sistema de qualquer dispositivo. Interface moderna e adaptada para desktop, tablet e mobile.'
  },
  {
    title: '🔍 Busca e Filtros',
    description: 'Encontre veículos rapidamente com nossa busca inteligente e filtros avançados por disponibilidade.'
  }
]
</script>

<style scoped>
.hero-section {
  min-height: 50vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.hero-content {
  max-width: 800px;
  width: 100%;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-card {
  transition: all 0.3s ease;
  background: white;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.cta-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
