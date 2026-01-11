<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>SmartAuto</h3>
        <p>Sistema de gerenciamento de aluguel de veículos</p>
      </div>
      <div class="footer-section">
        <h4>Links Rápidos</h4>
        <ul>
          <li><router-link to="/">Início</router-link></li>
          <li v-if="!isAuthenticated"><router-link to="/login">Login</router-link></li>
          <li v-if="!isAuthenticated"><router-link to="/register">Cadastro</router-link></li>
          <li v-if="isAuthenticated"><router-link to="/veiculos">Veículos</router-link></li>
        </ul>
      </div>
      <!-- <div class="footer-section">
        <h4>Contato</h4>
        <p>
          <a href="mailto:info@smartauto.com">info@smartauto.com</a><br />
          <a href="tel:+55-00-0000-0000">(00) 0000-0000</a>
        </p>
      </div> -->
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} SmartAuto. Todos os direitos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #2c3e50;
  color: white;
  margin-top: auto;
  border-top: 4px solid #3498db;
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-top: 0;
  color: #3498db;
}

.footer-section h3 {
  font-size: 1.3rem;
}

.footer-section h4 {
  font-size: 1rem;
}

.footer-section p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #ecf0f1;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #3498db;
}

.footer-bottom {
  background-color: #1a252f;
  padding: 1.5rem 2rem;
  text-align: center;
  border-top: 1px solid #34495e;
}

.footer-bottom p {
  margin: 0;
  font-size: 0.9rem;
  color: #95a5a6;
}

@media (max-width: 768px) {
  .footer-content {
    padding: 2rem 1rem;
    grid-template-columns: 1fr;
  }

  .footer-bottom {
    padding: 1rem;
  }
}
</style>
