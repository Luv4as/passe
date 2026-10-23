# Passe — Mercado de Jogadores

**Processo Seletivo SENAI/PE – CÓD. 237 DESENVOLVEDOR I (FULLSTACK)**

**Autor:** Lucas Gonçalves Venancio / **Contato:** venanciolucas310@gmail.com

Aplicação fullstack para gerenciamento de uma liga fictícia de futebol, cobrindo todo o ciclo de vida de jogadores: gestão financeira e contratual de clubes, mercado de transferências (com multas e comissões), escalação tática e simulação de partidas baseada em duelos de atributos.


## 1. Pré-requisitos

Para executar o projeto **sem Docker** (modo desenvolvimento), instale:

| Ferramenta | Versão utilizada | Instalação |
| :--- | :--- | :--- |
| **Node.js** | `22.x` LTS | [nodejs.org](https://nodejs.org) — inclui `npm` |
| **npm** | `10.x` | Incluído com Node.js |
| **PostgreSQL** | `16` | Executado via Docker (veja abaixo) |

Para executar **com Docker** (produção / avaliação):

| Ferramenta | Versão utilizada |
| :--- | :--- |
| **Docker Engine** | `24.0+` |
| **Docker Compose** | `v2` (plugin, `docker compose`) |

> O PostgreSQL **não precisa ser instalado localmente** — ele é iniciado automaticamente pelo Docker Compose.


## 2. Banco de Dados

> O banco criado pelos passos abaixo inicia **totalmente vazio** — sem jogadores, clubes, transações ou partidas.

### 2.1. Subir o banco via Docker

A partir da **raiz do repositório**:

```bash
docker compose up -d db
```

### 2.2. Aplicar as migrations (criar as tabelas)

Na pasta `backend/`:

```bash
cd backend
cp .env.example .env   # ajuste DATABASE_URL se necessário
npm ci
npx prisma migrate deploy
```

### 2.3. Recriar o banco do zero

Para **apagar tudo e recriar**

```bash
# Na pasta backend/
npx prisma migrate reset --force
```

> Este comando derruba o banco, recria-o e reaaplica todas as migrations. Nenhum dado de seed é inserido automaticamente.


## 3. Instalação e Execução

### 3.1. Modo desenvolvimento (sem Docker)

Execute cada bloco em um terminal separado.

#### Banco de dados (na raiz do repositório)

```bash
docker compose up -d db
```

#### Backend (na pasta `backend/`)

```bash
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run start:dev
```

- **API disponível em:** `http://localhost:3000`  
  *(o script da banca acrescenta `/api/v1` — o prefixo já está configurado no servidor)*
- **Documentação Swagger:** `http://localhost:3000/api/docs`

#### Frontend (em outro terminal, a partir da raiz do repositório)

```bash
cd frontend
npm ci
npm run dev
```

- **Interface disponível em:** `http://localhost:5173`

---

### 3.2. Modo produção (Docker Compose completo)

A partir da **raiz do repositório**:

```bash
cp .env.example .env        # preencha POSTGRES_USER, POSTGRES_PASSWORD e POSTGRES_DB
docker compose up --build
```

- **API:** `http://localhost:3000`
- **Frontend:** `http://localhost:5173`

> As imagens são construídas a partir deste repositório com pacotes de registros públicos (`registry.npmjs.org`, `hub.docker.com`). Nenhum recurso externo controlado pelo autor é utilizado.


## 4. Variáveis de Ambiente

O arquivo `.env.example` na raiz do repositório e em `backend/` documenta todas as variáveis necessárias.

### Raiz do repositório (`.env.example`) — usado pelo Docker Compose

```env
POSTGRES_USER=passe
POSTGRES_PASSWORD=change-me
POSTGRES_DB=passe
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### `backend/.env.example` — usado pelo backend em desenvolvimento local

```env
DATABASE_URL="postgresql://passe:change-me@localhost:5432/passe?schema=public"
FRONTEND_URL="http://localhost:5173"
```

| Variável | Descrição |
| :--- | :--- |
| `POSTGRES_USER` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL |
| `POSTGRES_DB` | Nome do banco de dados |
| `DATABASE_URL` | String de conexão completa do Prisma |
| `FRONTEND_URL` | URL de origem do frontend (usada no CORS do NestJS) |

> O frontend lê `NEXT_PUBLIC_API_URL` (opcional). Se não definida, usa `http://localhost:3000/api/v1` por padrão.
>
> No Docker Compose, essa variável é incorporada durante o build do frontend. Para executar
> em outro domínio ou IP, defina `NEXT_PUBLIC_API_URL` no `.env` da raiz antes de executar
> `docker compose up --build`. O container do backend aplica automaticamente as migrations
> versionadas com `prisma migrate deploy` antes de iniciar a API.


## 5. Estrutura de Pastas

```
passe/
├── docker-compose.yml        # Orquestra db, backend e frontend
├── .env.example              # Variáveis do Compose
├── backend/
│   ├── prisma/
│   │   └── schema.prisma     # Schema do banco e migrations
│   ├── src/
│   │   ├── modules/
│   │   │   ├── clubs/        # CRUD de clubes
│   │   │   ├── players/      # CRUD de jogadores
│   │   │   ├── market/       # Compra, venda e transações
│   │   │   └── league/       # Escalações, partidas e classificação
│   │   ├── prisma/           # PrismaService (singleton)
│   │   └── common/           # Pipes, middlewares e utilitários
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── app/              # Rotas Next.js (App Router)
    │   │   └── (main)/
    │   │       ├── market/   # Páginas de jogadores e clubes do mercado
    │   │       └── league/   # Partidas e classificação
    │   ├── components/       # Componentes de UI (tabelas, dialogs, drawers)
    │   ├── hooks/            # Custom hooks de dados (fetch + mutação)
    │   ├── contexts/         # Contextos React
    │   └── lib/
    │       └── api.ts        # Cliente HTTP centralizado (fetch wrapper)
    └── Dockerfile
```

### Bibliotecas utilizadas

#### Backend

| Biblioteca | Motivo |
| :--- | :--- |
| **NestJS** (`@nestjs/core`, `@nestjs/common`, etc.) | Framework Node.js com estrutura modular, injeção de dependência e decorators — facilita organização de controllers, services e pipes |
| **Prisma 7** (`prisma`, `@prisma/client`) | ORM type-safe com migrations versionadas e geração de tipos TypeScript a partir do schema |
| **`@prisma/adapter-pg`** | Adapter oficial do Prisma para usar o driver `pg` diretamente, com suporte a connection pooling |
| **`@nestjs/swagger`** | Geração automática de documentação OpenAPI (Swagger UI) a partir dos decorators |
| **`class-validator` / `class-transformer`** | Validação e transformação automática dos DTOs via `ValidationPipe` |
| **`@json2csv/plainjs`** | Conversão de arrays de objetos para CSV, usada no endpoint de exportação de transações |
| **`rxjs`** | Dependência obrigatória do NestJS (programação reativa) |

#### Frontend

| Biblioteca | Motivo |
| :--- | :--- |
| **Next.js 16** | Framework React com App Router, SSR/SSG e otimizações de build; modo `standalone` para containers Docker |
| **React 19** | Biblioteca de UI base |
| **Tailwind CSS v4** | Utility-first CSS — estilização rápida e consistente sem arquivos CSS separados |
| **`@base-ui/react`** | Componentes headless acessíveis (Base UI), base para os dialogs e drawers da aplicação |
| **`shadcn`** | CLI para instalação de componentes Radix/Base UI pré-estilizados com Tailwind |
| **`class-variance-authority`** | Gerencia variantes de componentes com Tailwind (ex.: botões com variantes `primary`, `ghost`) |
| **`lucide-react`** | Biblioteca de ícones SVG para React |
| **`tw-animate-css`** | Preset de animações CSS para Tailwind, usado nas transições de dialogs e drawers |


## 6. Decisões e Premissas

- **Mudanças em alguns visuais do frontend** Em algumas telas do frontend o design não ficou pixel perfect por questão de tempo, como os campos de futebol usados nas telas de escalação e de duelos.
- **Commits semanticos:** Ao longo do desenvolvimento desse projeto o uso de commits semanticos foi feito para deixar o histórico e organização do versionamento de código mais legível. Segue abaixo a lista de commits semanticos e quando usei/usaria cada um:

| Tipo | Descrição | Relação com SemVer / Observações |
| :--- | :--- | :--- |
| **`fix`** | Indica que o trecho de código está solucionando um problema (*bug fix*). | Relaciona-se com **PATCH**. |
| **`feat`** | Indica que o trecho de código está incluindo um novo recurso. | Relaciona-se com **MINOR**. |
| **`docs`** | Indica mudanças na documentação (ex: alterações no `README.md`). | Não inclui alterações no código da aplicação. |
| **`style`** | Alterações referentes a formatações de código, ponto e vírgula, espaços em branco, regras de lint... | Não inclui alterações funcionais no código. |
| **`refactor`** | Mudanças devido a refatorações que não alteram a funcionalidade existente (ex: melhorias de performance ou legibilidade pós *code review*). | Mantém o mesmo comportamento funcional. |
| **`build`** | Modificações em arquivos de *build* e gerenciamento de dependências. | Relacionado à infraestrutura de compilação/empacotamento. |
| **`test`** | Alterações em testes, seja criando, alterando ou excluindo testes unitários/integrados. | Não inclui alterações no código da aplicação. |
| **`chore`** | Atualizações de tarefas de *build*, configurações de ferramentas ou arquivos do repositório (ex: adicionar entradas no `.gitignore`). | Não inclui alterações no código da aplicação. |



## 7. Funcionalidades não implementadas

- Nenhuma funcionalidade prevista no enunciado foi deixada de fora.

## 8. Uso de Inteligência Artificial

Utilizei o **Google Antigravity (Gemini)** como assistente. A IA foi usada para:

- Geração de componentes complexos da interface do figma
- Revisão de lógica de negócio (cálculo de multas e comissões)
- Sugestão e correção de queries Prisma
- Revisão dos Dockerfiles e `docker-compose.yml`
- Auxílio na escrita deste README para ficar de acordo com o que foi pedido nas regras
- Como e por que foram utilizadas: Para agilizar tarefas repetitivas de boilerplate de código e validação de regras do desafio.

Todo o código gerado foi revisado, adaptado e validado manualmente. As decisões de arquitetura e modelagem foram tomadas por mim.
