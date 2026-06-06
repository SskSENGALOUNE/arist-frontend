import { useSiteSettings } from "@/hooks/use-site-settings";

const DEFAULT_TZ = "Asia/Vientiane";
const DEFAULT_FMT = "DD/MM/YYYY";

/**
 * Formats a date string/Date according to the site's dateFormat and timezone.
 * Returns "" for falsy input.
 */
export function formatDate(
  value: string | Date | null | undefined,
  dateFormat = DEFAULT_FMT,
  timezone = DEFAULT_TZ,
): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dd = get("day");
  const mm = get("month");
  const yyyy = get("year");

  switch (dateFormat) {
    case "MM/DD/YYYY": return `${mm}/${dd}/${yyyy}`;
    case "YYYY-MM-DD": return `${yyyy}-${mm}-${dd}`;
    default:           return `${dd}/${mm}/${yyyy}`;
  }
}

/** React hook — reads format and timezone from site settings automatically. */
export function useFormatDate() {
  const { data: site } = useSiteSettings();
  const fmt = site?.dateFormat ?? DEFAULT_FMT;
  const tz = site?.timezone ?? DEFAULT_TZ;
  return (value: string | Date | null | undefined) => formatDate(value, fmt, tz);
}
