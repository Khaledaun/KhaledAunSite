// Phase 6 Full: Role helpers with all RBAC roles
export type Role = 'USER' | 'AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMIN' | 'OWNER';

export const isAdmin = (role?: string | null): boolean => {
  if (!role) return false;
  const upperRole = role.toUpperCase();
  return upperRole === 'ADMIN' || upperRole === 'OWNER';
};

export const isUser = (role?: string | null): boolean => {
  if (!role) return false;
  const upperRole = role.toUpperCase();
  return ['USER', 'AUTHOR', 'REVIEWER', 'EDITOR', 'ADMIN', 'OWNER'].includes(upperRole);
};

