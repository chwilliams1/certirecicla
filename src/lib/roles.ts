export const ROLES = {
  ADMIN: "admin",
  OPERATOR: "operator",
  VIEWER: "viewer",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  operator: "Operador",
  viewer: "Visualizador",
};

// Permission definitions
const PERMISSIONS = {
  // Dashboard
  "dashboard:view": ["admin", "operator", "viewer"],
  // Clients
  "clients:view": ["admin", "operator", "viewer"],
  "clients:create": ["admin", "operator"],
  "clients:edit": ["admin", "operator"],
  "clients:delete": ["admin"],
  // Pickups
  "pickups:view": ["admin", "operator", "viewer"],
  "pickups:create": ["admin", "operator"],
  "pickups:edit": ["admin", "operator"],
  "pickups:delete": ["admin", "operator"],
  // Certificates
  "certificates:view": ["admin", "operator", "viewer"],
  "certificates:create": ["admin", "operator"],
  "certificates:send": ["admin", "operator"],
  "certificates:delete": ["admin"],
  // Settings
  "settings:view": ["admin"],
  "settings:edit": ["admin"],
  // Users
  "users:view": ["admin"],
  "users:manage": ["admin"],
  // Portal
  "portal:manage": ["admin", "operator"],
  // Export
  "export:sinader": ["admin", "operator"],
  // Reports
  "reports:view": ["admin", "operator", "viewer"],
  "reports:generate": ["admin", "operator"],
  // Notifications
  "notifications:view": ["admin", "operator", "viewer"],
  "notifications:manage": ["admin"],
  // Upload
  "upload:data": ["admin", "operator"],
  // Chatbot
  "chatbot:use": ["admin", "operator"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: string, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission] as readonly string[];
  return allowed?.includes(role) ?? false;
}

export function requirePermission(role: string, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error("No tienes permisos para realizar esta acción");
  }
}
