import React, { ReactNode } from 'react';
import useAuth from '../../hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Initialize auth state
  useAuth();
  
  return <>{children}</>;
} 