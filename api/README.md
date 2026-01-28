# API Backend

PHP 8 JSON API serving category data.

## Endpoints

**GET /api/index.php** → Returns 4 categories (name, color, description, image)

## Tech

- PHP 8 (strict types)
- Static JSON data (`categories.json`)
- CORS whitelist
- 1-hour cache headers

## Dev

```bash
php -S localhost:8000 -t api
curl http://localhost:8000/index.php
```

## Production

CORS configured for: `www.rekru-medforum.jspace.pl`
