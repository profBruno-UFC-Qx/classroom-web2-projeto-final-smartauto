<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AuthLayout from '../../layouts/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = computed(() => authStore.loading)
const error = ref<string | null>(null)

const form = reactive({
  usuario: '',
  senha: ''
})

async function handleLogin() {
  try {
    error.value = null
    await authStore.login(form.usuario, form.senha)
    await router.push('/dashboard')
  } catch {
    error.value = authStore.error || 'Erro ao fazer login'
  }
}
</script>

<template>
  <auth-layout>
    <div class="login-container">
      <div class="login-card">
        <h1>SmartAuto</h1>
        <p class="subtitle">Sistema de Gerenciamento de Veículos</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <div class="form-group">
            <label for="usuario">Usuário</label>
            <input
              id="email"
              v-model="form.usuario"
              type="text"
              required
              class="form-input"
              placeholder="seu usuario"
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

          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary"
          >
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="form-footer">
          <p>
            Não tem uma conta?
            <router-link to="/register" class="link">Cadastre-se aqui</router-link>
          </p>
        </div>
      </div>
    </div>
  </auth-layout>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  text-align: center;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.subtitle {
  text-align: center;
  color: #666;
  margin: 0 0 2rem 0;
  font-size: 0.95rem;
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

.login-form {
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
  color: #333;
}

.form-input {
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
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
  color: #666;
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
