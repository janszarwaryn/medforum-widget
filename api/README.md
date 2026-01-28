# API Backend

Simple PHP 8 backend that serves category data via JSON API.

## Local Development

Start the PHP development server:

```bash
php -S localhost:8000 -t api
```

The API will be available at `http://localhost:8000/index.php`.

## Testing

Test API endpoint:

```bash
curl http://localhost:8000/index.php
```

Expected response:

```json
{
  "categories": [
    {
      "name": "Komunikacja",
      "color": "#2D9F37",
      "description": "...",
      "image": "/images/person1.png"
    },
    ...
  ]
}
```

## Deployment

1. Upload `api/` folder to your web server
2. Update `$allowedOrigins` in `api/index.php` with your production domain:

```php
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://yourdomain.com'  // Add production domain
];
```

3. Ensure the web server can read `categories.json`
4. Test: `curl https://yourdomain.com/api/index.php`

## Architecture

- **PHP 8**: Strict types, modern error handling
- **CORS**: Origin whitelist for security
- **Caching**: 1-hour cache headers for performance
- **Data separation**: Business data in JSON, geometry in frontend
- **Fallback**: Frontend uses hardcoded categories if API fails

## Endpoints

### GET /index.php

Returns all categories with business data (name, color, description, image).

**Headers:**
- `Content-Type: application/json; charset=utf-8`
- `Cache-Control: public, max-age=3600`

**Status codes:**
- `200`: Success
- `405`: Method not allowed (only GET supported)
- `500`: Data file not found

## Frontend Integration

The widget automatically fetches from:
- **Development**: `http://localhost:8000/index.php`
- **Production**: `/api/index.php` (relative path)
