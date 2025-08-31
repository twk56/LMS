#!/bin/bash

# Quick Fix Script for Laravel Development Issues
# This script quickly fixes common development problems

set -e

echo "🔧 Quick Fix for Laravel Development Issues"

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

# Function to kill processes on ports
kill_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Killing process on port $port"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
}

# Quick cleanup
print_status "Cleaning up processes..."
pkill -f "php artisan serve" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true

kill_port 8000
kill_port 5173
kill_port 5174
kill_port 5175
kill_port 5176

# Clear caches
print_status "Clearing caches..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

# Clear Vite cache
rm -rf node_modules/.vite 2>/dev/null || true

# Fix environment
print_status "Fixing environment configuration..."
sed -i 's/SESSION_DRIVER=redis/SESSION_DRIVER=file/' .env 2>/dev/null || true
sed -i 's/QUEUE_CONNECTION=redis/QUEUE_CONNECTION=database/' .env 2>/dev/null || true
sed -i 's/CACHE_STORE=redis/CACHE_STORE=file/' .env 2>/dev/null || true

# Generate Ziggy routes
print_status "Generating Ziggy routes..."
php artisan ziggy:generate 2>/dev/null || true

# Fix permissions
print_status "Fixing file permissions..."
chmod -R 755 storage bootstrap/cache 2>/dev/null || true

print_success "Quick fix completed!"
echo ""
echo "Now you can run:"
echo "  npm run dev"
echo "  php artisan serve"
echo ""
echo "Or use the full setup script:"
echo "  ./scripts/dev-setup.sh"
