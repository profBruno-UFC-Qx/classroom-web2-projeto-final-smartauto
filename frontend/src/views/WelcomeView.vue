<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVehicleStore } from '@/stores/vehicles'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()

const vehicleStore = useVehicleStore()
const authStore = useAuthStore()

const currentIndex = ref(0)
const autoPlayInterval = ref<number | null>(null)

const availableVehicles = computed(() =>
  vehicleStore.vehicles.filter(v => v.disponivel)
)

const hasVehicles = computed(() => availableVehicles.value.length > 0)

onMounted(async () => {
  // Buscar apenas veículos disponíveis para o carrossel
  await vehicleStore.fetchAllVehicles()
  startAutoPlay()
})

// Auto-play do carrossel
function startAutoPlay() {
  if (hasVehicles.value && availableVehicles.value.length > 1) {
    autoPlayInterval.value = window.setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % availableVehicles.value.length
    }, 5000) // Muda de slide a cada 5 segundos
  }
}

function stopAutoPlay() {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
    autoPlayInterval.value = null
  }
}

function goToSlide(index: number) {
  currentIndex.value = index
  stopAutoPlay()
  startAutoPlay()
}

function nextSlide() {
  if (hasVehicles.value) {
    currentIndex.value = (currentIndex.value + 1) % availableVehicles.value.length
    stopAutoPlay()
    startAutoPlay()
  }
}

function prevSlide() {
  if (hasVehicles.value) {
    currentIndex.value = currentIndex.value === 0
      ? availableVehicles.value.length - 1
      : currentIndex.value - 1
    stopAutoPlay()
    startAutoPlay()
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Cleanup ao desmontar
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  stopAutoPlay()
})
</script>

