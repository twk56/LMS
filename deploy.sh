#!/bin/bash

# Production Deployment Script for Laravel LMS
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: artisan file not found. Make sure you're in the Laravel project root."
    exit 1
fi

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci

# Build frontend assets
echo "🔨 Building frontend assets..."
npm run build

# Remove dev dependencies
echo "🧹 Pruning development dependencies..."
npm prune --production

# Run database migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# Clear all caches
echo "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Optimize for production
echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan optimize

# Create storage link if it doesn't exist
echo "🔗 Creating storage link..."
php artisan storage:link

# Set proper permissions
echo "🔐 Setting permissions..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || echo "⚠️  Could not set ownership (may need sudo)"

# Restart services (uncomment if needed)
# echo "🔄 Restarting services..."
# sudo systemctl restart php8.4-fpm
# sudo systemctl restart nginx

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should now be live!"
echo "📊 Run 'php artisan prod:report' to check production readiness"
