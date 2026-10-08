FROM php:8.3-cli

WORKDIR /app
COPY site/ /app/site/
COPY router.php /app/router.php

ENV PORT=8080
ENV PHP_CLI_SERVER_WORKERS=4
EXPOSE 8080

# Встроенный PHP-сервер (без Apache): отдаёт статику и api/lead.php
CMD ["sh", "-c", "exec php -S 0.0.0.0:${PORT} -t /app/site /app/router.php"]
