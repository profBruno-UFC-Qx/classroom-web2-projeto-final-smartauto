<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const userName = computed(() => authStore.user?.nome || 'Visitante')
const isAuthenticated = computed(() => authStore.isAuthenticated)

function navigateTo(route: string) {
  router.push(route)
}
</script>

<template>
  <div class="home">
    <header class="hero">
      <h1>SmartAuto</h1>
      <p>Sistema de Locação de Veículos</p>
    </header>

    <section class="welcome">
      <h2>Bem-vindo, {{ userName }}!</h2>
      
      <div v-if="isAuthenticated" class="actions">
        <button @click="navigateTo('/veiculos')" class="btn-primary">
          Ver Veículos Disponíveis
        </button>
        <button v-if="authStore.isAdmin || authStore.isFuncionario" 
                @click="navigateTo('/usuarios')" 
                class="btn-secondary">
          Gerenciar Usuários
        </button>
        <button v-if="authStore.isAdmin || authStore.isFuncionario" 
                @click="navigateTo('/locacoes')" 
                class="btn-secondary">
          Gerenciar Locações
        </button>
      </div>

      <div v-else class="actions">
        <button @click="navigateTo('/login')" class="btn-primary">
          Entrar
        </button>
        <button @click="navigateTo('/register')" class="btn-secondary">
          Criar Conta
        </button>
      </div>
    </section>

    <section class="features">
      <div class="feature">
        <h3>🚗 Veículos Modernos</h3>
        <p>Frota completa e atualizada</p>
      </div>
      <div class="feature">
        <h3>⚡ Reserva Rápida</h3>
        <p>Processo simplificado e ágil</p>
      </div>
      <div class="feature">
        <h3>🔒 Segurança</h3>
        <p>Sistema seguro e confiável</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin: 0;
}

.hero p {
  font-size: 1.2rem;
  margin: 0.5rem 0 0 0;
}

.welcome {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #48bb78;
  color: white;
}

.btn-secondary:hover {
  background: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature {
  text-align: center;
  padding: 2rem;
  background: #f7fafc;
  border-radius: 8px;
  transition: transform 0.2s;
}

.feature:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.feature p {
  color: #718096;
}
</style>
