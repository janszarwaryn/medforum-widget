import type { Point } from '../types/rotating-wheel'

const SVG_ROTATION_OFFSET = 90
const SVG_COORDINATE_PRECISION = 2

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

function formatPoint(p: Point): string {
  return `${p.x.toFixed(SVG_COORDINATE_PRECISION)} ${p.y.toFixed(SVG_COORDINATE_PRECISION)}`
}

function formatArc(
  radius: number,
  largeArc: boolean,
  sweep: boolean,
  end: Point
): string {
  return `A ${radius} ${radius} 0 ${+largeArc} ${+sweep} ${formatPoint(end)}`
}

export function generateDonutSegment(config: {
  center: Point
  outerRadius: number
  innerRadius: number
  startAngle: number
  arcSize?: number
}): string {
  const { center, outerRadius, innerRadius, startAngle, arcSize = 90 } = config
  const endAngle = startAngle + arcSize

  const outerStart = polarToCartesian(center, outerRadius, startAngle)
  const outerEnd = polarToCartesian(center, outerRadius, endAngle)
  const innerStart = polarToCartesian(center, innerRadius, endAngle)
  const innerEnd = polarToCartesian(center, innerRadius, startAngle)

  const largeArc = arcSize > 180

  return [
    `M ${formatPoint(outerStart)}`,
    formatArc(outerRadius, largeArc, true, outerEnd),
    `L ${formatPoint(innerStart)}`,
    formatArc(innerRadius, largeArc, false, innerEnd),
    'Z'
  ].join(' ')
}

export function generateArrowArc(config: {
  center: Point
  radius: number
  startAngle: number
  endAngle: number
}): string {
  const { center, radius, startAngle, endAngle } = config

  const start = polarToCartesian(center, radius, startAngle)
  const end = polarToCartesian(center, radius, endAngle)

  const arcSize = Math.abs(endAngle - startAngle)
  const largeArc = arcSize > 180

  return `M ${formatPoint(start)} ${formatArc(radius, largeArc, true, end)}`
}
