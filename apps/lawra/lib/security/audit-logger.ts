/**
 * Audit Logger for Amendment 13 Compliance
 * Tracks all data access and modifications for legal compliance
 */

import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import {
  AuditAction,
  DataClassification,
  getDataClassification,
  AUDIT_SENSITIVE_FIELDS,
  type AuditLogEntry,
} from './compliance'

// ============================================================
// AUDIT LOG SERVICE
// ============================================================

interface AuditContext {
  userId: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
}

interface AuditData {
  action: AuditAction
  entityType: string
  entityId?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  success?: boolean
  errorMessage?: string
}

/**
 * Get request context from headers
 */
async function getRequestContext(): Promise<Partial<AuditContext>> {
  try {
    const headersList = await headers()
    return {
      ipAddress: headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 headersList.get('x-real-ip') ||
                 'unknown',
      userAgent: headersList.get('user-agent') || 'unknown',
    }
  } catch {
    return {
      ipAddress: 'unknown',
      userAgent: 'unknown',
    }
  }
}

/**
 * Determine the highest data classification in the audit entry
 */
function determineClassification(
  entityType: string,
  data?: Record<string, unknown>
): DataClassification {
  if (!data) return DataClassification.INTERNAL

  let highestClassification = DataClassification.PUBLIC

  const classificationOrder: DataClassification[] = [
    DataClassification.PUBLIC,
    DataClassification.INTERNAL,
    DataClassification.CONFIDENTIAL,
    DataClassification.SENSITIVE,
    DataClassification.PRIVILEGED,
  ]

  for (const field of Object.keys(data)) {
    const classification = getDataClassification(entityType, field)
    const currentIndex = classificationOrder.indexOf(classification)
    const highestIndex = classificationOrder.indexOf(highestClassification)

    if (currentIndex > highestIndex) {
      highestClassification = classification
    }
  }

  return highestClassification
}

/**
 * Mask sensitive values for audit log storage
 */
function maskSensitiveValues(
  data: Record<string, unknown> | undefined,
  entityType: string
): Record<string, unknown> | undefined {
  if (!data) return undefined

  const masked: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    const classification = getDataClassification(entityType, key)

    // Mask highly sensitive values
    if (
      classification === DataClassification.SENSITIVE ||
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('token')
    ) {
      masked[key] = '[MASKED]'
    } else if (classification === DataClassification.PRIVILEGED) {
      // Truncate privileged data
      if (typeof value === 'string' && value.length > 100) {
        masked[key] = value.substring(0, 100) + '...[TRUNCATED]'
      } else {
        masked[key] = value
      }
    } else {
      masked[key] = value
    }
  }

  return masked
}

/**
 * Calculate changed fields between old and new values
 */
function getChangedFields(
  oldValue?: Record<string, unknown>,
  newValue?: Record<string, unknown>
): string[] {
  if (!oldValue || !newValue) return []

  const changedFields: string[] = []
  const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)])

  for (const key of allKeys) {
    if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
      changedFields.push(key)
    }
  }

  return changedFields
}

/**
 * Main audit logging function
 */
export async function createAuditLog(
  context: AuditContext,
  data: AuditData
): Promise<void> {
  try {
    const requestContext = await getRequestContext()

    const classification = determineClassification(
      data.entityType,
      data.newValue || data.oldValue
    )

    // Check for sensitive field changes
    const changedFields = getChangedFields(data.oldValue, data.newValue)
    const hasSensitiveChanges = changedFields.some(f =>
      AUDIT_SENSITIVE_FIELDS.includes(f)
    )

    // Always log sensitive changes, and log all actions for HIGH security
    const shouldLog = hasSensitiveChanges ||
                      classification !== DataClassification.PUBLIC ||
                      data.action === AuditAction.DELETE ||
                      data.action === AuditAction.EXPORT ||
                      data.action === AuditAction.PERMISSION_CHANGE

    if (!shouldLog && data.action === AuditAction.READ) {
      // Skip logging routine reads of non-sensitive data
      return
    }

    const auditEntry = {
      userId: context.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValue: maskSensitiveValues(data.oldValue, data.entityType),
      newValue: maskSensitiveValues(data.newValue, data.entityType),
      ipAddress: context.ipAddress || requestContext.ipAddress || 'unknown',
      userAgent: context.userAgent || requestContext.userAgent || 'unknown',
      sessionId: context.sessionId,
      success: data.success ?? true,
      errorMessage: data.errorMessage,
      dataClassification: classification,
      changedFields: changedFields.length > 0 ? changedFields : undefined,
      hasSensitiveChanges,
    }

    await prisma.auditLog.create({
      data: auditEntry as any,
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', {
        action: data.action,
        entity: `${data.entityType}:${data.entityId}`,
        user: context.userId,
        classification,
      })
    }
  } catch (error) {
    // Never throw from audit logging - log error and continue
    console.error('[AUDIT ERROR]', error)
  }
}

