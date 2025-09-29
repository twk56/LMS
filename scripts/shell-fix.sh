#!/bin/bash

# Shell Fix Script for Laravel LMS
# Fixes PowerShell issues and provides alternative commands

set -e

echo "🔧 Fixing shell issues and providing alternatives..."

# Function to check if we're in PowerShell
is_powershell() {
    if [[ "$SHELL" == *"powershell"* ]] || [[ "$TERM_PROGRAM" == *"PowerShell"* ]]; then
        return 0
    else
        return 1
    fi
}

# Function to run command with proper shell
run_command() {
    local cmd="$1"
    local description="$2"
    
    echo "🔄 $description..."
    
    if is_powershell; then
        echo "⚠️  Detected PowerShell - using bash alternative"
        bash -c "$cmd"
    else
        eval "$cmd"
    fi
}

# Clear all caches
echo "🧹 Clearing all caches..."
run_command "php artisan config:clear" "Clearing config cache"
run_command "php artisan route:clear" "Clearing route cache"
run_command "php artisan cache:clear" "Clearing application cache"
run_command "php artisan view:clear" "Clearing view cache"

# Warm up caches (only if not in PowerShell)
if ! is_powershell; then
    echo "🔥 Warming up caches..."
    run_command "php artisan config:cache" "Caching configuration"
    run_command "php artisan route:cache" "Caching routes"
    run_command "php artisan view:cache" "Caching views"
else
    echo "⚠️  Skipping cache warming in PowerShell"
fi

# Generate Ziggy routes
echo "🔄 Generating Ziggy routes..."
run_command "php artisan ziggy:generate" "Generating Ziggy routes"

# Check database connection
echo "🗄️  Checking database connection..."
run_command "php artisan tinker --execute=\"echo 'Database: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED');\"" "Testing database connection"

# Show available commands
echo ""
echo "✅ Shell fix completed!"
echo ""
echo "📋 Available commands:"
echo "  make help              - Show all available commands"
echo "  make dev               - Start development server"
echo "  make cache-clear       - Clear all caches"
echo "  make cache-warm        - Warm up caches"
echo "  make fix               - Quick fix common issues"
echo "  make health            - Check application health"
echo ""
echo "🔧 Alternative commands (if PowerShell fails):"
echo "  bash -c 'php artisan serve'     - Start server"
echo "  bash -c 'php artisan route:list' - List routes"
echo "  bash -c 'php artisan migrate:status' - Check migrations"
echo ""

# Create a simple bash script for common commands
cat > dev.sh << 'EOF'
#!/bin/bash
# Simple development script

case "$1" in
    "serve")
        php artisan serve
        ;;
    "dev")
        npm run dev
        ;;
    "clear")
        php artisan config:clear
        php artisan route:clear
        php artisan cache:clear
        php artisan view:clear
        ;;
    "cache")
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        ;;
    "routes")
        php artisan route:list
        ;;
    "migrate")
        php artisan migrate
        ;;
    "status")
        php artisan migrate:status
        ;;
    "test")
        php artisan test
        ;;
    *)
        echo "Usage: ./dev.sh [serve|dev|clear|cache|routes|migrate|status|test]"
        echo "  serve   - Start Laravel server"
        echo "  dev     - Start Vite development"
        echo "  clear   - Clear all caches"
        echo "  cache   - Warm up caches"
        echo "  routes  - List all routes"
        echo "  migrate - Run migrations"
        echo "  status  - Check migration status"
        echo "  test    - Run tests"
        ;;
esac
EOF

chmod +x dev.sh

echo "📝 Created dev.sh script for easy commands"
echo "   Usage: ./dev.sh [command]"
echo ""

echo "🎉 All done! Your shell issues should be fixed."
