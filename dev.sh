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
