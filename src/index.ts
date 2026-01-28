import type { PluginObject } from 'vue'
import MedforumWidget from './components/Widget.vue'
import RotatingWheel from './components/RotatingWheel.vue'

export { MedforumWidget, RotatingWheel }

export type * from './types/rotating-wheel'

const MedforumWidgetPlugin: PluginObject<never> = {
  install(Vue) {
    Vue.component('MedforumWidget', MedforumWidget)
    Vue.component('RotatingWheel', RotatingWheel)
  }
}

export default MedforumWidgetPlugin

export type { ComponentOptions } from 'vue'
