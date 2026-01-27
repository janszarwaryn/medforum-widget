# Medforum Widget

Professional Vue 2.7 widget component for medical forum integration, built with TypeScript and Vite.

## Features

- ✅ Vue 2.7 with Composition API support
- ✅ Full TypeScript support with type definitions
- ✅ Tree-shakeable ES modules
- ✅ UMD build for browser usage
- ✅ Scoped CSS with zero conflicts
- ✅ Source maps for debugging

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

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run type-check

# Build library
npm run build
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

## License

MIT © jan.szarwaryn