<template>
  <v-container fluid class="welcome-container">
    <!-- Seção de Informativos -->
    <v-row class="info-section">
      <v-col cols="12">
        <div class="info-content">
          <v-icon class="info-icon">mdi-car-sports</v-icon>
          <h1 class="info-title">Bem-vindo ao SmartAuto</h1>
          <p class="info-subtitle">
            Sua plataforma completa de locação de veículos
          </p>

          <v-row class="mt-8">
            <v-col cols="12" md="4">
              <v-card class="info-card" elevation="2">
                <v-card-text class="text-center">
                  <v-icon size="48" color="primary" class="mb-3">mdi-shield-check</v-icon>
                  <h3 class="text-h6 mb-2">Segurança</h3>
                  <p class="text-body2 text-medium-emphasis">
                    Todos os nossos veículos passam por rigorosa inspeção e são segurados para sua tranquilidade.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="info-card" elevation="2">
                <v-card-text class="text-center">
                  <v-icon size="48" color="primary" class="mb-3">mdi-clock-fast</v-icon>
                  <h3 class="text-h6 mb-2">Agilidade</h3>
                  <p class="text-body2 text-medium-emphasis">
                    Processo rápido e simples. Escolha seu veículo e faça a locação em poucos minutos.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="info-card" elevation="2">
                <v-card-text class="text-center">
                  <v-icon size="48" color="primary" class="mb-3">mdi-currency-usd</v-icon>
                  <h3 class="text-h6 mb-2">Melhores Preços</h3>
                  <p class="text-body2 text-medium-emphasis">
                    Oferecemos as melhores condições e preços competitivos no mercado de locação.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <!-- Carrossel de Veículos -->
    <v-row v-if="hasVehicles" class="carousel-section">
      <v-col cols="12">
        <div class="carousel-container">
          <h2 class="carousel-title mb-6">Veículos Disponíveis</h2>

          <div class="carousel-wrapper" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
            <v-btn
              icon
              variant="text"
              class="carousel-nav prev"
              @click="prevSlide"
              :disabled="availableVehicles.length <= 1"
            >
              <v-icon color="#1a202c" style="opacity: 1 !important; visibility: visible !important;">mdi-chevron-left</v-icon>
            </v-btn>

            <div class="carousel-viewport">
              <div
                class="carousel-track"
                :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
              >
                <div
                  v-for="vehicle in availableVehicles"
                  :key="vehicle.id"
                  class="carousel-slide"
                >
                  <v-card class="vehicle-card" elevation="4">
                    <v-card-title class="vehicle-title">
                      {{ vehicle.marca }} {{ vehicle.modelo }}
                    </v-card-title>

                    <v-card-subtitle class="vehicle-subtitle">
                      {{ vehicle.ano }} • {{ vehicle.cor }}
                    </v-card-subtitle>

                    <v-card-text class="vehicle-content">
                      <div class="vehicle-details">
                        <div class="detail-item">
                          <v-icon size="20" color="#4a5568" style="opacity: 1 !important; visibility: visible !important;">mdi-calendar</v-icon>
                          <span>Ano: {{ vehicle.ano }}</span>
                        </div>
                        <div class="detail-item">
                          <v-icon size="20" color="#4a5568" style="opacity: 1 !important; visibility: visible !important;">mdi-palette</v-icon>
                          <span>{{ vehicle.cor }}</span>
                        </div>
                      </div>

                      <div class="price-section">
                        <div class="price-label">Diária</div>
                        <div class="price-value">{{ formatCurrency(vehicle.valor_diaria) }}</div>
                      </div>
                    </v-card-text>

                    <v-card-actions>
                      <v-btn
                        color="primary"
                        variant="elevated"
                        block
                        @click="() => {
                          if (authStore.isAuthenticated) {
                            router.push('/veiculos')
                          } else {
                            router.push({ path: '/login', query: { redirect: '/veiculos' } })
                          }
                        }"
                      >
                        {{ authStore.isAuthenticated ? 'Ver Detalhes' : 'Fazer Login para Alugar' }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </div>
              </div>
            </div>

            <v-btn
              icon
              variant="text"
              class="carousel-nav next"
              @click="nextSlide"
              :disabled="availableVehicles.length <= 1"
            >
              <v-icon color="#1a202c" style="opacity: 1 !important; visibility: visible !important;">mdi-chevron-right</v-icon>
            </v-btn>
          </div>

          <!-- Indicadores de slide -->
          <div v-if="availableVehicles.length > 1" class="carousel-indicators">
            <v-btn
              v-for="(vehicle, idx) in availableVehicles"
              :key="vehicle.id"
              icon
              variant="text"
              size="small"
              :class="{ active: currentIndex === idx }"
              @click="goToSlide(idx)"
            >
              <v-icon
                size="10"
                :color="currentIndex === idx ? '#667eea' : '#9ca3af'"
              >
                {{ currentIndex === idx ? 'mdi-circle' : 'mdi-circle-outline' }}
              </v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Mensagem quando não há veículos -->
    <v-row v-else-if="!vehicleStore.loading" class="carousel-section">
      <v-col cols="12">
        <v-alert type="info" variant="tonal" class="text-center">
          <v-icon class="mb-2" color="#4299e1">mdi-information</v-icon>
          <div class="text-h6 mb-2">Nenhum veículo disponível no momento</div>
          <div class="text-body2">Volte em breve para ver nossa seleção de veículos!</div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="vehicleStore.loading" class="carousel-section">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-body1">Carregando veículos...</p>
      </v-col>
    </v-row>

    <!-- Call to Action -->
    <v-row class="cta-section">
      <v-col cols="12" class="text-center">
        <v-card class="cta-card" elevation="3">
          <v-card-text class="py-8">
            <h2 class="text-h5 mb-4">Pronto para começar?</h2>
            <p class="text-body1 mb-6">
              {{ authStore.isAuthenticated
                ? 'Explore nossa seleção completa de veículos e encontre o perfeito para você!'
                : 'Cadastre-se gratuitamente e tenha acesso a todas as funcionalidades do SmartAuto!'
              }}
            </p>
            <div class="cta-buttons">
              <v-btn
                v-if="!authStore.isAuthenticated"
                color="primary"
                size="large"
                variant="elevated"
                prepend-icon="mdi-car-multiple"
                to="/veiculos"
                class="mr-3"
              >
                Ver Veículos
              </v-btn>
              <v-btn
                v-if="!authStore.isAuthenticated"
                color="primary"
                size="large"
                variant="outlined"
                prepend-icon="mdi-account-plus"
                to="/register"
                class="mr-3"
              >
                Cadastrar
              </v-btn>
              <v-btn
                v-if="!authStore.isAuthenticated"
                color="secondary"
                size="large"
                variant="outlined"
                prepend-icon="mdi-login"
                to="/login"
                class="mr-3"
              >
                Entrar
              </v-btn>
              <v-btn
                v-if="authStore.isAuthenticated"
                color="primary"
                size="large"
                variant="elevated"
                prepend-icon="mdi-car-multiple"
                to="/veiculos"
              >
                Ver Todos os Veículos
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* Força visibilidade dos ícones SVG */
.welcome-container :deep(.v-icon) {
  opacity: 1 !important;
  visibility: visible !important;
  color: inherit !important;
}

.welcome-container :deep(.v-icon svg) {
  opacity: 1 !important;
  visibility: visible !important;
  fill: currentColor !important;
  color: currentColor !important;
  width: 100% !important;
  height: 100% !important;
}

.welcome-container :deep(.v-icon path),
.welcome-container :deep(.v-icon circle),
.welcome-container :deep(.v-icon rect),
.welcome-container :deep(.v-icon polygon),
.welcome-container :deep(.v-icon polyline) {
  fill: currentColor !important;
  stroke: currentColor !important;
  opacity: 1 !important;
}

.welcome-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 1rem;
}

/* Seção de Informativos */
.info-section {
  margin-bottom: 4rem;
}

.info-content {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}

