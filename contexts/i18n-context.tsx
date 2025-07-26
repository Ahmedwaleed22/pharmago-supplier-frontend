"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  Locale, 
  getLocale, 
  setLocale as setLocaleCookie, 
  getTranslations,
  getNestedValue,
  interpolate,
  isRtlLocale,
  defaultLocale 
} from '@/lib/i18n';

interface I18nContextType {
  locale: Locale;
  translations: any;
  t: (key: string, values?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
  initialTranslations?: any;
}

export function I18nProvider({ children, initialLocale, initialTranslations }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [translations, setTranslations] = useState<any>(initialTranslations || {});
  const [isLoading, setIsLoading] = useState(!initialTranslations);

  // Initialize locale on client side only if no initial locale was provided
  useEffect(() => {
    if (!initialLocale) {
      const detectedLocale = getLocale();
      setLocaleState(detectedLocale);
    }
  }, [initialLocale]);

  // Load translations when locale changes (only if not already provided)
  useEffect(() => {
    // If we have initial translations for the current locale, don't reload
    if (initialTranslations && locale === initialLocale) {
      return;
    }

    let isMounted = true;

    async function loadTranslations() {
      setIsLoading(true);
      try {
        const newTranslations = await getTranslations(locale);
        if (isMounted) {
          setTranslations(newTranslations);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        if (isMounted) {
          setTranslations({});
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTranslations();

    return () => {
      isMounted = false;
    };
  }, [locale, initialLocale, initialTranslations]);

  // Update document direction and lang attribute only if they differ from server-side values
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const isRtl = isRtlLocale(locale);
      
      // Only update if different from current values to avoid unnecessary DOM changes
      if (html.getAttribute('lang') !== locale) {
        html.setAttribute('lang', locale);
      }
      
      if (html.getAttribute('dir') !== (isRtl ? 'rtl' : 'ltr')) {
        html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      }
      
      // Update CSS classes for RTL support
      if (isRtl && !html.classList.contains('rtl')) {
        html.classList.add('rtl');
      } else if (!isRtl && html.classList.contains('rtl')) {
        html.classList.remove('rtl');
      }
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setLocaleCookie(newLocale);
    // Removed window.location.reload() to allow for reactive language switching
  };

  const t = (key: string, values?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations, key);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
      return key; // Return the key as fallback
    }

    if (values) {
      return interpolate(translation, values);
    }

    return translation;
  };

  const contextValue: I18nContextType = {
    locale,
    translations,
    t,
    setLocale,
    isLoading,
    isRtl: isRtlLocale(locale),
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {/* Only render children when translations are loaded or when we have initial translations */}
      {(!isLoading || initialTranslations) ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale, isRtl, isLoading } = useI18n();
  return { t, locale, isRtl, isLoading };
} 