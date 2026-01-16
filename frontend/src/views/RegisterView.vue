<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types'
import type { UserRole as UserRoleType } from '@/types'

const authStore = useAuthStore()
const router = useRouter()

const nome = ref('')
const email = ref('')
const usuario = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const telefone = ref('')
const uf = ref('')
const cidade = ref('')
const logradouro = ref('')
const numero = ref(0)
const role = ref<UserRoleType>(UserRole.CLIENTE)
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

const roleOptions = [
  { title: 'Cliente', value: UserRole.CLIENTE },
  { title: 'Locador', value: UserRole.LOCADOR }
]

async function handleRegister() {
  errorMessage.value = ''

  if (!nome.value || !usuario.value || !email.value || !senha.value || !telefone.value || !uf.value || !cidade.value || !logradouro.value || numero.value === 0) {
    errorMessage.value = 'Preencha todos os campos obrigatórios'
    return
  }

  if (senha.value !== confirmarSenha.value) {
    errorMessage.value = 'As senhas não coincidem'
    return
  }

  if (senha.value.length < 6) {
    errorMessage.value = 'A senha deve ter pelo menos 6 caracteres'
    return
  }

  const userData = {
    nome: nome.value,
    usuario: usuario.value,
    email: email.value,
    senha: senha.value,
    telefone: telefone.value,
    uf: uf.value,
    cidade: cidade.value,
    logradouro: logradouro.value,
    numero: numero.value,
    role: role.value as UserRoleType
  }

  const success = await authStore.register(userData)

  if (success) {
    router.push('/login')
  } else {
    errorMessage.value = authStore.error || 'Erro ao criar conta'
  }
}
</script>

<template>
  <v-container fluid class="register-container">
    <v-row class="justify-center">
      <v-col cols="11" xs="11" sm="10" md="8" lg="6" class="mx-auto">
        <v-card class="form-card pa-4 pa-md-6" elevation="10">
          <h1 class="mb-2 text-center">Cadastro</h1>
          <p class="subtitle mb-6 text-center">Crie sua conta SmartAuto</p>

          <v-card-text class="pa-0">
            <v-form @submit.prevent="handleRegister">
            <!-- Dados Pessoais -->
            <h3 class="text-subtitle1 mb-4">Dados Pessoais</h3>

            <v-text-field
              v-model="nome"
              label="Nome Completo"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              density="compact"
              class="mb-3"
              required
            ></v-text-field>

            <v-text-field
              v-model="usuario"
              label="Usuário"
              prepend-inner-icon="mdi-account-circle"
              variant="outlined"
              density="compact"
              class="mb-3"
              required
            ></v-text-field>

            <v-text-field
              v-model="email"
              label="E-mail"
              type="email"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              density="compact"
              class="mb-3"
              required
            ></v-text-field>

            <v-text-field
              v-model="telefone"
              label="Telefone"
              prepend-inner-icon="mdi-phone"
              variant="outlined"
              density="compact"
              class="mb-3"
              required
            ></v-text-field>

            <!-- Segurança -->
            <h3 class="text-subtitle1 mb-4 mt-6">Segurança</h3>

            <v-text-field
              v-model="senha"
              :type="showPassword ? 'text' : 'password'"
              label="Senha"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              variant="outlined"
              density="compact"
              class="mb-3"
              @click:append-inner="showPassword = !showPassword"
              required
            ></v-text-field>

            <v-text-field
              v-model="confirmarSenha"
              :type="showConfirm ? 'text' : 'password'"
              label="Confirmar Senha"
              prepend-inner-icon="mdi-lock-check"
              :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'"
              variant="outlined"
              density="compact"
              class="mb-3"
              @click:append-inner="showConfirm = !showConfirm"
              required
            ></v-text-field>

            <!-- Endereço -->
            <h3 class="text-subtitle1 mb-4 mt-6">Endereço</h3>

            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="uf"
                  label="UF"
                  maxlength="2"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="8">
                <v-text-field
                  v-model="cidade"
                  label="Cidade"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="logradouro"
              label="Logradouro"
              variant="outlined"
              density="compact"
              class="mb-3"
              required
            ></v-text-field>

            <v-text-field
              v-model.number="numero"
              label="Número"
              type="number"
              variant="outlined"
              density="compact"
              class="mb-3"
              required
            ></v-text-field>

            <!-- Papel do Usuário -->
            <h3 class="text-subtitle1 mb-4 mt-6">Tipo de Conta</h3>

            <v-select
              v-model="role"
              :items="roleOptions"
              label="Tipo de Usuário"
              prepend-inner-icon="mdi-shield-account"
              variant="outlined"
              density="compact"
              class="mb-6"
              required
            ></v-select>

            <!-- Mensagens de Erro -->
            <v-alert v-if="errorMessage" type="error" class="mb-4">
              {{ errorMessage }}
            </v-alert>

            <!-- Botões -->
            <v-btn
              type="submit"
              color="primary"
              class="w-100 mb-4"
              size="large"
              :loading="authStore.loading"
            >
              {{ authStore.loading ? 'Criando conta...' : 'Criar Conta' }}
            </v-btn>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-text class="text-center py-4 d-flex flex-column gap-2">
            <div>
              <span>Já tem uma conta?</span>
              <router-link to="/login" class="link-login">Faça login</router-link>
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
.register-container {
  display: flex;
  justify-content: center;
  background: #ffffff;
  min-height: 100vh;
  padding-top: 80px;
  padding-bottom: 2rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.form-card {
  max-width: 600px;
  max-height: 90vh;
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

h3 {
  color: var(--v-theme-primary);
  font-weight: 500;
}

a {
  color: #1976d2;
  text-decoration: none;
  cursor: pointer;
}

.link-login {
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

  .register-container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>
