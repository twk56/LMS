# Laravel LMS Development Commands
# Alternative to PowerShell for better compatibility

.PHONY: help dev setup test cache-clear cache-warm optimize

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development server
	@echo "Starting development server..."
	php artisan serve

dev-full: ## Start full development environment
	@echo "Starting full development environment..."
	composer run dev

setup: ## Setup the project
	@echo "Setting up the project..."
	composer install
	npm install
	cp .env.example .env
	php artisan key:generate
	php artisan migrate --force
	php artisan ziggy:generate

test: ## Run tests
	@echo "Running tests..."
	php artisan test

cache-clear: ## Clear all caches
	@echo "Clearing all caches..."
	php artisan config:clear
	php artisan route:clear
	php artisan cache:clear
	php artisan view:clear

cache-warm: ## Warm up all caches
	@echo "Warming up caches..."
	php artisan config:cache
	php artisan route:cache
	php artisan view:cache

optimize: ## Optimize for production
	@echo "Optimizing for production..."
	php artisan config:cache
	php artisan route:cache
	php artisan view:cache
	composer install --optimize-autoloader --no-dev

fix: ## Quick fix common issues
	@echo "Fixing common issues..."
	php artisan config:clear
	php artisan route:clear
	php artisan cache:clear
	php artisan view:clear
	php artisan ziggy:generate

clean: ## Clean up temporary files
	@echo "Cleaning up..."
	rm -rf bootstrap/cache/*
	rm -rf storage/framework/cache/*
	rm -rf storage/framework/views/*
	rm -rf storage/framework/sessions/*

install-deps: ## Install all dependencies
	@echo "Installing dependencies..."
	composer install
	npm install

migrate: ## Run migrations
	@echo "Running migrations..."
	php artisan migrate

seed: ## Run seeders
	@echo "Running seeders..."
	php artisan db:seed

fresh: ## Fresh install with seeders
	@echo "Fresh install..."
	php artisan migrate:fresh --seed

# Database commands
db-status: ## Check database status
	@echo "Database status:"
	php artisan migrate:status

db-reset: ## Reset database
	@echo "Resetting database..."
	php artisan migrate:fresh

# Utility commands
routes: ## List all routes
	@echo "Available routes:"
	php artisan route:list

config: ## Show configuration
	@echo "Configuration status:"
	php artisan config:show

logs: ## Show recent logs
	@echo "Recent logs:"
	tail -n 50 storage/logs/laravel.log

# Development helpers
create-admin: ## Create admin user
	@echo "Creating admin user..."
	php artisan tinker --execute="App\Models\User::updateOrCreate(['email' => 'admin@example.com'], ['name' => 'Admin User', 'password' => bcrypt('password'), 'email_verified_at' => now(), 'role' => 'admin']); echo 'Admin user created/updated';"

create-test-user: ## Create test user
	@echo "Creating test user..."
	php artisan tinker --execute="App\Models\User::updateOrCreate(['email' => 'test@test.com'], ['name' => 'Test User', 'password' => bcrypt('123456'), 'email_verified_at' => now(), 'role' => 'student']); echo 'Test user created/updated';"

# Production commands
deploy: ## Deploy to production
	@echo "Deploying to production..."
	composer install --optimize-autoloader --no-dev
	php artisan config:cache
	php artisan route:cache
	php artisan view:cache
	npm run build

# Health checks
health: ## Check application health
	@echo "Checking application health..."
	php artisan route:list | head -5
	php artisan migrate:status | head -5
	@echo "Health check completed"
