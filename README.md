# 🌾 Brain Agriculture

Sistema completo de gestão agrícola com **NestJS** no backend, **Angular** no frontend e **PostgreSQL** como banco de dados. Tudo containerizado com **Docker** e **Docker Compose**.

---

## 📦 Requisitos | Requirements

- [Docker](https://www.docker.com/) instalado
- [Docker Compose](https://docs.docker.com/compose/) instalado

---

## 🚀 Como executar o projeto | How to run the project

### 1. Clone o repositório | Clone the repository

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 2. Build dos containers | Build the containers

```bash
docker-compose build
```

🔧 Esse comando irá:

- Criar containers para o **frontend Angular**, **backend NestJS** e o **banco PostgreSQL**;
- Instalar todas as dependências via `npm`/`yarn`;
- Executar automaticamente o comando:

```bash
npx prisma migrate deploy
```

💡 Isso garante que o **banco de dados seja migrado automaticamente** com base no schema definido em `prisma/schema.prisma`.

---

### 3. Subir a aplicação | Start the app

```bash
docker-compose up
```

Isso iniciará os 3 serviços:

- **Frontend (Angular):** http://localhost:4200
- **Backend (NestJS + Swagger):** http://localhost:3000/api
- **Banco de Dados (PostgreSQL):** porta 5432 (local)

---

## 🗂️ Estrutura dos serviços | Services structure

| Serviço | Porta | Tecnologia  |
|---------|-------|--------------|
| Frontend | `4200` | Angular     |
| Backend  | `3000` | NestJS + Swagger |
| Database | `5432` | PostgreSQL  |

---

## 🛠️ Banco de dados | Database

Após o build, o NestJS executa:

```bash
npx prisma migrate deploy
```

Isso aplica todas as **migrations** criadas no projeto e garante que o banco esteja sincronizado com o schema do Prisma.

---

## 🧪 Testes (em breve) | Tests (coming soon)

Testes autonatizados foram aplicados mas devido a rapidez do projeto estão precários, necessitando de ajustes, peço desculpas mas pela pressa eu nao ajustei.

---

## 📄 Licença | License

Projeto open-source desenvolvido por **Tharlles Silva Té** – livre para uso e contribuição.
