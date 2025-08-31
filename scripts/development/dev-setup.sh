#!/bin/bash

# Development Environment Setup Script
# This script automates common Laravel + Vite development issues

set -e

echo "🚀 Starting Laravel Development Environment Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Port $port is in use. Killing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to clean up processes
cleanup_processes() {
    print_status "Cleaning up existing processes..."
    
    # Kill existing Laravel and Vite processes
    pkill -f "php artisan serve" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "concurrently" 2>/dev/null || true
    
    # Kill processes on common ports
    kill_port 8000
    kill_port 5173
    kill_port 5174
    kill_port 5175
    kill_port 5176
    
    sleep 3
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
    fi
    
    # Update .env for development
    print_status "Configuring .env for development..."
    
    # Set session driver to file
    sed -i 's/SESSION_DRIVER=redis/SESSION_DRIVER=file/' .env 2>/dev/null || true
    
    # Set queue connection to database
    sed -i 's/QUEUE_CONNECTION=redis/QUEUE_CONNECTION=database/' .env 2>/dev/null || true
    
    # Set cache store to file
    sed -i 's/CACHE_STORE=redis/CACHE_STORE=file/' .env 2>/dev/null || true
    
    print_success "Environment configured"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install PHP dependencies
    if [ -f composer.json ]; then
        print_status "Installing PHP dependencies..."
        composer install --no-interaction
    fi
    
    # Install Node.js dependencies
    if [ -f package.json ]; then
        print_status "Installing Node.js dependencies..."
        npm install
    fi
    
    print_success "Dependencies installed"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Create SQLite database if it doesn't exist
    if [ ! -f database/database.sqlite ]; then
        print_status "Creating SQLite database..."
        touch database/database.sqlite
    fi
    
    # Run migrations
    print_status "Running migrations..."
    php artisan migrate --force
    
    # Seed database if seeder exists
    if [ -f database/seeders/DatabaseSeeder.php ]; then
        print_status "Seeding database..."
        php artisan db:seed --force
    fi
    
    print_success "Database setup complete"
}

# Function to create test user
create_test_user() {
    print_status "Creating test user..."
    
    # Check if test user exists
    if php artisan tinker --execute="echo App\Models\User::where('email', 'test@test.com')->exists() ? 'exists' : 'not_exists';" 2>/dev/null | grep -q "not_exists"; then
        php artisan tinker --execute="
        App\Models\User::create([
            'name' => 'Test User',
            'email' => 'test@test.com',
            'password' => bcrypt('123456'),
            'email_verified_at' => now(),
            'role' => 'student'
        ]);
        echo 'Test user created successfully';
        " 2>/dev/null || true
        print_success "Test user created (email: test@test.com, password: 123456)"
    else
        print_status "Test user already exists"
    fi
}

# Function to clear caches
clear_caches() {
    print_status "Clearing caches..."
    
    php artisan config:clear
    php artisan route:clear
    php artisan cache:clear
    php artisan view:clear
    
    # Clear Vite cache
    rm -rf node_modules/.vite 2>/dev/null || true
    
    print_success "Caches cleared"
}

# Function to fix common issues
fix_common_issues() {
    print_status "Fixing common issues..."
    
    # Fix file permissions
    chmod -R 755 storage bootstrap/cache 2>/dev/null || true
    
    # Generate application key if not set
    if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
        print_status "Generating application key..."
        php artisan key:generate
    fi
    
    # Generate Ziggy routes
    print_status "Generating Ziggy routes..."
    php artisan ziggy:generate 2>/dev/null || true
    
    print_success "Common issues fixed"
}

# Function to start development servers
start_servers() {
    print_status "Starting development servers..."
    
    # Start Laravel server in background
    print_status "Starting Laravel server on port 8000..."
    php artisan serve --port=8000 > /dev/null 2>&1 &
    LARAVEL_PID=$!
    
    # Wait for Laravel to start
    sleep 5
    
    # Start Vite in background
    print_status "Starting Vite development server..."
    npm run dev > /dev/null 2>&1 &
    VITE_PID=$!
    
    # Wait for Vite to start
    sleep 10
    
    print_success "Development servers started"
    echo ""
    echo "🌐 Laravel Server: http://localhost:8000"
    echo "⚡ Vite Server: http://localhost:5173 (or next available port)"
    echo ""
    echo "📝 Test Login:"
    echo "   Email: test@test.com"
    echo "   Password: 123456"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    
    # Function to cleanup on exit
    cleanup_on_exit() {
        print_status "Shutting down servers..."
        kill $LARAVEL_PID 2>/dev/null || true
        kill $VITE_PID 2>/dev/null || true
        cleanup_processes
        print_success "Servers stopped"
        exit 0
    }
    
    # Set trap to cleanup on exit
    trap cleanup_on_exit INT TERM
    
    # Keep script running
    wait
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check PHP
    if ! command -v php &> /dev/null; then
        print_error "PHP is not installed"
        exit 1
    fi
    
    # Check Composer
    if ! command -v composer &> /dev/null; then
        print_error "Composer is not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "System requirements met"
}

# Main execution
main() {
    echo "=========================================="
    echo "  Laravel Development Environment Setup"
    echo "=========================================="
    echo ""
    
    check_requirements
    cleanup_processes
    setup_environment
    install_dependencies
    setup_database
    create_test_user
    clear_caches
    fix_common_issues
    start_servers
}

# Run main function
main "$@"
