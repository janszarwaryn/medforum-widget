// Strict literal types
export type CategoryId = 'communication' | 'marketing' | 'sales' | 'strategy'
export type SegmentAngle = 270 | 0 | 90 | 180  // Start angles
export type ArrowAngle = 315 | 45 | 135 | 225  // Center angles (gdzie strzałka wskazuje)
export type HexColor = `#${string}`  // Enforces hex format

// Immutable interfaces (readonly)
export interface Point {
  readonly x: number
  readonly y: number
}

export interface WheelCategory {
  readonly id: CategoryId
  readonly label: string
  readonly color: HexColor
  readonly segmentStartAngle: SegmentAngle  // Początek segmentu
  readonly arrowAngle: ArrowAngle           // Środek segmentu (dla strzałki)
  readonly personImage: `/images/person${1 | 2 | 3 | 4}.svg` | `/images/person${1 | 2 | 3 | 4}.png`
  readonly title: string
  readonly description: string
}

export interface RotatingWheelData {
  readonly categories: ReadonlyArray<WheelCategory>
  activeIndex: number
  isAnimating: boolean
  segmentPaths: string[]
  labelPositions: Array<{ x: number; y: number; anchor: string }>
  wheelCenter: Point
  arrowTransformOrigin: string
}

// Configuration object for flexibility
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
