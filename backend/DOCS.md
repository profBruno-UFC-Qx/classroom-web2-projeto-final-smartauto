# SmartAutoApp - Node.js/Express/TypeScript

Sistema de locação de veículos SmartAuto migrado de Python/FastAPI para Node.js/Express/TypeScript.

## Descrição

Este projeto foi migrado do [projeto original](https://github.com/gabrielraulino/DS-Persist-SmartAuto) em Python (FastAPI + SQLModel) para Node.js (Express + TypeScript + TypeORM). O sistema foi refatorado para unificar Cliente e Funcionario em uma única entidade Usuario, e a funcionalidade de vendas foi removida, focando exclusivamente em locações de veículos.

## Tecnologias

- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **TypeScript**: Linguagem de programação
- **TypeORM**: ORM para TypeScript
- **SQLite**: Banco de dados (sqlite3)
- **reflect-metadata**: Necessário para decorators do TypeORM
- **JWT (jsonwebtoken)**: Autenticação baseada em tokens
- **bcrypt**: Hash de senhas
- **Zod**: Validação de dados com schemas TypeScript

## Estrutura do Projeto

```
SmartAutoApp-Node/
├── package.json
├── tsconfig.json
├── .env
├── .gitignore
├── README.md
├── src/
│   ├── main.ts                    # Entry point
│   ├── database/
│   │   └── database.ts            # Configuração TypeORM
│   ├── models/
│   │   ├── Usuario.ts
│   │   ├── Veiculo.ts
│   │   ├── Categoria.ts
│   │   ├── Locacao.ts
│   │   └── CategoriaVeiculo.ts
│   ├── middleware/
│   │   ├── auth.ts              # Middleware de autenticação JWT
│   │   └── validate.ts          # Middleware de validação Zod
│   └── routes/
│       ├── auth.ts              # Rotas de autenticação (login, register)
│       ├── categorias.ts
│       ├── usuarios.ts
│       ├── veiculos.ts
│       └── locacoes.ts
└── smartauto.db                   # Banco SQLite
```

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. Configure o arquivo `.env` (opcional, já configurado por padrão):

```
SQLITE_URL=sqlite:./smartauto.db
JWT_SECRET=smartauto-secret-key-change-in-production
ADMIN_API_KEY=your-secure-admin-api-key-here
```

**Importante**: Em produção, altere o `JWT_SECRET` e `ADMIN_API_KEY` para chaves seguras e aleatórias.

## Execução

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado com `nodemon` e `ts-node`, recarregando automaticamente quando houver mudanças.

### Modo Produção

1. Compile o TypeScript:

```bash
npm run build
```

2. Execute o servidor:

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000` por padrão.

## Endpoints

### Autenticação

- `POST /auth/register` - Registra um novo usuário (público)
  - Body: `{ "nome", "usuario", "senha", "telefone", "email", "uf", "cidade", "logradouro", "numero", "api_key" (opcional) }`
  - Retorna: `{ "token": "...", "user": {...} }`
  - **Comportamento**:
    - Sem `api_key`: cria usuário com role `CLIENTE` (padrão)
    - Com `api_key` válida: cria usuário com role `ADMIN`
    - Com `api_key` inválida: retorna erro 403
  - Validações: usuário e email únicos
  - A `api_key` válida deve estar configurada no arquivo `.env` como `ADMIN_API_KEY`

- `POST /auth/login` - Realiza login (público)
  - Body: `{ "usuario", "senha" }`
  - Retorna: `{ "token": "...", "user": {...} }`
  - Use o token no header: `Authorization: Bearer <token>`

**Nota**: Para acessar rotas protegidas, inclua o header `Authorization: Bearer <token>` nas requisições.

### Categorias

- `GET /categorias` - Lista categorias (público - com paginação: `?offset=0&limit=10`)
- `GET /categorias/:categoria_id` - Busca categoria por ID (público)
- `POST /categorias` - Cria categoria (requer autenticação: LOCADOR ou ADMIN) - Body: `{ "nome": "...", "descricao": "..." }`
- `PUT /categorias/:categoria_id` - Atualiza categoria (requer autenticação: LOCADOR ou ADMIN)
- `DELETE /categorias/:categoria_id` - Remove categoria (requer autenticação: LOCADOR ou ADMIN)

### Usuários

- `GET /usuarios` - Lista usuários (requer autenticação: LOCADOR ou ADMIN)
- `GET /usuarios/me` - Retorna dados do usuário logado (requer autenticação)
- `PUT /usuarios/me` - Atualiza dados do usuário logado (requer autenticação)
- `GET /usuarios/:id` - Busca usuário por ID (requer autenticação: LOCADOR ou ADMIN)
- `GET /usuarios/nome/:nome` - Busca usuários por nome (requer autenticação: LOCADOR ou ADMIN)
- `GET /usuarios/role/:role` - Busca usuários por role (requer autenticação: LOCADOR ou ADMIN)
- `POST /usuarios` - Cria usuário (requer autenticação: ADMIN)
- `PUT /usuarios/:id` - Atualiza usuário (requer autenticação: ADMIN)
- `DELETE /usuarios/:id` - Remove usuário (requer autenticação: ADMIN)

### Veículos

- `GET /veiculos` - Lista veículos com categorias (público - sempre retorna categorias)
  - Query params opcionais (podem ser combinados):
    - `offset`: número (padrão: 0) - Paginação
    - `limit`: número (padrão: 10, máximo: 100) - Limite de resultados
    - `disponiveis`: boolean (padrão: true) - Filtrar por disponibilidade
    - `categoria`: string - Filtrar por nome da categoria
    - `min_preco`: number - Preço mínimo
    - `max_preco`: number - Preço máximo
    - `ano`: number - Filtrar por ano
    - `modelo`: string - Filtrar por modelo
    - `marca`: string - Filtrar por marca
  - Exemplos:
    - `GET /veiculos?categoria=Locacao&disponiveis=true` - Veículos disponíveis da categoria Locação
    - `GET /veiculos?ano=2023&marca=Honda` - Veículos Honda de 2023
    - `GET /veiculos?min_preco=50000&max_preco=150000` - Veículos na faixa de preço
    - `GET /veiculos?modelo=Civic&disponiveis=true` - Civics disponíveis
- `GET /veiculos/:veiculo_id` - Busca veículo por ID (público - retorna com categorias)
- `POST /veiculos` - Cria veículo (requer autenticação: LOCADOR ou ADMIN)
- `PUT /veiculos/:veiculo_id` - Atualiza veículo (requer autenticação: LOCADOR ou ADMIN)
- `DELETE /veiculos/:veiculo_id` - Remove veículo (requer autenticação: LOCADOR ou ADMIN)
- `POST /veiculos/categoria/:veiculo_id` - Associa categoria ao veículo (requer autenticação: LOCADOR ou ADMIN)

### Locações

- `GET /locacoes` - Lista locações (requer autenticação - com paginação)
- `GET /locacoes/me` - Lista locações do usuário logado (requer autenticação)
- `GET /locacoes/:id` - Busca locação por ID (requer autenticação)
- `POST /locacoes` - Cria locação com status PENDENTE (requer autenticação - valor_total é calculado automaticamente)
- `PUT /locacoes/:id` - Atualiza locação (requer autenticação: LOCADOR ou ADMIN)
- `PUT /locacoes/:id/aprovar` - Aprova uma locação pendente (requer autenticação: LOCADOR ou ADMIN - muda status para APROVADA)
- `PUT /locacoes/:id/recusar` - Recusa uma locação pendente (requer autenticação: LOCADOR ou ADMIN - muda status para RECUSADA)
- `DELETE /locacoes/:id` - Remove locação (requer autenticação: LOCADOR ou ADMIN)

## Modelos de Dados

### Usuario
- `id`: number
- `usuario`: string (obrigatório)
- `senha`: string (obrigatório)
- `nome`: string
- `telefone`: string
- `email`: string
- `uf`: string
- `cidade`: string
- `logradouro`: string
- `numero`: number
- `role`: Role (enum: CLIENTE, LOCADOR, ADMIN)

### Veículo
- `id`: number
- `marca`: string
- `modelo`: string
- `ano`: number
- `preco`: number
- `cor`: string
- `disponivel`: boolean
- `valor_diaria`: number (valor da diária para locação)

### Categoria
- `id`: number
- `nome`: string
- `desc`: string

### Locação
- `id`: number
- `data_inicio`: Date
- `data_fim`: Date
- `cliente_id`: number (referência a Usuario)
- `locador_id`: number (referência a Usuario com role LOCADOR ou ADMIN)
- `veiculo_id`: number
- `status`: StatusLocacao (enum: PENDENTE, APROVADA, RECUSADA)
- `valor_total`: number (calculado dinamicamente: valor_diaria do veículo × número de dias)

**Nota**: O `valor_total` não é armazenado no banco de dados, mas é calculado e retornado nas respostas da API baseado na `valor_diaria` do veículo e na duração da locação.

**Importante**: Nas respostas das rotas de locações, os campos `usuario` e `senha` dos objetos `locador` e `cliente` são removidos automaticamente por questões de segurança. Além disso, os IDs `cliente_id`, `locador_id` e `veiculo_id` são omitidos quando os objetos relacionados (`cliente`, `locador`, `veiculo`) estão presentes na resposta.

### StatusLocacao (Enum)
- `PENDENTE`: Locação criada, aguardando aprovação
- `APROVADA`: Locação aprovada pelo locador, veículo marcado como indisponível
- `RECUSADA`: Locação recusada pelo locador, veículo permanece disponível

## Relacionamentos

- Um `Usuario` pode ter várias `Locacoes` (como cliente ou como locador)
- Um `Usuario` pode ter role `CLIENTE`, `LOCADOR` ou `ADMIN`
- Um `Veiculo` pode estar associado a várias `Locacoes`
- Uma `Locacao` está associada a um `Usuario` (cliente), um `Usuario` (locador) e um `Veiculo`
- O `locador` em uma `Locacao` deve ter role `LOCADOR` ou `ADMIN`
- O `valor_total` de uma `Locacao` é calculado a partir da `valor_diaria` do `Veiculo` e da duração (dias)
- Um `Veiculo` pode pertencer a várias `Categorias` (relacionamento many-to-many)

## Permissões e Autenticação

### Sistema de Autenticação JWT

A API utiliza autenticação baseada em JWT (JSON Web Tokens). Para acessar rotas protegidas:

1. **Registrar ou fazer login** para obter um token JWT
2. **Incluir o token** no header das requisições: `Authorization: Bearer <token>`

### Permissões por Role

#### CLIENTE
- **Público**: Visualizar catálogo de veículos e categorias
- **Autenticado**: 
  - Ver próprios dados (`GET /usuarios/me`)
  - Atualizar próprios dados (`PUT /usuarios/me`)
  - Criar locações (`POST /locacoes`)
  - Ver próprias locações (`GET /locacoes/me`)
  - Ver todas as locações (`GET /locacoes`)

#### LOCADOR
- **Todas as permissões de CLIENTE**
- **Adicional**:
  - Gerenciar veículos (criar, atualizar, deletar)
  - Gerenciar categorias (criar, atualizar, deletar)
  - Listar todos os usuários
  - Gerenciar locações (aprovar, recusar, atualizar, deletar)

#### ADMIN
- **Todas as permissões de LOCADOR**
- **Adicional**:
  - Gerenciar usuários (criar, atualizar, deletar qualquer usuário)
  - Alterar roles de usuários

### Resumo de Acesso

| Endpoint | Público | Autenticado | LOCADOR/ADMIN | ADMIN |
|----------|---------|-------------|---------------|-------|
| `GET /veiculos` | ✅ | ✅ | ✅ | ✅ |
| `GET /categorias` | ✅ | ✅ | ✅ | ✅ |
| `POST /auth/register` | ✅ | - | - | - |
| `POST /auth/login` | ✅ | - | - | - |
| `GET /usuarios/me` | - | ✅ | ✅ | ✅ |
| `PUT /usuarios/me` | - | ✅ | ✅ | ✅ |
| `POST /locacoes` | - | ✅ | ✅ | ✅ |
| `GET /locacoes/me` | - | ✅ | ✅ | ✅ |
| `POST /veiculos` | - | - | ✅ | ✅ |
| `POST /categorias` | - | - | ✅ | ✅ |
| `GET /usuarios` | - | - | ✅ | ✅ |
| `PUT /locacoes/:id` | - | - | ✅ | ✅ |
| `POST /usuarios` | - | - | - | ✅ |
| `PUT /usuarios/:id` | - | - | - | ✅ |
| `DELETE /usuarios/:id` | - | - | - | ✅ |

## Validação de Dados

A API utiliza **Zod** para validação de dados em todas as rotas que recebem body, query params ou params. A validação é feita automaticamente através do middleware `validate`.

### Formato de Erro de Validação

Quando a validação falha, a API retorna um status `400 Bad Request` com o seguinte formato:

```json
{
  "message": "Validation error",
  "errors": [
    {
      "path": ["campo"],
      "message": "Mensagem de erro específica"
    }
  ]
}
```

Exemplo de erro ao tentar registrar um usuário com email inválido:

```json
{
  "message": "Validation error",
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid email address"
    }
  ]
}
```

### Rotas com Validação

Todas as rotas POST e PUT que recebem dados no body possuem validação automática:

- `POST /auth/register` - Valida campos de registro
- `POST /auth/login` - Valida credenciais
- `POST /usuarios` - Valida dados do usuário
- `PUT /usuarios/me` - Valida campos opcionais para atualização
- `PUT /usuarios/me/senha` - Valida nova senha (mínimo 8 caracteres)
- `POST /categorias` - Valida nome e descrição
- `PUT /categorias/:categoria_id` - Valida nome e descrição
- `POST /veiculos` - Valida dados do veículo
- `PUT /veiculos/:veiculo_id` - Valida campos opcionais do veículo
- `POST /locacoes` - Valida dados da locação
- `PUT /locacoes/:id` - Valida campos opcionais da locação

### Campos Opcionais

Alguns campos são opcionais nos schemas de validação:
- `telefone`, `uf`, `cidade`, `logradouro`, `numero` em `/auth/register` e `/usuarios`
- Campos em schemas de atualização (UpdateSchema) são todos opcionais

## Segurança e Sanitização

### Proteção de Dados Sensíveis

Por questões de segurança, a API implementa sanitização automática de dados sensíveis:

1. **Locações**: Ao retornar locações, os campos `usuario` e `senha` são removidos dos objetos `locador` e `cliente`
2. **Respostas de Login/Register**: A senha nunca é retornada nas respostas
3. **Dados de Usuário**: Ao listar ou buscar usuários, a senha não é incluída nas respostas

### Sanitização em Locações

Nas rotas de locações (`GET /locacoes`, `GET /locacoes/:id`, etc.), os objetos de usuário retornados contêm apenas:
- `id`, `nome`, `email`, `telefone`, `uf`, `cidade`, `logradouro`, `numero`, `role`

Os campos `usuario` e `senha` são **sempre removidos** automaticamente.

## Notas de Migração

Este projeto foi migrado de Python/FastAPI para Node.js/Express/TypeScript. As principais mudanças incluem:

- **SQLModel → TypeORM**: Uso de decorators para definir entidades e relacionamentos
- **FastAPI → Express**: Rotas convertidas para Express Router
- **Pydantic → Zod**: Validação de dados com schemas TypeScript usando Zod
- **SQLAlchemy Session → TypeORM Repository**: Padrão Repository para acesso a dados

## Mudanças Arquiteturais

### Unificação de Usuario
- As entidades `Cliente` e `Funcionario` foram unificadas em uma única entidade `Usuario`
- Todos os usuários possuem campos de autenticação (`usuario`, `senha`) e role (`CLIENTE`, `LOCADOR`, `ADMIN`)
- Endpoints `/clientes` e `/funcionarios` foram consolidados em `/usuarios`

### Remoção de Vendas
- A funcionalidade de vendas foi completamente removida do sistema
- A entidade `Venda` e todos os endpoints relacionados (`/vendas`) foram removidos
- O sistema agora foca exclusivamente em locações de veículos

### Atualização de Locação
- O campo `vendedor_id` foi renomeado para `locador_id` em `Locacao`
- O `locador` deve ser um `Usuario` com role `LOCADOR` ou `ADMIN`
- O campo `valor_diaria` foi removido de `Locacao` e movido para `Veiculo`
- O `valor_total` da locação é calculado dinamicamente: `valor_diaria` (do veículo) × número de dias
- Sistema de status implementado: `PENDENTE` → `APROVADA`/`RECUSADA`
- Locações são criadas com status `PENDENTE` e veículo permanece disponível até aprovação
- Apenas locações `APROVADA` marcam o veículo como indisponível

### Renomeação de Role
- O role `VENDEDOR` foi renomeado para `LOCADOR` para maior clareza e consistência com o domínio do sistema

### Sistema de Status de Locação
- **Fluxo**: `PENDENTE` → `APROVADA` (via `/aprovar`) ou `PENDENTE` → `RECUSADA` (via `/recusar`)
- **Criação**: Todas as locações são criadas com status `PENDENTE`
- **Aprovação**: Endpoint `PUT /locacoes/:id/aprovar` - apenas LOCADOR ou ADMIN podem aprovar
- **Recusa**: Endpoint `PUT /locacoes/:id/recusar` - apenas LOCADOR ou ADMIN podem recusar
- **Veículo**: Apenas locações `APROVADA` marcam o veículo como `disponivel = false`

## Autores

- Gabriel Raulino
- Kauan Perdigão

