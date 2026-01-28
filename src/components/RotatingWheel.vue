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
            :class="{
              'rotating-wheel__arrow-indicator--carousel': !isJumping,
              'rotating-wheel__arrow-indicator--jumping': isJumping
            }"
            :style="isJumping ? {
              transform: `rotate(${currentRotation}deg)`,
              transformOrigin: `${wheelCenter.x}px ${wheelCenter.y}px`
            } : {}"
            role="img"
            aria-label="Wskaźnik aktywnej kategorii"
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
            <!-- Category content -->
            <div v-if="centerDisplayMode === 'category'"
                 :key="`category-${activeCategory.id}`"
                 class="rotating-wheel__center-inner">
              <h3 class="rotating-wheel__center-title">
                {{ activeCategory.title }}
              </h3>
              <p class="rotating-wheel__center-description">
                {{ activeCategory.description }}
              </p>
            </div>

            <!-- Logo content -->
            <img v-else
                 key="logo"
                 src="/images/medforum-logo.png"
                 alt="Logo Medforum"
                 class="rotating-wheel__center-logo"
                 role="img" />
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
import type { WheelCategory, Point, RotatingWheelData, ArrowPathSegment, CenterDisplayMode } from '../types/rotating-wheel'
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
      centerDisplayMode: 'category' as CenterDisplayMode,
      carouselTimers: [] as number[],
      carouselStartTime: 0,
      isJumping: false
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

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      // Start carousel automatically (not for reduced motion users)
      this.startCarousel(0)
    } else {
      // For reduced motion: disable CSS animation, show static category 0
      this.activeIndex = 0
      this.centerDisplayMode = 'category'
      // Don't start carousel
    }

    // Handle tab visibility (pause/resume on tab change)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    // Keyboard event listener
    document.addEventListener('keydown', this.handleKeyDown)
  },

  beforeDestroy(): void {
    this.clearCarouselTimers()
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    document.removeEventListener('keydown', this.handleKeyDown)
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

    selectCategory(index: number): void {
      this.jumpToCategory(index)
    },

    jumpToCategory(index: number): void {
      if (index === this.activeIndex) return

      // Pause carousel animation temporarily
      this.isJumping = true
      this.clearCarouselTimers()

      // Show selected category immediately
      this.centerDisplayMode = 'category'

      // Calculate quick jump rotation
      const targetAngle = this.categories[index].arrowAngle
      const currentBaseAngle = this.categories[this.activeIndex].arrowAngle
      this.currentRotation = this.normalizeRotationTarget(
        this.currentRotation,
        currentBaseAngle,
        targetAngle
      )

      const previousIndex = this.activeIndex
      this.activeIndex = index
      this.$emit('category-change', {
        category: this.categories[index],
        index,
        previousIndex
      })

      // After transition completes (600ms), resume carousel from this category
      window.setTimeout(() => {
        this.startCarousel(index)
      }, 600)
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
      const nextIndex = (this.activeIndex + 1) % 4
      this.jumpToCategory(nextIndex)
    },

    selectPrevious(): void {
      const prevIndex = (this.activeIndex - 1 + 4) % 4
      this.jumpToCategory(prevIndex)
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

    startCarousel(startFromIndex = 0): void {
      this.clearCarouselTimers()
      this.carouselStartTime = Date.now()
      this.activeIndex = startFromIndex
      this.centerDisplayMode = 'category'
      this.isJumping = false

      this.scheduleContentSwitches(startFromIndex)
    },

    scheduleContentSwitches(startIndex = 0): void {
      this.clearCarouselTimers()

      const CATEGORY_DURATION = 4000 // 4 seconds
      const LOGO_DURATION = 3000     // 3 seconds
      const SEGMENT_DURATION = CATEGORY_DURATION + LOGO_DURATION // 7 seconds

      // Schedule all 4 categories starting from startIndex
      for (let i = 0; i < 4; i++) {
        const categoryIndex = (startIndex + i) % 4
        const segmentStart = i * SEGMENT_DURATION

        // Show category at segment start
        this.carouselTimers.push(
          window.setTimeout(() => {
            if (!this.isJumping) {
              this.activeIndex = categoryIndex
              this.centerDisplayMode = 'category'
              this.$emit('category-change', {
                category: this.categories[categoryIndex],
                index: categoryIndex,
                previousIndex: this.activeIndex
              })
            }
          }, segmentStart)
        )

        // Show logo after 4 seconds
        this.carouselTimers.push(
          window.setTimeout(() => {
            if (!this.isJumping) {
              this.centerDisplayMode = 'logo'
            }
          }, segmentStart + CATEGORY_DURATION)
        )
      }

      // Loop: restart after full cycle
      this.carouselTimers.push(
        window.setTimeout(() => {
          this.scheduleContentSwitches(startIndex) // Restart from same index
        }, 4 * SEGMENT_DURATION) // 28 seconds
      )
    },

    clearCarouselTimers(): void {
      this.carouselTimers.forEach(id => window.clearTimeout(id))
      this.carouselTimers = []
    },

    handleVisibilityChange(): void {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion) return // Don't manage carousel for reduced motion users

      if (document.hidden) {
        // Pause carousel when tab hidden
        this.clearCarouselTimers()
        this.isJumping = true // Pause CSS animation
      } else {
        // Resume carousel when tab visible
        this.startCarousel(this.activeIndex) // Resume from current category
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
    will-change: transform;
    pointer-events: none;
    transform-origin: 320px 320px;
  }

  // Continuous carousel rotation (default state)
  &__arrow-indicator--carousel {
    animation: rotate-carousel 28s linear infinite;
    transform: rotate(315deg); // Start position

    @media (prefers-reduced-motion: reduce) {
      animation: none;
      // Show static arrow at category 0
    }
  }

  // Quick jump to user-selected category
  &__arrow-indicator--jumping {
    transition: transform 600ms $easing-smooth;
    animation: none; // Pause carousel animation during jump

    @media (prefers-reduced-motion: reduce) {
      transition: none; // Instant jump for reduced motion
    }
  }

  @keyframes rotate-carousel {
    from {
      transform: rotate(315deg);
    }
    to {
      transform: rotate(675deg); // 315 + 360 = full rotation
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

  &__center-logo {
    max-width: 200px;
    max-height: 200px;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
    margin: 0 auto;

    @media (max-width: $breakpoint-mobile) {
      max-width: 150px;
      max-height: 150px;
    }
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
