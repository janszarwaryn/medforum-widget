import type { WheelConfig, WheelCategory } from '../types/rotating-wheel'

export const WHEEL_CONFIG: WheelConfig = {
  svgSize: 640,
  outerRadius: 200,
  innerRadius: 150,
  indicatorRadius: 260,
  labelRadius: 260,
  animationDuration: 600,
  get centerX() { return this.svgSize / 2 },
  get centerY() { return this.svgSize / 2 }
} as const

export const DEFAULT_CATEGORIES: ReadonlyArray<WheelCategory> = Object.freeze([
  Object.freeze({
    id: 'communication',
    label: 'Komunikacja',
    color: '#2D9F37',
    segmentStartAngle: 270,
    arrowAngle: 315,
    personImage: '/images/person1.png',
    title: 'Komunikacja',
    description: 'Łączymy nowoczesne działania związane z komunikacją oraz wiedzą medyczną, tworząc skuteczne narzędzia promocyjno-edukacyjne. Docieramy do lekarzy, farmaceutów, pielęgniarek i położnych oraz innych specjalistów ochrony zdrowia, a także pacjentów z wartościowymi, precyzyjnie dopasowanymi treściami. Współpracujemy z ekspertami i liderami opinii.'
  }),
  Object.freeze({
    id: 'marketing',
    label: 'Marketing',
    color: '#1790C9',
    segmentStartAngle: 0,
    arrowAngle: 45,
    personImage: '/images/person2.png',
    title: 'Marketing',
    description: 'Projektujemy cyfrowe i analogowe działania marketingowe oparte na analizie danych i doświadczeniu dla rynku medycznego. Wykorzystujemy badania focusowe, strategie SEO, SEM, content i e-mail marketing, by skutecznie wspierać marki medyczne i farmaceutyczne. Realizujemy dla klienta działania marketingowe oparte na aktualnej wiedzy i trendach. Mamy długoletnie doświadczenie w realizacji działań w kategoriach ATL i BTL.'
  }),
  Object.freeze({
    id: 'sales',
    label: 'Sprzedaż',
    color: '#F3AA21',
    segmentStartAngle: 90,
    arrowAngle: 135,
    personImage: '/images/person3.png',
    title: 'Sprzedaż',
    description: 'Wspieramy sprzedaż poprzez wykorzystanie unikalnych narzędzi. Realizujemy kampanie sprzedażowo-marketingowe oraz dystrybucję materiałów edukacyjnych. Pomagamy skutecznie docierać do odbiorców i wspierać realizację założonych celów.'
  }),
  Object.freeze({
    id: 'strategy',
    label: 'Strategia',
    color: '#F58220',
    segmentStartAngle: 180,
    arrowAngle: 225,
    personImage: '/images/person4.png',
    title: 'Strategia',
    description: 'Tworzymy kompleksowe strategie marketingowe i komunikacyjne w oparciu o wieloletnie doświadczenie i znajomość rynku medycznego. Każde rozwiązanie dopasowujemy do celów i potrzeb klienta. Bazujemy na analizie danych, trendach i potrzebach grupy docelowej z uwzględnieniem odbiorcy indywidualnego i masowego.'
  })
]) as ReadonlyArray<WheelCategory>

export const ARROW_CONFIG = Object.freeze({
  arcSpanDegrees: 55,
  strokeWidth: 1.5,
  startOffsetDegrees: -60,
  segmentCount: 10,
  opacityStops: Object.freeze([0.05, 0.15, 0.27, 0.40, 0.53, 0.65, 0.75, 0.84, 0.92, 1.0])
})
