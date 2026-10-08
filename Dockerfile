FROM php:8.3-apache

# Apache берёт порт из переменной окружения PORT (Railway задаёт её сам)
ENV PORT=8080
RUN rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf \
 && a2enmod mpm_prefork rewrite expires deflate headers \
 && sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf \
 && sed -i 's/Listen 80$/Listen ${PORT}/' /etc/apache2/ports.conf \
 && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/' /etc/apache2/sites-available/000-default.conf \
 && echo 'ServerName localhost' > /etc/apache2/conf-available/servername.conf \
 && a2enconf servername

COPY site/ /var/www/html/
RUN chown -R www-data:www-data /var/www/html

EXPOSE 8080

# Перед стартом ещё раз оставляем ровно один MPM (на Railway бывает загружено несколько)
CMD ["sh", "-c", "rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf && a2enmod mpm_prefork >/dev/null && exec apache2-foreground"]
