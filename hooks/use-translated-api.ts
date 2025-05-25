import { useCallback } from 'react';
import { useTranslation } from '@/contexts/i18n-context';
import { translateApiError } from '@/lib/api-i18n';

interface UseTranslatedApiOptions {
  showToast?: boolean;
}

export function useTranslatedApi(options: UseTranslatedApiOptions = {}) {
  const { locale } = useTranslation();

  const callApi = useCallback(
    async <T>(apiCall: () => Promise<T>): Promise<T> => {
      try {
        return await apiCall();
      } catch (error) {
        // Translate the error message
        const translatedError = await translateApiError(error, locale);
        
        // Create a new error with the translated message
        const newError = new Error(translatedError);
        
        // Preserve the original error properties
        if (error && typeof error === 'object') {
          Object.assign(newError, error);
        }
        
        throw newError;
      }
    },
    [locale]
  );

  const get = useCallback(
    async (url: string, config?: RequestInit): Promise<any> => {
      return callApi(async () => {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Locale': locale,
            'Accept-Language': locale,
            ...config?.headers,
          },
          ...config,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        }

        return response.json();
      });
    },
    [callApi, locale]
  );

  const post = useCallback(
    async (url: string, data?: any, config?: RequestInit): Promise<any> => {
      return callApi(async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Locale': locale,
            'Accept-Language': locale,
            ...config?.headers,
          },
          body: data ? JSON.stringify(data) : undefined,
          ...config,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        }

        return response.json();
      });
    },
    [callApi, locale]
  );

  const put = useCallback(
    async (url: string, data?: any, config?: RequestInit): Promise<any> => {
      return callApi(async () => {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Locale': locale,
            'Accept-Language': locale,
            ...config?.headers,
          },
          body: data ? JSON.stringify(data) : undefined,
          ...config,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        }

        return response.json();
      });
    },
    [callApi, locale]
  );

  const del = useCallback(
    async (url: string, config?: RequestInit): Promise<any> => {
      return callApi(async () => {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Locale': locale,
            'Accept-Language': locale,
            ...config?.headers,
          },
          ...config,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        }

        return response.json();
      });
    },
    [callApi, locale]
  );

  return {
    callApi,
    get,
    post,
    put,
    delete: del,
  };
} 