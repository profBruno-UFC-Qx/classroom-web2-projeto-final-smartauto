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
const numero = ref<number | null>(null)
const role = ref<UserRoleType | ''>('')
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

const roleOptions = [
  { title: 'Cliente', value: UserRole.CLIENTE },
  { title: 'Locador', value: UserRole.LOCADOR }
]

async function handleRegister() {
  errorMessage.value = ''

  if (!nome.value || !usuario.value || !email.value || !senha.value || !telefone.value || !uf.value || !cidade.value || !logradouro.value || !numero.value || !role.value) {
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
    <v-row class="row-center">
      <v-col cols="11" xs="11" sm="10" md="7" lg="4" class="col-center">
        <v-card class="form-card" elevation="10">
          <h1 class="title">Criar Conta</h1>
          <p class="subtitle">Cadastre-se no SmartAuto</p>

          <v-card-text class="card-content">
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="nome"
                label="Nome Completo"
                outlined
                class="field"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model="usuario"
                label="Usuário"
                outlined
                class="field"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                outlined
                class="field"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model="telefone"
                label="Telefone"
                outlined
                class="field"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model="senha"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"
                outlined
                class="field"
                density="compact"
                append-icon="mdi-eye"
                @click:append="showPassword = !showPassword"
                required
              ></v-text-field>

              <v-text-field
                v-model="confirmarSenha"
                label="Confirmar Senha"
                :type="showConfirm ? 'text' : 'password'"
                outlined
                class="field"
                density="compact"
                append-icon="mdi-eye"
                @click:append="showConfirm = !showConfirm"
                required
              ></v-text-field>

              <v-text-field
                v-model="uf"
                label="UF"
                maxlength="2"
                outlined
                class="field"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model="cidade"
                label="Cidade"
                outlined
                class="field"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model="logradouro"
                label="Logradouro"
                outlined
                class="field"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model.number="numero"
                label="Número"
                type="number"
                outlined
                class="field"
                density="compact"
                required
              ></v-text-field>

              <v-select
                v-model="role"
                :items="roleOptions"
                label="Tipo de Usuário"
                outlined
                class="field"
                density="compact"
                required
              ></v-select>

              <v-alert v-if="errorMessage" type="error" class="alert">
                {{ errorMessage }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                class="btn-submit"
                size="large"
                :loading="authStore.loading"
              >
                {{ authStore.loading ? 'Criando conta...' : 'Criar Conta' }}
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-text class="card-footer">
            <div>
              <span>Já tem uma conta? </span>
              <router-link to="/login" class="link-login">Faça login</router-link>
            </div>
            <v-btn
              text
              color="secondary"
              to="/"
              prepend-icon="mdi-arrow-left"
              class="btn-back"
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
  min-height: 100vh;
  padding-top: 40px;
  padding-bottom: 2rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.register-container::before {
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

.register-container::after {
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

.row-center {
  justify-content: center;
}

.col-center {
  margin-left: auto;
  margin-right: auto;
}

.form-card {
  max-width: 500px;
  padding: 1rem;
  position: relative;
  z-index: 1;
}

@media (min-width: 960px) {
  .form-card {
    padding: 1.5rem;
  }
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #757575;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  text-align: center;
}

.card-content {
  padding: 0;
}

.field {
  margin-bottom: 0.75rem;
}

.alert {
  margin-bottom: 1rem;
}

.btn-submit {
  width: 100%;
  margin-bottom: 1rem;
}

.card-footer {
  text-align: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-back {
  margin-top: 1.5rem;
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

:deep(input[type="number"]) {
  -moz-appearance: textfield;
  appearance: textfield;
}

:deep(input[type="number"]::-webkit-outer-spin-button),
:deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
</style>
