import type { WheelConfig, WheelCategory } from '../types/rotating-wheel'

export const WHEEL_CONFIG: WheelConfig = {
  svgSize: 640,
  outerRadius: 200,
  innerRadius: 150,
  indicatorRadius: 260,
  labelRadius: 260,
  animationDuration: 600,
  get centerX() { return this.svgSize / 2 },
  get centerY() { return this.svgSize / 2 }
} as const

export const ARROW_CONFIG = Object.freeze({
  arcSpanDegrees: 55,
  strokeWidth: 1.5,
  startOffsetDegrees: -60,
  segmentCount: 10,
  opacityStops: Object.freeze([0.05, 0.15, 0.27, 0.40, 0.53, 0.65, 0.75, 0.84, 0.92, 1.0])
})

export const CAROUSEL_DURATION = 28000  // ms
export const CATEGORY_DISPLAY_DURATION = 4000  // ms
export const JUMP_DURATION = 600  // ms
