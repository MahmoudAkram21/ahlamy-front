/**
 * AlAdhan Prayer Times API client
 * https://aladhan.com/prayer-times-api
 */

const ALADHAN_BASE = "https://api.aladhan.com/v1"

export interface PrayerTimings {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

export interface PrayerTimesData {
  timings: PrayerTimings
  dateReadable: string
  timezone: string
  /** Hijri date string if available */
  hijri?: string
}

interface AlAdhanTimingsResponse {
  data?: {
    timings?: Record<string, string>
    date?: { readable?: string; hijri?: { date?: string; day?: string; month?: { ar?: string }; year?: string } }
    meta?: { timezone?: string }
  }
}

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const
const PRAYER_NAMES_AR: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
}

function parseResponse(res: AlAdhanTimingsResponse): PrayerTimesData | null {
  const data = res?.data
  if (!data?.timings) return null
  const t = data.timings
  const timings: PrayerTimings = {
    Fajr: t.Fajr ?? "",
    Sunrise: t.Sunrise ?? "",
    Dhuhr: t.Dhuhr ?? "",
    Asr: t.Asr ?? "",
    Maghrib: t.Maghrib ?? "",
    Isha: t.Isha ?? "",
  }
  const hijri = data.date?.hijri
  const hijriStr =
    hijri?.day && hijri?.month?.ar && hijri?.year
      ? `${hijri.day} ${hijri.month.ar} ${hijri.year}`
      : undefined
  return {
    timings,
    dateReadable: data.date?.readable ?? "",
    timezone: data.meta?.timezone ?? "",
    hijri: hijriStr,
  }
}

export async function getTimingsByCoords(lat: number, lon: number): Promise<PrayerTimesData | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
  })
  const url = `${ALADHAN_BASE}/timings?${params}`
  const res = await fetch(url)
  if (!res.ok) return null
  const json: AlAdhanTimingsResponse = await res.json()
  return parseResponse(json)
}

export async function getTimingsByCity(city: string, country: string): Promise<PrayerTimesData | null> {
  const params = new URLSearchParams({
    city: city,
    country: country,
  })
  const url = `${ALADHAN_BASE}/timingsByCity?${params}`
  const res = await fetch(url)
  if (!res.ok) return null
  const json: AlAdhanTimingsResponse = await res.json()
  return parseResponse(json)
}

export interface NextPrayer {
  name: string
  nameAr: string
  time: string
  isNext: true
  /** If after Isha, next is Fajr (tomorrow) */
  isTomorrow?: boolean
}

/**
 * Given timings and current local time (HH:mm), return the next prayer.
 * Uses the location's date for "today"; if we're after Isha, next is Fajr (tomorrow).
 */
export function getNextPrayer(timings: PrayerTimings, nowHHmm: string): NextPrayer | null {
  const parse = (s: string) => {
    const [h, m] = s.split(":").map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }
  const nowMins = parse(nowHHmm)
  if (Number.isNaN(nowMins) && nowHHmm !== "24:00") return null

  for (const key of PRAYER_ORDER) {
    const time = timings[key as keyof PrayerTimings]
    if (!time) continue
    const prayerMins = parse(time)
    if (nowMins < prayerMins) {
      return {
        name: key,
        nameAr: PRAYER_NAMES_AR[key] ?? key,
        time,
        isNext: true,
      }
    }
  }
  // After Isha -> next is Fajr (tomorrow)
  const fajr = timings.Fajr
  if (fajr) {
    return {
      name: "Fajr",
      nameAr: "الفجر",
      time: fajr,
      isNext: true,
      isTomorrow: true,
    }
  }
  return null
}

/**
 * Get current time in HH:mm (24h). If timezone is provided (e.g. from API meta.timezone),
 * returns time in that zone so "next prayer" comparison matches the location's times.
 */
export function getNowHHmm(timezone?: string): string {
  const d = new Date()
  if (timezone) {
    try {
      const s = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone })
      return s
    } catch {
      // fallback to device time
    }
  }
  const h = d.getHours()
  const m = d.getMinutes()
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/** All five daily prayers in order for today's timetable */
export function getTodayPrayerList(timings: PrayerTimings): { key: keyof PrayerTimings; nameAr: string; time: string }[] {
  return PRAYER_ORDER.map((key) => ({
    key: key as keyof PrayerTimings,
    nameAr: PRAYER_NAMES_AR[key] ?? key,
    time: timings[key as keyof PrayerTimings] ?? "--:--",
  }))
}
