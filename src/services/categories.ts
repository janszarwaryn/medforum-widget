import type { WheelCategory } from '../types/rotating-wheel'

interface ApiCategory {
  readonly name: string
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
    id: cat.name.toLowerCase().replace(/[^a-z]/g, '') as any,
    label: cat.name,
    color: cat.color as `#${string}`,
    segmentStartAngle: segmentStartAngle as any,
    arrowAngle: arrowAngle as any,
    personImage: cat.image as any,
    title: cat.name,
    description: cat.description
  }
}
