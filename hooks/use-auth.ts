import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginPharmacy, setAuthData, logout as logoutApi } from "@/lib/api";

export function useAuth() {
  const router = useRouter();

  const login = useMutation({
    mutationFn: (credentials: Auth.LoginCredentials) => loginPharmacy(credentials),
    onSuccess: (data) => {
      setAuthData(data);
      router.push("/dashboard");
    },
  });

  const logout = () => {
    logoutApi();
    router.push("/");
  };

  return {
    login,
    logout,
    isLoading: login.isPending,
    error: login.error,
  };
} 