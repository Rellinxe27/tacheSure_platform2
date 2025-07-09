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
  const { profile } = useAuth();

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}



