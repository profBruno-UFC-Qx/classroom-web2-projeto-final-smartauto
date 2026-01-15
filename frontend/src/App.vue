<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const drawer = ref(false)

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <v-app>
    <v-app-bar v-if="isAuthenticated" color="primary" dark fixed height="56">
      <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none"></v-app-bar-nav-icon>
      
      <router-link to="/" class="text-decoration-none">
        <v-toolbar-title class="text-white text-h6">SmartAuto</v-toolbar-title>
      </router-link>
      
      <v-spacer></v-spacer>
      
      <div class="d-none d-md-flex ga-3 align-center">
        <router-link to="/veiculos" class="text-decoration-none text-white text-caption">
          Veículos
        </router-link>
        <router-link v-if="authStore.isAdmin || authStore.isFuncionario" to="/usuarios" class="text-decoration-none text-white text-caption">
          Usuários
        </router-link>
        <router-link v-if="authStore.isAdmin || authStore.isFuncionario" to="/locacoes" class="text-decoration-none text-white text-caption">
          Locações
        </router-link>
        <v-btn color="error" @click="logout" variant="outlined" size="x-small">
          Sair
        </v-btn>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-if="isAuthenticated" v-model="drawer" temporary>
      <v-list>
        <v-list-item>
          <v-list-item-title class="font-weight-bold">Menu</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item to="/veiculos" @click="drawer = false">
          <v-list-item-title>Veículos</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="authStore.isAdmin || authStore.isFuncionario" to="/usuarios" @click="drawer = false">
          <v-list-item-title>Usuários</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="authStore.isAdmin || authStore.isFuncionario" to="/locacoes" @click="drawer = false">
          <v-list-item-title>Locações</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="logout">
          <v-list-item-title>Sair</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="flex-grow-1">
      <RouterView />
    </v-main>
  </v-app>
</template>
