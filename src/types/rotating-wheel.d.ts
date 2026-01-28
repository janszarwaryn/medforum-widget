export type CategoryId = 'communication' | 'marketing' | 'sales' | 'strategy'
export type SegmentAngle = 270 | 0 | 90 | 180
export type ArrowAngle = 315 | 45 | 135 | 225
export type HexColor = `#${string}`
export type CenterDisplayMode = 'category' | 'logo'

export interface Point {
  readonly x: number
  readonly y: number
}

export interface WheelCategory {
  readonly id: CategoryId
  readonly label: string
  readonly color: HexColor
  readonly segmentStartAngle: SegmentAngle
  readonly arrowAngle: ArrowAngle
  readonly personImage: `/images/person${1 | 2 | 3 | 4}.svg` | `/images/person${1 | 2 | 3 | 4}.png`
  readonly title: string
  readonly description: string
}

export interface ArrowPathSegment {
  readonly path: string
  readonly opacity: number
}

export interface ArrowConfig {
  readonly arcSpanDegrees: number
  readonly strokeWidth: number
  readonly startOffsetDegrees: number
  readonly segmentCount: number
  readonly opacityStops: ReadonlyArray<number>
}

export interface RotatingWheelData {
  categories: ReadonlyArray<WheelCategory>
  activeIndex: number
  wheelCenter: Point
  arrowTransformOrigin: string
  arrowRotation: number
  previousArrowRotation: number
  animationFrameId: number | null
  carouselStartTime: number
  logoTimer: number | null
  centerDisplayMode: CenterDisplayMode
  isJumping: boolean
  windowWidth: number
  resizeTimeout: number | null
  isLoading: boolean
  errorMessage: string | null
}

export interface WheelConfig {
  readonly svgSize: number
  readonly outerRadius: number
  readonly innerRadius: number
  readonly indicatorRadius: number
  readonly labelRadius: number
  readonly animationDuration: number
  readonly centerX: number
  readonly centerY: number
}
