NETWORK_NAME=brain-net

.PHONY: network up-postgres up-backend up-frontend down build up

# Cria a rede somente se ainda não existir
network:
	@docker network inspect $(NETWORK_NAME) >/dev/null 2>&1 || \
	(docker network create \
		--subnet=172.25.0.0/16 \
		--gateway=172.25.0.1 \
		--driver=bridge \
		$(NETWORK_NAME) && echo "✅ Rede $(NETWORK_NAME) criada")

up-postgres:
	docker compose -f ./docker-compose.postgres.yml up -d --build

up-backend:
	docker compose -f ./api/docker-compose.backend.yml up -d --build

up-frontend:
	docker compose -f ./web/docker-compose.web.yml up -d --build

# Sobe tudo em modo detached
build: network
	make up-postgres
	make up-backend
	make up-frontend

# Sobe tudo com logs (sem -d)
up: network
	docker compose -f ./web/docker-compose.web.yml up --build
	docker compose -f ./api/docker-compose.backend.yml up --build
	docker compose -f ./docker-compose.postgres.yml up --build

down:
	docker compose -f ./web/docker-compose.web.yml down -v
	docker compose -f ./api/docker-compose.backend.yml down -v
	docker compose -f ./docker-compose.postgres.yml down -/v
