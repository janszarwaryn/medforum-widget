<template>
  <div class="rotating-wheel" role="region" aria-label="Koło usług 360°">
    
    <img
      src="/images/pattern.svg"
      alt=""
      class="rotating-wheel__pattern"
      aria-hidden="true"
    />

    
    <h2 class="rotating-wheel__title">
      Wsparcie i obsługa organizacji 360°
    </h2>

    
    <div class="rotating-wheel__auto-toggle">
      <label class="rotating-wheel__toggle-label">
        <input
          type="checkbox"
          v-model="autoRotate"
          class="rotating-wheel__toggle-input"
        />
        <span class="rotating-wheel__toggle-slider"></span>
        <span class="rotating-wheel__toggle-text">automatyczna karuzela ({{ autoRotate ? countdown + 's' : UI_CONFIG.AUTO_ROTATE_INTERVAL_SECONDS + 's' }})</span>
      </label>
    </div>

    <div class="rotating-wheel__content">
      
      <div class="rotating-wheel__persona">
        <transition name="fade" mode="out-in">
          <img
            :key="activeCategory.id"
            :src="activeCategory.personImage"
            :alt="`Przedstawiciel ${activeCategory.label} - profesjonalna obsługa`"
            class="rotating-wheel__persona-image"
          />
        </transition>
      </div>

      
      <div class="rotating-wheel__wheel-container">
        <svg
          :viewBox="`0 0 ${WHEEL_CONFIG.svgSize} ${WHEEL_CONFIG.svgSize}`"
          class="rotating-wheel__svg"
          role="img"
          aria-labelledby="wheel-title wheel-desc"
          xmlns="http://www.w3.org/2000/svg"
        >
          
          <title id="wheel-title">Koło kategorii usług 360°</title>
          <desc id="wheel-desc">
            Interaktywne koło pokazujące 4 kategorie: Komunikacja, Marketing, Sprzedaż, Strategia
          </desc>

          
          <g role="list" aria-label="Segmenty kategorii">
            <path
              v-for="(cat, index) in categories"
              :key="`segment-${cat.id}`"
              :d="segmentPaths[index]"
              :fill="cat.color"
              class="rotating-wheel__segment"
              :class="{ 'rotating-wheel__segment--active': index === activeIndex }"
              :aria-label="`Segment ${cat.label}`"
              @click="selectCategory(index)"
            />
          </g>

          
          <circle
            :cx="wheelCenter.x"
            :cy="wheelCenter.y"
            :r="WHEEL_CONFIG.indicatorRadius"
            fill="none"
            stroke="#e0e0e0"
            stroke-width="2"
            class="rotating-wheel__orbit"
          />

          
          <g
            class="rotating-wheel__arrow-indicator"
            :style="{
              transform: `rotate(${arrowRotation}deg)`,
              transformOrigin: `${wheelCenter.x}px ${wheelCenter.y}px`
            }"
          >
            <defs>
              
              <marker
                id="arrow-head-marker"
                markerWidth="12"
                markerHeight="12"
                refX="6"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M 0 1 L 6 5 L 0 9"
                  stroke="#000000"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </marker>
            </defs>

            
            <path
              v-for="(segment, idx) in arrowPathSegments"
              :key="`arrow-seg-${idx}`"
              :d="segment.path"
              fill="none"
              stroke="#000000"
              :stroke-opacity="segment.opacity"
              :stroke-width="ARROW_CONFIG.strokeWidth"
              stroke-linecap="round"
              :marker-end="idx === arrowPathSegments.length - 1 ? 'url(#arrow-head-marker)' : undefined"
              class="rotating-wheel__arrow-path"
            />
          </g>

          
          <circle
            v-for="(cat, index) in categories"
            :key="`orbit-dot-${cat.id}`"
            :cx="indicatorPositions[index].x"
            :cy="indicatorPositions[index].y"
            :r="UI_CONFIG.ORBIT_DOT_RADIUS"
            :fill="index === activeIndex ? cat.color : '#e0e0e0'"
            stroke="white"
            :stroke-width="UI_CONFIG.ORBIT_DOT_STROKE_WIDTH"
            class="rotating-wheel__orbit-dot"
            @click="selectCategory(index)"
          />

          
          <g role="list" aria-label="Kategorie">
            <text
              v-for="(cat, index) in categories"
              :key="`label-${cat.id}`"
              :x="labelPositions[index].x"
              :y="labelPositions[index].y"
              :text-anchor="labelPositions[index].anchor"
              dominant-baseline="middle"
              class="rotating-wheel__label"
              :class="{ 'rotating-wheel__label--active': index === activeIndex }"
              role="button"
              :tabindex="0"
              :aria-pressed="index === activeIndex"
              :aria-label="`Wybierz kategorię ${cat.label}`"
              @click="selectCategory(index)"
              @keydown.enter.prevent="selectCategory(index)"
              @keydown.space.prevent="selectCategory(index)"
            >
              {{ cat.label }}
            </text>
          </g>
        </svg>

        
        <div class="rotating-wheel__center-content" aria-live="polite">
          <transition name="fade-text" mode="out-in">
            <div :key="activeCategory.id" class="rotating-wheel__center-inner">
              <h3 class="rotating-wheel__center-title">
                {{ activeCategory.title }}
              </h3>
              <p class="rotating-wheel__center-description">
                {{ activeCategory.description }}
              </p>
            </div>
          </transition>
        </div>
      </div>
    </div>

    
    <div class="rotating-wheel__cta">
      <a
        href="#oferta"
        class="rotating-wheel__cta-text"
        aria-label="Poznaj naszą ofertę - przejdź do szczegółów"
      >
        poznaj naszą ofertę
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { WheelCategory, Point, RotatingWheelData, ArrowPathSegment } from '../types/rotating-wheel'
import { WHEEL_CONFIG, DEFAULT_CATEGORIES, ARROW_CONFIG } from '../constants/wheel-config'
import { UI_CONFIG } from '../constants/ui-config'
import { polarToCartesian, generateDonutSegment, generateArrowArc } from '../utils/geometry'

