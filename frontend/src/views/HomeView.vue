<script setup lang="ts">
</script>

<template>
  <v-container fluid class="h-100 d-flex align-center justify-center px-3 px-sm-4 pt-16">
    <v-row class="w-100">
      <v-col cols="12" sm="10" md="8" lg="6" class="mx-auto">
        <v-card class="gradient-card pa-6 pa-sm-8" elevation="10">
          <h1 class="mb-4 text-center">Bem-vindo ao SmartAuto</h1>
          <p class="subtitle mb-8 text-center">Plataforma de gerenciamento de locação de veículos</p>
          
          <v-row class="gap-4 d-flex justify-center flex-column">
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
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
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
</style>
