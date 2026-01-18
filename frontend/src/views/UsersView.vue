<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types'
import type { User, CreateUserData, UpdateUserData } from '@/types'
import { debounce } from '@/utils/debounce'

const userStore = useUserStore()
const authStore = useAuthStore()

const showModal = ref(false)
const editingUser = ref<User | null>(null)
const roleFilter = ref<UserRole | 'all'>('all')
const nomeFilter = ref('')

// Notificações
const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

const formData = ref({
  nome: '',
  usuario: '',
  email: '',
  senha: '',
  telefone: '',
  uf: '',
  cidade: '',
  logradouro: '',
  numero: 0,
  role: UserRole.CLIENTE
})

const canManage = computed(() => authStore.isAdmin)

// Lista já vem paginada/filtrada do backend
const filteredUsers = computed(() => userStore.users)

const applyFilters = debounce(async () => {
  userStore.currentPage = 1
  await userStore.fetchUsers(1, roleFilter.value, nomeFilter.value || null)
}, 500)

watch(roleFilter, () => {
  applyFilters()
})

watch(nomeFilter, () => {
  applyFilters()
})

onMounted(async () => {
  await userStore.fetchUsers(1, roleFilter.value, nomeFilter.value || null)
})

function openCreateModal() {
  editingUser.value = null
  formData.value = {
    nome: '',
    usuario: '',
    email: '',
    senha: '',
    telefone: '',
    uf: '',
    cidade: '',
    logradouro: '',
    numero: 0,
    role: UserRole.CLIENTE
  }
  showModal.value = true
}

function openEditModal(user: User) {
  editingUser.value = user
  formData.value = {
    nome: user.nome,
    usuario: user.usuario,
    email: user.email,
    senha: '', // Não preenchemos a senha ao editar
    telefone: user.telefone,
    uf: user.uf,
    cidade: user.cidade,
    logradouro: user.logradouro,
    numero: user.numero,
    role: user.role
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
}

function showNotification(message: string, type: 'success' | 'error' = 'success') {
  notification.value = { show: true, message, type }
  // Auto-fechar após 4 segundos
  setTimeout(() => {
    notification.value.show = false
  }, 4000)
}

async function handleSubmit() {
  if (!formData.value.nome || !formData.value.usuario || !formData.value.email) {
    showNotification('Preencha todos os campos obrigatórios', 'error')
    return
  }

  if (!editingUser.value && !formData.value.senha) {
    showNotification('Senha é obrigatória para novo usuário', 'error')
    return
  }

  const data = { ...formData.value }

  // Se estamos editando e não alterou a senha, remove o campo
  let submitData: CreateUserData | UpdateUserData = data
  if (editingUser.value && !formData.value.senha) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senha, ...dataWithoutSenha } = data
    submitData = dataWithoutSenha
  }

  if (editingUser.value && editingUser.value.id) {
      await userStore.updateUser(editingUser.value.id, submitData as UpdateUserData)
      if (!userStore.error) {
        showNotification('Usuário atualizado com sucesso!', 'success')
        closeModal()
        await userStore.fetchUsers(userStore.currentPage, roleFilter.value, nomeFilter.value || null)
      } else {
        showNotification(userStore.error, 'error')
      }
    } else {
      await userStore.createUser(submitData as CreateUserData)
      if (!userStore.error) {
        showNotification('Usuário criado com sucesso!', 'success')
        closeModal()
        await userStore.fetchUsers(userStore.currentPage, roleFilter.value, nomeFilter.value || null)
      } else {
        showNotification(userStore.error, 'error')
      }
    }
}

async function deleteUser(id: number) {
  if (confirm('Tem certeza que deseja deletar este usuário?')) {
    await userStore.deleteUser(id)
    if (!userStore.error) {
      showNotification('Usuário deletado com sucesso!', 'success')
    } else {
      showNotification(userStore.error, 'error')
    }
  }
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.LOCADOR]: 'Locador',
    [UserRole.CLIENTE]: 'Cliente'
  }
  return labels[role] || role
}

function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'error',
    [UserRole.LOCADOR]: 'warning',
    [UserRole.CLIENTE]: 'info'
  }
  return colors[role] || 'default'
}

function changePage(page: number) {
  userStore.fetchUsers(page, roleFilter.value, nomeFilter.value || null)
}

function clearFilters() {
  nomeFilter.value = ''
  roleFilter.value = 'all'
  userStore.currentPage = 1
  userStore.fetchUsers(1, 'all', null)
}
</script>

