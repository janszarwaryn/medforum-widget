import type { WheelCategory, SegmentAngle, ArrowAngle, CategoryId, HexColor } from '../types/rotating-wheel'

interface ApiCategory {
  readonly name: string        // English ID: 'communication', 'marketing', 'sales', 'strategy'
  readonly label: string       // Localized display text: 'Komunikacja', 'Marketing', etc.
  readonly color: string
  readonly description: string
  readonly image: string
}

interface ApiResponse {
  readonly categories: ReadonlyArray<ApiCategory>
}

const API_URL = import.meta.env.DEV
  ? 'http://localhost:8000/index.php'
  : '/api/index.php'

// Type assertion helpers with runtime validation
function assertSegmentAngle(angle: number): SegmentAngle {
  const valid: number[] = [270, 0, 90, 180]
  if (!valid.includes(angle)) {
    throw new Error(`Invalid segment angle: ${angle}. Expected one of: ${valid.join(', ')}`)
  }
  return angle as SegmentAngle
}

function assertArrowAngle(angle: number): ArrowAngle {
  const valid: number[] = [315, 45, 135, 225]
  if (!valid.includes(angle)) {
    throw new Error(`Invalid arrow angle: ${angle}. Expected one of: ${valid.join(', ')}`)
  }
  return angle as ArrowAngle
}

function assertCategoryId(id: string): CategoryId {
  const valid: string[] = ['communication', 'marketing', 'sales', 'strategy']
  if (!valid.includes(id)) {
    throw new Error(`Invalid category ID: ${id}. Expected one of: ${valid.join(', ')}`)
  }
  return id as CategoryId
}

function assertHexColor(color: string): HexColor {
  if (!color.startsWith('#')) {
    throw new Error(`Invalid hex color: ${color}. Must start with #`)
  }
  return color as HexColor
}

function assertPersonImage(image: string): WheelCategory['personImage'] {
  const validPattern = /^\/images\/person[1-4]\.(png|svg)$/
  if (!validPattern.test(image)) {
    throw new Error(`Invalid person image path: ${image}. Expected /images/person[1-4].(png|svg)`)
  }
  return image as WheelCategory['personImage']
}

export async function fetchCategories(): Promise<ReadonlyArray<WheelCategory>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(API_URL, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Błąd serwera: HTTP ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      if (!data.categories || !Array.isArray(data.categories)) {
        throw new Error('Nieprawidłowa struktura odpowiedzi z API')
      }

      return Object.freeze(
        data.categories.map((cat, index) =>
          Object.freeze(transformCategory(cat, index))
        )
      )

    } catch (error) {
      console.error(`Próba ${attempt + 1} pobierania danych nie powiodła się:`, error)
      if (attempt === 1) {
        throw new Error('Nie udało się pobrać danych z serwera. Sprawdź połączenie z API.')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  throw new Error('Przekroczono limit prób połączenia z API')
}

function transformCategory(cat: ApiCategory, index: number): WheelCategory {
  const totalCategories = 4
  const degreesPerSegment = 360 / totalCategories

  const segmentStartAngle = (270 + (index * degreesPerSegment)) % 360
  const arrowAngle = (315 + (index * degreesPerSegment)) % 360

  return {
    id: assertCategoryId(cat.name),           // name is English ID from API
    label: cat.label,                         // label is localized text from API
    color: assertHexColor(cat.color),
    segmentStartAngle: assertSegmentAngle(segmentStartAngle),
    arrowAngle: assertArrowAngle(arrowAngle),
    personImage: assertPersonImage(cat.image),
    title: cat.label,                         // Use localized label for title
    description: cat.description
  }
}
