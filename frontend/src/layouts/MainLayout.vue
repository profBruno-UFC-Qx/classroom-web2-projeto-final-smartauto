<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
</script>

<template>
  <div class="main-layout d-flex flex-column w-100">
    <AppHeader />
    <v-main class="bg-light flex-grow-1 w-100">
      <v-container fluid class="pa-0">
        <slot />
      </v-container>
    </v-main>
    <AppFooter />
  </div>
</template>

<style scoped>
:deep(.bg-light) {
  background-color: #f5f5f5;
  width: 100%;
}
</style>
