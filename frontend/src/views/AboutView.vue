<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <v-container class="py-12">
    <v-row class="mb-8">
      <v-col cols="12" class="text-center">
        <h1 class="text-h2 font-weight-bold mb-4">SmartAuto</h1>
        <p class="text-h6 text-disabled">Sistema de Aluguel de Veículos</p>
      </v-col>
    </v-row>

    <v-row class="mb-12">
      <v-col cols="12" md="6">
        <v-card class="h-100" variant="outlined">
          <v-card-title>Sobre o Projeto</v-card-title>
          <v-card-text>
            <p class="mb-4">
              O SmartAuto é um sistema completo de aluguel de veículos desenvolvido como projeto final de Full Stack Development.
            </p>
            <p class="mb-4">
              A plataforma facilita a visualização do catálogo de veículos disponíveis e o gerenciamento das locações de forma segura e eficiente.
            </p>
            <p>
              Desenvolvido com tecnologias modernas e boas práticas de engenharia de software, o sistema oferece uma experiência de usuário intuitiva e responsiva.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="h-100" variant="outlined">
          <v-card-title>Tecnologias Utilizadas</v-card-title>
          <v-card-text>
            <div class="mb-3">
              <strong>Frontend:</strong>
              <ul class="ml-4 mt-2 text-body2">
                <li>Vue 3 com Composition API</li>
                <li>Vue Router para navegação</li>
                <li>Pinia para gerenciamento de estado</li>
                <li>Vuetify 3 para componentes UI</li>
                <li>TypeScript para type safety</li>
              </ul>
            </div>
            <div>
              <strong>Backend:</strong>
              <ul class="ml-4 mt-2 text-body2">
                <li>Node.js com Express</li>
                <li>TypeORM para ORM</li>
                <li>SQLite para banco de dados</li>
                <li>TypeScript</li>
              </ul>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-12">
      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-title>Funcionalidades</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center mb-4">
                  <v-icon size="48" color="primary" class="mb-2">mdi-car</v-icon>
                  <h4 class="text-subtitle2 font-weight-bold">Catálogo de Veículos</h4>
                  <p class="text-body2 text-disabled">Browse nossos veículos disponíveis</p>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center mb-4">
                  <v-icon size="48" color="warning" class="mb-2">mdi-calendar-check</v-icon>
                  <h4 class="text-subtitle2 font-weight-bold">Locações</h4>
                  <p class="text-body2 text-disabled">Solicite e gerencie aluguel</p>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center mb-4">
                  <v-icon size="48" color="success" class="mb-2">mdi-security</v-icon>
                  <h4 class="text-subtitle2 font-weight-bold">Autenticação JWT</h4>
                  <p class="text-body2 text-disabled">Segurança em primeiro lugar</p>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center mb-4">
                  <v-icon size="48" color="info" class="mb-2">mdi-account-multiple</v-icon>
                  <h4 class="text-subtitle2 font-weight-bold">Multi-papéis</h4>
                  <p class="text-body2 text-disabled">Admin, Locador, Cliente</p>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="text-center">
        <h3 class="text-h5 font-weight-bold mb-6">Comece Agora</h3>
        <div class="d-flex gap-4 justify-center flex-wrap">
          <router-link v-if="!isAuthenticated" to="/login" class="text-decoration-none">
            <v-btn color="primary" size="large">
              <v-icon left>mdi-login</v-icon>
              Fazer Login
            </v-btn>
          </router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="text-decoration-none">
            <v-btn color="secondary" variant="outlined" size="large">
              <v-icon left>mdi-account-plus</v-icon>
              Cadastre-se
            </v-btn>
          </router-link>
          <router-link v-if="isAuthenticated" to="/veiculos" class="text-decoration-none">
            <v-btn color="primary" size="large">
              <v-icon left>mdi-car</v-icon>
              Ver Veículos
            </v-btn>
          </router-link>
        </div>
      </v-col>
    </v-row>

    <v-divider class="my-12"></v-divider>

    <v-row>
      <v-col cols="12" class="text-center">
        <p class="text-body2 text-disabled">
          SmartAuto &copy; 2025 - Projeto Final de Full Stack Development
        </p>
        <p class="text-caption text-disabled">
          Desenvolvido com Vue 3, Node.js e TypeScript
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>
