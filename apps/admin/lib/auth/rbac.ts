/**
 * Role-Based Access Control (RBAC)
 * Defines roles, permissions, and access control helpers
 */

import { getUser } from './supabase-server';
import { prisma } from '../../app/lib/prisma';

// Role definitions
export type Role = 'admin' | 'editor' | 'viewer';

// Permission definitions
export type Permission = 
  | 'content:read'
  | 'content:write'
  | 'content:delete'
  | 'content:publish'
  | 'media:read'
  | 'media:write'
  | 'media:delete'
  | 'settings:read'
  | 'settings:write'
  | 'users:read'
  | 'users:write';

// Role -> Permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'content:read',
    'content:write',
    'content:delete',
    'content:publish',
    'media:read',
    'media:write',
    'media:delete',
    'settings:read',
    'settings:write',
    'users:read',
    'users:write',
  ],
  editor: [
    'content:read',
    'content:write',
    'content:publish',
    'media:read',
    'media:write',
    'settings:read',
  ],
  viewer: [
    'content:read',
    'media:read',
    'settings:read',
  ],
};

/**
 * Get user's roles from database
 */
export async function getUserRoles(userId: string): Promise<Role[]> {
  try {
    const roles = await prisma.userRole.findMany({
      where: { userId },
      select: { role: true },
    });
    return roles.map(r => r.role as Role);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, role: Role): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(role);
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(userId: string, roles: Role[]): Promise<boolean> {
  const userRoles = await getUserRoles(userId);
  return userRoles.some(role => roles.includes(role));
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const roles = await getUserRoles(userId);
  
  for (const role of roles) {
    const rolePermissions = ROLE_PERMISSIONS[role];
    if (rolePermissions.includes(permission)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Require authentication and return user
 * Throws error if not authenticated
 */
export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Require specific role
 * Throws error if user doesn't have role
 */
export async function requireRole(role: Role | Role[]) {
  const user = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];
  
  const hasRequiredRole = await hasAnyRole(user.id, roles);
  
  if (!hasRequiredRole) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  
  return user;
}

/**
 * Require specific permission
 * Throws error if user doesn't have permission
 */
export async function requirePermission(permission: Permission) {
  const user = await requireAuth();
  
  const hasRequiredPermission = await hasPermission(user.id, permission);
  
  if (!hasRequiredPermission) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  
  return user;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  return hasRole(user.id, 'admin');
}

/**
 * Get current user with their roles
 */
export async function getCurrentUserWithRoles() {
  const user = await getUser();
  if (!user) return null;
  
  const roles = await getUserRoles(user.id);
  
  return {
    ...user,
    roles,
  };
}

