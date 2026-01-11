<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { Role } from '../types/Auth'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.user?.role === Role.ADMIN)
</script>

<template>
  <nav class="navigation-menu">
    <ul class="nav-list">
      <li v-if="isAuthenticated">
        <router-link
          to="/dashboard"
          active-class="active"
          class="nav-link"
        >
          Dashboard
        </router-link>
      </li>
      <li v-if="isAuthenticated">
        <router-link
          to="/veiculos"
          active-class="active"
          class="nav-link"
        >
          Veículos
        </router-link>
      </li>
      <li v-if="isAdmin">
        <router-link
          to="/usuarios"
          active-class="active"
          class="nav-link"
        >
          Usuários
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.navigation-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 0;
}

.nav-list li {
  margin: 0;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  display: block;
  transition: background-color 0.3s;
  border-bottom: 3px solid transparent;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: #3498db;
  border-bottom-color: #2980b9;
}

@media (max-width: 768px) {
  .navigation-menu {
    flex: none;
    width: 100%;
    order: 3;
  }

  .nav-list {
    flex-direction: column;
    width: 100%;
  }

  .nav-link {
    padding: 0.75rem 1rem;
  }
}
</style>
