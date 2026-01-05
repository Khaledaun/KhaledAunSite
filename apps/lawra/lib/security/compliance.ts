/**
 * Amendment 13 Compliance Framework
 * תיקון 13 לחוק הגנת הפרטיות
 *
 * LaWra is classified as HIGH SECURITY DATABASE due to:
 * - Attorney-client privileged information
 * - Sensitive legal case details
 * - Personal identification data
 */

import { prisma } from '@/lib/prisma'

// ============================================================
// DATA CLASSIFICATION
// ============================================================

export enum DataClassification {
  PUBLIC = 'PUBLIC',           // Can be shared openly
  INTERNAL = 'INTERNAL',       // Internal use only
  CONFIDENTIAL = 'CONFIDENTIAL', // Limited access
  PRIVILEGED = 'PRIVILEGED',   // Attorney-client privilege
  SENSITIVE = 'SENSITIVE',     // PII, health, financial
}

export enum SecurityLevel {
  BASIC = 'BASIC',     // < 10,000 records, no sensitive data
  MEDIUM = 'MEDIUM',   // < 100,000 records or basic sensitive data
  HIGH = 'HIGH',       // Legal, health, financial data
}

// LaWra operates at HIGH security level
export const LAWRA_SECURITY_LEVEL = SecurityLevel.HIGH

// Data classification by entity type
export const DATA_CLASSIFICATIONS: Record<string, DataClassification> = {
  // Client data
  'client.name': DataClassification.CONFIDENTIAL,
  'client.idNumber': DataClassification.SENSITIVE,
  'client.phone': DataClassification.CONFIDENTIAL,
  'client.email': DataClassification.CONFIDENTIAL,
  'client.address': DataClassification.CONFIDENTIAL,

  // Case data
  'case.title': DataClassification.PRIVILEGED,
  'case.description': DataClassification.PRIVILEGED,
  'case.caseNumber': DataClassification.CONFIDENTIAL,
  'case.opposingParty': DataClassification.PRIVILEGED,
  'case.internalNotes': DataClassification.PRIVILEGED,

  // Document data
  'document.content': DataClassification.PRIVILEGED,
  'document.filePath': DataClassification.CONFIDENTIAL,

  // Financial data
  'invoice.amount': DataClassification.CONFIDENTIAL,
  'timeEntry.rate': DataClassification.INTERNAL,

  // AI conversations
  'aiConversation.messages': DataClassification.PRIVILEGED,
}

// ============================================================
// CONSENT MANAGEMENT (סעיף 11 - הסכמה)
// ============================================================

export enum ConsentType {
  DATA_PROCESSING = 'DATA_PROCESSING',       // עיבוד נתונים
  MARKETING = 'MARKETING',                   // שיווק
  THIRD_PARTY_SHARING = 'THIRD_PARTY_SHARING', // שיתוף עם צד ג׳
  AI_PROCESSING = 'AI_PROCESSING',           // עיבוד AI
  DATA_RETENTION = 'DATA_RETENTION',         // שמירת מידע
}

export interface ConsentRecord {
  userId: string
  clientId?: string
  consentType: ConsentType
  granted: boolean
  grantedAt?: Date
  revokedAt?: Date
  ipAddress?: string
  userAgent?: string
  version: string // Consent form version
}

// Required consents for LaWra
export const REQUIRED_CONSENTS: ConsentType[] = [
  ConsentType.DATA_PROCESSING,
  ConsentType.AI_PROCESSING,
  ConsentType.DATA_RETENTION,
]

// ============================================================
// DATA SUBJECT RIGHTS (סעיף 13 - זכויות נושא המידע)
// ============================================================

export enum DataSubjectRight {
  ACCESS = 'ACCESS',           // זכות עיון
  CORRECTION = 'CORRECTION',   // זכות תיקון
  DELETION = 'DELETION',       // זכות מחיקה
  PORTABILITY = 'PORTABILITY', // זכות ניידות
  OBJECTION = 'OBJECTION',     // זכות התנגדות
}

export interface DataSubjectRequest {
  id: string
  requesterId: string
  requesterType: 'USER' | 'CLIENT'
  rightType: DataSubjectRight
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  requestedAt: Date
  completedAt?: Date
  rejectionReason?: string
  verificationMethod: string
  handledBy?: string
}

