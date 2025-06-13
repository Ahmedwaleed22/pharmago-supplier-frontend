import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginPharmacy, setAuthData, logout as logoutApi } from "@/lib/api";
import { resetPassword as resetPasswordPharmacy } from "@/lib/api";
import { useTranslation } from "@/contexts/i18n-context";

// Function to translate API errors to user-friendly messages
function translateLoginError(error: any, t: (key: string) => string): string {
  // Check if it's an axios error with response
  if (error?.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 401:
        return t('auth.invalidCredentials');
      case 422:
        return t('auth.validationError');
      case 429:
        return t('auth.tooManyAttempts');
      case 500:
        return t('errors.server');
      case 503:
        return t('errors.serviceUnavailable');
      default:
        // Check for specific error messages
        if (message?.toLowerCase().includes('invalid credentials')) {
          return t('auth.invalidCredentials');
        }
        if (message?.toLowerCase().includes('email') && message?.toLowerCase().includes('password')) {
          return t('auth.invalidCredentials');
        }
        return t('auth.loginFailed');
    }
  }
  
  // Check for network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return t('errors.network');
  }
  
  // Check for timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return t('errors.timeout');
  }
  
  // Default fallback
  return t('auth.loginFailed');
}

export function useAuth() {
  const router = useRouter();
  const { t } = useTranslation();

  const login = useMutation({
    mutationFn: (credentials: Auth.LoginCredentials) => loginPharmacy(credentials),
    onSuccess: (data, variables) => {
      setAuthData(data, variables.remember);
      router.push("/dashboard");
    },
    onError: (error) => {
      // Error is automatically handled by the mutation and will be available in login.error
      console.error("Login failed:", error);
    },
  });

  const logout = () => {
    logoutApi();
    router.push("/");
  };

  // Transform the error to a user-friendly message
  const translatedError = login.error?.message ? login.error.message : null;

  return {
    login,
    logout,
    isLoading: login.isPending,
    error: translatedError,
  };
}

export function useResetPassword() {
  const { t } = useTranslation();
  const { mutate: resetPassword, isPending, error } = useMutation({
    mutationFn: (email: string) => resetPasswordPharmacy(email),
    onError: (error) => {
      console.error("Reset password failed:", error);
    },
  });
  return { resetPassword, isPending, error, t };
} 