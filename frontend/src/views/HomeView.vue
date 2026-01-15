<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <v-container fluid class="home-container">
    <v-row class="h-100">
      <v-col cols="12" xs="11" sm="10" md="8" lg="6" class="mx-auto align-self-center">
        <v-card class="gradient-card pa-4 pa-md-8" elevation="10">
          <h1 class="mb-4 text-center">Bem-vindo ao SmartAuto</h1>
          <p class="subtitle mb-8 text-center">Plataforma de gerenciamento de locação de veículos</p>
          
          <v-row class="gap-4 d-flex justify-center flex-column">
            <!-- Se autenticado -->
            <template v-if="isAuthenticated">
              <v-col cols="12">
                <router-link to="/veiculos" class="text-decoration-none">
                  <v-btn color="primary" size="large" block>
                    Ver Veículos
                  </v-btn>
                </router-link>
              </v-col>
              <v-col cols="12">
                <router-link to="/locacoes" class="text-decoration-none">
                  <v-btn color="secondary" size="large" block>
                    Minhas Locações
                  </v-btn>
                </router-link>
              </v-col>
            </template>
            
            <!-- Se não autenticado -->
            <template v-else>
              <v-col cols="12">
                <router-link to="/login" class="text-decoration-none">
                  <v-btn color="primary" size="large" block>
                    Login
                  </v-btn>
                </router-link>
              </v-col>
              <v-col cols="12">
                <router-link to="/register" class="text-decoration-none">
                  <v-btn color="secondary" size="large" block>
                    Cadastro
                  </v-btn>
                </router-link>
              </v-col>
            </template>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.gradient-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
}

@media (max-width: 600px) {
  h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }
}
</style>
