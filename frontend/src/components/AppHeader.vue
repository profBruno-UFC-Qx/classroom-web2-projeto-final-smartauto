<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import NavMenu from './NavigationMenu.vue'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <v-app-bar color="primary" dark class="app-header">
    <template v-slot:prepend>
      <router-link to="/" class="logo text-white text-decoration-none d-flex align-center">
        <span class="logo-text">SmartAuto</span>
      </router-link>
    </template>

    <v-spacer class="hidden-xs-only" />

    <nav-menu class="hidden-sm-and-down" />

    <v-spacer class="hidden-xs-only" />

    <template v-if="authStore.isAuthenticated">
      <span class="mr-2">{{ authStore.user?.nome }}</span>
      <v-btn variant="tonal" @click="logout" class="text-white">
        Logout
      </v-btn>
    </template>

    <template v-else>
      <v-btn text to="/login" class="text-white">
        Login
      </v-btn>
      <v-btn color="secondary" to="/register" class="ml-2">
        Cadastro
      </v-btn>
    </template>
  </v-app-bar>
</template>

<style scoped>
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  white-space: nowrap;
}

.logo-text {
  color: #ffd700;
  margin-right: 0.5rem;
}
</style>
