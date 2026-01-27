import type { WheelConfig, WheelCategory } from '../types/rotating-wheel'

export const WHEEL_CONFIG: WheelConfig = {
  svgSize: 640,          // Zwiększone z 500 - żeby pomieścić etykiety
  outerRadius: 200,
  innerRadius: 150,      // Zmniejszone z 160 - grubszy donut
  indicatorRadius: 260,  // Zwiększone z 240 - dalej od donuta
  labelRadius: 260,      // Taka sama jak indicatorRadius - teksty przy kropkach
  animationDuration: 600,
  get centerX() { return this.svgSize / 2 },  // Teraz 320
  get centerY() { return this.svgSize / 2 }   // Teraz 320
} as const

// CRITICAL: Object.freeze() prevents Vue reactivity overhead!
// CRITICAL: EXACT colors from design specs (not estimates!)
export const DEFAULT_CATEGORIES: ReadonlyArray<WheelCategory> = Object.freeze([
  Object.freeze({
    id: 'communication',
    label: 'Komunikacja',
    color: '#2D9F37B2',  // EXACT: Green with alpha
    segmentStartAngle: 270,
    arrowAngle: 315,
    personImage: '/images/person1.png',
    title: 'Komunikacja',
    description: 'Łączymy nowoczesne działania związane z komunikacją oraz wiedzą medyczną, tworząc skuteczne narzędzia promocyjno-edukacyjne. Docieramy do lekarzy, farmaceutów, pielęgniarek i położnych oraz innych specjalistów ochrony zdrowia, a także pacjentów z wartościowymi, precyzyjnie dopasowanymi treściami. Współpracujemy z ekspertami i liderami opinii.'
  }),
  Object.freeze({
    id: 'marketing',
    label: 'Marketing',
    color: '#1790C9CC',  // EXACT: Blue with alpha
    segmentStartAngle: 0,
    arrowAngle: 45,
    personImage: '/images/person2.png',
    title: 'Marketing',
    description: 'Projektujemy cyfrowe i analogowe działania marketingowe oparte na analizie danych i doświadczeniu dla rynku medycznego. Wykorzystujemy badania focusowe, strategie SEO, SEM, content i e-mail marketing, by skutecznie wspierać marki medyczne i farmaceutyczne. Realizujemy dla klienta działania marketingowe oparte na aktualnej wiedzy i trendach. Mamy długoletnie doświadczenie w realizacji działań w kategoriach ATL i BTL.'
  }),
  Object.freeze({
    id: 'sales',
    label: 'Sprzedaż',
    color: '#F3AA21CF',  // EXACT: Yellow with alpha
    segmentStartAngle: 90,
    arrowAngle: 135,
    personImage: '/images/person3.png',
    title: 'Sprzedaż',
    description: 'Wspieramy sprzedaż poprzez wykorzystanie unikalnych narzędzi. Realizujemy kampanie sprzedażowo-marketingowe oraz dystrybucję materiałów edukacyjnych. Pomagamy skutecznie docierać do odbiorców i wspierać realizację założonych celów.'
  }),
  Object.freeze({
    id: 'strategy',
    label: 'Strategia',
    color: '#F58220',  // EXACT: Orange (no alpha)
    segmentStartAngle: 180,
    arrowAngle: 225,
    personImage: '/images/person4.png',
    title: 'Strategia',
    description: 'Tworzymy kompleksowe strategie marketingowe i komunikacyjne w oparciu o wieloletnie doświadczenie i znajomość rynku medycznego. Każde rozwiązanie dopasowujemy do celów i potrzeb klienta. Bazujemy na analizie danych, trendach i potrzebach grupy docelowej z uwzględnieniem odbiorcy indywidualnego i masowego.'
  })
]) as ReadonlyArray<WheelCategory>
