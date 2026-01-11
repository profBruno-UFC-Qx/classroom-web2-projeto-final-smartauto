<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AuthLayout from '../../layouts/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = computed(() => authStore.loading)
const error = ref<string | null>(null)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref<'success' | 'error' | 'info'>('success')

const form = reactive({
  nome: '',
  usuario: '',
  senha: '',
  confirmaSenha: '',
  telefone: '',
  email: '',
  uf: '',
  cidade: '',
  logradouro: '',
  numero: 0
})

async function handleRegister() {
  if (form.senha !== form.confirmaSenha) {
    error.value = 'As senhas não coincidem'
    return
  }

  try {
    error.value = null
    await authStore.register(form.usuario, form.nome, form.email, form.senha)
    snackbarText.value = 'Cadastro realizado com sucesso!'
    snackbarColor.value = 'success'
    snackbar.value = true
    setTimeout(() => {
      router.push('/dashboard')
    }, 1200)
  } catch {
    error.value = authStore.error || 'Erro ao cadastrar'
    snackbarText.value = error.value
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}
</script>

<template>
  <auth-layout>
    <div class="register-container">
      <div class="register-card">
        <h1>SmartAuto</h1>
        <p class="subtitle">Criar Conta</p>

        <form @submit.prevent="handleRegister" class="register-form">
          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <div class="form-group">
            <label for="nome">Nome Completo</label>
            <input
              id="nome"
              v-model="form.nome"
              type="text"
              required
              class="form-input"
              placeholder="Seu nome completo"
            />
          </div>


          <div class="form-group">
            <label for="usuario">Usuário</label>
            <input
              id="usuario"
              v-model="form.usuario"
              type="text"
              required
              class="form-input"
              placeholder="Seu usuário"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="form-input"
              placeholder="seu@email.com"
            />
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              id="password"
              v-model="form.senha"
              type="password"
              required
              class="form-input"
              placeholder="Sua senha"
            />
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirmar Senha</label>
            <input
              id="confirm-password"
              v-model="form.confirmaSenha"
              type="password"
              required
              class="form-input"
              placeholder="Confirme sua senha"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary"
          >
            {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
          </button>
        </form>

        <div class="form-footer">
          <p>
            Já tem uma conta?
            <router-link to="/login" class="link">Faça login aqui</router-link>
          </p>
        </div>
      </div>
    </div>

    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      :color="snackbarColor"
      location="top right"
    >
      {{ snackbarText }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </auth-layout>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.register-card {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.register-card h1 {
  text-align: center;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  text-align: center;
  color: #4a4a4a;
  margin: 0 0 2rem 0;
  font-size: 0.95rem;
  font-weight: 500;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #1a1a1a;
}

.form-input {
  padding: 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #ffffff;
  color: #1a1a1a;
  transition: all 0.3s;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.btn {
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background-color 0.3s;
  margin-top: 0.5rem;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.form-footer p {
  margin: 0;
  color: #4a4a4a;
  font-size: 0.9rem;
}

.link {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.link:hover {
  color: #2980b9;
}
</style>
