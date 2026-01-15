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
  <div class="register-container">
    <div class="register-card">
      <h1>Criar Conta</h1>
      <p class="subtitle">Cadastre-se no SmartAuto</p>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="nome">Nome completo *</label>
          <input 
            id="nome"
            v-model="nome" 
            type="text" 
            placeholder="João Silva"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">E-mail *</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="seu@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="cpf">CPF *</label>
          <input 
            id="cpf"
            v-model="cpf" 
            type="text" 
            placeholder="000.000.000-00"
            required
          />
        </div>

        <div class="form-group">
          <label for="telefone">Telefone</label>
          <input 
            id="telefone"
            v-model="telefone" 
            type="tel" 
            placeholder="(00) 00000-0000"
          />
        </div>

        <div class="form-group">
          <label for="endereco">Endereço</label>
          <input 
            id="endereco"
            v-model="endereco" 
            type="text" 
            placeholder="Rua, número, bairro"
          />
        </div>

        <div class="form-group">
          <label for="senha">Senha *</label>
          <input 
            id="senha"
            v-model="senha" 
            type="password" 
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmar">Confirmar senha *</label>
          <input 
            id="confirmar"
            v-model="confirmarSenha" 
            type="password" 
            placeholder="Digite a senha novamente"
            required
          />
        </div>

        <div class="form-group">
          <label for="papel">Tipo de conta</label>
          <select id="papel" v-model="papel">
            <option value="cliente">Cliente</option>
            <option value="funcionario">Funcionário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-register" :disabled="authStore.loading">
          {{ authStore.loading ? 'Criando conta...' : 'Criar Conta' }}
        </button>
      </form>

      <div class="footer">
        <p>Já tem uma conta? 
          <a @click="goToLogin" class="link">Faça login</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3748;
  font-weight: 500;
  font-size: 0.9rem;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

input:focus, select:focus {
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

.btn-register {
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
  margin-top: 0.5rem;
}

.btn-register:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-register:disabled {
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