export default Vue.extend({
  name: 'RotatingWheel',

  data(): RotatingWheelData {
    return {
      activeIndex: 0,
      categories: DEFAULT_CATEGORIES,
      segmentPaths: [],
      labelPositions: [],
      wheelCenter: {
        x: WHEEL_CONFIG.centerX,
        y: WHEEL_CONFIG.centerY
      },
      arrowTransformOrigin: `${WHEEL_CONFIG.centerX}px ${WHEEL_CONFIG.centerY}px`,
      arrowPathSegments: [],
      currentRotation: 315,
      autoRotate: false,
      autoRotateInterval: null,
      countdown: UI_CONFIG.AUTO_ROTATE_INTERVAL_SECONDS
    }
  },

  computed: {
    activeCategory(): WheelCategory {
      return this.categories[this.activeIndex]
    },

    // Pozycje dotów na zewnętrznej orbicie
    indicatorPositions(): Array<Point> {
      return this.categories.map(cat =>
        polarToCartesian(
          this.wheelCenter,
          WHEEL_CONFIG.indicatorRadius,
          cat.arrowAngle
        )
      )
    },

    // Arrow rotation angle (points to active category) - always clockwise
    arrowRotation(): number {
      return this.currentRotation
    },

    WHEEL_CONFIG() {
      return WHEEL_CONFIG
    },

    ARROW_CONFIG() {
      return ARROW_CONFIG
    },

    UI_CONFIG() {
      return UI_CONFIG
    }
  },

  watch: {
    autoRotate(enabled: boolean): void {
      if (enabled) {
        this.startAutoRotate()
      } else {
        this.stopAutoRotate()
      }
    }
  },

  created(): void {
    // CRITICAL: Calculate paths once in created(), NOT in computed!
    // Computed would recalculate even though these never change
    this.segmentPaths = this.categories.map(cat =>
      generateDonutSegment({
        center: this.wheelCenter,
        outerRadius: WHEEL_CONFIG.outerRadius,
        innerRadius: WHEEL_CONFIG.innerRadius,
        startAngle: cat.segmentStartAngle
      })
    )

    this.labelPositions = this.categories.map(cat =>
      this.calculateLabelPosition(cat.arrowAngle)
    )

    // Calculate arrow path segments for smooth fade
    // Divide 60° arc into 4 segments of 15° each
    const segmentSize = ARROW_CONFIG.arcSpanDegrees / ARROW_CONFIG.segmentCount

    this.arrowPathSegments = ARROW_CONFIG.opacityStops.map((opacity, idx) => {
      const startAngle = ARROW_CONFIG.startOffsetDegrees + (idx * segmentSize)
      const endAngle = startAngle + segmentSize

      return Object.freeze({
        path: generateArrowArc({
          center: this.wheelCenter,
          radius: WHEEL_CONFIG.indicatorRadius,
          startAngle,
          endAngle
        }),
        opacity
      })
    })
  },

  mounted(): void {
    // Preload images
    this.categories.forEach((cat, index) => {
      const img = new Image()
      img.loading = index === 0 ? 'eager' : 'lazy'
      img.decoding = 'async'
      img.src = cat.personImage
      img.onerror = () => console.error(`Failed to load: ${cat.personImage}`)
    })

    // Keyboard event listener
    document.addEventListener('keydown', this.handleKeyDown)
  },

  beforeDestroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown)
    this.stopAutoRotate()
  },

  methods: {
    calculateRotationSteps(currentRotation: number): number {
      return Math.floor(currentRotation / 360)
    },

    normalizeRotationTarget(
      currentRotation: number,
      currentBaseAngle: number,
      targetAngle: number
    ): number {
      const diff = targetAngle - currentBaseAngle
      const rotationSteps = this.calculateRotationSteps(currentRotation)

      if (diff < 0 && Math.abs(diff) > 180) {
        return targetAngle + (rotationSteps + 1) * 360
      }

      if (diff > 0 && Math.abs(diff) > 180) {
        return targetAngle + (rotationSteps - 1) * 360
      }

      let normalizedTarget = targetAngle + rotationSteps * 360

      if (normalizedTarget < currentRotation) {
        normalizedTarget += 360
      }

      return normalizedTarget
    },

    selectCategory(index: number, fromAutoRotate: boolean = false): void {
      if (index === this.activeIndex) return

      if (!fromAutoRotate && this.autoRotate) {
        this.autoRotate = false
      }

      const previousIndex = this.activeIndex
      const targetAngle = this.categories[index].arrowAngle
      const currentBaseAngle = this.categories[this.activeIndex].arrowAngle

      const normalizedTarget = this.normalizeRotationTarget(
        this.currentRotation,
        currentBaseAngle,
        targetAngle
      )

      this.currentRotation = normalizedTarget
      this.activeIndex = index

      this.$emit('category-change', {
        category: this.categories[index],
        index,
        previousIndex
      })
    },

    handleKeyDown(event: KeyboardEvent): void {
      switch(event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          this.selectNext()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          this.selectPrevious()
          break
      }
    },

    selectNext(): void {
      const next = (this.activeIndex + 1) % this.categories.length
      this.selectCategory(next)
    },

    selectPrevious(): void {
      const prev = (this.activeIndex - 1 + this.categories.length) % this.categories.length
      this.selectCategory(prev)
    },

    calculateLabelPosition(angle: number): { x: number; y: number; anchor: string } {
      const pos = polarToCartesian(
        this.wheelCenter,
        WHEEL_CONFIG.labelRadius,
        angle
      )

      // Determine text-anchor based on angle
      let anchor = 'middle'
      let xOffset = 0

      if (angle === 45 || angle === 135) {
        anchor = 'start'
        xOffset = UI_CONFIG.LABEL_OFFSET_FROM_DOT
      } else if (angle === 225 || angle === 315) {
        anchor = 'end'
        xOffset = -UI_CONFIG.LABEL_OFFSET_FROM_DOT
      }

      return {
        x: pos.x + xOffset,
        y: pos.y,
        anchor
      }
    },

    startAutoRotate(): void {
      this.stopAutoRotate()
      this.countdown = UI_CONFIG.AUTO_ROTATE_INTERVAL_SECONDS
      this.autoRotateInterval = window.setInterval(() => {
        this.countdown--
        if (this.countdown === 0) {
          const next = (this.activeIndex + 1) % this.categories.length
          this.selectCategory(next, true)
          this.countdown = UI_CONFIG.AUTO_ROTATE_INTERVAL_SECONDS
        }
      }, 1000)
    },

    stopAutoRotate(): void {
      if (this.autoRotateInterval !== null) {
        clearInterval(this.autoRotateInterval)
        this.autoRotateInterval = null
        this.countdown = UI_CONFIG.AUTO_ROTATE_INTERVAL_SECONDS
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use 'sass:math';




$rotating-wheel-color-communication: #2d9f37b2 !default;
$rotating-wheel-color-marketing: #1790c9cc !default;
$rotating-wheel-color-sales: #f3aa21cf !default;
$rotating-wheel-color-strategy: #f58220 !default;

$colors-segments: (
  'communication': $rotating-wheel-color-communication,
  'marketing': $rotating-wheel-color-marketing,
  'sales': $rotating-wheel-color-sales,
  'strategy': $rotating-wheel-color-strategy
) !default;

$color-text-primary: #1a1a1a !default;
$color-text-secondary: #666 !default;
$color-text-inactive: #999 !default;
$color-white: #fff !default;
$color-border: #e0e0e0 !default;




$font-family-base: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif !default;

$font-size-title: 52px !default;
$font-size-subtitle: 32px !default;
$font-size-body: 15px !default;
$font-size-label: 18px !default;
$font-size-label-active: 20px !default;

$font-weight-regular: 400 !default;
$font-weight-semibold: 600 !default;
$font-weight-bold: 700 !default;

$letter-spacing-tight: -1px !default;




$rotating-wheel-animation-duration: 600ms !default;


$_wheel-size: 640px;  // Zwiększone z 500px - żeby pomieścić etykiety
$_outer-radius: 200px;
$_inner-radius: 140px;
$_center-x: math.div($_wheel-size, 2);  // Teraz 320px
$_center-y: math.div($_wheel-size, 2);  // Teraz 320px




$duration-arrow: 600ms !default;
$duration-text: 300ms !default;
$duration-image: 400ms !default;
$easing-smooth: cubic-bezier(0.4, 0, 0.2, 1) !default;




$breakpoint-mobile: 768px !default;
$breakpoint-tablet: 1024px !default;




$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12) !default;
$shadow-indicator: 0 2px 8px rgba(0, 0, 0, 0.15) !default;




@function color-segment($name) {
  @return map.get($colors-segments, $name);
}




@mixin transition-transform($duration: $rotating-wheel-animation-duration) {
  transition: transform $duration $easing-smooth;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    will-change: auto;
  }
}

@mixin transition-opacity($duration: $duration-text) {
  transition: opacity $duration $easing-smooth;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@mixin focus-outline {
  outline: 2px solid color-segment('marketing');
  outline-offset: 4px;
}




.rotating-wheel {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  font-family: $font-family-base;
  background-color: #F7F7F9;  // Jasno-szare tło

  // ============================================================================
  // PATTERN DECORATION
  // ============================================================================
  &__pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 350px;
    height: 350px;
    pointer-events: none;
    z-index: 0;
    opacity: 0.8;
  }

  // ============================================================================
  // TITLE
  // ============================================================================
  &__title {
    position: relative;
    z-index: 1;
    font-size: $font-size-title;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    text-align: center;
    margin-bottom: 0;
    letter-spacing: $letter-spacing-tight;
    line-height: 1.2;

    @media (max-width: $breakpoint-mobile) {
      font-size: 36px;
    }
  }

  // ============================================================================
  // AUTO-ROTATE TOGGLE
  // ============================================================================
  &__auto-toggle {
    position: relative;
    z-index: 1;
    text-align: center;
    margin: 0 0 60px 0;
    padding: 0;

    @media (max-width: $breakpoint-mobile) {
      margin-bottom: 40px;
    }
  }

  &__toggle-label {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
  }

  &__toggle-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .rotating-wheel__toggle-slider {
      background-color: #2D9F37;

      &::before {
        transform: translateX(20px);
      }
    }

    &:focus-visible + .rotating-wheel__toggle-slider {
      outline: 2px solid #2D9F37;
      outline-offset: 2px;
    }
  }

  &__toggle-slider {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    background-color: #e0e0e0;
    border-radius: 24px;
    transition: background-color 300ms $easing-smooth;

    &::before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      left: 3px;
      top: 3px;
      background-color: white;
      border-radius: 50%;
      transition: transform 300ms $easing-smooth;
    }
  }

  &__toggle-text {
    font-size: 16px;
    font-weight: $font-weight-regular;
    color: $color-text-secondary;
  }

  // ============================================================================
  // LAYOUT GRID
  // ============================================================================
  &__content {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 0.6fr 1.4fr;  // Persona mniejsza, koło większe
    gap: 25px;  // Bardziej zwarta kompozycja
    align-items: center;
    margin-bottom: 0;  // CTA bezpośrednio pod contentem

    @media (max-width: $breakpoint-tablet) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  // ============================================================================
  // PERSONA
  // ============================================================================
  &__persona {
    position: relative;  // Kontener dla absolute child
    min-height: 480px;  // Dopasowane do proporcji orbity (~92% wysokości)
    overflow: visible;
  }

  &__persona-image {
    position: absolute;  // Absolutna pozycja
    bottom: 0;  // Przyczepione do dołu kontenera
    left: 50%;
    transform: translateX(-50%) scale(1.2);  // Wycentrowane + powiększone
    width: 100%;
    height: 100%;
    max-height: 480px;  // Zsynchronizowane z min-height kontenera
    display: block;
    object-fit: contain;
    object-position: center bottom;
    z-index: 1;  // Niższy z-index - pod wykresem (wykres ma z-index: 10)
  }

  // ============================================================================
  // WHEEL SVG
  // ============================================================================
  &__wheel-container {
    position: relative;
    width: 100%;
    max-width: 700px;  // Zwiększone z 600px
    margin: 0 auto;
    z-index: 10;  // Wyższy z-index
  }

  &__svg {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;  // Zapewnia że nic nie jest przycinane
  }

  &__segment {
    cursor: pointer;
    stroke: #ffffff;  // Czysto biały zamiast z opacity
    stroke-width: 5;  // Zwiększone z 1 - szersze przerwy
    transition: opacity 200ms ease;

    &:hover:not(&--active) {
      opacity: 0.85;
    }

    &--active {
      opacity: 1;
    }
  }

  // ============================================================================
  // ORBIT CIRCLE & DOTS
  // ============================================================================
  &__orbit {
    pointer-events: none;
  }

  &__orbit-dot {
    cursor: pointer;
    transition: fill 300ms $easing-smooth;
    // Brak animacji scale i hover - tylko nakładka na orbitę
  }

  // ============================================================================
  // ARROW INDICATOR
  // ============================================================================
  &__arrow-indicator {
    transition: transform $duration-arrow $easing-smooth;
    pointer-events: none;  // Arrow is decorative, not interactive

    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
    }
  }

  &__arrow-path {
    // Styling handled via template attributes (stroke, stroke-opacity, stroke-width)
  }

  // ============================================================================
  // LABELS
  // ============================================================================
  &__label {
    font-size: $font-size-label;
    font-weight: $font-weight-semibold;
    fill: $color-text-inactive;
    cursor: pointer;
    @include transition-opacity(200ms);
    user-select: none;
    position: relative;
    z-index: 30;

    &:hover {
      fill: $color-text-secondary;
    }

    &:focus,
    &:focus-visible {
      outline: none;  // Usunięty niebieski border
    }

    &--active {
      font-size: $font-size-label-active;
      font-weight: $font-weight-bold;
      fill: $color-text-primary;
    }
  }

  // ============================================================================
  // CENTER CONTENT
  // ============================================================================
  &__center-content {
    @include absolute-center;
    width: 280px;
    max-height: 280px;
    text-align: center;
    pointer-events: none;
    z-index: 10;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__center-inner {
    width: 100%;
    max-height: 100%;
    overflow: visible;
  }

  &__center-title {
    font-size: 28px;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    margin: 0 0 12px 0;
    line-height: 1.2;
  }

  &__center-description {
    font-size: 13px;
    font-weight: $font-weight-regular;
    color: $color-text-secondary;
    line-height: 1.5;
    margin: 0;
    word-wrap: break-word;
  }

  // ============================================================================
  // CTA
  // ============================================================================
  &__cta {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  &__cta-text {
    display: inline-block;
    font-size: 18px;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    cursor: pointer;
    transition: color 200ms ease, text-decoration-color 200ms ease;

    &:hover {
      color: color-segment('marketing');
      text-decoration-color: color-segment('marketing');
    }
  }
}




.fade-enter-active, .fade-leave-active {
  transition: opacity $duration-image $easing-smooth;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-text-enter-active, .fade-text-leave-active {
  transition: opacity $duration-text $easing-smooth;
}
.fade-text-enter, .fade-text-leave-to {
  opacity: 0;
}




@media (prefers-reduced-motion: reduce) {
  .rotating-wheel {
    &__segment,
    &__orbit-dot,
    &__label {
      transition: none !important;
      animation: none !important;
    }
  }

  .fade-enter-active,
  .fade-leave-active,
  .fade-text-enter-active,
  .fade-text-leave-active {
    transition: none !important;
  }
}
</style>
