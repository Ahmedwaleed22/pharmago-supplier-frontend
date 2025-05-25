import { Locale, getTranslations, getNestedValue, interpolate } from './i18n';
import { getCookie } from 'cookies-next';

/**
 * Translate API error messages based on current locale
 */
export async function translateApiError(error: any, locale?: Locale): Promise<string> {
  const currentLocale = locale || (getCookie('locale') as Locale) || 'en';
  
  try {
    const translations = await getTranslations(currentLocale);
    
    // Map common error types to translation keys
    const errorMappings: Record<string, string> = {
      'network': 'errors.network',
      'server': 'errors.server',
      'validation': 'errors.validation',
      'unauthorized': 'errors.unauthorized',
      'forbidden': 'errors.forbidden',
      'not found': 'errors.notFound',
      'timeout': 'errors.timeout',
      'api configuration error': 'errors.apiConfiguration',
      'invalid json body': 'errors.invalidJson',
      'endpoint parameter is required': 'errors.endpointRequired',
      'x-target-url header is required': 'errors.targetUrlRequired',
      'connection refused': 'errors.connectionRefused',
    };

    // Try to match error message to translation key
    if (error?.message) {
      const errorMessage = error.message.toLowerCase();
      
      for (const [pattern, translationKey] of Object.entries(errorMappings)) {
        if (errorMessage.includes(pattern)) {
          const translation = getNestedValue(translations, translationKey);
          if (translation) {
            return translation;
          }
        }
      }
    }

    // Check for specific HTTP status codes
    if (error?.response?.status) {
      const statusCode = error.response.status;
      const statusMappings: Record<number, string> = {
        400: 'errors.validation',
        401: 'errors.unauthorized',
        403: 'errors.forbidden',
        404: 'errors.notFound',
        408: 'errors.timeout',
        500: 'errors.server',
        502: 'errors.server',
        503: 'errors.server',
        504: 'errors.timeout',
      };

      const translationKey = statusMappings[statusCode];
      if (translationKey) {
        const translation = getNestedValue(translations, translationKey);
        if (translation) {
          return translation;
        }
      }
    }

    // Return generic error message as fallback
    const genericError = getNestedValue(translations, 'errors.general');
    return genericError || error?.message || 'An error occurred';
    
  } catch (translationError) {
    console.warn('Failed to translate error message:', translationError);
    return error?.message || 'An error occurred';
  }
}

/**
 * Create a translated error response for API routes
 */
export async function createTranslatedErrorResponse(
  error: any, 
  statusCode: number = 500,
  locale?: Locale
): Promise<{ error: string }> {
  const translatedMessage = await translateApiError(error, locale);
  return { error: translatedMessage };
}

/**
 * Extract locale from request headers
 */
export function getLocaleFromRequest(request: Request): Locale {
  // Try to get locale from Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(',')[0].split('-')[0] as Locale;
    if (['en', 'ar', 'fr'].includes(preferredLocale)) {
      return preferredLocale;
    }
  }

  // Try to get locale from custom header
  const customLocale = request.headers.get('X-Locale') as Locale;
  if (customLocale && ['en', 'ar', 'fr'].includes(customLocale)) {
    return customLocale;
  }

  return 'en'; // Default fallback
}

/**
 * Middleware helper to add locale to request
 */
export function addLocaleToHeaders(headers: HeadersInit = {}, locale: Locale): HeadersInit {
  return {
    ...headers,
    'X-Locale': locale,
    'Accept-Language': locale,
  };
}

/**
 * Translate success messages for API responses
 */
export async function translateSuccessMessage(
  messageKey: string, 
  values?: Record<string, string | number>,
  locale?: Locale
): Promise<string> {
  const currentLocale = locale || (getCookie('locale') as Locale) || 'en';
  
  try {
    const translations = await getTranslations(currentLocale);
    const translation = getNestedValue(translations, messageKey);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${messageKey} in locale: ${currentLocale}`);
      return messageKey;
    }

    if (values) {
      return interpolate(translation, values);
    }

    return translation;
  } catch (error) {
    console.warn('Failed to translate success message:', error);
    return messageKey;
  }
}

/**
 * Wrapper for API calls with automatic error translation
 */
export async function withApiTranslation<T>(
  apiCall: () => Promise<T>,
  locale?: Locale
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    const translatedError = await translateApiError(error, locale);
    throw new Error(translatedError);
  }
} 