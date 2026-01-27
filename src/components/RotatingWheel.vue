<template>
  <div class="rotating-wheel" role="region" aria-label="Koło usług 360°">
    <!-- Title -->
    <h2 class="rotating-wheel__title">
      Wsparcie i obsługa organizacji 360°
    </h2>

    <div class="rotating-wheel__content">
      <!-- Left: Persona Image -->
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

      <!-- Right: Interactive Wheel -->
      <div class="rotating-wheel__wheel-container">
        <svg
          :viewBox="`0 0 ${WHEEL_CONFIG.svgSize} ${WHEEL_CONFIG.svgSize}`"
          class="rotating-wheel__svg"
          role="img"
          aria-labelledby="wheel-title wheel-desc"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Accessibility labels -->
          <title id="wheel-title">Koło kategorii usług 360°</title>
          <desc id="wheel-desc">
            Interaktywne koło pokazujące 4 kategorie: Komunikacja, Marketing, Sprzedaż, Strategia
          </desc>

          <!-- OPTIMIZED: Array access (no Map overhead for 4 items) -->
          <g role="list" aria-label="Segmenty kategorii">
            <path
              v-for="(cat, index) in categories"
              :key="`segment-${cat.id}`"
              :d="segmentPaths[index]"
              :fill="cat.color"
              class="rotating-wheel__segment"
              :class="{ 'rotating-wheel__segment--active': index === activeIndex }"
              :aria-label="`Segment ${cat.label}`"
            />
          </g>

          <!-- Outer orbit circle (szara orbita) -->
          <circle
            :cx="wheelCenter.x"
            :cy="wheelCenter.y"
            :r="WHEEL_CONFIG.indicatorRadius"
            fill="none"
            stroke="#e0e0e0"
            stroke-width="2"
            class="rotating-wheel__orbit"
          />

          <!-- Category indicator dots on orbit (4 corners) -->
          <circle
            v-for="(cat, index) in categories"
            :key="`orbit-dot-${cat.id}`"
            :cx="indicatorPositions[index].x"
            :cy="indicatorPositions[index].y"
            r="12"
            :fill="index === activeIndex ? cat.color : '#e0e0e0'"
            stroke="white"
            stroke-width="3"
            class="rotating-wheel__orbit-dot"
          />

          <!-- OPTIMIZED: Array access instead of Map lookups -->
          <g role="list" aria-label="Kategorie">
            <text
              v-for="(cat, index) in categories"
              :key="`label-${cat.id}`"
              :x="labelPositions[index].x"
              :y="labelPositions[index].y"
              :text-anchor="labelPositions[index].anchor"
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

        <!-- Center content overlay (HTML for better text wrapping) -->
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

    <!-- CTA Link -->
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
import type { WheelCategory, Point, RotatingWheelData } from '../types/rotating-wheel'
import { WHEEL_CONFIG, DEFAULT_CATEGORIES } from '../constants/wheel-config'
import { polarToCartesian, generateDonutSegment, generateCurvedArrow } from '../utils/geometry'

