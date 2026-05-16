.PHONY: help dev build test lint clean docker-up docker-down db-migrate db-seed k8s-apply

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	docker-compose up -d postgres redis
	npm run dev

build: ## Build all packages
	npm run build

test: ## Run all tests
	npm run test

lint: ## Run linter
	npm run lint

clean: ## Clean build artifacts
	npm run clean

docker-up: ## Start all Docker services
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-build: ## Build Docker images
	docker-compose build

db-migrate: ## Run database migrations
	npm run db:migrate

db-seed: ## Seed database
	npm run db:seed

db-reset: ## Reset database
	npm run db:migrate -- --fresh
	npm run db:seed

k8s-apply: ## Apply Kubernetes manifests
	kubectl apply -f k8s/

k8s-delete: ## Delete Kubernetes resources
	kubectl delete -f k8s/

logs: ## Follow logs
	docker-compose logs -f

ps: ## Show running containers
	docker-compose ps
