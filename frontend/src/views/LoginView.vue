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

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <v-container fluid class="login-container">
    <v-row class="justify-center">
      <v-col cols="12" xs="11" sm="10" md="8" lg="5" class="mx-auto">
        <v-card class="pa-4 pa-md-8" elevation="10">
          <h1 class="mb-2 text-center">Login</h1>
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
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
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
              <span>Não tem uma conta?</span>
              <v-btn
                text
                color="primary"
                @click="goToRegister"
                class="ml-2"
              >
                Cadastre-se
              </v-btn>
            </div>
            <v-btn
              text
              color="secondary"
              to="/"
              prepend-icon="mdi-arrow-left"
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
  height: 100vh;
  padding-top: 80px;
  padding-bottom: 2rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  overflow-y: auto;
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