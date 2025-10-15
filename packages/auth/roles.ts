// Phase 6 Lite: Role helpers
export type Role = 'USER' | 'ADMIN';

export const isAdmin = (role?: string | null): boolean => {
  return role === 'ADMIN';
};

export const isUser = (role?: string | null): boolean => {
  return role === 'USER' || role === 'ADMIN';
};

