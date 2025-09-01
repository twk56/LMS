# Use PHP 8.3 with Apache (required by some dependencies)
FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zlib1g-dev \
    libzip-dev \
    zip \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    nodejs \
    npm \
    && docker-php-ext-configure zip \
    && docker-php-ext-install pdo pdo_sqlite mbstring exif pcntl bcmath gd zip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Allow composer to run as root in container
ENV COMPOSER_ALLOW_SUPERUSER=1

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy package.json files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy application code
COPY . .

# Create .env from production template if not present and adjust DB path
RUN if [ -f deployment/env.production ]; then \
        cp deployment/env.production .env; \
    elif [ -f env.production ]; then \
        cp env.production .env; \
    else \
        cp .env.example .env || true; \
    fi \
    && sed -i 's|^DB_DATABASE=.*|DB_DATABASE=/var/www/html/database/database.sqlite|' .env \
    && sed -i 's|^APP_ENV=.*|APP_ENV=production|' .env \
    && sed -i 's|^APP_DEBUG=.*|APP_DEBUG=false|' .env

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Create SQLite database
RUN touch database/database.sqlite \
    && chown www-data:www-data database/database.sqlite

# Build frontend assets
RUN npm run build

# Generate application key
RUN php artisan key:generate --force

# Run migrations and seed
RUN php artisan migrate --force --seed

# Cache configuration
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan optimize

# Generate Ziggy routes
RUN php artisan ziggy:generate

# Configure Apache
RUN a2enmod rewrite
COPY docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
