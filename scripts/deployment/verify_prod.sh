#!/bin/bash

# Production Verification Script for Laravel LMS
# Usage: ./scripts/verify_prod.sh [--migrate] [-h|--help]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
MIGRATE_FLAG=false
HELP_FLAG=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --migrate)
            MIGRATE_FLAG=true
            shift
            ;;
        -h|--help)
            HELP_FLAG=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Show help
if [[ "$HELP_FLAG" == true ]]; then
    echo "Production Verification Script for Laravel LMS"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --migrate    Run database migrations"
    echo "  -h, --help   Show this help message"
    echo ""
    echo "This script performs end-to-end verification of the Laravel application:"
    echo "  - Environment validation"
    echo "  - Backend setup and testing"
    echo "  - Frontend build verification"
    echo "  - Production readiness report"
    echo "  - Health endpoint testing"
    echo ""
    exit 0
fi

echo -e "${BLUE}🚀 Starting Production Verification...${NC}"
echo ""

# Function to print section headers
print_section() {
    echo -e "${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "artisan" ]]; then
    echo -e "${RED}❌ Error: artisan file not found. Make sure you're in the Laravel project root.${NC}"
    exit 1
fi

# Load environment variables from .env file
if [[ -f ".env" ]]; then
    echo "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
    print_success "Environment variables loaded"
else
    print_error ".env file not found"
    exit 1
fi

# 1. Print versions
print_section "System Versions"
echo "PHP: $(php -v | head -n1)"
echo "Composer: $(composer --version | head -n1)"
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"
echo "Laravel: $(php artisan --version)"
echo ""

# 2. Environment sanity check
print_section "Environment Validation"

# Check required environment variables
REQUIRED_ENV_VARS=(
    "APP_KEY"
    "DB_CONNECTION"
    "REDIS_HOST"
    "REDIS_PORT"
    "CACHE_STORE"
    "SESSION_DRIVER"
    "QUEUE_CONNECTION"
)

# Check database-specific variables
if [[ "${DB_CONNECTION:-}" == "sqlite" ]]; then
    # For SQLite, we don't need DB_HOST and DB_DATABASE
    print_success "Using SQLite database (no host/database required)"
elif [[ -n "${DB_CONNECTION:-}" ]]; then
    # For other databases, check for host and database
    if [[ -z "${DB_HOST:-}" ]]; then
        MISSING_VARS+=("DB_HOST")
    fi
    if [[ -z "${DB_DATABASE:-}" ]]; then
        MISSING_VARS+=("DB_DATABASE")
    fi
fi

MISSING_VARS=()
for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        MISSING_VARS+=("$var")
    fi
done

if [[ ${#MISSING_VARS[@]} -eq 0 ]]; then
    print_success "All required environment variables are set"
else
    print_error "Missing environment variables: ${MISSING_VARS[*]}"
    echo "Please check your .env file"
    exit 1
fi

# Check VITE_* variables
VITE_VARS=$(env | grep -E "^VITE_" | wc -l)
if [[ $VITE_VARS -gt 0 ]]; then
    print_success "Vite environment variables found: $VITE_VARS"
else
    print_warning "No VITE_* environment variables found"
fi
echo ""

# 3. Backend setup
print_section "Backend Setup"

# Install PHP dependencies
echo "Installing PHP dependencies..."
composer install --no-interaction --no-progress
print_success "PHP dependencies installed"

# Clear config cache
echo "Clearing configuration cache..."
php artisan config:clear
print_success "Configuration cache cleared"

# Generate application key if missing
if [[ -z "${APP_KEY:-}" ]] || [[ "$APP_KEY" == "base64:" ]]; then
    echo "Generating application key..."
    php artisan key:generate
    print_success "Application key generated"
else
    print_success "Application key already set"
fi

# Run migrations if requested
if [[ "$MIGRATE_FLAG" == true ]]; then
    echo "Running database migrations..."
    php artisan migrate --force
    print_success "Database migrations completed"
else
    print_warning "Skipping migrations (use --migrate to run them)"
fi
echo ""

# 4. Frontend setup
print_section "Frontend Setup"

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm ci
print_success "Node.js dependencies installed"

# Build frontend assets
echo "Building frontend assets..."
npm run build
print_success "Frontend assets built"

# Check if manifest exists
if [[ -f "public/build/.vite/manifest.json" ]]; then
    print_success "Vite manifest found"
else
    print_error "Vite manifest not found"
    exit 1
fi

# Prune production dependencies if on server
if [[ "${NODE_ENV:-}" == "production" ]] || [[ "${APP_ENV:-}" == "production" ]]; then
    echo "Pruning development dependencies..."
    npm prune --production
    print_success "Development dependencies pruned"
fi
echo ""

# 5. Optimization
print_section "Application Optimization"

# Cache configuration
echo "Caching configuration..."
php artisan config:cache
print_success "Configuration cached"

# Cache routes
echo "Caching routes..."
php artisan route:cache
print_success "Routes cached"

# Cache views
echo "Caching views..."
php artisan view:cache
print_success "Views cached"

# Cache events
echo "Caching events..."
php artisan event:cache
print_success "Events cached"

# Optimize
echo "Running optimization..."
php artisan optimize
print_success "Application optimized"
echo ""

# 6. Production report
print_section "Production Readiness Report"

echo "Generating production report..."
php artisan prod:report --format=md

# Get the report path
REPORT_PATH="storage/app/prod_report.md"
if [[ -f "$REPORT_PATH" ]]; then
    print_success "Production report generated"
    echo "Report saved to: $REPORT_PATH"
    
    # Check for failures in the report
    if grep -q "❌ FAIL" "$REPORT_PATH"; then
        print_error "Production report contains failures"
        echo "Please review the report and fix any issues"
        exit 1
    else
        print_success "No failures found in production report"
    fi
else
    print_error "Production report not found"
    exit 1
fi
echo ""

# 7. Health endpoint test
print_section "Health Endpoint Test"

# Check if APP_URL is set
if [[ -n "${APP_URL:-}" ]]; then
    echo "Testing health endpoint at: $APP_URL/health"
    
    # Test health endpoint
    if command -v jq &> /dev/null; then
        # Pretty print with jq if available
        HEALTH_RESPONSE=$(curl -fsSL "$APP_URL/health" 2>/dev/null || echo "{}")
        if [[ "$HEALTH_RESPONSE" != "{}" ]]; then
            echo "Health endpoint response:"
            echo "$HEALTH_RESPONSE" | jq .
            
            # Check if health is ok
            if echo "$HEALTH_RESPONSE" | jq -e '.status == "healthy"' &> /dev/null; then
                print_success "Health endpoint is healthy"
            else
                print_warning "Health endpoint returned non-healthy status"
            fi
        else
            print_error "Health endpoint request failed"
        fi
    else
        # Simple curl without jq
        if curl -fsSL "$APP_URL/health" &> /dev/null; then
            print_success "Health endpoint is accessible"
        else
            print_error "Health endpoint request failed"
        fi
    fi
else
    print_warning "APP_URL not set, skipping health endpoint test"
fi
echo ""

# 8. Final summary
print_section "Verification Summary"

print_success "✅ Environment validation passed"
print_success "✅ Backend setup completed"
print_success "✅ Frontend build successful"
print_success "✅ Application optimization completed"
print_success "✅ Production report generated"

if [[ "$MIGRATE_FLAG" == true ]]; then
    print_success "✅ Database migrations completed"
fi

if [[ -n "${APP_URL:-}" ]]; then
    print_success "✅ Health endpoint tested"
fi

echo ""
echo -e "${GREEN}🎉 Production verification completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the production report: $REPORT_PATH"
echo "2. Deploy to production using: ./deploy.sh"
echo "3. Monitor the application using the health endpoint"
echo ""
