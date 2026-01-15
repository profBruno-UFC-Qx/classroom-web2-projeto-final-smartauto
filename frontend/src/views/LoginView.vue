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
  <v-container fluid class="h-100 d-flex align-center justify-center px-3 px-sm-4 pt-16">
    <v-row class="w-100 ma-0">
      <v-col cols="12" sm="10" md="8" lg="5" class="mx-auto">
        <v-card class="pa-6 pa-sm-8" elevation="10">
          <h1 class="mb-2 text-center text-h4">Login</h1>
          <p class="subtitle mb-8 text-center text-grey">Acesse sua conta SmartAuto</p>

          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                outlined
                class="mb-4"
                required
              ></v-text-field>

              <v-text-field
                v-model="senha"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Digite sua senha"
                outlined
                class="mb-4"
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

          <v-card-text class="text-center py-4">
            <span>Não tem uma conta?</span>
            <v-btn
              text
              color="primary"
              @click="goToRegister"
              class="ml-2"
            >
              Cadastre-se
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