.info-icon {
  font-size: 4rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.info-title {
  font-size: 3rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 1rem;
}

.info-subtitle {
  font-size: 1.25rem;
  color: #4a5568;
  margin-bottom: 2rem;
}

.info-card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

/* Carrossel */
.carousel-section {
  margin-bottom: 4rem;
}

.carousel-container {
  max-width: 1200px;
  margin: 0 auto;
}

.carousel-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
}

.carousel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.carousel-viewport {
  flex: 1;
  overflow: hidden;
  border-radius: 16px;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide {
  min-width: 100%;
  padding: 0 0.5rem;
}

.vehicle-card {
  height: 100%;
  border-radius: 16px;
}

.vehicle-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  padding-bottom: 0.5rem;
}

.vehicle-subtitle {
  font-size: 1rem;
  color: #718096;
  padding-bottom: 1rem;
}

.vehicle-content {
  padding-top: 0;
}

.vehicle-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
}

.detail-item :deep(.v-icon) {
  color: #4a5568 !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.detail-item :deep(.v-icon svg) {
  fill: #4a5568 !important;
  color: #4a5568 !important;
  opacity: 1 !important;
  visibility: visible !important;
  width: 100% !important;
  height: 100% !important;
}

.detail-item :deep(.v-icon path),
.detail-item :deep(.v-icon circle),
.detail-item :deep(.v-icon rect) {
  fill: #4a5568 !important;
  stroke: #4a5568 !important;
  opacity: 1 !important;
}

.price-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  color: white;
}

.price-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.price-value {
  font-size: 2rem;
  font-weight: 700;
}

.carousel-nav {
  background: white !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 10;
  color: #1a202c !important;
  min-width: 48px !important;
  width: 48px !important;
  height: 48px !important;
}

.carousel-nav:hover {
  transform: scale(1.1);
  background: #f7fafc !important;
}

.carousel-nav :deep(.v-icon) {
  color: #1a202c !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.carousel-nav :deep(.v-icon svg) {
  fill: #1a202c !important;
  color: #1a202c !important;
  opacity: 1 !important;
  visibility: visible !important;
  width: 100% !important;
  height: 100% !important;
}

.carousel-nav :deep(.v-icon path),
.carousel-nav :deep(.v-icon circle),
.carousel-nav :deep(.v-icon rect) {
  fill: #1a202c !important;
  stroke: #1a202c !important;
  opacity: 1 !important;
}

.carousel-nav:disabled :deep(.v-icon),
.carousel-nav:disabled :deep(.v-icon svg) {
  color: #cbd5e0 !important;
  fill: #cbd5e0 !important;
  opacity: 0.5 !important;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.carousel-indicators .v-btn {
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.carousel-indicators .v-btn.active {
  opacity: 1;
}

.carousel-indicators :deep(.v-icon) {
  color: #667eea !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.carousel-indicators :deep(.v-icon svg) {
  fill: #667eea !important;
  color: #667eea !important;
  opacity: 1 !important;
  visibility: visible !important;
  width: 100% !important;
  height: 100% !important;
}

.carousel-indicators :deep(.v-icon path),
.carousel-indicators :deep(.v-icon circle) {
  fill: #667eea !important;
  stroke: #667eea !important;
  opacity: 1 !important;
}

.carousel-indicators .v-btn:not(.active) :deep(.v-icon) {
  color: #9ca3af !important;
}

.carousel-indicators .v-btn:not(.active) :deep(.v-icon svg) {
  fill: #9ca3af !important;
  color: #9ca3af !important;
}

.carousel-indicators .v-btn:not(.active) :deep(.v-icon path),
.carousel-indicators .v-btn:not(.active) :deep(.v-icon circle) {
  fill: #9ca3af !important;
  stroke: #9ca3af !important;
}

.carousel-indicators .v-btn.active :deep(.v-icon) {
  color: #667eea !important;
}

.carousel-indicators .v-btn.active :deep(.v-icon svg) {
  fill: #667eea !important;
  color: #667eea !important;
}

.carousel-indicators .v-btn.active :deep(.v-icon path),
.carousel-indicators .v-btn.active :deep(.v-icon circle) {
  fill: #667eea !important;
  stroke: #667eea !important;
}

/* CTA Section */
.cta-section {
  margin-top: 4rem;
}

.cta-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 16px;
  background: white;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 960px) {
  .info-title {
    font-size: 2rem;
  }

  .info-subtitle {
    font-size: 1.1rem;
  }

  .carousel-title {
    font-size: 2rem;
  }

  .carousel-nav {
    display: none;
  }

  .carousel-slide {
    padding: 0;
  }
}

@media (max-width: 600px) {
  .welcome-container {
    padding: 1rem 0.5rem;
  }

  .info-title {
    font-size: 1.75rem;
  }

  .carousel-title {
    font-size: 1.5rem;
  }

  .price-value {
    font-size: 1.5rem;
  }

  .cta-buttons {
    flex-direction: column;
    width: 100%;
  }

  .cta-buttons .v-btn {
    width: 100%;
  }
}
</style>
