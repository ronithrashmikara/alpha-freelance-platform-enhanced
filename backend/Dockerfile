FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

FROM php:8.3-cli-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends \
      libfreetype6-dev libjpeg62-turbo-dev libonig-dev libpng-dev libpq-dev libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) bcmath gd mbstring pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=vendor /app/vendor ./vendor
COPY . .
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PORT=8000
EXPOSE 8000
USER www-data
CMD ["sh", "-c", "php artisan migrate --force && php artisan optimize && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
