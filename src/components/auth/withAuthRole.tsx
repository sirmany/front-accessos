
"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AccessDenied } from '@/components/shared/AccessDenied';
import { PageHeader } from '@/components/shared/PageHeader';

interface WithAuthRoleOptions {
  // You can add options here if needed in the future, e.g., a custom loading component.
}

export function withAuthRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[],
  options?: WithAuthRoleOptions
) {
  const ComponentWithAuth: React.FC<P> = (props) => {
    const { user, isLoadingAuth } = useAuth();

    if (isLoadingAuth) {
      return <PageHeader title="Verificant permisos..." description="Si us plau, espera." />;
    }

    if (!user) {
      // AuthContext should handle redirection to login, but as a fallback:
      return <AccessDenied />; // Or a specific "Not Logged In" component
    }

    const hasRequiredRole = user.roles.some(role => allowedRoles.includes(role));

    if (!hasRequiredRole) {
      return <AccessDenied />;
    }

    return <WrappedComponent {...props} />;
  };

  // Assign a display name for easier debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithAuth.displayName = `withAuthRole(${displayName})`;

  return ComponentWithAuth;
}
