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

    <!-- Loading State -->
    <div v-if="isLoading" class="rotating-wheel__loading">
      <div class="rotating-wheel__spinner"></div>
      <p>Ładowanie danych...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="rotating-wheel__error">
      <div class="rotating-wheel__error-icon">&#9888;</div>
      <h3>Błąd ładowania</h3>
      <p>{{ errorMessage }}</p>
      <button @click="reloadData" class="rotating-wheel__retry-button">
        Spróbuj ponownie
      </button>
    </div>

    <!-- Main Content -->
    <div v-else-if="hasCategories" class="rotating-wheel__content">
      <div class="rotating-wheel__persona">
        <transition name="fade" mode="out-in">
          <img
            v-if="activeCategory"
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
            <div v-if="!isMobile && centerDisplayMode === 'category' && activeCategory"
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
        <div v-if="isMobile && activeCategory"
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
import { WHEEL_CONFIG, ARROW_CONFIG, CAROUSEL_DURATION, CATEGORY_DISPLAY_DURATION, JUMP_DURATION } from '../constants/wheel-config'
import { UI_CONFIG } from '../constants/ui-config'
import { polarToCartesian, generateDonutSegment, generateArrowArc } from '../utils/geometry'
import { fetchCategories } from '../services/categories'

export default Vue.extend({
  name: 'RotatingWheel',

  data(): RotatingWheelData {
    return {
      activeIndex: 0,
      categories: [] as ReadonlyArray<WheelCategory>,
      wheelCenter: {
        x: WHEEL_CONFIG.centerX,
        y: WHEEL_CONFIG.centerY
      },
      arrowTransformOrigin: `${WHEEL_CONFIG.centerX}px ${WHEEL_CONFIG.centerY}px`,
      arrowRotation: 315,
      previousArrowRotation: 315,
      animationFrameId: null as number | null,
      carouselStartTime: 0,
      logoTimer: null as number | null,
      centerDisplayMode: 'category' as CenterDisplayMode,
      isJumping: false,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1440,
      resizeTimeout: null as number | null,
      isLoading: true,
      errorMessage: null as string | null
    }
  },

  computed: {
    activeCategory(): WheelCategory | null {
      return this.categories[this.activeIndex] || null
    },

    hasCategories(): boolean {
      return this.categories.length > 0
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

    segmentPaths(): string[] {
      return this.categories.map(cat =>
        generateDonutSegment({
          center: this.wheelCenter,
          outerRadius: WHEEL_CONFIG.outerRadius,
          innerRadius: WHEEL_CONFIG.innerRadius,
          startAngle: cat.segmentStartAngle
        })
      )
    },

    labelPositions(): Array<{ x: number; y: number; anchor: string }> {
      return this.categories.map(cat =>
        this.calculateLabelPosition(cat.arrowAngle)
      )
    },

    arrowPathSegments(): ReadonlyArray<ArrowPathSegment> {
      const segmentSize = ARROW_CONFIG.arcSpanDegrees / ARROW_CONFIG.segmentCount

      return ARROW_CONFIG.opacityStops.map((opacity, idx) => {
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
    this.isLoading = true
    this.errorMessage = null

    fetchCategories()
      .then(categories => {
        this.categories = categories
        this.isLoading = false
      })
      .catch(error => {
        console.error('Błąd ładowania kategorii:', error)
        this.errorMessage = error.message || 'Nie udało się załadować danych z serwera'
        this.isLoading = false
      })
  },

  mounted(): void {
    this.windowWidth = window.innerWidth
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    document.addEventListener('keydown', this.handleKeyDown)

    // Wait for categories to load before initializing
    const initWheel = () => {
      if (this.categories.length === 0) return

      this.categories.forEach((cat, index) => {
        const img = new Image()
        img.loading = index === 0 ? 'eager' : 'lazy'
        img.decoding = 'async'
        img.src = cat.personImage
        img.onerror = () => {}
      })

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (!prefersReducedMotion) {
        this.startCarouselAnimation(0)
      } else {
        this.activeIndex = 0
        this.arrowRotation = this.categories[0].arrowAngle
        this.centerDisplayMode = 'category'
      }
    }

    // Initialize once categories are loaded
    this.$watch('categories', () => {
      if (this.categories.length > 0) {
        this.$nextTick(() => initWheel())
      }
    }, { immediate: true })
  },

  beforeDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    if (this.logoTimer !== null) {
      clearTimeout(this.logoTimer)
      this.logoTimer = null
    }
    if (this.resizeTimeout !== null) {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = null
    }
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    document.removeEventListener('keydown', this.handleKeyDown)
  },

  methods: {
    reloadData(): void {
      this.isLoading = true
      this.errorMessage = null
      this.categories = []

      fetchCategories()
        .then(categories => {
          this.categories = categories
          this.isLoading = false

          // Restart animation after successful reload
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          if (!prefersReducedMotion && this.categories.length > 0) {
            this.startCarouselAnimation(0)
          }
        })
        .catch(error => {
          console.error('Błąd ładowania kategorii:', error)
          this.errorMessage = error.message || 'Nie udało się załadować danych z serwera'
          this.isLoading = false
        })
    },

    didCrossAngle(prevAngle: number, currAngle: number, checkpointAngle: number): boolean {
      // Handle wrap-around (359° → 1°)
      if (prevAngle > 270 && currAngle < 90) {
        return checkpointAngle > prevAngle || checkpointAngle < currAngle
      }

      // Normal case
      return prevAngle < checkpointAngle && currAngle >= checkpointAngle
    },

    updateActiveCategoryBasedOnArrow(): void {
      const currentNormalized = this.arrowRotation % 360
      const previousNormalized = this.previousArrowRotation % 360

      this.categories.forEach((cat, index) => {
        if (this.didCrossAngle(previousNormalized, currentNormalized, cat.arrowAngle)) {
          this.activeIndex = index
          this.$emit('category-change', {
            category: cat,
            index,
            previousIndex: this.activeIndex
          })

          // On desktop: show category then switch to logo after 4s
          // On mobile: always show logo (category text is below wheel)
          if (!this.isMobile) {
            this.centerDisplayMode = 'category'

            if (this.logoTimer !== null) {
              clearTimeout(this.logoTimer)
            }
            this.logoTimer = window.setTimeout(() => {
              if (!this.isJumping) {
                this.centerDisplayMode = 'logo'
              }
            }, CATEGORY_DISPLAY_DURATION)
          }
        }
      })

      this.previousArrowRotation = this.arrowRotation
    },

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

    jumpToCategory(targetIndex: number): void {
      if (targetIndex === this.activeIndex) return

      // Stop carousel
      this.isJumping = true
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
      if (this.logoTimer !== null) {
        clearTimeout(this.logoTimer)
        this.logoTimer = null
      }

      // Calculate route
      const currentAngle = this.arrowRotation % 360
      const targetAngle = this.categories[targetIndex].arrowAngle
      const targetRotation = this.normalizeRotationTarget(
        this.arrowRotation,
        currentAngle,
        targetAngle
      )

      // Animate with easing
      const jumpStartTime = performance.now()
      const jumpStartRotation = this.arrowRotation
      const jumpDistance = targetRotation - jumpStartRotation
      const previousIndex = this.activeIndex

      const animateJump = (timestamp: number) => {
        const elapsed = timestamp - jumpStartTime
        const progress = Math.min(elapsed / JUMP_DURATION, 1)

        // Cubic easing (Material Design)
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2

        this.arrowRotation = jumpStartRotation + (jumpDistance * eased)

        if (progress >= 1) {
          // CRITICAL: Change activeIndex ONLY when arrow arrives
          this.arrowRotation = targetRotation
          this.activeIndex = targetIndex
          this.centerDisplayMode = this.isMobile ? 'logo' : 'category'
          this.$emit('category-change', {
            category: this.categories[targetIndex],
            index: targetIndex,
            previousIndex
          })

          // Resume carousel after brief pause
          setTimeout(() => {
            this.startCarouselAnimation(targetIndex)
          }, 100)
        } else {
          this.animationFrameId = requestAnimationFrame(animateJump)
        }
      }

      this.animationFrameId = requestAnimationFrame(animateJump)
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
          if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
          }
          if (this.logoTimer !== null) {
            clearTimeout(this.logoTimer)
            this.logoTimer = null
          }

          // Resume carousel on both mobile and desktop
          this.startCarouselAnimation(this.activeIndex)
        }
      }, 150)
    },

    startCarouselAnimation(startIndex: number): void {
      this.isJumping = false
      this.activeIndex = startIndex
      this.arrowRotation = this.categories[startIndex].arrowAngle
      this.previousArrowRotation = this.arrowRotation
      this.carouselStartTime = performance.now()
      this.centerDisplayMode = this.isMobile ? 'logo' : 'category'

      const animate = (timestamp: number) => {
        if (this.isJumping) return  // User clicked - stop

        const elapsed = timestamp - this.carouselStartTime
        const progress = (elapsed % CAROUSEL_DURATION) / CAROUSEL_DURATION
        this.arrowRotation = 315 + (progress * 360)

        this.updateActiveCategoryBasedOnArrow()

        this.animationFrameId = requestAnimationFrame(animate)
      }

      this.animationFrameId = requestAnimationFrame(animate)
    },

    handleVisibilityChange(): void {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion) return

      if (document.hidden) {
        if (this.animationFrameId !== null) {
          cancelAnimationFrame(this.animationFrameId)
          this.animationFrameId = null
        }
        if (this.logoTimer !== null) {
          clearTimeout(this.logoTimer)
          this.logoTimer = null
        }
        this.isJumping = true
      } else {
        this.carouselStartTime = performance.now()
        this.startCarouselAnimation(this.activeIndex)
      }
    }
  }
})
</script>

<style lang="scss" scoped src="./RotatingWheel.scss"></style>
