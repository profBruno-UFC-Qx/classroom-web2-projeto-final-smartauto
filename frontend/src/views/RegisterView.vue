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
const senha = ref('')
const confirmarSenha = ref('')
const cpf = ref('')
const telefone = ref('')
const endereco = ref('')
const papel = ref<UserRoleType>(UserRole.CLIENTE)
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

const papelOptions = [
  { title: 'Cliente', value: UserRole.CLIENTE },
  { title: 'Funcionário', value: UserRole.FUNCIONARIO },
  { title: 'Administrador', value: UserRole.ADMIN }
]

async function handleRegister() {
  errorMessage.value = ''

  if (!nome.value || !email.value || !senha.value || !cpf.value) {
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
    email: email.value,
    senha: senha.value,
    cpf: cpf.value,
    ...(telefone.value && { telefone: telefone.value }),
    ...(endereco.value && { endereco: endereco.value }),
    papel: papel.value
  }

  const user = await authStore.register(userData)
  
  if (user) {
    router.push('/')
  } else {
    errorMessage.value = authStore.error || 'Erro ao criar conta'
  }
}
</script>


<template>
  <v-container fluid class="register-container">
    <v-row class="justify-center">
      <v-col cols="11" xs="10" sm="10" md="8" lg="5" class="mx-auto">
        <v-card class="pa-4 pa-md-8" elevation="10">
          <h1 class="mb-2 text-center">Cadastro</h1>
          <p class="subtitle mb-8 text-center">Crie sua conta SmartAuto</p>

          <v-card-text class="pa-0">
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="nome"
                label="Nome completo *"
                placeholder="João Silva"
                outlined
                class="mb-2"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="E-mail *"
                type="email"
                placeholder="seu@email.com"
                outlined
                class="mb-2"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model="cpf"
                label="CPF *"
                placeholder="000.000.000-00"
                outlined
                class="mb-2"
                density="compact"
                required
              ></v-text-field>

              <v-text-field
                v-model="telefone"
                label="Telefone"
                placeholder="(00) 00000-0000"
                outlined
                class="mb-2"
                density="compact"
              ></v-text-field>

              <v-text-field
                v-model="endereco"
                label="Endereço"
                placeholder="Rua, número, bairro"
                outlined
                class="mb-2"
                density="compact"
              ></v-text-field>

              <v-text-field
                v-model="senha"
                label="Senha *"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                outlined
                class="mb-2"
                density="compact"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
              ></v-text-field>

              <v-text-field
                v-model="confirmarSenha"
                label="Confirmar senha *"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="Digite a senha novamente"
                outlined
                class="mb-2"
                density="compact"
                :append-icon="showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showConfirm = !showConfirm"
                required
              ></v-text-field>

              <v-select
                v-model="papel"
                label="Tipo de conta"
                :items="papelOptions"
                outlined
                class="mb-3"
                density="compact"
              ></v-select>

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
                {{ authStore.loading ? 'Criando conta...' : 'Criar Conta' }}
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-text class="text-center py-4 d-flex flex-column gap-2">
            <div>
              <span>Já tem uma conta?</span>
              <router-link to="/sobre">Faça login</router-link>
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

a {
  color: #1976d2;
  text-decoration: none;
  cursor: pointer;
  outline: none;
  border: none;
}

a:hover,
a:focus {
  outline: none;
  border: none;
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