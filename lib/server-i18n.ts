import { cookies, headers } from 'next/headers';
import { Locale, locales, defaultLocale } from './i18n';

// Server-side locale detection
export async function getServerLocale(): Promise<Locale> {
  try {
    // Try to get locale from cookie
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale')?.value as Locale;
    if (localeCookie && locales.includes(localeCookie)) {
      return localeCookie;
    }

    // Try to get from Accept-Language header
    const headersList = await headers();
    const acceptLanguage = headersList.get('Accept-Language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(',')[0].split('-')[0] as Locale;
      if (locales.includes(preferredLocale)) {
        return preferredLocale;
      }
    }

    return defaultLocale;
  } catch (error) {
    // Fallback to default if server-side detection fails
    console.warn('Server-side locale detection failed:', error);
    return defaultLocale;
  }
}

// Server-side translation loading
export async function getServerTranslations(locale: Locale): Promise<any> {
  try {
    const translations = await import(`../translations/${locale}.json`);
    return translations.default || translations;
  } catch (error) {
    console.warn(`Failed to load translations for locale: ${locale}`, error);
    // Fallback to default locale
    if (locale !== defaultLocale) {
      return getServerTranslations(defaultLocale);
    }
    return {};
  }
} 