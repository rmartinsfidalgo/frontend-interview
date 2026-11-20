/**
 * Formats an ISO timestamp relative to `now` for display.
 *
 * - Under a minute (past or future): "just now"
 * - Up to 3 days ago, or any time in the future: "5 minutes ago", "yesterday", "in 2 hours"
 * - More than 3 days ago: short date, "12 Nov" (or "12 Nov 2025" if not the current year)
 *
 * @param now Reference time in ms; injectable for deterministic tests.
 */

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

const RELATIVE_MAX_SECONDS = 3 * 86_400

const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const shortDateWithYear = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatRelative(iso: string, now: number = Date.now()): string {
  const date = new Date(iso)
  const diffSeconds = (date.getTime() - now) / 1000

  if (-diffSeconds > RELATIVE_MAX_SECONDS) {
    const sameYear = date.getFullYear() === new Date(now).getFullYear()
    return (sameYear ? shortDate : shortDateWithYear).format(date)
  }

  const match = UNITS.find(([, seconds]) => Math.abs(diffSeconds) >= seconds)
  if (!match) return 'just now'
  const [unit, seconds] = match
  return rtf.format(Math.round(diffSeconds / seconds), unit)
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
