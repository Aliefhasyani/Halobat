FROM mcr.microsoft.com/devcontainers/php:0-8.2

# Install OS packages and PHP extensions needed for Laravel + SQLite
RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get update \
    && apt-get -y install --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libicu-dev \
        libpng-dev \
        libonig-dev \
        sqlite3 \
        libsqlite3-dev \
        curl \
        ca-certificates \
        gnupg \
    && docker-php-ext-install pdo pdo_sqlite zip intl bcmath gd

# Install Composer globally (the base devcontainer might already have composer)
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('composer-setup.php');"

# Install Node.js (LTS) and npm
RUN apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /workspace

CMD ["/bin/bash"]