// Response timeframes per Amendment 13
export const RESPONSE_TIMEFRAMES: Record<DataSubjectRight, number> = {
  [DataSubjectRight.ACCESS]: 30,      // 30 days
  [DataSubjectRight.CORRECTION]: 30,  // 30 days
  [DataSubjectRight.DELETION]: 30,    // 30 days
  [DataSubjectRight.PORTABILITY]: 30, // 30 days
  [DataSubjectRight.OBJECTION]: 14,   // 14 days
}

// ============================================================
// DATA RETENTION POLICIES (תקנות שמירת מידע)
// ============================================================

export interface RetentionPolicy {
  entityType: string
  retentionPeriodDays: number
  legalBasis: string
  deletionMethod: 'SOFT_DELETE' | 'HARD_DELETE' | 'ANONYMIZE'
  reviewRequired: boolean
}

// Israeli legal retention requirements
export const RETENTION_POLICIES: RetentionPolicy[] = [
  {
    entityType: 'Client',
    retentionPeriodDays: 7 * 365, // 7 years per Israeli law
    legalBasis: 'חוק התיישנות, חוק הארכיונים',
    deletionMethod: 'ANONYMIZE',
    reviewRequired: true,
  },
  {
    entityType: 'Case',
    retentionPeriodDays: 7 * 365, // 7 years after case closure
    legalBasis: 'כללי לשכת עורכי הדין (שמירת מסמכים)',
    deletionMethod: 'ANONYMIZE',
    reviewRequired: true,
  },
  {
    entityType: 'Document',
    retentionPeriodDays: 7 * 365,
    legalBasis: 'כללי לשכת עורכי הדין',
    deletionMethod: 'HARD_DELETE',
    reviewRequired: true,
  },
  {
    entityType: 'Invoice',
    retentionPeriodDays: 7 * 365,
    legalBasis: 'פקודת מס הכנסה, חוק מע״מ',
    deletionMethod: 'SOFT_DELETE',
    reviewRequired: false,
  },
  {
    entityType: 'TimeEntry',
    retentionPeriodDays: 7 * 365,
    legalBasis: 'פקודת מס הכנסה',
    deletionMethod: 'SOFT_DELETE',
    reviewRequired: false,
  },
  {
    entityType: 'AIConversation',
    retentionPeriodDays: 365, // 1 year
    legalBasis: 'הסכמת משתמש',
    deletionMethod: 'HARD_DELETE',
    reviewRequired: false,
  },
  {
    entityType: 'AuditLog',
    retentionPeriodDays: 7 * 365,
    legalBasis: 'תקנות הגנת הפרטיות (אבטחת מידע)',
    deletionMethod: 'SOFT_DELETE',
    reviewRequired: false,
  },
]

// ============================================================
// BREACH NOTIFICATION (הודעה על הפרת אבטחה)
// ============================================================

export enum BreachSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface DataBreach {
  id: string
  detectedAt: Date
  reportedAt?: Date
  severity: BreachSeverity
  description: string
  affectedRecords: number
  affectedDataTypes: string[]
  containmentActions: string[]
  notificationStatus: {
    authority: boolean // Privacy Protection Authority
    affectedUsers: boolean
  }
  rootCause?: string
  preventiveMeasures?: string[]
}

// Notification requirements per Amendment 13
export const BREACH_NOTIFICATION_RULES = {
  // Must notify Privacy Protection Authority within 72 hours
  authorityNotificationHours: 72,

  // Must notify affected individuals "without undue delay"
  userNotificationRequired: (severity: BreachSeverity) =>
    severity === BreachSeverity.HIGH || severity === BreachSeverity.CRITICAL,

  // Privacy Protection Authority contact
  authorityContact: {
    name: 'רשות הגנת הפרטיות',
    email: 'ppa@justice.gov.il',
    phone: '*6564',
    fax: '02-6467064',
  },
}

// ============================================================
// AUDIT LOGGING REQUIREMENTS
// ============================================================

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  SHARE = 'SHARE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  CONSENT_GRANTED = 'CONSENT_GRANTED',
  CONSENT_REVOKED = 'CONSENT_REVOKED',
  DATA_SUBJECT_REQUEST = 'DATA_SUBJECT_REQUEST',
}

export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  action: AuditAction
  entityType: string
  entityId?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  ipAddress: string
  userAgent: string
  sessionId?: string
  success: boolean
  errorMessage?: string
  dataClassification: DataClassification
}

// Fields that must be logged when changed
export const AUDIT_SENSITIVE_FIELDS = [
  'email', 'phone', 'idNumber', 'address', 'password',
  'role', 'permissions', 'status', 'amount', 'rate',
]

