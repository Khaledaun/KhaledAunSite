/**
 * Firm-Specific RBAC Permissions
 *
 * Extends the base RBAC system with firm-specific roles and permissions
 * for NAS & Co. partners and staff.
 *
 * Access Levels:
 * - OWNER (Khaled): Full access including technical settings and API keys
 * - PARTNER (Abed, Hisham): Full content access, no technical/API settings
 * - ASSOCIATE: Limited to own content and LinkedIn drafts
 * - STAFF: View only with limited editing
 */

// Firm-specific roles
export type FirmRole =
  | 'FIRM_OWNER'      // Khaled - full access
  | 'FIRM_PARTNER'    // Abed, Hisham - content access, no technical
  | 'FIRM_ASSOCIATE'  // Associates - limited to own content
  | 'FIRM_STAFF';     // Administrative staff - view/limited edit

// Firm-specific permissions
export type FirmPermission =
  // Content Management
  | 'firm:content:read'          // View firm website content
  | 'firm:content:write'         // Edit firm website content
  | 'firm:content:publish'       // Publish content changes

  // Team Management
  | 'firm:team:read'             // View team members
  | 'firm:team:write'            // Add/edit team members
  | 'firm:team:delete'           // Remove team members

  // Practice Areas
  | 'firm:practice:read'         // View practice areas
  | 'firm:practice:write'        // Edit practice areas

  // LinkedIn Management
  | 'firm:linkedin:read'         // View LinkedIn posts/drafts
  | 'firm:linkedin:draft'        // Create drafts (own account)
  | 'firm:linkedin:approve'      // Approve drafts for publishing
  | 'firm:linkedin:publish'      // Publish to LinkedIn
  | 'firm:linkedin:manage'       // Manage all LinkedIn accounts

  // Settings & Configuration
  | 'firm:settings:read'         // View settings
  | 'firm:settings:write'        // Edit general settings
  | 'firm:settings:technical'    // Technical settings (API keys, integrations)

  // Analytics
  | 'firm:analytics:read'        // View analytics
  | 'firm:analytics:export';     // Export analytics data

// Role -> Permissions mapping for firm
export const FIRM_ROLE_PERMISSIONS: Record<FirmRole, FirmPermission[]> = {
  // Khaled - Full access to everything
  FIRM_OWNER: [
    'firm:content:read',
    'firm:content:write',
    'firm:content:publish',
    'firm:team:read',
    'firm:team:write',
    'firm:team:delete',
    'firm:practice:read',
    'firm:practice:write',
    'firm:linkedin:read',
    'firm:linkedin:draft',
    'firm:linkedin:approve',
    'firm:linkedin:publish',
    'firm:linkedin:manage',
    'firm:settings:read',
    'firm:settings:write',
    'firm:settings:technical',  // Only owner has this
    'firm:analytics:read',
    'firm:analytics:export',
  ],

  // Abed, Hisham - Everything except technical settings
  FIRM_PARTNER: [
    'firm:content:read',
    'firm:content:write',
    'firm:content:publish',
    'firm:team:read',
    'firm:team:write',
    // No firm:team:delete - can't remove other partners
    'firm:practice:read',
    'firm:practice:write',
    'firm:linkedin:read',
    'firm:linkedin:draft',
    'firm:linkedin:approve',
    'firm:linkedin:publish',
    'firm:linkedin:manage',
    'firm:settings:read',
    'firm:settings:write',
    // No firm:settings:technical - can't access API keys
    'firm:analytics:read',
    'firm:analytics:export',
  ],

  // Associates - Limited to own content
  FIRM_ASSOCIATE: [
    'firm:content:read',
    'firm:team:read',
    'firm:practice:read',
    'firm:linkedin:read',
    'firm:linkedin:draft',        // Can create own drafts
    // No approve/publish without partner review
    'firm:settings:read',
    'firm:analytics:read',
  ],

  // Staff - View and limited editing
  FIRM_STAFF: [
    'firm:content:read',
    'firm:team:read',
    'firm:practice:read',
    'firm:linkedin:read',
    'firm:settings:read',
    'firm:analytics:read',
  ],
};

// Partner email -> role mapping
export const PARTNER_ROLES: Record<string, FirmRole> = {
  'aun@nas-law.com': 'FIRM_OWNER',
  'khaled@khaledaun.com': 'FIRM_OWNER',
  'nashef@nas-law.com': 'FIRM_PARTNER',
  'shaban@nas-law.com': 'FIRM_PARTNER',
};

/**
 * Get firm role for a user by email
 */
export function getFirmRole(email: string): FirmRole | null {
  const normalizedEmail = email.toLowerCase();
  return PARTNER_ROLES[normalizedEmail] || null;
}

/**
 * Check if user has a specific firm permission
 */
