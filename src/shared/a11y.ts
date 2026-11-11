const DEFAULT_LANGUAGE = "fr";

/**
 * The CAS login page does not declare its language. Expose it to assistive
 * technologies without overriding a language explicitly set by the theme.
 */
export function ensurePageLanguage(language = DEFAULT_LANGUAGE): void {
  const root = document.documentElement;
  if (!root.lang.trim()) {
    root.lang = language;
  }
}
