import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  logLevel: 'warn',
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/dev.ts', 'src/App.vue'],
      copyDtsFiles: true,
      staticImport: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MedforumWidget',
      fileName: (format) => `medforum-widget.${format}.js`,
      formats: ['es', 'umd']
    },
    cssCodeSplit: false,
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'medforum-widget.css'
          }
          return assetInfo.name || ''
        }
      }
    }
  }
})
