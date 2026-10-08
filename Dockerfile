FROM php:8.3-apache

# curl для вебхука Битрикс24
RUN apt-get update && apt-get install -y --no-install-recommends libcurl4-openssl-dev \
 && docker-php-ext-install curl \
 && rm -rf /var/lib/apt/lists/* \
 && a2enmod rewrite expires deflate headers \
 && sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

COPY site/ /var/www/html/

# Railway передаёт порт в переменной PORT
CMD ["sh", "-c", "sed -i \"s/Listen 80/Listen ${PORT:-80}/\" /etc/apache2/ports.conf && sed -i \"s/:80>/:${PORT:-80}>/\" /etc/apache2/sites-enabled/000-default.conf && apache2-foreground"]
