# Multi-Language Support (i18n) 🌍

This application now supports **English**, **Arabic**, and **French** with full RTL support for Arabic.

## ✨ Features

- 🔄 **Automatic Language Detection**: Browser language + cookie persistence  
- 🎯 **Frontend Translation**: All UI text translatable via `t()` function
- 🔧 **API Translation**: Error messages and responses translated automatically
- 📱 **RTL Support**: Complete right-to-left layout for Arabic
- 🎛️ **Language Switcher**: Easy language selection component
- 📝 **TypeScript Support**: Type-safe translation keys

## 🚀 Quick Usage

### In Components
```tsx
import { useTranslation } from '@/contexts/i18n-context';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('auth.login')}</h1>;
}
```

### Language Switcher
```tsx
import LanguageSwitcher from '@/components/language-switcher';

function Header() {
  return <LanguageSwitcher />;
}
```

### API with Translation
```tsx
import { useTranslatedApi } from '@/hooks/use-translated-api';

function MyComponent() {
  const api = useTranslatedApi();
  // Error messages automatically translated
  const data = await api.get('/api/products');
}
```

## 🛠️ Adding New Translations

### Option 1: Use the Helper Script
```bash
npm run add-translation
```

### Option 2: Manual Addition
1. Add keys to `translations/en.json`, `translations/ar.json`, `translations/fr.json`
2. Use in components: `t('your.new.key')`

## 📁 Key Files

- `translations/` - Translation files (en.json, ar.json, fr.json)
- `lib/i18n.ts` - Core i18n utilities  
- `lib/api-i18n.ts` - API translation utilities
- `contexts/i18n-context.tsx` - React context and hooks
- `components/language-switcher.tsx` - Language selector component
- `docs/i18n-guide.md` - **Complete documentation**

## 📖 Full Documentation

See [docs/i18n-guide.md](./docs/i18n-guide.md) for comprehensive documentation including:
- Advanced usage patterns
- RTL styling guide  
- API integration examples
- Troubleshooting tips
- Best practices

## 🎨 RTL Support

Arabic language automatically enables:
- `dir="rtl"` on `<html>` element
- `.rtl` CSS class for custom styling
- Automatic margin/padding/positioning reversal

## 🔧 Development

The app detects language from:
1. Cookie (`locale`)
2. Browser `Accept-Language` header  
3. Defaults to English

Language changes trigger a page reload to ensure all translations load correctly.

---

**Start translating!** 🎉 The system is ready to use immediately with comprehensive English, Arabic, and French support. 