// ============================================================
// CONVENIENCE WRAPPERS
// ============================================================

/**
 * Log a CREATE action
 */
export async function logCreate(
  context: AuditContext,
  entityType: string,
  entityId: string,
  data: Record<string, unknown>
): Promise<void> {
  await createAuditLog(context, {
    action: AuditAction.CREATE,
    entityType,
    entityId,
    newValue: data,
  })
}

/**
 * Log a READ action (for sensitive data access)
 */
export async function logRead(
  context: AuditContext,
  entityType: string,
  entityId: string
): Promise<void> {
  await createAuditLog(context, {
    action: AuditAction.READ,
    entityType,
    entityId,
  })
}

/**
 * Log an UPDATE action
 */
export async function logUpdate(
  context: AuditContext,
  entityType: string,
  entityId: string,
  oldValue: Record<string, unknown>,
  newValue: Record<string, unknown>
): Promise<void> {
  await createAuditLog(context, {
    action: AuditAction.UPDATE,
    entityType,
    entityId,
    oldValue,
    newValue,
  })
}

/**
 * Log a DELETE action
 */
export async function logDelete(
  context: AuditContext,
  entityType: string,
  entityId: string,
  deletedData?: Record<string, unknown>
): Promise<void> {
  await createAuditLog(context, {
    action: AuditAction.DELETE,
    entityType,
    entityId,
    oldValue: deletedData,
  })
}

/**
 * Log an EXPORT action (data download)
 */
export async function logExport(
  context: AuditContext,
  entityType: string,
  entityIds: string[],
  format: string
): Promise<void> {
  await createAuditLog(context, {
    action: AuditAction.EXPORT,
    entityType,
    entityId: entityIds.join(','),
    newValue: { format, count: entityIds.length },
  })
}

/**
 * Log authentication events
 */
export async function logAuth(
  userId: string,
  action: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN',
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const requestContext = await getRequestContext()

  await createAuditLog(
    {
      userId,
      ...requestContext,
    },
    {
      action: AuditAction[action],
      entityType: 'User',
      entityId: userId,
      success,
      errorMessage,
    }
  )
}

/**
 * Log consent changes
 */
export async function logConsentChange(
  context: AuditContext,
  consentType: string,
  granted: boolean
): Promise<void> {
  await createAuditLog(context, {
    action: granted ? AuditAction.CONSENT_GRANTED : AuditAction.CONSENT_REVOKED,
    entityType: 'Consent',
    entityId: consentType,
    newValue: { granted },
  })
}

/**
 * Log data subject request
 */
export async function logDataSubjectRequest(
  context: AuditContext,
  requestId: string,
  rightType: string,
  status: string
): Promise<void> {
  await createAuditLog(context, {
    action: AuditAction.DATA_SUBJECT_REQUEST,
    entityType: 'DataSubjectRequest',
    entityId: requestId,
    newValue: { rightType, status },
  })
}

// ============================================================
// QUERY HELPERS
// ============================================================

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLog(
  entityType: string,
  entityId: string,
  limit = 100
) {
  return prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLog(
  userId: string,
  fromDate?: Date,
  toDate?: Date,
  limit = 100
) {
  return prisma.auditLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

/**
 * Get sensitive data access logs
 */
export async function getSensitiveAccessLog(
  fromDate: Date,
  toDate: Date
) {
  return prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      OR: [
        { dataClassification: DataClassification.SENSITIVE },
        { dataClassification: DataClassification.PRIVILEGED },
        { hasSensitiveChanges: true },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}
