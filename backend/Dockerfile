# Etapa 1: Build
FROM node:20 AS build

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install
COPY . .

RUN npx prisma generate
RUN yarn build

# Etapa 2: Produção
FROM node:20 AS production

WORKDIR /usr/src/app

# Netcat para entrypoint.sh
RUN apt-get update && apt-get install -y netcat-openbsd


COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/.env ./
COPY --from=build /usr/src/app/entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]
