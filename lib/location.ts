export interface Coordinates {
  latitude: number
  longitude: number
}

export interface ProfileLocation {
  city?: string | null
  countryCode?: string | null
}

export type ResolvedLocation =
  | {
      source: "gps"
      coordinates: Coordinates
      city?: string | null
      countryCode?: string | null
    }
  | {
      source: "profile" | "default"
      city: string
      countryCode: string
    }

export const DEFAULT_CITY = "Cairo"
export const DEFAULT_COUNTRY_CODE = "EG"

const normalizeText = (value?: string | null) => value?.trim() || ""
const normalizeCountryCode = (value?: string | null) => normalizeText(value).toUpperCase()

export const getBrowserCoordinates = (options?: PositionOptions) =>
  new Promise<Coordinates | null>((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => resolve(null),
      {
        enableHighAccuracy: false,
        maximumAge: 30 * 60 * 1000,
        timeout: 8000,
        ...options,
      },
    )
  })

export async function reverseGeocodeCoordinates({ latitude, longitude }: Coordinates) {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      localityLanguage: "en",
    })
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`)
    if (!response.ok) return null

    const data = await response.json()
    return {
      city: normalizeText(data.city || data.locality || data.principalSubdivision),
      countryCode: normalizeCountryCode(data.countryCode),
    }
  } catch {
    return null
  }
}

export function getProfileLocation(profile?: ProfileLocation | null) {
  const city = normalizeText(profile?.city)
  const countryCode = normalizeCountryCode(profile?.countryCode)

  if (!city || !/^[A-Z]{2}$/.test(countryCode)) {
    return null
  }

  return { city, countryCode }
}

export async function resolveUserLocation(profile?: ProfileLocation | null, options?: PositionOptions): Promise<ResolvedLocation> {
  const coordinates = await getBrowserCoordinates(options)

  if (coordinates) {
    const geocoded = await reverseGeocodeCoordinates(coordinates)
    return {
      source: "gps",
      coordinates,
      city: geocoded?.city || null,
      countryCode: geocoded?.countryCode || null,
    }
  }

  const profileLocation = getProfileLocation(profile)
  if (profileLocation) {
    return {
      source: "profile",
      ...profileLocation,
    }
  }

  return {
    source: "default",
    city: DEFAULT_CITY,
    countryCode: DEFAULT_COUNTRY_CODE,
  }
}

export async function resolveCountryCode(profile?: ProfileLocation | null, options?: PositionOptions) {
  const location = await resolveUserLocation(profile, options)

  if (location.source === "gps") {
    return location.countryCode || getProfileLocation(profile)?.countryCode || DEFAULT_COUNTRY_CODE
  }

  return location.countryCode
}

function isInsideEgypt({ latitude, longitude }: Coordinates) {
  return latitude >= 21.5 && latitude <= 31.9 && longitude >= 24.5 && longitude <= 36.9
}

export async function resolveEgyptPlanRegion(profile?: ProfileLocation | null, options?: PositionOptions): Promise<"EG" | "OTHER" | null> {
  const coordinates = await getBrowserCoordinates(options)

  if (coordinates) {
    return isInsideEgypt(coordinates) ? "EG" : "OTHER"
  }

  const profileLocation = getProfileLocation(profile)
  if (profileLocation) {
    return profileLocation.countryCode === "EG" ? "EG" : "OTHER"
  }

  return null
}