<template>
  <v-container class="py-8">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Gerenciar Usuários</h1>
        <p class="text-body2 text-disabled">Administre os usuários do sistema</p>
      </v-col>
    </v-row>

    <!-- Filtros e Ações -->
    <v-row class="mb-4 align-center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="nomeFilter"
          label="Buscar por nome"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          placeholder="Digite o nome do usuário"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <!-- locador não pode filtrar por papel -->
        <v-select
          v-if="!authStore.isLocador"
          v-model="roleFilter"
          :items="[
            { title: 'Todos', value: 'all' },
            { title: 'Administradores', value: UserRole.ADMIN },
            { title: 'Locadores', value: UserRole.LOCADOR },
            { title: 'Clientes', value: UserRole.CLIENTE }
          ]"
          label="Filtrar por papel"
          variant="outlined"
          density="compact"
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" md="4" class="d-flex justify-end align-center ga-2">
        <v-btn
          v-if="nomeFilter || roleFilter !== 'all'"
          variant="outlined"
          prepend-icon="mdi-close"
          density="compact"
          @click="clearFilters"
        >
          Limpar
        </v-btn>
        <v-btn
          v-if="canManage"
          color="primary"
          prepend-icon="mdi-plus"
          density="compact"
          @click="openCreateModal"
        >
          Novo Usuário
        </v-btn>
      </v-col>
    </v-row>

    <!-- Mensagens de Erro/Status -->
    <v-row v-if="userStore.loading" class="mb-4">
      <v-col cols="12">
        <v-progress-linear indeterminate></v-progress-linear>
      </v-col>
    </v-row>

    <v-row v-if="userStore.error" class="mb-4">
      <v-col cols="12">
        <v-alert type="error" closable>{{ userStore.error }}</v-alert>
      </v-col>
    </v-row>

    <!-- Notificação de Feedback -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type === 'success' ? 'success' : 'error'"
      location="top"
    >
      {{ notification.message }}
    </v-snackbar>

    <!-- Tabela de Usuários -->
    <v-row v-if="filteredUsers.length > 0">
      <v-col cols="12">
        <v-table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Usuário</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Papel</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="text-body2 font-weight-bold">{{ user.nome }}</td>
              <td class="text-body2">{{ user.usuario }}</td>
              <td class="text-body2">{{ user.email }}</td>
              <td class="text-body2">{{ user.telefone }}</td>
              <td>
                <v-chip
                  :color="getRoleColor(user.role)"
                  text-color="white"
                  label
                  size="small"
                >
                  {{ getRoleLabel(user.role) }}
                </v-chip>
              </td>
              <td>
                <div class="d-flex gap-2" style="gap: 12px;">
                  <v-btn
                    v-if="canManage"
                    variant="outlined"
                    size="x-small"
                    @click="openEditModal(user)"
                  >
                    Editar
                  </v-btn>
                  <v-btn
                    v-if="canManage && user.id !== authStore.user?.id"
                    color="error"
                    variant="outlined"
                    size="x-small"
                    @click="deleteUser(user.id!)"
                  >
                    Deletar
                  </v-btn>
                  <v-btn
                    v-if="canManage && user.id === authStore.user?.id"
                    disabled
                    variant="outlined"
                    size="x-small"
                  >
                    (Você)
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>

    <!-- Paginação -->
    <v-row class="mt-4 align-center">
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="userStore.itemsPerPage"
          :items="[{ title: '5', value: 5 }, { title: '10', value: 10 }, { title: '20', value: 20 }, { title: '50', value: 50 }, { title: 'Todos', value: 0 }]"
          label="Itens por página"
          density="compact"
          variant="outlined"
          item-title="title"
          item-value="value"
          style="max-width: 140px"
          @update:model-value="() => userStore.fetchUsers(1, roleFilter)"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="8" class="text-right">
        <v-pagination
          v-if="userStore.totalPages > 1"
          v-model="userStore.currentPage"
          :length="userStore.totalPages"
          @update:model-value="changePage"
        ></v-pagination>
        <div class="text-caption mt-2">
          Página {{ userStore.currentPage }} de {{ userStore.totalPages }} — Total: {{ userStore.total }}
        </div>
      </v-col>
    </v-row>

    <!-- Vazio -->
    <v-row v-if="filteredUsers.length === 0 && !userStore.loading">
      <v-col cols="12" class="text-center py-12">
        <v-icon size="48" class="text-disabled mb-4">mdi-account-off</v-icon>
        <p class="text-body1 text-disabled">Nenhum usuário encontrado</p>
      </v-col>
    </v-row>

    <!-- Modal de Criação/Edição -->
    <v-dialog v-model="showModal" max-width="700">
      <v-card>
        <v-card-title>
          {{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}
        </v-card-title>

        <v-card-text class="py-4">
          <v-form @submit.prevent="handleSubmit">
            <!-- Dados Pessoais -->
            <h3 class="text-subtitle1 mb-3">Dados Pessoais</h3>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.nome"
                  label="Nome"
                  required
                  density="compact"
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.usuario"
                  label="Usuário"
                  required
                  density="compact"
                  class="mb-3"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  type="email"
                  required
                  density="compact"
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.telefone"
                  label="Telefone"
                  required
                  density="compact"
                  class="mb-3"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.senha"
                  label="Senha"
                  type="password"
                  :required="!editingUser"
                  density="compact"
                  class="mb-3"
                  :hint="editingUser ? 'Deixe em branco para não alterar' : ''"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.role"
                  :items="[
                    { title: 'Administrador', value: UserRole.ADMIN },
                    { title: 'Locador', value: UserRole.LOCADOR },
                    { title: 'Cliente', value: UserRole.CLIENTE }
                  ]"
                  label="Papel"
                  required
                  density="compact"
                  class="mb-3"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Endereço -->
            <h3 class="text-subtitle1 mb-3 mt-4">Endereço</h3>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="formData.uf"
                  label="UF"
                  required
                  maxlength="2"
                  density="compact"
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="8">
                <v-text-field
                  v-model="formData.cidade"
                  label="Cidade"
                  required
                  density="compact"
                  class="mb-3"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" sm="9">
                <v-text-field
                  v-model="formData.logradouro"
                  label="Logradouro"
                  required
                  density="compact"
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model.number="formData.numero"
                  label="Número"
                  type="number"
                  required
                  density="compact"
                  class="mb-3"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-alert v-if="userStore.error" type="error" class="mb-3">
              {{ userStore.error }}
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="closeModal">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="handleSubmit"
            :loading="userStore.loading"
          >
            {{ editingUser ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
