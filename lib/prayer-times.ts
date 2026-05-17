import {
  DEFAULT_CITY,
  DEFAULT_COUNTRY_CODE,
  type ProfileLocation,
  type ResolvedLocation,
  resolveUserLocation,
} from "@/lib/location"

type PrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"

interface AladhanTimings {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

interface AladhanDate {
  gregorian: {
    date: string
  }
  hijri: {
    day: string
    month: {
      ar: string
    }
    year: string
  }
}

interface AladhanTimingData {
  timings: AladhanTimings
  date: AladhanDate
}

interface AladhanTimingResponse {
  code: number
  status: string
  data: AladhanTimingData
}

interface PrayerCache {
  cachedAt: string
  locationKey: string
  data: AladhanTimingData
  tomorrowFajrTime?: string
}

export interface PrayerWidgetDisplay {
  hijriDate: string
  gregorianDate: string
  nextPrayerName: string
  nextPrayerTime: string
}

const PRAYER_CACHE_KEY = "ahlamy-prayer-times-v2"
const ARABIC_PRAYER_NAMES: Record<PrayerKey, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
}
const PRAYER_ORDER: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]

const COUNTRY_METHODS: Record<string, number> = {
  EG: 5,
  SA: 4,
  AE: 8,
  BH: 8,
  OM: 8,
  KW: 9,
  QA: 10,
  TR: 13,
  SG: 11,
  FR: 12,
  RU: 14,
  IR: 7,
  MA: 21,
  DZ: 19,
  TN: 18,
  ID: 20,
  PK: 1,
  IN: 1,
  BD: 1,
  AF: 1,
  US: 2,
  CA: 2,
}

export const getPrayerCalculationMethod = (countryCode?: string | null) =>
  COUNTRY_METHODS[countryCode?.toUpperCase() || ""] ?? 3

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const formatAladhanDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${day}-${month}-${date.getFullYear()}`
}

const parseAladhanGregorianDate = (date: string) => {
  const [day, month, year] = date.split("-").map(Number)
  if (!day || !month || !year) {
    return new Date()
  }
  return new Date(year, month - 1, day)
}

const formatGregorianDate = (date: string) =>
  new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseAladhanGregorianDate(date))

const formatHijriDate = (date: AladhanDate) => `${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year}`

const normalizePrayerTime = (time: string) => {
  const match = time.match(/\d{1,2}:\d{2}/)
  return match ? match[0] : time
}

const getPrayerDateTime = (baseDate: Date, time: string) => {
  const [hours, minutes] = normalizePrayerTime(time).split(":").map(Number)
  const prayerDate = new Date(baseDate)
  prayerDate.setHours(hours || 0, minutes || 0, 0, 0)
  return prayerDate
}

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const findNextPrayer = (data: AladhanTimingData) => {
  const currentTime = new Date()
  const prayerDate = parseAladhanGregorianDate(data.date.gregorian.date)

  for (const prayer of PRAYER_ORDER) {
    if (getPrayerDateTime(prayerDate, data.timings[prayer]) > currentTime) {
      return {
        name: ARABIC_PRAYER_NAMES[prayer],
        time: normalizePrayerTime(data.timings[prayer]),
      }
    }
  }

  return null
}

const getLocationCountryCode = (location: ResolvedLocation) =>
  location.source === "gps" ? location.countryCode ?? null : location.countryCode

const getLocationKey = (location: ResolvedLocation) => {
  if (location.source === "gps") {
    const latitude = location.coordinates.latitude.toFixed(3)
    const longitude = location.coordinates.longitude.toFixed(3)
    return `gps:${latitude},${longitude}:m${getPrayerCalculationMethod(location.countryCode)}`
  }

  return `city:${location.city}:${location.countryCode}:m${getPrayerCalculationMethod(location.countryCode)}`
}

const buildPrayerTimesUrl = (location: ResolvedLocation, date?: Date) => {
  const endpointDate = date ? `/${formatAladhanDate(date)}` : ""
  const countryCode = getLocationCountryCode(location)
  const method = String(getPrayerCalculationMethod(countryCode))
  const params = new URLSearchParams({ method })

  if (location.source === "gps") {
    params.set("latitude", String(location.coordinates.latitude))
    params.set("longitude", String(location.coordinates.longitude))
    return `https://api.aladhan.com/v1/timings${endpointDate}?${params.toString()}`
  }

  params.set("city", location.city || DEFAULT_CITY)
  params.set("country", countryCode || DEFAULT_COUNTRY_CODE)
  return `https://api.aladhan.com/v1/timingsByCity${endpointDate}?${params.toString()}`
}

const fetchPrayerTimes = async (location: ResolvedLocation, date?: Date) => {
  const response = await fetch(buildPrayerTimesUrl(location, date))

  if (!response.ok) {
    throw new Error("Prayer times request failed")
  }

  const result = (await response.json()) as AladhanTimingResponse
  if (result.code !== 200 || result.status !== "OK") {
    throw new Error("Prayer times response was not valid")
  }

  return result.data
}

const readPrayerCache = () => {
  try {
    const cached = window.localStorage.getItem(PRAYER_CACHE_KEY)
    if (!cached) return null
    return JSON.parse(cached) as PrayerCache
  } catch {
    return null
  }
}

const writePrayerCache = (cache: PrayerCache) => {
  try {
    window.localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // The widget can still render live data when browser storage is unavailable.
  }
}

export async function getPrayerWidgetData(profile?: ProfileLocation | null, forceRefresh = false): Promise<PrayerWidgetDisplay> {
  const location = await resolveUserLocation(profile)
  const todayKey = getLocalDateKey()
  const locationKey = getLocationKey(location)
  const cache = !forceRefresh ? readPrayerCache() : null
  const cachedForToday = cache?.cachedAt === todayKey && cache.locationKey === locationKey ? cache : null

  const todayData = cachedForToday?.data ?? (await fetchPrayerTimes(location))
  const nextPrayer = findNextPrayer(todayData)
  let tomorrowFajrTime = cachedForToday?.tomorrowFajrTime

  if (!nextPrayer && !tomorrowFajrTime) {
    tomorrowFajrTime = normalizePrayerTime((await fetchPrayerTimes(location, addDays(new Date(), 1))).timings.Fajr)
  }

  if (!cachedForToday || cachedForToday.tomorrowFajrTime !== tomorrowFajrTime) {
    writePrayerCache({
      cachedAt: todayKey,
      locationKey,
      data: todayData,
      tomorrowFajrTime,
    })
  }

  const upcomingPrayer = nextPrayer ?? {
    name: ARABIC_PRAYER_NAMES.Fajr,
    time: tomorrowFajrTime ?? "--:--",
  }

  return {
    hijriDate: formatHijriDate(todayData.date),
    gregorianDate: formatGregorianDate(todayData.date.gregorian.date),
    nextPrayerName: upcomingPrayer.name,
    nextPrayerTime: upcomingPrayer.time,
  }
}
