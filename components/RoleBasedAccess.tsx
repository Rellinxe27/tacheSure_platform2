// components/RoleBasedAccess.tsx
import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface RoleBasedAccessProps {
  allowedRoles: ('client' | 'provider' | 'admin' | 'moderator' | 'verifier')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleBasedAccess({
                                          allowedRoles,
                                          children,
                                          fallback = null
                                        }: RoleBasedAccessProps) {
  const { profile, loading } = useAuth();

  // Don't render anything while loading
  if (loading) {
    return <>{fallback}</>;
  }

  // Check if user has required role
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Helper hook for role checking
export const useRole = () => {
  const { profile } = useAuth();

  const hasRole = (role: string | string[]) => {
    if (!profile) return false;
    if (Array.isArray(role)) {
      return role.includes(profile.role);
    }
    return profile.role === role;
  };

  const isProvider = () => hasRole('provider');
  const isClient = () => hasRole('client');
  const isAdmin = () => hasRole('admin');
  const isModerator = () => hasRole('moderator');
  const isVerifier = () => hasRole('verifier');

  return {
    currentRole: profile?.role,
    hasRole,
    isProvider,
    isClient,
    isAdmin,
    isModerator,
    isVerifier
  };
};