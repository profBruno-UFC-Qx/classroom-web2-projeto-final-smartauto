<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.nome || 'Usuário')
const drawer = ref(false)

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <v-app>
    <v-app-bar v-if="isAuthenticated" color="primary" dark sticky class="px-4">
      <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none"></v-app-bar-nav-icon>

      <router-link to="/" class="text-decoration-none d-flex align-center gap-2">
        <v-icon>mdi-car</v-icon>
        <v-toolbar-title class="text-white">SmartAuto</v-toolbar-title>
      </router-link>

      <v-spacer></v-spacer>

      <div class="d-none d-md-flex ga-2 align-center">
        <router-link to="/veiculos" class="text-decoration-none text-white">
          <v-btn variant="text" size="small">Veículos</v-btn>
        </router-link>

        <router-link v-if="isAuthenticated" to="/locacoes" class="text-decoration-none text-white">
          <v-btn variant="text" size="small">Locações</v-btn>
        </router-link>

        <router-link v-if="authStore.isAdmin || authStore.isLocador" to="/usuarios" class="text-decoration-none text-white">
          <v-btn variant="text" size="small">Usuários</v-btn>
        </router-link>

        <v-divider vertical class="mx-2"></v-divider>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="text" size="small" class="text-white">
              {{ userName }}
              <v-icon size="small" class="ml-1">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item disabled>
              <v-list-item-title>{{ authStore.user?.email }}</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="logout">
              <v-list-item-title>Sair</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-if="isAuthenticated" v-model="drawer" temporary>
      <v-list>
        <v-list-item :title="userName" :subtitle="authStore.user?.email">
          <template v-slot:prepend>
            <v-avatar color="primary">{{ userName.charAt(0).toUpperCase() }}</v-avatar>
          </template>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <router-link to="/veiculos" class="text-decoration-none" @click="drawer = false">
          <v-list-item title="Veículos" prepend-icon="mdi-car"></v-list-item>
        </router-link>

        <router-link v-if="authStore.isAdmin || authStore.isLocador" to="/locacoes" class="text-decoration-none" @click="drawer = false">
          <v-list-item title="Locações" prepend-icon="mdi-calendar"></v-list-item>
        </router-link>

        <router-link v-if="authStore.isAdmin || authStore.isLocador" to="/usuarios" class="text-decoration-none" @click="drawer = false">
          <v-list-item title="Usuários" prepend-icon="mdi-account-multiple"></v-list-item>
        </router-link>

        <v-divider class="my-2"></v-divider>

        <v-list-item title="Sair" prepend-icon="mdi-logout" @click="logout"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="flex-grow-1">
      <RouterView />
    </v-main>

    <v-footer v-if="isAuthenticated" class="text-center py-4 bg-surface">
      <div class="w-100">
        <p class="text-caption text-disabled mb-0">SmartAuto &copy; 2025 - Sistema de Aluguel de Veículos</p>
      </div>
    </v-footer>
  </v-app>
</template>
