# SmartAuto - Frontend Vue 3

Sistema de aluguel de veículos - Frontend desenvolvido com Vue 3, Composition API, Vue Router e Pinia.

## Características

✅ **SPA (Single Page Application)** com Vue Router  
✅ **Autenticação JWT** com Pinia store  
✅ **Rotas protegidas** por papel de usuário (Admin, Locador, Cliente)  
✅ **CRUD completo** para Veículos, Locações e Usuários  
✅ **Interface responsiva** com Vuetify 3  
✅ **Paginação** e **filtros** avançados  
✅ **TypeScript** para segurança de tipos  
✅ **Composition API** (sem usar Options API)  

## Requisitos

- Node.js >= 20.19.0 ou >= 22.12.0
- npm ou yarn
- Backend SmartAuto rodando em `http://localhost:3000`

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── stores/             # Pinia stores (auth, vehicles, rentals, users)
├── views/              # Páginas da aplicação
│   ├── HomeView.vue
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   ├── VehiclesView.vue
│   ├── RentalsView.vue
│   ├── UsersView.vue
│   └── AboutView.vue
├── router/             # Vue Router configuration
├── services/           # Serviços de API
├── types/              # Definições TypeScript
├── utils/              # Utilidades
├── App.vue             # Componente raiz
└── main.ts             # Ponto de entrada
```

## Funcionalidades Implementadas

### Autenticação
- ✅ Login com email/usuário e senha
- ✅ Registro de novos usuários (Cliente ou Locador)
- ✅ JWT token storage em localStorage
- ✅ Logout com limpeza de dados
- ✅ Proteção de rotas por autenticação

### Veículos
- ✅ Listar todos os veículos disponíveis
- ✅ Buscar/filtrar por marca, modelo, cor
- ✅ **Pagination** (offset/limit)
- ✅ CRUD completo (Admin/Locador)
- ✅ Visualizar detalhes e categorias

### Locações
- ✅ Criar nova solicitação de aluguel
- ✅ Listar todas as locações (com filtro por status)
- ✅ Aprovar/Recusar locações (Locador/Admin)
- ✅ Cálculo automático de valor total
- ✅ Status: Pendente, Aprovada, Recusada

### Usuários
- ✅ CRUD completo de usuários (Admin)
- ✅ Gerenciar papéis (Admin, Locador, Cliente)
- ✅ Filtrar por tipo de usuário
- ✅ Validação de dados

## Rotas Disponíveis

### Públicas (sem autenticação)
- `/` - Home
- `/login` - Login
- `/register` - Cadastro
- `/about` - Sobre

### Protegidas (todas autenticadas)
- `/veiculos` - Listar veículos (todos)
- `/locacoes` - Locações (Admin/Locador)
- `/usuarios` - Gerenciar usuários (Admin)

## Variáveis de Ambiente

```
VITE_API_BASE_URL=http://localhost:3000
```

Edite o arquivo `.env` conforme necessário.

## Papéis de Usuário

### 👤 Cliente
- Ver catálogo de veículos
- Solicitar aluguel de veículos
- Ver suas locações

### 🚗 Locador
- Ver catálogo de veículos
- Criar/editar/deletar veículos
- Gerenciar locações (aprovar/recusar)
- Criar locações manualmente

### ⚙️ Admin
- Todas as permissões do Locador
- Gerenciar usuários
- Gerenciar todos os dados do sistema

## Stores Pinia

### `useAuthStore`
Gerencia autenticação e dados do usuário logado.

```typescript
const authStore = useAuthStore()
authStore.login(email, senha)
authStore.logout()
authStore.isAuthenticated
```

### `useVehicleStore`
Gerencia lista de veículos e operações CRUD.

```typescript
const vehicleStore = useVehicleStore()
vehicleStore.fetchVehicles()
vehicleStore.createVehicle(data)
vehicleStore.updateVehicle(id, data)
vehicleStore.deleteVehicle(id)
```

### `useRentalStore`
Gerencia locações e suas operações.

```typescript
const rentalStore = useRentalStore()
rentalStore.fetchRentals()
rentalStore.createRental(data)
rentalStore.approveRental(id)
rentalStore.rejectRental(id)
```

### `useUserStore`
Gerencia usuários (apenas admin).

```typescript
const userStore = useUserStore()
userStore.fetchUsers()
userStore.createUser(data)
userStore.updateUser(id, data)
userStore.deleteUser(id)
```

## Serviço de API

O `apiService` fornece métodos para comunicação com o backend:

```typescript
import { apiService } from '@/services/api'

// GET
const response = await apiService.get<T>('/endpoint')

// POST
await apiService.post<T>('/endpoint', data)

// PUT
await apiService.put<T>('/endpoint/id', data)

// DELETE
await apiService.delete<T>('/endpoint/id')

// Pagination
await apiService.getList<T>('/endpoint', offset, limit)
```

## Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev          # Iniciar dev server
npm run build        # Build para produção
npm run preview      # Preview da build
npm run type-check   # Verificar tipos TypeScript
npm run lint         # Executar ESLint
npm run format       # Formatar código com Prettier
```

### Tecnologias

- **Vue 3** - Framework
- **Composition API** - Gerenciamento de lógica
- **Vue Router 4** - Roteamento
- **Pinia** - State management
- **Vuetify 3** - Componentes UI
- **TypeScript** - Type safety
- **Vite** - Build tool

## Requisitos do Projeto Final

✅ SPA com Vue 3 + Composition API  
✅ Vue Router com rotas protegidas  
✅ Pinia para state management  
✅ CRUDs implementados (Veículos, Locações, Usuários)  
✅ Autenticação JWT  
✅ Paginação (offset/limit)  
✅ Filtros avançados  
✅ Diferentes papéis de usuário  
✅ Página principal acessível  
✅ Código modularizado  

## Notas

- O backend deve estar rodando em `http://localhost:3000`
- Tokens JWT são salvos em localStorage automaticamente
- A autenticação persiste entre recarregos de página
- Todas as rotas requerem autenticação exceto home, login e registro

## Licença

ISC
