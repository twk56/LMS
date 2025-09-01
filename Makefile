# Laravel Development Makefile
# Provides convenient commands for development

.PHONY: help dev setup fix clean test-user install prod-check prod-check-migrate deploy docs test-production render-deploy

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev              - Start development environment (full setup)"
	@echo "  make setup            - Setup project from scratch"
	@echo "  make fix              - Quick fix common issues"
	@echo "  make clean            - Clean all caches and processes"
	@echo "  make install          - Install dependencies"
	@echo "  make test-user        - Create test user"
	@echo "  make dev-simple       - Start simple development servers"
	@echo "  make prod-check       - Run production verification"
	@echo "  make prod-check-migrate - Run production verification with migrations"
	@echo "  make test-production  - Test production build locally"
	@echo "  make render-deploy    - Prepare for Render deployment"
	@echo "  make deploy           - Show deployment instructions"
	@echo "  make docs             - Show documentation structure"

# Full development setup
dev:
	@echo "🚀 Starting full development environment..."
	@chmod +x scripts/development/dev-setup.sh
	@./scripts/development/dev-setup.sh

# Setup project from scratch
setup:
	@echo "🔧 Setting up project from scratch..."
	@composer install
	@npm install
	@composer run setup
	@composer run create-test-user
	@echo "✅ Setup complete!"

# Quick fix common issues
fix:
	@echo "🔧 Quick fixing common issues..."
	@chmod +x scripts/maintenance/quick-fix.sh
	@./scripts/maintenance/quick-fix.sh

# Clean everything
clean:
	@echo "🧹 Cleaning everything..."
	@pkill -f "php artisan serve" 2>/dev/null || true
	@pkill -f "npm run dev" 2>/dev/null || true
	@pkill -f "vite" 2>/dev/null || true
	@pkill -f "concurrently" 2>/dev/null || true
	@composer run fix
	@rm -rf node_modules/.vite 2>/dev/null || true
	@echo "✅ Clean complete!"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@composer install
	@npm install
	@echo "✅ Dependencies installed!"

# Create test user
test-user:
	@echo "👤 Creating test user..."
	@composer run create-test-user

# Simple development servers
dev-simple:
	@echo "🚀 Starting simple development servers..."
	@composer run fix
	@echo "Starting Laravel server on port 8000..."
	@php artisan serve --port=8000 &
	@echo "Starting Vite server..."
	@npm run dev &
	@echo "✅ Servers started!"
	@echo "🌐 Laravel: http://localhost:8000"
	@echo "⚡ Vite: http://localhost:5173"
	@echo "Press Ctrl+C to stop"
	@wait

# Production verification
prod-check:
	@echo "🔍 Running production verification..."
	@bash scripts/deployment/verify_prod.sh

# Production verification with migrations
prod-check-migrate:
	@echo "🔍 Running production verification with migrations..."
	@bash scripts/deployment/verify_prod.sh --migrate

# Show deployment instructions
deploy:
	@echo "🚀 Deployment Instructions:"
	@echo ""
	@echo "📖 Read deployment guide:"
	@echo "   cat deployment/RENDER_DEPLOYMENT.md"
	@echo ""
	@echo "🔧 Run deployment script:"
	@echo "   ./scripts/deployment/deploy-render.sh"
	@echo ""
	@echo "✅ Check production readiness:"
	@echo "   ./scripts/deployment/verify_prod.sh"

# Test production build locally
test-production:
	@echo "🧪 Testing production build locally..."
	@chmod +x scripts/deployment/test-production.sh
	@./scripts/deployment/test-production.sh

# Prepare for Render deployment
render-deploy:
	@echo "🚀 Preparing for Render deployment..."
	@echo ""
	@echo "✅ Files ready for deployment:"
	@echo "   - render.yaml (Render configuration)"
	@echo "   - Dockerfile (Container configuration)"
	@echo "   - Fixed CoursePolicy for published courses"
	@echo "   - Added flash message support"
	@echo "   - Fixed database seeder"
	@echo ""
	@echo "📋 Next steps:"
	@echo "1. Push changes to GitHub:"
	@echo "   git add ."
	@echo "   git commit -m 'Prepare for Render deployment'"
	@echo "   git push origin main"
	@echo ""
	@echo "2. Go to Render Dashboard:"
	@echo "   https://dashboard.render.com"
	@echo ""
	@echo "3. Create New Web Service:"
	@echo "   - Connect GitHub repository"
	@echo "   - Use render.yaml configuration"
	@echo "   - Deploy automatically"
	@echo ""
	@echo "4. Test deployment:"
	@echo "   - Check build logs"
	@echo "   - Visit your app URL"
	@echo "   - Test /health endpoint"

# Show documentation structure
docs:
	@echo "📚 Documentation Structure:"
	@echo ""
	@echo "📖 Main Documentation:"
	@echo "   docs/README.md"
	@echo ""
	@echo "📁 Scripts Documentation:"
	@echo "   scripts/README.md"
	@echo ""
	@echo "🚀 Deployment Documentation:"
	@echo "   deployment/README.md"
	@echo ""
	@echo "⚙️ Configuration Documentation:"
	@echo "   config-files/README.md"
