"use client";

import React, { useState } from 'react';
import { ChevronDownIcon, GlobeIcon } from 'lucide-react';
import { useI18n } from '@/contexts/i18n-context';
import { locales, localeNames, localeFlags, Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale, isRtl } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
          "bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          compact && "px-2 py-1"
        )}
        aria-label="Change language"
      >
        {compact ? (
          <GlobeIcon className="w-4 h-4" />
        ) : (
          <>
            <span className="text-lg cursor-pointer">{localeFlags[locale]}</span>
            <span className="hidden sm:inline">{localeNames[locale]}</span>
          </>
        )}
        <ChevronDownIcon className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className={cn(
            "absolute top-full mt-1 z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1",
            "right-0"
          )}>
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left cursor-pointer",
                  "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                  locale === loc && "bg-blue-50 text-blue-700"
                )}
              >
                <span className="text-lg">{localeFlags[loc]}</span>
                <span className="font-medium">{localeNames[loc]}</span>
                {locale === loc && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher; 