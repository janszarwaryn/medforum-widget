export const UI_CONFIG = Object.freeze({
  ORBIT_DOT_RADIUS: 18,
  ORBIT_DOT_STROKE_WIDTH: 4,
  SEGMENT_STROKE_WIDTH: 5,
  LABEL_OFFSET_FROM_DOT: 25,
  CENTER_CONTENT_WIDTH: 280,
} as const)

export type UIConfig = typeof UI_CONFIG
