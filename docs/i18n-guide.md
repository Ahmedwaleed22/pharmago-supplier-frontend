# Internationalization (i18n) Guide

This guide explains how to use the multi-language translation system implemented in the PharmaGo application.

## Overview

The application supports three languages:
- English (en) - Default
- Arabic (ar) - RTL support
- French (fr)

## Features

- ✅ **Frontend Translation**: All UI text is translatable
- ✅ **API Response Translation**: Error messages and API responses are translated
- ✅ **RTL Support**: Full right-to-left layout support for Arabic
- ✅ **Language Switching**: Users can change language with a dropdown
- ✅ **Automatic Detection**: Browser language detection with cookie persistence
- ✅ **Type Safety**: TypeScript support for translation keys

## Quick Start

### Using Translations in Components

```tsx
import { useTranslation } from '@/contexts/i18n-context';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.loading')}</h1>
      <p>{t('auth.enterEmail')}</p>
    </div>
  );
}
```

### Adding the Language Switcher

```tsx
import LanguageSwitcher from '@/components/language-switcher';

function Header() {
  return (
    <div>
      <LanguageSwitcher />
      {/* or compact version */}
      <LanguageSwitcher compact />
    </div>
  );
}
```

### Using API with Translation

```tsx
import { useTranslatedApi } from '@/hooks/use-translated-api';

function MyComponent() {
  const api = useTranslatedApi();
  
  const handleSubmit = async () => {
    try {
      const result = await api.post('/api/products', data);
      // Success
    } catch (error) {
      // Error message is automatically translated
      console.error(error.message);
    }
  };
}
```

## Translation Keys

Translation keys are organized in a nested structure:

```
common.*          - Common UI elements (loading, error, save, etc.)
auth.*           - Authentication related text
dashboard.*      - Dashboard specific text
products.*       - Product management text
categories.*     - Category management text
prescriptions.*  - Prescription related text
notifications.*  - Notification text
errors.*         - Error messages
ui.*             - General UI components
navigation.*     - Navigation items
forms.*          - Form validation messages
```

## Adding New Translations

### 1. Add to Translation Files

Add your new keys to all language files:

**translations/en.json**
```json
{
  "mySection": {
    "newKey": "Hello World"
  }
}
```

**translations/ar.json**
```json
{
  "mySection": {
    "newKey": "مرحبا بالعالم"
  }
}
```

**translations/fr.json**
```json
{
  "mySection": {
    "newKey": "Bonjour le monde"
  }
}
```

### 2. Use in Components

```tsx
const { t } = useTranslation();
return <div>{t('mySection.newKey')}</div>;
```

## Advanced Usage

### Interpolation

You can use variables in translations:

**Translation file:**
```json
{
  "welcome": "Welcome {{name}} to {{app}}"
}
```

**Component:**
```tsx
const message = t('welcome', { name: 'John', app: 'PharmaGo' });
// Result: "Welcome John to PharmaGo"
```

### Checking Current Language

```tsx
import { useI18n } from '@/contexts/i18n-context';

function MyComponent() {
  const { locale, isRtl } = useI18n();
  
  return (
    <div className={isRtl ? 'text-right' : 'text-left'}>
      Current language: {locale}
    </div>
  );
}
```

### Programmatic Language Change

```tsx
import { useI18n } from '@/contexts/i18n-context';

function MyComponent() {
  const { setLocale } = useI18n();
  
  const changeToArabic = () => {
    setLocale('ar');
  };
}
```

## API Translation

### In API Routes

```tsx
import { createTranslatedErrorResponse, getLocaleFromRequest } from '@/lib/api-i18n';

export async function POST(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    // ... your API logic
  } catch (error) {
    const locale = getLocaleFromRequest(request);
    const errorResponse = await createTranslatedErrorResponse(error, 500, locale);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
```

### Translating Success Messages

```tsx
import { translateSuccessMessage } from '@/lib/api-i18n';

const message = await translateSuccessMessage('products.productUpdated', {}, locale);
```

## RTL Support

Arabic language automatically enables RTL layout. The system:

1. Sets `dir="rtl"` on the `<html>` element
2. Adds `.rtl` class for custom CSS
3. Reverses margins, paddings, and positioning

### Custom RTL Styles

```css
.rtl .my-component {
  margin-left: 0;
  margin-right: 1rem;
}
```

## Best Practices

### 1. Use Semantic Keys
```tsx
// ✅ Good
t('auth.loginButton')
t('products.addProduct')

// ❌ Bad
t('button1')
t('text123')
```

### 2. Group Related Keys
```tsx
// ✅ Good
t('forms.required')
t('forms.invalidEmail')

// ❌ Bad
t('required')
t('emailError')
```

### 3. Handle Missing Translations
```tsx
const { t } = useTranslation();

// The system automatically falls back to the key name if translation is missing
const text = t('missing.key'); // Returns 'missing.key' if not found
```

### 4. Use Loading States
```tsx
const { isLoading } = useTranslation();

if (isLoading) {
  return <div>Loading translations...</div>;
}
```

## Troubleshooting

### Translation Not Showing
1. Check if the key exists in all translation files
2. Verify the key path is correct
3. Ensure the component is wrapped in `I18nProvider`

### RTL Layout Issues
1. Check if Arabic language is properly detected
2. Verify RTL CSS is properly imported
3. Use the `.rtl` class for custom styles

### API Errors Not Translated
1. Ensure API routes import and use translation utilities
2. Check if locale is properly extracted from request
3. Verify error mapping in `lib/api-i18n.ts`

## File Structure

```
translations/
├── en.json          # English translations
├── ar.json          # Arabic translations
└── fr.json          # French translations

lib/
├── i18n.ts          # Core i18n utilities
└── api-i18n.ts      # API translation utilities

contexts/
└── i18n-context.tsx # React context and hooks

components/
└── language-switcher.tsx # Language switcher component

hooks/
└── use-translated-api.ts  # API hook with translation
```

## Contributing

When adding new features:
1. Add translation keys to all language files
2. Use the `t()` function for all user-facing text
3. Test with different languages, especially Arabic (RTL)
4. Update API routes to use translation utilities
5. Document new translation keys in this guide 