#!/bin/bash

# Production Setup Script for Laravel Learning Platform

echo "🚀 Setting up Laravel Learning Platform for Production..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
composer install --optimize-autoloader --no-dev

# 2. Generate application key
echo "🔑 Generating application key..."
php artisan key:generate

# 3. Clear and cache configuration
echo "⚙️ Optimizing configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Run migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# 5. Seed database
echo "🌱 Seeding database..."
php artisan db:seed --class=SidebarTestDataSeeder

# 6. Set permissions
echo "🔐 Setting permissions..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# 7. Build frontend assets
echo "🎨 Building frontend assets..."
npm ci
npm run build

# 8. Create admin user
echo "👤 Creating admin user..."
php artisan make:command CreateProductionAdmin
php artisan create:production-admin

echo "✅ Production setup completed!"
echo "🌐 Application is ready for production use."
echo "📊 Admin credentials: kk@kk / 1234"
echo "👨‍🎓 Student credentials: test@test / 1234"
