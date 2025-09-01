#!/bin/bash

# Test Production Build Script
echo "🧪 Testing production build locally..."

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [[ ! -f "artisan" ]]; then
    print_error "artisan file not found. Make sure you're in the Laravel project root."
    exit 1
fi

print_status "Starting production build test..."

# 1. Install production dependencies
print_status "Installing production PHP dependencies..."
composer install --no-dev --optimize-autoloader

# 2. Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm ci

# 3. Build frontend assets
print_status "Building frontend assets..."
npm run build

# 4. Create fresh test database
print_status "Creating fresh test database..."
rm -f database/test_production.sqlite
touch database/test_production.sqlite

# 5. Set up environment for testing
print_status "Setting up test environment..."
cp .env .env.backup
cat > .env.test << EOF
APP_NAME="Laravel LMS"
APP_ENV=production
APP_KEY=base64:$(php artisan key:generate --show)
APP_DEBUG=false
APP_URL=http://localhost:8000

LOG_CHANNEL=stderr
LOG_LEVEL=info

DB_CONNECTION=sqlite
DB_DATABASE=$(pwd)/database/test_production.sqlite

BROADCAST_DRIVER=log
CACHE_STORE=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120
EOF

# 6. Use test environment
cp .env.test .env

# 7. Generate application key
print_status "Generating application key..."
php artisan key:generate --force

# 8. Run migrations and seed
print_status "Running migrations and seeding..."
php artisan migrate --force --seed

# 9. Cache optimization
print_status "Optimizing caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# 10. Generate Ziggy routes
print_status "Generating Ziggy routes..."
php artisan ziggy:generate

# 11. Test health endpoint
print_status "Testing health endpoint..."
php artisan serve --host=127.0.0.1 --port=8001 &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
if curl -f http://127.0.0.1:8001/health > /dev/null 2>&1; then
    print_success "Health endpoint is working"
else
    print_error "Health endpoint is not responding"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Test main page
if curl -f http://127.0.0.1:8001 > /dev/null 2>&1; then
    print_success "Main page is accessible"
else
    print_error "Main page is not accessible"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Stop test server
kill $SERVER_PID 2>/dev/null || true

# 12. Restore original environment
print_status "Restoring original environment..."
mv .env.backup .env

# Clear caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Reinstall dev dependencies
composer install

print_success "✅ Production build test completed successfully!"
print_status "Your application is ready for deployment to Render."

echo ""
print_status "Next steps:"
echo "  1. Push your changes to GitHub"
echo "  2. Create a new Web Service on Render"
echo "  3. Connect your GitHub repository"
echo "  4. Use the render.yaml configuration"
echo ""
print_success "🚀 Ready for deployment!"
