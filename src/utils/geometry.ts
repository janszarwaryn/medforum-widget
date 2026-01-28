import type { Point } from '../types/rotating-wheel'

// SVG coordinate system starts at 3 o'clock, we want 0° = 12 o'clock
const SVG_ROTATION_OFFSET = 90
const SVG_COORDINATE_PRECISION = 2

/**
 * Convert polar coordinates to Cartesian coordinates
 * OPTIMIZED: Groups related params, clear naming
 * @param center - Center point {x, y}
 * @param radius - Distance from center
 * @param angleDegrees - Angle in degrees (0° = top/12 o'clock)
 * @returns Point with x,y coordinates
 */
export function polarToCartesian(
  center: Point,
  radius: number,
  angleDegrees: number
): Point {
  const angleRad = ((angleDegrees - SVG_ROTATION_OFFSET) * Math.PI) / 180
  return {
    x: center.x + radius * Math.cos(angleRad),
    y: center.y + radius * Math.sin(angleRad)
  }
}

/**
 * Format point coordinates for SVG path
 * DRY: Reused in multiple path generation functions
 */
function formatPoint(p: Point): string {
  return `${p.x.toFixed(SVG_COORDINATE_PRECISION)} ${p.y.toFixed(SVG_COORDINATE_PRECISION)}`
}

/**
 * Format SVG arc command
 * DRY: Simplifies path generation
 */
function formatArc(
  radius: number,
  largeArc: boolean,
  sweep: boolean,
  end: Point
): string {
  return `A ${radius} ${radius} 0 ${+largeArc} ${+sweep} ${formatPoint(end)}`
}

/**
 * Generate SVG path for donut segment (quarter circle)
 * OPTIMIZED: Uses formatPoint/formatArc helpers, cleaner code
 * @param config - Segment configuration
 * @returns SVG path string
 */
export function generateDonutSegment(config: {
  center: Point
  outerRadius: number
  innerRadius: number
  startAngle: number
  arcSize?: number
}): string {
  const { center, outerRadius, innerRadius, startAngle, arcSize = 90 } = config
  const endAngle = startAngle + arcSize

  // Calculate arc points using improved API
  const outerStart = polarToCartesian(center, outerRadius, startAngle)
  const outerEnd = polarToCartesian(center, outerRadius, endAngle)
  const innerStart = polarToCartesian(center, innerRadius, endAngle)
  const innerEnd = polarToCartesian(center, innerRadius, startAngle)

  // Build SVG path with helper functions (DRY!)
  const largeArc = arcSize > 180

  return [
    `M ${formatPoint(outerStart)}`,
    formatArc(outerRadius, largeArc, true, outerEnd),
    `L ${formatPoint(innerStart)}`,
    formatArc(innerRadius, largeArc, false, innerEnd),
    'Z'
  ].join(' ')
}

/**
 * Generate curved arrow path from indicator to segment
 * OPTIMIZED: Uses improved API + helper functions
 */
export function generateCurvedArrow(
  center: Point,
  angle: number,
  startRadius: number,
  endRadius: number
): string {
  const start = polarToCartesian(center, startRadius, angle)
  const end = polarToCartesian(center, endRadius, angle)
  const control = polarToCartesian(center, (startRadius + endRadius) / 2, angle)

  return `M ${formatPoint(start)} Q ${formatPoint(control)} ${formatPoint(end)}`
}

/**
 * Generate SVG arc path for arrow indicator on orbit circle
 * PATTERN: Uses config object like generateDonutSegment for consistency
 * @param config - Arc configuration
 * @returns SVG path string for arc
 */
export function generateArrowArc(config: {
  center: Point
  radius: number
  startAngle: number
  endAngle: number
}): string {
  const { center, radius, startAngle, endAngle } = config

  const start = polarToCartesian(center, radius, startAngle)
  const end = polarToCartesian(center, radius, endAngle)

  // Small arc (< 180°), clockwise sweep
  const arcSize = Math.abs(endAngle - startAngle)
  const largeArc = arcSize > 180

  return `M ${formatPoint(start)} ${formatArc(radius, largeArc, true, end)}`
}
