<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.nome || 'Usuário')
</script>

<template>
  <v-container fluid class="home-container">
    <!-- Background decorativo com carros -->
    <div class="background-cars">
      <div class="car car-1">🚗</div>
      <div class="car car-2">🚙</div>
      <div class="car car-3">🚕</div>
      <div class="car car-4">🚓</div>
      <div class="car car-5">🏎️</div>
    </div>

    <div class="hero-section">
      <div class="hero-content">
        <v-icon class="hero-icon">mdi-car-sports</v-icon>
        
        <h1 class="hero-title">
          {{ isAuthenticated ? `Olá, ${userName}!` : 'Bem-vindo ao SmartAuto' }}
        </h1>
        
        <p class="hero-subtitle">
          {{ isAuthenticated 
            ? 'Explore nossos veículos e gerencie suas locações' 
            : 'Plataforma de locação de veículos' 
          }}
        </p>

        <div class="action-buttons">
          <template v-if="isAuthenticated">
            <router-link to="/veiculos" class="link-button">
              <v-btn class="btn-primary">
                Ver Veículos
              </v-btn>
            </router-link>
            <router-link to="/locacoes" class="link-button">
              <v-btn class="btn-secondary">
                Minhas Locações
              </v-btn>
            </router-link>
          </template>
          
          <template v-else>
            <router-link to="/register" class="link-button">
              <v-btn class="btn-primary">
                Cadastrar
              </v-btn>
            </router-link>
            <router-link to="/login" class="link-button">
              <v-btn class="btn-secondary">
                Entrar
              </v-btn>
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Background com carros decorativos */
.background-cars {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 0;
}

.car {
  position: absolute;
  font-size: 4rem;
  opacity: 0.08;
  animation: driftCar 20s infinite linear;
}

.car-1 {
  top: 10%;
  left: -100px;
  font-size: 3.5rem;
  animation: driftCar 25s infinite linear;
}

.car-2 {
  top: 30%;
  right: -100px;
  font-size: 4rem;
  animation: driftCarReverse 30s infinite linear;
}

.car-3 {
  bottom: 20%;
  left: -80px;
  font-size: 3.8rem;
  animation: driftCar 28s infinite linear;
}

.car-4 {
  top: 50%;
  right: -120px;
  font-size: 4.2rem;
  animation: driftCarReverse 35s infinite linear;
}

.car-5 {
  bottom: 10%;
  left: -100px;
  font-size: 3.5rem;
  animation: driftCar 32s infinite linear;
}

@keyframes driftCar {
  from {
    transform: translateX(-100px);
  }
  to {
    transform: translateX(calc(100vw + 200px));
  }
}

@keyframes driftCarReverse {
  from {
    transform: translateX(calc(100vw + 200px));
  }
  to {
    transform: translateX(-100px);
  }
}

.home-container::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
  z-index: 0;
}

.home-container::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  bottom: -50px;
  left: -50px;
  animation: float 8s ease-in-out infinite reverse;
  z-index: 0;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(30px);
  }
}

.hero-section {
  width: 100%;
  padding: 1rem 1rem 2rem;
  position: relative;
  z-index: 1;
  margin-top: -18vh;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.hero-icon {
  font-size: 5.5rem;
  color: white;
  margin-bottom: 1.2rem;
  opacity: 0.95;
  display: block;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.7rem;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 2rem;
  line-height: 1.6;
  font-weight: 400;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 0.5rem;
}

.link-button {
  text-decoration: none;
  display: flex;
}

.btn-primary,
.btn-secondary {
  padding: 0.95rem 2.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 10px;
  text-transform: none;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-width: 160px;
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.btn-primary {
  background: white !important;
  color: #667eea !important;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.btn-primary:active {
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.18) !important;
  color: white !important;
  border: 2.5px solid white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.28) !important;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.btn-secondary:active {
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .car {
    font-size: 2.5rem;
  }

  .car-1, .car-2, .car-3, .car-4, .car-5 {
    font-size: 2.5rem;
  }

  .hero-section {
    margin-top: -8vh;
  }

  .hero-icon {
    font-size: 4.5rem;
    margin-bottom: 1rem;
  }

  .hero-title {
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 1.8rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    gap: 0.8rem;
  }

  .link-button {
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    min-width: auto;
    padding: 0.9rem 2rem;
    font-size: 1rem;
  }
}
</style>