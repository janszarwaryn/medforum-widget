# Stage 1: Build the Vue widget with Node.js
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (for layer caching)
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and config files
COPY src ./src
COPY public ./public
COPY index.html ./
COPY vite.config.ts tsconfig.json ./

# Build the widget (runs type-check + vite build)
RUN npm run build

# Stage 2: Production image with Nginx + PHP-FPM
FROM serversideup/php:8.3-fpm-nginx

# Set working directory
WORKDIR /var/www/html

# Copy built frontend files from builder stage
COPY --from=builder /app/dist ./dist

# Copy images (WARNING: Large files - person4.png is 3.5 MB!)
# Consider optimizing images before deployment if size is a concern
COPY --from=builder /app/public/images ./images

# Copy demo page (index.html loads the widget)
COPY --from=builder /app/index.html ./index.html

# Copy PHP API (pure PHP 8, no Composer needed)
COPY api ./api

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Environment variables for serversideup/php image
# See: https://github.com/serversideup/docker-php/blob/main/docs/content/docs/2.image-variations/fpm-nginx.md
ENV NGINX_WEBROOT=/var/www/html \
    NGINX_CLIENT_MAX_BODY_SIZE=10M \
    NGINX_FASTCGI_BUFFERS="16 16k" \
    NGINX_FASTCGI_BUFFER_SIZE="32k" \
    SSL_MODE=off \
    PHP_MEMORY_LIMIT=256M \
    PHP_MAX_EXECUTION_TIME=30 \
    PHP_OPCACHE_ENABLE=1 \
    PHP_FPM_PM_CONTROL=ondemand \
    PHP_FPM_PM_MAX_CHILDREN=20

# Expose port 8080 (Coolify default for non-root containers)
EXPOSE 8080

# Health check (verifies Nginx responds)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/healthcheck || exit 1
