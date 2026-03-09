"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { Shield } from "lucide-react";
import type { Permission } from "@/lib/roles";

export function PermissionGate({
  permission,
  children,
  fallback,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

export function PageGuard({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-sage-300 mx-auto mb-3" />
        <p className="text-sm text-sage-600">No tienes permisos para ver esta pagina.</p>
      </div>
    );
  }

  return <>{children}</>;
}
