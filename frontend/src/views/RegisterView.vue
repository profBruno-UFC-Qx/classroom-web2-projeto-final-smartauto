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

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <v-container fluid class="h-100 d-flex align-center justify-center px-3 px-sm-4 pt-16">
    <v-row class="w-100 ma-0">
      <v-col cols="12" sm="10" md="8" lg="6" class="mx-auto">
        <v-card class="pa-6 pa-sm-8" elevation="10">
          <h1 class="mb-2 text-center text-h4">Criar Conta</h1>
          <p class="subtitle mb-6 text-center text-grey">Cadastre-se no SmartAuto</p>

          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="nome"
                label="Nome completo *"
                placeholder="João Silva"
                outlined
                class="mb-3"
                required
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="E-mail *"
                type="email"
                placeholder="seu@email.com"
                outlined
                class="mb-3"
                required
              ></v-text-field>

              <v-text-field
                v-model="cpf"
                label="CPF *"
                placeholder="000.000.000-00"
                outlined
                class="mb-3"
                required
              ></v-text-field>

              <v-text-field
                v-model="telefone"
                label="Telefone"
                placeholder="(00) 00000-0000"
                outlined
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="endereco"
                label="Endereço"
                placeholder="Rua, número, bairro"
                outlined
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="senha"
                label="Senha *"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                outlined
                class="mb-3"
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
                class="mb-3"
                :append-icon="showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showConfirm = !showConfirm"
                required
              ></v-text-field>

              <v-select
                v-model="papel"
                label="Tipo de conta"
                :items="papelOptions"
                outlined
                class="mb-4"
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

          <v-card-text class="text-center py-4">
            <span>Já tem uma conta?</span>
            <v-btn
              text
              color="primary"
              @click="goToLogin"
              class="ml-2"
            >
              Faça login
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
