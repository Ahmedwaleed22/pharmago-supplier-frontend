export type Locale = 'en' | 'ar' | 'fr';

export interface TranslationKeys {
  // Common keys
  'common.loading': string;
  'common.error': string;
  'common.noData': string;
  'common.close': string;
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.add': string;
  'common.search': string;
  'common.filter': string;
  'common.submit': string;
  'common.back': string;
  'common.next': string;
  'common.previous': string;
  'common.selectAll': string;
  'common.clear': string;

  // Auth keys
  'auth.login': string;
  'auth.email': string;
  'auth.password': string;
  'auth.enterEmail': string;
  'auth.enterPassword': string;
  'auth.rememberMe': string;
  'auth.forgotPassword': string;
  'auth.loggingIn': string;
  'auth.needAccount': string;
  'auth.signUp': string;
  'auth.loginFailed': string;
  'auth.invalidCredentials': string;
  'auth.validationError': string;
  'auth.tooManyAttempts': string;
  'auth.unauthorized': string;
  'auth.showPassword': string;
  'auth.hidePassword': string;
  'auth.clearStored': string;

  // Brand keys
  'brand.name': string;
  'brand.tagline': string;

  // Dashboard keys
  'dashboard.title': string;
  'dashboard.analytics': string;
  'dashboard.orders': string;
  'dashboard.prescriptions': string;
  'dashboard.sales': string;
  'dashboard.delivery': string;
  'dashboard.visits': string;
  'dashboard.orderHistory': string;
  'dashboard.growthVolume': string;
  'dashboard.errorLoadingData': string;
  'dashboard.statistics': string;

  // Products keys
  'products.title': string;
  'products.addProduct': string;
  'products.editProduct': string;
  'products.deleteProduct': string;
  'products.productName': string;
  'products.category': string;
  'products.price': string;
  'products.stock': string;
  'products.description': string;
  'products.image': string;
  'products.selectCategory': string;
  'products.failedToFetch': string;
  'products.failedToUpdate': string;
  'products.productUpdated': string;
  'products.productDeleted': string;

  // Notifications keys
  'notifications.title': string;
  'notifications.markAllRead': string;
  'notifications.markAsRead': string;
  'notifications.noNotifications': string;
  'notifications.loadingMore': string;
  'notifications.markingAsRead': string;
  'notifications.failedToFetch': string;
  'notifications.failedToMarkRead': string;
  'notifications.failedToMarkAllRead': string;

  // Error keys
  'errors.general': string;
  'errors.network': string;
  'errors.server': string;
  'errors.serviceUnavailable': string;
  'errors.validation': string;
  'errors.unauthorized': string;
  'errors.forbidden': string;
  'errors.notFound': string;
  'errors.timeout': string;
  'errors.unknown': string;
  'errors.apiConfiguration': string;
  'errors.invalidJson': string;
  'errors.endpointRequired': string;
  'errors.targetUrlRequired': string;
  'errors.connectionRefused': string;

  // UI keys
  'ui.selectOption': string;
  'ui.enterText': string;
  'ui.chooseFile': string;
  'ui.dragDropFile': string;
  'ui.maxTags': string;
  'ui.addTag': string;
  'ui.removeTag': string;
  'ui.searchPlaceholder': string;
  'ui.noResults': string;
  'ui.showMore': string;
  'ui.showLess': string;

  // Forms keys
  'forms.required': string;
  'forms.invalidEmail': string;
  'forms.invalidPassword': string;
  'forms.passwordsDoNotMatch': string;
  'forms.invalidNumber': string;
  'forms.invalidDate': string;
  'forms.fileTooLarge': string;
  'forms.invalidFileType': string;
}

export type TranslationFunction = (
  key: keyof TranslationKeys | string,
  values?: Record<string, string | number>
) => string;

export interface I18nContextType {
  locale: Locale;
  translations: any;
  t: TranslationFunction;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
  isRtl: boolean;
} 