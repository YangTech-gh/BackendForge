export type Permission = string;

export interface Role {
  name: string;
  permissions: Permission[];
  parentRole?: string;
}

const roles: Map<string, Role> = new Map([
  ['admin', { name: 'admin', permissions: ['*'] }],
  ['manager', { name: 'manager', permissions: ['users:read', 'users:write', 'orders:read', 'orders:write'], parentRole: 'user' }],
  ['user', { name: 'user', permissions: ['orders:read', 'profile:read', 'profile:write'] }],
]);

export function getRole(name: string): Role | undefined {
  return roles.get(name);
}

export function hasPermission(roleName: string, permission: Permission): boolean {
  const role = roles.get(roleName);
  if (!role) return false;
  if (role.permissions.includes('*')) return true;
  if (role.permissions.includes(permission)) return true;
  if (role.parentRole) return hasPermission(role.parentRole, permission);
  return false;
}

export function requireRole(...allowedRoles: string[]) {
  return (userRoles: string[]): boolean => {
    return userRoles.some(role => allowedRoles.includes(role));
  };
}
