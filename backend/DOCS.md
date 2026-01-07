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
│   └── routes/
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
```

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

### Categorias

- `GET /categorias` - Lista categorias (com paginação: `?offset=0&limit=10`)
- `GET /categorias/:categoria_id` - Busca categoria por ID
- `POST /categorias` - Cria categoria (`{ "nome": "...", "descricao": "..." }`)
- `PUT /categorias/:categoria_id` - Atualiza categoria
- `DELETE /categorias/:categoria_id` - Remove categoria

### Usuários

- `GET /usuarios` - Lista usuários (com paginação: `?offset=0&limit=10`)
- `GET /usuarios/:id` - Busca usuário por ID
- `GET /usuarios/nome/:nome` - Busca usuários por nome
- `GET /usuarios/role/:role` - Busca usuários por role (cliente, locador, admin)
- `POST /usuarios` - Cria usuário
- `PUT /usuarios/:id` - Atualiza usuário
- `DELETE /usuarios/:id` - Remove usuário

### Veículos

- `GET /veiculos` - Lista veículos (com paginação, `?disponiveis=true`)
- `GET /veiculos/veiculo-com-categoria/` - Lista veículos com categorias
- `GET /veiculos/:veiculo_id` - Busca veículo por ID
- `GET /veiculos/categoria/:categoria` - Lista veículos por categoria
- `GET /veiculos/preco/?min_preco=0&max_preco=1000000` - Lista veículos por faixa de preço
- `GET /veiculos/ano/:ano` - Lista veículos por ano
- `GET /veiculos/modelo/:modelo` - Lista veículos por modelo
- `POST /veiculos` - Cria veículo
- `PUT /veiculos/:veiculo_id` - Atualiza veículo
- `DELETE /veiculos/:veiculo_id` - Remove veículo
- `POST /veiculos/categoria/:veiculo_id` - Associa categoria ao veículo

### Locações

- `GET /locacoes` - Lista locações (com paginação)
- `GET /locacoes/:id` - Busca locação por ID
- `POST /locacoes` - Cria locação com status PENDENTE (valor_total é calculado automaticamente)
- `PUT /locacoes/:id` - Atualiza locação
- `PUT /locacoes/:id/aprovar` - Aprova uma locação pendente (muda status para APROVADA)
- `PUT /locacoes/:id/recusar` - Recusa uma locação pendente (muda status para RECUSADA)
- `DELETE /locacoes/:id` - Remove locação

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

## Permissões

- `CLIENTE`: Pode visualizar catálogo de veículos e solicitar locações
- `LOCADOR`: Pode gerenciar locações (aprovar, recusar, alterar) e visualizar catálogo
- `ADMIN`: Permissão total - pode inserir, atualizar e deletar veículos, usuários e gerenciar locações

## Notas de Migração

Este projeto foi migrado de Python/FastAPI para Node.js/Express/TypeScript. As principais mudanças incluem:

- **SQLModel → TypeORM**: Uso de decorators para definir entidades e relacionamentos
- **FastAPI → Express**: Rotas convertidas para Express Router
- **Pydantic → class-validator**: Validação de dados (não implementada nesta versão inicial)
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

