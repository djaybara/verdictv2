
export const LOCALES = ['en','es','fr','de'] as const
export type Locale = typeof LOCALES[number]
export const DEFAULT_LOCALE: Locale = 'en'

export const I18N: Record<string, any> = {
  en: { brand: 'QuickVerdict' },
  fr: { brand: 'QuickVerdict' },
  es: { brand: 'QuickVerdict' },
  de: { brand: 'QuickVerdict' },
}

export function detectBrowserLocale(): Locale {
  try {
    const l = (navigator.language || (navigator as any).languages?.[0] || 'en').slice(0,2).toLowerCase()
    return (LOCALES as readonly string[]).includes(l) ? (l as Locale) : DEFAULT_LOCALE
  } catch { return DEFAULT_LOCALE }
}

export function getLocale(){
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const saved = localStorage.getItem('lang')
  if (saved && (LOCALES as readonly string[]).includes(saved)) return saved as Locale
  return detectBrowserLocale()
}

export function setLocale(l: Locale){
  localStorage.setItem('lang', l)
  document.documentElement.lang = l
}