export function hasFirmPermission(
  role: FirmRole | null,
  permission: FirmPermission
): boolean {
  if (!role) return false;

  const rolePermissions = FIRM_ROLE_PERMISSIONS[role];
  return rolePermissions.includes(permission);
}

/**
 * Check if user has any of the specified firm permissions
 */
export function hasAnyFirmPermission(
  role: FirmRole | null,
  permissions: FirmPermission[]
): boolean {
  if (!role) return false;
  return permissions.some(p => hasFirmPermission(role, p));
}

/**
 * Check if user has all of the specified firm permissions
 */
export function hasAllFirmPermissions(
  role: FirmRole | null,
  permissions: FirmPermission[]
): boolean {
  if (!role) return false;
  return permissions.every(p => hasFirmPermission(role, p));
}

/**
 * Get all permissions for a firm role
 */
export function getFirmPermissions(role: FirmRole): FirmPermission[] {
  return FIRM_ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user can access technical settings (API keys, etc.)
 */
export function canAccessTechnicalSettings(role: FirmRole | null): boolean {
  return hasFirmPermission(role, 'firm:settings:technical');
}

/**
 * Check if user can manage LinkedIn accounts
 */
export function canManageLinkedIn(role: FirmRole | null): boolean {
  return hasFirmPermission(role, 'firm:linkedin:manage');
}

/**
 * Check if user can delete team members
 */
export function canDeleteTeamMembers(role: FirmRole | null): boolean {
  return hasFirmPermission(role, 'firm:team:delete');
}

/**
 * Require firm permission (throws error if not allowed)
 */
export function requireFirmPermission(
  role: FirmRole | null,
  permission: FirmPermission
): void {
  if (!hasFirmPermission(role, permission)) {
    throw new Error('FORBIDDEN: Insufficient firm permissions');
  }
}

/**
 * Permission descriptions for UI display
 */
export const FIRM_PERMISSION_LABELS: Record<FirmPermission, { en: string; ar: string; he: string }> = {
  'firm:content:read': {
    en: 'View Content',
    ar: 'عرض المحتوى',
    he: 'צפייה בתוכן'
  },
  'firm:content:write': {
    en: 'Edit Content',
    ar: 'تحرير المحتوى',
    he: 'עריכת תוכן'
  },
  'firm:content:publish': {
    en: 'Publish Content',
    ar: 'نشر المحتوى',
    he: 'פרסום תוכן'
  },
  'firm:team:read': {
    en: 'View Team',
    ar: 'عرض الفريق',
    he: 'צפייה בצוות'
  },
  'firm:team:write': {
    en: 'Manage Team',
    ar: 'إدارة الفريق',
    he: 'ניהול צוות'
  },
  'firm:team:delete': {
    en: 'Remove Team Members',
    ar: 'إزالة أعضاء الفريق',
    he: 'הסרת חברי צוות'
  },
  'firm:practice:read': {
    en: 'View Practice Areas',
    ar: 'عرض مجالات الممارسة',
    he: 'צפייה בתחומי עיסוק'
  },
  'firm:practice:write': {
    en: 'Edit Practice Areas',
    ar: 'تحرير مجالات الممارسة',
    he: 'עריכת תחומי עיסוק'
  },
  'firm:linkedin:read': {
    en: 'View LinkedIn',
    ar: 'عرض لينكد إن',
    he: 'צפייה בלינקדאין'
  },
  'firm:linkedin:draft': {
    en: 'Create Drafts',
    ar: 'إنشاء المسودات',
    he: 'יצירת טיוטות'
  },
  'firm:linkedin:approve': {
    en: 'Approve Posts',
    ar: 'الموافقة على المنشورات',
    he: 'אישור פוסטים'
  },
  'firm:linkedin:publish': {
    en: 'Publish to LinkedIn',
    ar: 'النشر على لينكد إن',
    he: 'פרסום בלינקדאין'
  },
  'firm:linkedin:manage': {
    en: 'Manage LinkedIn Accounts',
    ar: 'إدارة حسابات لينكد إن',
    he: 'ניהול חשבונות לינקדאין'
  },
  'firm:settings:read': {
    en: 'View Settings',
    ar: 'عرض الإعدادات',
    he: 'צפייה בהגדרות'
  },
  'firm:settings:write': {
    en: 'Edit Settings',
    ar: 'تحرير الإعدادات',
    he: 'עריכת הגדרות'
  },
  'firm:settings:technical': {
    en: 'Technical Settings & API Keys',
    ar: 'الإعدادات التقنية ومفاتيح API',
    he: 'הגדרות טכניות ומפתחות API'
  },
  'firm:analytics:read': {
    en: 'View Analytics',
    ar: 'عرض التحليلات',
    he: 'צפייה בנתונים'
  },
  'firm:analytics:export': {
    en: 'Export Analytics',
    ar: 'تصدير التحليلات',
    he: 'ייצוא נתונים'
  },
};
