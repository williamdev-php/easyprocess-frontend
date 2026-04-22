/**
 * Resolve a localized string from a JSON translation object.
 *
 * The database stores translatable fields as `{"en": "...", "sv": "..."}`.
 * This helper picks the right locale, falling back to English, then any
 * available key, and finally to a fallback string.
 */
export function localizedText(
  translations: Record<string, string> | string | null | undefined,
  locale: string,
  fallback = "",
): string {
  if (!translations) return fallback;
  // Backwards-compat: if the value is already a plain string, return it as-is
  if (typeof translations === "string") return translations;
  return translations[locale] ?? translations["en"] ?? Object.values(translations)[0] ?? fallback;
}
