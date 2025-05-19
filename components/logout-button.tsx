"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <span 
      onClick={logout} 
      className="flex items-center gap-2 cursor-pointer text-red-400 w-max"
    >
      <LogOut className="w-5 h-5" />
      Log Out
    </span>
  );
} 