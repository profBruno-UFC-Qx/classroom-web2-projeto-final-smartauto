<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const senha = ref('')
const errorMessage = ref('')
const showPassword = ref(false)

async function handleLogin() {
  errorMessage.value = ''
  
  if (!email.value || !senha.value) {
    errorMessage.value = 'Preencha todos os campos'
    return
  }

  const success = await authStore.login(email.value, senha.value)
  
  if (success) {
    router.push('/')
  } else {
    errorMessage.value = authStore.error || 'Erro ao fazer login'
  }
}
</script>


<template>
  <v-container fluid class="login-container">
    <v-row class="justify-center">
      <v-col cols="11" xs="11" sm="10" md="7" lg="4" class="mx-auto">
        <v-card class="form-card pa-4 pa-md-6" elevation="10">
          <h1 class="mb-2 text-center">Entrar</h1>
          <p class="subtitle mb-8 text-center">Acesse sua conta SmartAuto</p>

          <v-card-text class="pa-0">
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                outlined
                class="mb-3"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model="senha"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Digite sua senha"
                outlined
                class="mb-3"
                density="compact"
                append-icon="mdi-eye"
                @click:append="showPassword = !showPassword"
                required
              ></v-text-field>

              <v-alert v-if="errorMessage" type="error" class="mb-4">
                {{ errorMessage }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                class="w-100 mb-4"
                size="large"
                :loading="authStore.loading"
              >
                {{ authStore.loading ? 'Entrando...' : 'Entrar' }}
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-text class="text-center py-4 d-flex flex-column gap-2">
            <div>
              <span>Não tem uma conta? </span>
              <router-link to="/register" class="link-register">Cadastre-se</router-link>
            </div>
            <v-btn
              text
              color="secondary"
              to="/"
              prepend-icon="mdi-arrow-left"
              class="mt-6"
            >
              Voltar à Home
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding-top: 80px;
  padding-bottom: 2rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
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

.login-container::after {
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

.form-card {
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.subtitle {
  color: #757575;
  font-size: 0.875rem;
  opacity: 0.9;
}

a {
  color: #1976d2;
  text-decoration: none;
  cursor: pointer;
}

.link-register {
  text-decoration: underline;
}

:deep(.v-btn a) {
  text-decoration: none !important;
}

@media (max-width: 600px) {
  h1 {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  .login-container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>