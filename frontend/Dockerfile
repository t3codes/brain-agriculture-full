# Etapa 1: build da aplicação Angular
FROM node:22.16.0 AS build

WORKDIR /app

# Copiando arquivos de dependência
COPY package.json yarn.lock ./

# Instalando dependências
RUN yarn install

# Copiando o restante dos arquivos do projeto
COPY . .

# Build da aplicação
RUN yarn run build

# Etapa 2: nginx para servir os arquivos compilados
FROM nginx:alpine

# Copiando arquivos de build para o diretório padrão do nginx
COPY --from=build /app/dist/brain-agriculture-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf


# Porta padrão do nginx
EXPOSE 80

# Comando para rodar o nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
