// Phase 6 Full: Role helpers with all RBAC roles
export type Role = 'USER' | 'AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMIN' | 'OWNER';

export const isAdmin = (role?: string | null): boolean => {
  return role === 'ADMIN' || role === 'OWNER';
};

export const isUser = (role?: string | null): boolean => {
  return role === 'USER' || role === 'AUTHOR' || role === 'REVIEWER' || role === 'EDITOR' || role === 'ADMIN' || role === 'OWNER';
};

