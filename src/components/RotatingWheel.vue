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


        <div class="rotating-wheel__center-content"
             aria-live="polite"
             :aria-label="isMobile ? 'Logo Medforum' : 'Informacje o kategorii'">
          <transition name="fade-text" mode="out-in">
            <div v-if="!isMobile && centerDisplayMode === 'category'"
                 :key="`category-${activeCategory.id}`"
                 class="rotating-wheel__center-inner">
              <h3 class="rotating-wheel__center-title">
                {{ activeCategory.title }}
              </h3>
              <p class="rotating-wheel__center-description">
                {{ activeCategory.description }}
              </p>
            </div>

            <img v-else
                 key="logo"
                 src="/images/medforum-logo.png"
                 alt="Logo Medforum"
                 class="rotating-wheel__center-logo"
                 role="img" />
          </transition>
        </div>
      </div>

      <transition name="fade-text" mode="out-in">
        <div v-if="isMobile"
             :key="activeCategory.id"
             class="rotating-wheel__below-wheel-text"
             role="region"
             aria-live="polite">
          <h3 class="rotating-wheel__below-wheel-title">{{ activeCategory.title }}</h3>
          <p class="rotating-wheel__below-wheel-description">{{ activeCategory.description }}</p>
        </div>
      </transition>
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
      isJumping: false,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1440,
      resizeTimeout: null as number | null
    }
  },

  computed: {
    activeCategory(): WheelCategory {
      return this.categories[this.activeIndex]
    },

    indicatorPositions(): Array<Point> {
      return this.categories.map(cat =>
        polarToCartesian(
          this.wheelCenter,
          WHEEL_CONFIG.indicatorRadius,
          cat.arrowAngle
        )
      )
    },

    isMobile(): boolean {
      return this.windowWidth <= 767
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
    this.windowWidth = window.innerWidth
    window.addEventListener('resize', this.handleResize)

    this.categories.forEach((cat, index) => {
      const img = new Image()
      img.loading = index === 0 ? 'eager' : 'lazy'
      img.decoding = 'async'
      img.src = cat.personImage
      img.onerror = () => console.error(`Failed to load: ${cat.personImage}`)
    })

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      this.isMobile
        ? (this.activeIndex = 0, this.centerDisplayMode = 'logo', this.isJumping = true)
        : this.startCarousel(0)
    } else {
      this.activeIndex = 0
      this.centerDisplayMode = 'category'
    }

    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    document.addEventListener('keydown', this.handleKeyDown)
  },

  beforeDestroy(): void {
    this.clearCarouselTimers()
    if (this.resizeTimeout !== null) window.clearTimeout(this.resizeTimeout)
    window.removeEventListener('resize', this.handleResize)
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

      this.isJumping = true
      this.clearCarouselTimers()

      if (!this.isMobile) {
        this.centerDisplayMode = 'category'
      }

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

      window.setTimeout(() => {
        if (this.isMobile) {
          this.isJumping = false
        } else {
          this.startCarousel(index)
        }
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

    handleResize(): void {
      if (this.resizeTimeout !== null) {
        window.clearTimeout(this.resizeTimeout)
      }

      this.resizeTimeout = window.setTimeout(() => {
        const prev = this.windowWidth
        this.windowWidth = window.innerWidth

        if ((prev <= 767) !== (this.windowWidth <= 767)) {
          this.clearCarouselTimers()
          this.windowWidth > 767
            ? this.startCarousel(this.activeIndex)
            : (this.centerDisplayMode = 'logo', this.isJumping = true)
        }
      }, 150)
    },

    startCarousel(startFromIndex = 0): void {
      if (this.isMobile) {
        this.centerDisplayMode = 'logo'
        this.activeIndex = startFromIndex
        this.isJumping = true
        return
      }

      this.clearCarouselTimers()
      this.carouselStartTime = Date.now()
      this.activeIndex = startFromIndex
      this.centerDisplayMode = 'category'
      this.isJumping = false

      this.scheduleContentSwitches(startFromIndex)
    },

    scheduleContentSwitches(startIndex = 0): void {
      this.clearCarouselTimers()

      const CATEGORY_DURATION = 4000
      const LOGO_DURATION = 3000
      const SEGMENT_DURATION = CATEGORY_DURATION + LOGO_DURATION

      for (let i = 0; i < 4; i++) {
        const categoryIndex = (startIndex + i) % 4
        const segmentStart = i * SEGMENT_DURATION

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

        this.carouselTimers.push(
          window.setTimeout(() => {
            if (!this.isJumping) {
              this.centerDisplayMode = 'logo'
            }
          }, segmentStart + CATEGORY_DURATION)
        )
      }

      this.carouselTimers.push(
        window.setTimeout(() => {
          this.scheduleContentSwitches(startIndex)
        }, 4 * SEGMENT_DURATION)
      )
    },

    clearCarouselTimers(): void {
      this.carouselTimers.forEach(id => window.clearTimeout(id))
      this.carouselTimers = []
    },

    handleVisibilityChange(): void {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion) return

      if (document.hidden) {
        this.clearCarouselTimers()
        this.isJumping = true
      } else {
        this.startCarousel(this.activeIndex)
      }
    }
  }
})
</script>

<style lang="scss" scoped src="./RotatingWheel.scss"></style>
