/**
 * Phase 6 Full: RBAC Permissions System
 * Fine-grained permission checks based on user roles
 */

import { Role } from './roles';

// User interface for permission checks
export interface PermissionUser {
  id: string;
  role: Role;
}

// Resource interface for ownership checks
export interface Resource {
  authorId?: string;
  [key: string]: any;
}

// Available permissions in the system
export type Permission =
  | 'createPost'           // Create new posts
  | 'editPost'             // Edit existing posts
  | 'submitReview'         // Submit post for review
  | 'approve'              // Approve/reject posts
  | 'publish'              // Publish posts
  | 'deletePost'           // Delete posts
  | 'manageMedia'          // Upload/manage media assets
  | 'manageCMS'            // Manage CMS content (hero, experiences, etc.)
  | 'manageUsers'          // Manage users and roles
  | 'viewAudit'            // View audit logs
  | 'createSocialEmbed'    // Phase 8: Create social embeds
  | 'editSocialEmbed'      // Phase 8: Edit social embeds
  | 'deleteSocialEmbed';   // Phase 8: Delete social embeds

/**
 * Access Control List (ACL)
 * Maps permissions to roles that have access
 */
export const ACL: Record<Permission, Role[]> = {
  // Posts - Authors can create
  createPost: ['AUTHOR', 'EDITOR', 'ADMIN', 'OWNER'],
  
  // Posts - Authors can edit (with ownership check), Editors+ can edit any
  editPost: ['AUTHOR', 'EDITOR', 'ADMIN', 'OWNER'],
  
  // Posts - Only authors can submit for review
  submitReview: ['AUTHOR'],
  
  // Posts - Reviewers+ can approve/reject
  approve: ['REVIEWER', 'EDITOR', 'ADMIN', 'OWNER'],
  
  // Posts - Editors+ can publish
  publish: ['EDITOR', 'ADMIN', 'OWNER'],
  
  // Posts - Admins+ can delete
  deletePost: ['ADMIN', 'OWNER'],
  
  // Media - Authors+ can manage media
  manageMedia: ['AUTHOR', 'EDITOR', 'ADMIN', 'OWNER'],
  
  // CMS - Editors+ can manage CMS content
  manageCMS: ['EDITOR', 'ADMIN', 'OWNER'],
  
  // Users - Only Owners can manage users
  manageUsers: ['OWNER'],
  
  // Audit - Admins+ can view audit logs
  viewAudit: ['ADMIN', 'OWNER'],
  
  // Phase 8: Social Embeds - Editors+ can create/edit
  createSocialEmbed: ['EDITOR', 'ADMIN', 'OWNER'],
  editSocialEmbed: ['EDITOR', 'ADMIN', 'OWNER'],
  
  // Phase 8: Social Embeds - Admins+ can delete
  deleteSocialEmbed: ['ADMIN', 'OWNER'],
};

/**
 * Check if a user has a specific permission
 * Includes ownership checks for certain permissions
 * 
 * @param user - User to check permission for
 * @param permission - Permission to check
 * @param resource - Optional resource for ownership checks
 * @returns true if user has permission, false otherwise
 */
export function hasPermission(
  user: PermissionUser,
  permission: Permission,
  resource?: Resource
): boolean {
  // Check if user's role is in the ACL for this permission
  const allowedRoles = ACL[permission];
  
  if (!allowedRoles.includes(user.role)) {
    return false;
  }
  
  // Special case: AUTHORS can only edit their own posts
  if (permission === 'editPost' && user.role === 'AUTHOR') {
    if (!resource?.authorId) {
      // No resource provided, we can't verify ownership
      return false;
    }
    // Check if user is the author
    return resource.authorId === user.id;
  }
  
  // User has permission
  return true;
}

/**
 * Require a permission (throws error if not allowed)
 * Use this in API routes for permission enforcement
 * 
 * @param user - User to check permission for
 * @param permission - Permission to require
 * @param resource - Optional resource for ownership checks
 * @throws Error with message 'FORBIDDEN' if permission denied
 */
export function requirePermission(
  user: PermissionUser,
  permission: Permission,
  resource?: Resource
): void {
  if (!hasPermission(user, permission, resource)) {
    throw new Error('FORBIDDEN');
  }
}

/**
 * Get all permissions for a user
 * Useful for client-side UI to show/hide features
 * 
 * @param user - User to get permissions for
 * @returns Array of permissions the user has
 */
export function getUserPermissions(user: PermissionUser): Permission[] {
  const permissions: Permission[] = [];
  
  for (const [permission, roles] of Object.entries(ACL)) {
    if (roles.includes(user.role)) {
      permissions.push(permission as Permission);
    }
  }
  
  return permissions;
}

/**
 * Check if user can perform any of the given permissions
 * 
 * @param user - User to check
 * @param permissions - Array of permissions (OR logic)
 * @param resource - Optional resource for ownership checks
 * @returns true if user has at least one of the permissions
 */
export function hasAnyPermission(
  user: PermissionUser,
  permissions: Permission[],
  resource?: Resource
): boolean {
  return permissions.some((permission) => hasPermission(user, permission, resource));
}

/**
 * Check if user can perform all of the given permissions
 * 
 * @param user - User to check
 * @param permissions - Array of permissions (AND logic)
 * @param resource - Optional resource for ownership checks
 * @returns true if user has all of the permissions
 */
export function hasAllPermissions(
  user: PermissionUser,
  permissions: Permission[],
  resource?: Resource
): boolean {
  return permissions.every((permission) => hasPermission(user, permission, resource));
}

/**
 * Middleware-friendly permission checker
 * Returns a function that can be used in API routes
 * 
 * @example
 * const checkPermission = createPermissionChecker(user);
 * checkPermission('publish'); // throws if not allowed
 */
export function createPermissionChecker(user: PermissionUser) {
  return (permission: Permission, resource?: Resource) => {
    requirePermission(user, permission, resource);
  };
}