// ============================================================
// ACCESS CONTROL REQUIREMENTS
// ============================================================

export enum AccessLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  DELETE = 3,
  ADMIN = 4,
}

export interface AccessPolicy {
  role: string
  entityType: string
  accessLevel: AccessLevel
  conditions?: {
    ownerOnly?: boolean
    teamOnly?: boolean
    caseAssigned?: boolean
  }
}

// Default access policies for LaWra
export const ACCESS_POLICIES: AccessPolicy[] = [
  // Admin - full access
  { role: 'ADMIN', entityType: '*', accessLevel: AccessLevel.ADMIN },

  // Partner - full access to own team's data
  { role: 'PARTNER', entityType: 'Client', accessLevel: AccessLevel.ADMIN, conditions: { teamOnly: true } },
  { role: 'PARTNER', entityType: 'Case', accessLevel: AccessLevel.ADMIN, conditions: { teamOnly: true } },

  // Associate - access to assigned cases
  { role: 'ASSOCIATE', entityType: 'Client', accessLevel: AccessLevel.READ },
  { role: 'ASSOCIATE', entityType: 'Case', accessLevel: AccessLevel.WRITE, conditions: { caseAssigned: true } },
  { role: 'ASSOCIATE', entityType: 'Document', accessLevel: AccessLevel.WRITE, conditions: { caseAssigned: true } },

  // Paralegal - limited access
  { role: 'PARALEGAL', entityType: 'Client', accessLevel: AccessLevel.READ },
  { role: 'PARALEGAL', entityType: 'Case', accessLevel: AccessLevel.READ, conditions: { caseAssigned: true } },
  { role: 'PARALEGAL', entityType: 'Document', accessLevel: AccessLevel.WRITE, conditions: { caseAssigned: true } },

  // Secretary - scheduling and basic info
  { role: 'SECRETARY', entityType: 'CalendarEvent', accessLevel: AccessLevel.WRITE },
  { role: 'SECRETARY', entityType: 'Client', accessLevel: AccessLevel.READ },
  { role: 'SECRETARY', entityType: 'Task', accessLevel: AccessLevel.WRITE },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if a specific consent is required and granted
 */
export function hasRequiredConsent(
  consents: ConsentRecord[],
  requiredType: ConsentType
): boolean {
  const consent = consents.find(c => c.consentType === requiredType)
  return consent?.granted === true && !consent.revokedAt
}

/**
 * Get the retention policy for an entity type
 */
export function getRetentionPolicy(entityType: string): RetentionPolicy | undefined {
  return RETENTION_POLICIES.find(p => p.entityType === entityType)
}

/**
 * Calculate deletion date based on retention policy
 */
export function calculateDeletionDate(
  entityType: string,
  createdAt: Date
): Date | null {
  const policy = getRetentionPolicy(entityType)
  if (!policy) return null

  const deletionDate = new Date(createdAt)
  deletionDate.setDate(deletionDate.getDate() + policy.retentionPeriodDays)
  return deletionDate
}

/**
 * Check if data should be deleted based on retention policy
 */
export function shouldDeleteData(entityType: string, createdAt: Date): boolean {
  const deletionDate = calculateDeletionDate(entityType, createdAt)
  if (!deletionDate) return false
  return new Date() > deletionDate
}

/**
 * Get access level for a role and entity type
 */
export function getAccessLevel(
  role: string,
  entityType: string
): AccessPolicy | undefined {
  // Check for specific entity policy first
  const specific = ACCESS_POLICIES.find(
    p => p.role === role && p.entityType === entityType
  )
  if (specific) return specific

  // Fall back to wildcard policy
  return ACCESS_POLICIES.find(
    p => p.role === role && p.entityType === '*'
  )
}

/**
 * Check if breach notification to authority is overdue
 */
export function isBreachNotificationOverdue(breach: DataBreach): boolean {
  if (breach.notificationStatus.authority) return false

  const hoursSinceDetection =
    (Date.now() - breach.detectedAt.getTime()) / (1000 * 60 * 60)

  return hoursSinceDetection > BREACH_NOTIFICATION_RULES.authorityNotificationHours
}

/**
 * Get data classification for a field
 */
export function getDataClassification(
  entityType: string,
  fieldName: string
): DataClassification {
  const key = `${entityType.toLowerCase()}.${fieldName}`
  return DATA_CLASSIFICATIONS[key] || DataClassification.INTERNAL
}
