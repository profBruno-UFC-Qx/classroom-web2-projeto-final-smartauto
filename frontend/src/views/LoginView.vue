<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const senha = ref('')
const errorMessage = ref('')

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
  <div class="login-container">
    <div class="login-card">
      <h1>Login</h1>
      <p class="subtitle">Acesse sua conta SmartAuto</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">E-mail</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="seu@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="senha">Senha</label>
          <input 
            id="senha"
            v-model="senha" 
            type="password" 
            placeholder="Digite sua senha"
            required
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-login" :disabled="authStore.loading">
          {{ authStore.loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="footer">
        <p>Não tem uma conta? 
          <a @click="goToRegister" class="link">Cadastre-se</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
}

h1 {
  font-size: 2rem;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #718096;
  margin: 0 0 2rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3748;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.btn-login {
  width: 100%;
  padding: 0.875rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.btn-login:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer {
  margin-top: 1.5rem;
  text-align: center;
  color: #718096;
}

.link {
  color: #667eea;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>
