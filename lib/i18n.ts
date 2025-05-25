import { getCookie, setCookie } from 'cookies-next';

export type Locale = 'en' | 'ar' | 'fr' | 'es';

export const locales: Locale[] = ['en', 'ar', 'fr', 'es'];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  es: 'Español',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ar: '🇸🇦',
  fr: '🇫🇷',
  es: '🇪🇸',
};

// RTL languages
export const rtlLocales: Locale[] = ['ar'];

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function getLocale(): Locale {
  // Try to get locale from cookie
  const cookieLocale = getCookie('locale') as Locale;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Try to get locale from browser
  if (typeof navigator !== 'undefined') {
    const browserLocale = navigator.language.split('-')[0] as Locale;
    if (locales.includes(browserLocale)) {
      return browserLocale;
    }
  }

  return defaultLocale;
}

export function setLocale(locale: Locale): void {
  if (locales.includes(locale)) {
    setCookie('locale', locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'lax',
    });
  }
}

// Translation cache
const translationCache = new Map<string, any>();

export async function getTranslations(locale: Locale): Promise<any> {
  const cacheKey = locale;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const translations = await import(`../translations/${locale}.json`);
    const data = translations.default || translations;
    translationCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`Failed to load translations for locale: ${locale}`, error);
    // Fallback to default locale
    if (locale !== defaultLocale) {
      return getTranslations(defaultLocale);
    }
    return {};
  }
}

export function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
} 