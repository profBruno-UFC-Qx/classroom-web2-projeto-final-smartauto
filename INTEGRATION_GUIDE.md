# Guia de Integração Frontend-Backend

## Configuração Inicial

### 1. **Iniciar o Backend**

```bash
cd backend
npm install
npm run dev
```

O backend rodará em `http://localhost:3000`

### 2. **Iniciar o Frontend**

```bash
cd frontend
npm install
npm run dev
```

O frontend rodará em `http://localhost:5173`

## Dados de Teste

### Usuários Padrão

Para criar usuários de teste, você pode usar as rotas de cadastro do frontend ou fazer requisições diretas.

**Admin:**
```
usuário: admin
email: admin@smartauto.com
senha: admin123
role: admin
```

**Locador:**
```
usuário: locador
email: locador@smartauto.com
senha: locador123
role: locador
```

**Cliente:**
```
usuário: cliente
email: cliente@smartauto.com
senha: cliente123
role: cliente
```

### Categoria de Veículos

As categorias devem ser criadas no backend. Exemplos:

```
- Hatch
- Sedan
- SUV
- Camionete
```

### Criar Veículos de Teste

Use a interface do frontend ou POST direto:

```bash
curl -X POST http://localhost:3000/veiculos \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "Toyota",
    "modelo": "Corolla",
    "ano": 2023,
    "cor": "Prata",
    "disponivel": true,
    "valor_diaria": 120.00
  }'
```

## Fluxo de Funcionalidades

### 1. **Autenticação**
- Usuario acessa `/login` ou `/register`
- Credenciais são enviadas para `POST /usuarios/login` ou `POST /usuarios`
- Token JWT é retornado e armazenado em localStorage
- Usuário é redirecionado para home autenticado

### 2. **Visualizar Veículos**
- `GET /veiculos?offset=0&limit=10&disponiveis=true`
- Retorna lista paginada de veículos disponíveis

### 3. **Criar Locação**
- `POST /locacoes` com dados da locação
- Veículo deve estar disponível
- Status inicia como "pendente"

### 4. **Aprovar/Recusar Locação**
- `PUT /locacoes/{id}` com novo status
- Apenas admin/locador podem fazer isso

### 5. **Gerenciar Usuários** (Admin)
- CRUD completo: GET, POST, PUT, DELETE `/usuarios`

## Endpoints da API

### Autenticação
```
POST /usuarios/login
  Body: { email, senha }
  Response: { token, user }

POST /usuarios
  Body: { nome, usuario, email, senha, telefone, uf, cidade, logradouro, numero, role }
  Response: { usuario criado }
```

### Veículos
```
GET /veiculos?offset=0&limit=10&disponiveis=true
  Response: Array<Veiculo>

GET /veiculos/{id}
  Response: Veiculo

POST /veiculos
  Body: { marca, modelo, ano, cor, disponivel, valor_diaria }
  Response: Veiculo criado

PUT /veiculos/{id}
  Body: { ...campos a atualizar }
  Response: Veiculo atualizado

DELETE /veiculos/{id}
  Response: { sucesso }
```

### Locações
```
GET /locacoes?offset=0&limit=10
  Response: Array<Locacao>

GET /locacoes/{id}
  Response: Locacao

POST /locacoes
  Body: { data_inicio, data_fim, cliente_id, locador_id, veiculo_id }
  Response: Locacao criada

PUT /locacoes/{id}
  Body: { status }
  Response: Locacao atualizada

DELETE /locacoes/{id}
  Response: { sucesso }
```

### Usuários
```
GET /usuarios?offset=0&limit=10
  Response: Array<Usuario>

GET /usuarios/{id}
  Response: Usuario

POST /usuarios
  Body: { nome, usuario, email, senha, ... }
  Response: Usuario criado

PUT /usuarios/{id}
  Body: { ...campos a atualizar }
  Response: Usuario atualizado

DELETE /usuarios/{id}
  Response: { sucesso }
```

### Categorias
```
GET /categorias
  Response: Array<Categoria>

POST /categorias
  Body: { nome }
  Response: Categoria criada

PUT /categorias/{id}
  Body: { nome }
  Response: Categoria atualizada

DELETE /categorias/{id}
  Response: { sucesso }
```

## Componentes Principais do Frontend

### **Stores (Pinia)**

1. **useAuthStore** - Autenticação e dados do usuário
2. **useVehicleStore** - Gerenciamento de veículos
3. **useRentalStore** - Gerenciamento de locações
4. **useUserStore** - Gerenciamento de usuários

### **Views**

1. **HomeView** - Página inicial
2. **LoginView** - Login
3. **RegisterView** - Registro
4. **VehiclesView** - Listar/gerenciar veículos
5. **RentalsView** - Listar/gerenciar locações
6. **UsersView** - Gerenciar usuários (admin)

### **Router Guards**

- Verifica autenticação antes de acessar rotas protegidas
- Verifica permissões de papel (role)
- Redireciona para login se não autenticado

## Requisitos Atendidos

✅ **SPA** - Vue 3 + Vue Router  
✅ **Composition API** - Apenas composition API (sem Options API)  
✅ **Pinia** - Estado global gerenciado  
✅ **Autenticação JWT** - Token em localStorage  
✅ **Rotas protegidas** - Guard verifica autenticação e permissões  
✅ **CRUDs** - Veículos, Locações, Usuários  
✅ **Paginação** - offset/limit no backend  
✅ **Filtros** - Busca por marca, modelo, etc  
✅ **Papéis de usuário** - Admin, Locador, Cliente  
✅ **Entidades relacionadas** - Veiculo, Usuario, Locacao  

## Troubleshooting

### "Falha de conexão com o servidor"
- Verifique se backend está rodando em `http://localhost:3000`
- Verifique o arquivo `.env` do frontend
- Verifique CORS no backend

### Token inválido
- Limpe localStorage: `localStorage.clear()`
- Faça login novamente
- Verifique se token é gerado corretamente no backend

### Permissão negada
- Verifique o papel do usuário (role)
- Admin pode acessar tudo
- Locador pode acessar locações e usuários (limitado)
- Cliente pode apenas visualizar veículos

## Scripts Úteis

### Resetar dados de teste
```bash
# Deletar banco de dados SQLite
rm backend/smartauto.db

# Reiniciar backend
npm run dev
```

### Ver logs
- Frontend: Browser DevTools Console
- Backend: Terminal onde npm run dev foi executado

## Performance e Otimizações

- ✅ Lazy loading de componentes com dynamic imports
- ✅ Paginação para grandes listas
- ✅ Cache de dados em Pinia stores
- ✅ Debounce em filtros (considerado)
- ✅ TypeScript para evitar erros em runtime
