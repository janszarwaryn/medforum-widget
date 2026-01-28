# Medforum Widget

Vue 2.7 widget with rotating wheel component + PHP 8 API backend.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts both API (localhost:8000) and Vite dev server (localhost:5173).

Access: http://localhost:5173

## Production Build

```bash
npm run build
```

Output: `dist/` (ES + UMD + CSS + types)

## Deployment (Coolify)

1. Push to Git
2. Coolify: Select **Dockerfile** build pack
3. Set port: **8080**
4. Set domain: your-domain.com
5. Deploy

CORS already configured for: www.rekru-medforum.jspace.pl

## Project Structure

```
medforum-widget/
├── api/              # PHP 8 backend
│   ├── index.php     # API endpoint
│   └── categories.json
├── src/              # Vue 2.7 + TypeScript
├── dist/             # Build output
└── Dockerfile        # Production container
```

## Commands

```bash
npm run dev          # Start API + Vite (both servers)
npm run build        # Production build
npm run type-check   # TypeScript validation
```

## Docs

- `api/README.md` - Backend details
- `CLAUDE.md` - Claude Code guidelines

## License

MIT © jan.szarwaryn
