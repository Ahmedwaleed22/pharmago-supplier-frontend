"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/contexts/i18n-context";

export default function LogoutButton() {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <span 
      onClick={logout} 
      className="flex items-center gap-2 cursor-pointer text-red-400 w-max"
    >
      <LogOut className="w-5 h-5" />
      {t('navigation.logout')}
    </span>
  );
} 