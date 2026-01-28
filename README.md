# Medforum Widget

Professional Vue 2.7 widget component for medical forum integration, built with TypeScript and Vite.

## Project Overview

Vue 2.7 widget library featuring an interactive rotating wheel component for medical forum integration. Displays service categories (Communication, Marketing, Sales, Strategy) with dynamic data loading from PHP backend.

Built as a distributable component library with full TypeScript support and dual-format output (ES modules + UMD).

## Technology Stack

**Frontend**:
- Vue 2.7 with Options API
- TypeScript 5.9 (strict mode)
- Vite 5.4 build system
- Sass (BEM methodology)
- SVG-based graphics

**Backend**:
- PHP 8 (standalone, no dependencies)
- Static JSON data storage
- Built-in PHP development server

**Build Tools**:
- vite-plugin-dts for type generation
- Terser for minification
- Dual output: ES modules + UMD

## Architecture

### Frontend Widget

Interactive SVG-based wheel component (`RotatingWheel.vue`) with:
- 4 clickable segments representing service categories
- Animated arrow indicator
- Auto-rotating carousel (28s cycle)
- Keyboard navigation support
- Responsive design with mobile adaptation

### Backend API

Minimal PHP 8 endpoint serving category data:
- **Location**: `api/` directory
- **Endpoint**: `/api/index.php` (GET only)
- **Data**: Static JSON file (`api/categories.json`)
- **Dependencies**: None - pure PHP, no Composer required
- **CORS**: Configurable origin whitelist

API returns category data (name, color, description, image). Frontend calculates geometry (angles, positions, SVG paths) from array index.

### Data Flow

1. Component mounts → fetches from API
2. API returns JSON with 4 categories
3. Frontend transforms data + calculates SVG geometry
4. Wheel renders with interactive elements
5. On error: Shows error message with retry button

## How It Works

**Component Initialization**:
1. RotatingWheel component created
2. Fetches categories from `api/index.php` (dev: localhost:8000, prod: /api)
3. 2 retry attempts with 10-second timeout
4. Transforms API response to WheelCategory format
5. Computes SVG paths reactively via Vue computed properties

**User Interaction**:
- Click segments/dots → jumps to category
- Arrow keys → cycles through categories
- Auto-carousel → rotates continuously unless interrupted

**Backend Setup**:
No package installation required. PHP 8 must be installed on system.

Start API server:
```bash
php -S localhost:8000 -t api
```

API responds at `http://localhost:8000/index.php` with JSON.

## Features

- Vue 2.7 with full TypeScript support
- Tree-shakeable ES modules
- UMD build for browser usage
- Scoped CSS with zero conflicts
- Automated type definition generation
- Source maps for debugging
- Interactive SVG-based wheel component
- PHP 8 backend with zero dependencies

## Installation

```bash
npm install medforum-widget
```

## Usage

### As Vue Plugin (Auto-registration)

```typescript
import Vue from 'vue'
import MedforumWidget from 'medforum-widget'
import 'medforum-widget/dist/medforum-widget.css'

Vue.use(MedforumWidget)
```

Then use in templates:

```vue
<template>
  <MedforumWidget />
</template>
```

### As Direct Import (Tree-shaking)

```typescript
import { MedforumWidget } from 'medforum-widget'
import 'medforum-widget/dist/medforum-widget.css'

export default {
  components: {
    MedforumWidget
  }
}
```

### Browser (UMD)

```html
<link rel="stylesheet" href="./medforum-widget.css">
<script src="https://cdn.jsdelivr.net/npm/vue@2.7"></script>
<script src="./medforum-widget.umd.js"></script>

<div id="app">
  <medforum-widget></medforum-widget>
</div>

<script>
  new Vue({ el: '#app' })
</script>
```

## Development

### Prerequisites

- Node.js 16+ with npm
- PHP 8+ (for backend API)

### Setup

```bash
# Install frontend dependencies
npm install

# Terminal 1: Start PHP API server
php -S localhost:8000 -t api

# Terminal 2: Start Vite dev server
npm run dev
```

Access at `http://localhost:5173`

### Build Commands

```bash
# Type checking
npm run type-check

# Production build (ES + UMD + types)
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
medforum-widget/
├── api/                 # PHP backend (no dependencies)
│   ├── index.php        # API endpoint
│   └── categories.json  # Category data
├── src/
│   ├── components/      # Vue components
│   ├── services/        # API client
│   ├── constants/       # Configuration
│   ├── utils/           # Geometry helpers
│   └── types/           # TypeScript definitions
├── dist/                # Build output
└── public/              # Static assets
```

## TypeScript Support

This library includes TypeScript definitions. No additional `@types` package needed.

```typescript
import { MedforumWidget } from 'medforum-widget'
import type { ComponentOptions } from 'medforum-widget'
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- IE11: Not supported (ES2017 target)

## Additional Documentation

- `api/README.md` - Backend deployment guide (for production setup)
- `CLAUDE.md` - Development guidelines for Claude Code
- `package.json` - Full dependency list and scripts

All core information is in this README. Other .md files provide supplementary details.

## License

MIT © jan.szarwaryn