export default Vue.extend({
  name: 'RotatingWheel',

  data(): RotatingWheelData {
    return {
      activeIndex: 0,
      isAnimating: false,
      categories: DEFAULT_CATEGORIES,
      segmentPaths: [],
      labelPositions: [],
      wheelCenter: {
        x: WHEEL_CONFIG.centerX,
        y: WHEEL_CONFIG.centerY
      },
      arrowTransformOrigin: `${WHEEL_CONFIG.centerX}px ${WHEEL_CONFIG.centerY}px`
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

    // Strzałka z aktywnego dota do segmentu
    arrowPath(): string {
      const activeCategory = this.activeCategory
      const start = polarToCartesian(
        this.wheelCenter,
        WHEEL_CONFIG.indicatorRadius,
        activeCategory.arrowAngle
      )
      const end = polarToCartesian(
        this.wheelCenter,
        WHEEL_CONFIG.outerRadius + 5,
        activeCategory.arrowAngle
      )

      return generateCurvedArrow(
        this.wheelCenter,
        activeCategory.arrowAngle,
        WHEEL_CONFIG.indicatorRadius,
        WHEEL_CONFIG.outerRadius + 5
      )
    },

    // Expose WHEEL_CONFIG to template
    WHEEL_CONFIG() {
      return WHEEL_CONFIG
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
  },

  methods: {
    selectCategory(index: number): void {
      if (index === this.activeIndex) return

      const previousIndex = this.activeIndex
      this.activeIndex = index

      // Emit event for parent components
      this.$emit('category-change', {
        category: this.activeCategory,
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
      const anchor = angle === 45 || angle === 135 ? 'start'
                    : angle === 225 || angle === 315 ? 'end'
                    : 'middle'

      return { ...pos, anchor }
    }
  }
})
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use 'sass:math';

// ============================================================================
// COLOR PALETTE (PUBLIC API - EXACT VALUES from design!)
// ============================================================================
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

// ============================================================================
// TYPOGRAPHY (EXACT from design specs!)
// ============================================================================
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

// ============================================================================
// SPACING & SIZING
// ============================================================================
$rotating-wheel-animation-duration: 600ms !default;

// PRIVATE (internal use, prefix with _)
$_wheel-size: 640px;  // Zwiększone z 500px - żeby pomieścić etykiety
$_outer-radius: 200px;
$_inner-radius: 140px;
$_center-x: math.div($_wheel-size, 2);  // Teraz 320px
$_center-y: math.div($_wheel-size, 2);  // Teraz 320px

// ============================================================================
// ANIMATION
// ============================================================================
$duration-arrow: 600ms !default;
$duration-text: 300ms !default;
$duration-image: 400ms !default;
$easing-smooth: cubic-bezier(0.4, 0, 0.2, 1) !default;

// ============================================================================
// BREAKPOINTS
// ============================================================================
$breakpoint-mobile: 768px !default;
$breakpoint-tablet: 1024px !default;

// ============================================================================
// SHADOWS
// ============================================================================
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12) !default;
$shadow-indicator: 0 2px 8px rgba(0, 0, 0, 0.15) !default;

// ============================================================================
// FUNCTIONS
// ============================================================================
@function color-segment($name) {
  @return map.get($colors-segments, $name);
}

// ============================================================================
// MIXINS
// ============================================================================
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

// ============================================================================
// COMPONENT STYLES
// ============================================================================
.rotating-wheel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  font-family: $font-family-base;

  // ============================================================================
  // TITLE
  // ============================================================================
  &__title {
    font-size: $font-size-title;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    text-align: center;
    margin-bottom: 60px;
    letter-spacing: $letter-spacing-tight;
    line-height: 1.2;

    @media (max-width: $breakpoint-mobile) {
      font-size: 36px;
      margin-bottom: 40px;
    }
  }

  // ============================================================================
  // LAYOUT GRID
  // ============================================================================
  &__content {
    display: grid;
    grid-template-columns: 0.6fr 1.4fr;  // Persona mniejsza, koło większe
    gap: 40px;  // Zmniejszony gap
    align-items: center;
    margin-bottom: 40px;

    @media (max-width: $breakpoint-tablet) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  // ============================================================================
  // PERSONA
  // ============================================================================
  &__persona {
    display: flex;
    justify-content: flex-start;  // Wyrównanie do lewej
    align-items: center;
    min-height: 400px;  // Zmniejszone
  }

  &__persona-image {
    max-width: 80%;  // Zmniejszony do 80%
    height: auto;
    display: block;
    border-radius: 8px;
    filter: drop-shadow($shadow-md);
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

  &__center-circle {
    fill: $color-white;
    filter: drop-shadow($shadow-md);
  }

  // ============================================================================
  // ORBIT CIRCLE & DOTS
  // ============================================================================
  &__orbit {
    pointer-events: none;
  }

  &__arrow {
    pointer-events: none;
    transition: opacity 300ms $easing-smooth;
  }

  &__orbit-dot {
    cursor: pointer;
    transition: fill 300ms $easing-smooth;
    // Brak animacji scale i hover - tylko nakładka na orbitę
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
      @include focus-outline;
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
    width: 380px;  // Zwiększone dla dłuższych tekstów
    text-align: center;
    pointer-events: none;
    z-index: 10;
  }

  &__center-title {
    font-size: $font-size-subtitle;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    margin: 0 0 16px 0;
    line-height: 1.2;
  }

  &__center-description {
    font-size: 14px;  // Zmniejszone z 15px dla dłuższych tekstów
    font-weight: $font-weight-regular;
    color: $color-text-secondary;
    line-height: 1.6;
    margin: 0;
  }

  // ============================================================================
  // CTA
  // ============================================================================
  &__cta {
    text-align: center;
    padding-top: 20px;
  }

  &__cta-text {
    display: inline-block;
    font-size: 18px;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    text-decoration: none;
    border-bottom: 3px solid $color-text-primary;
    padding-bottom: 4px;
    cursor: pointer;
    transition: color 200ms ease, border-color 200ms ease;

    &:hover {
      color: color-segment('marketing');
      border-color: color-segment('marketing');
    }
  }
}

// ============================================================================
// VUE TRANSITIONS
// ============================================================================
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

// ============================================================================
// ACCESSIBILITY
// ============================================================================
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
