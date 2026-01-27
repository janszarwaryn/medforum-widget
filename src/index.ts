import type { PluginObject } from 'vue'
import MedforumWidget from './components/Widget.vue'
import RotatingWheel from './components/RotatingWheel.vue'

// Named exports for tree-shaking
export { MedforumWidget, RotatingWheel }

// Type exports
export type * from './types/rotating-wheel'

// Default export as Vue plugin
const MedforumWidgetPlugin: PluginObject<never> = {
  install(Vue) {
    Vue.component('MedforumWidget', MedforumWidget)
    Vue.component('RotatingWheel', RotatingWheel)
  }
}

export default MedforumWidgetPlugin

// Type exports for TypeScript consumers
export type { ComponentOptions } from 'vue'
