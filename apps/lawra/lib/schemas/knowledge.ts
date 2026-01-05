import { z } from 'zod'

// Knowledge item type enum
export const knowledgeTypeEnum = z.enum([
  'STATUTE', // חוק
  'REGULATION', // תקנה
  'PRECEDENT', // פסיקה
  'LEGAL_OPINION', // חוות דעת
  'TEMPLATE', // תבנית
  'ARTICLE', // מאמר
  'PROCEDURE', // נוהל
  'FORM', // טופס
  'GUIDELINE', // הנחיה
  'OTHER', // אחר
])

export type KnowledgeType = z.infer<typeof knowledgeTypeEnum>

// Hebrew labels for knowledge types
export const knowledgeTypeLabels: Record<KnowledgeType, string> = {
  STATUTE: 'חוק',
  REGULATION: 'תקנה',
  PRECEDENT: 'פסיקה',
  LEGAL_OPINION: 'חוות דעת',
  TEMPLATE: 'תבנית',
  ARTICLE: 'מאמר',
  PROCEDURE: 'נוהל',
  FORM: 'טופס',
  GUIDELINE: 'הנחיה',
  OTHER: 'אחר',
}

// Knowledge type icons (Lucide icon names)
export const knowledgeTypeIcons: Record<KnowledgeType, string> = {
  STATUTE: 'scale',
  REGULATION: 'scroll',
  PRECEDENT: 'gavel',
  LEGAL_OPINION: 'message-square',
  TEMPLATE: 'file-text',
  ARTICLE: 'book-open',
  PROCEDURE: 'list-checks',
  FORM: 'clipboard',
  GUIDELINE: 'info',
  OTHER: 'file',
}

// Practice areas for categorization
export const practiceAreaEnum = z.enum([
  'CIVIL', // אזרחי
  'CRIMINAL', // פלילי
  'FAMILY', // משפחה
  'LABOR', // עבודה
  'COMMERCIAL', // מסחרי
  'REAL_ESTATE', // מקרקעין
  'ADMINISTRATIVE', // מנהלי
  'TAX', // מיסים
  'BANKRUPTCY', // פשיטת רגל
  'INTELLECTUAL_PROPERTY', // קניין רוחני
  'IMMIGRATION', // הגירה
  'MILITARY', // צבאי
  'CONSTITUTIONAL', // חוקתי
  'INTERNATIONAL', // בינלאומי
  'OTHER', // אחר
])

export type PracticeArea = z.infer<typeof practiceAreaEnum>

export const practiceAreaLabels: Record<PracticeArea, string> = {
  CIVIL: 'משפט אזרחי',
  CRIMINAL: 'משפט פלילי',
  FAMILY: 'דיני משפחה',
  LABOR: 'דיני עבודה',
  COMMERCIAL: 'משפט מסחרי',
  REAL_ESTATE: 'מקרקעין',
  ADMINISTRATIVE: 'משפט מנהלי',
  TAX: 'דיני מיסים',
  BANKRUPTCY: 'פשיטת רגל וחדלות פירעון',
  INTELLECTUAL_PROPERTY: 'קניין רוחני',
  IMMIGRATION: 'הגירה',
  MILITARY: 'משפט צבאי',
  CONSTITUTIONAL: 'משפט חוקתי',
  INTERNATIONAL: 'משפט בינלאומי',
  OTHER: 'אחר',
}

// Create knowledge item schema
export const createKnowledgeSchema = z.object({
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  type: knowledgeTypeEnum,
  practiceArea: practiceAreaEnum.optional().nullable(),
  content: z.string().min(1, 'תוכן הוא שדה חובה'),
  summary: z.string().optional().nullable(),
  citation: z.string().optional().nullable(), // ציטוט משפטי
  source: z.string().optional().nullable(), // מקור
  sourceUrl: z.string().url().optional().nullable(), // קישור למקור
  effectiveDate: z.string().optional().nullable(), // תאריך תחילה
  expirationDate: z.string().optional().nullable(), // תאריך תפוגה
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
})

export type CreateKnowledgeInput = z.infer<typeof createKnowledgeSchema>

// Update knowledge item schema
export const updateKnowledgeSchema = createKnowledgeSchema.partial()

export type UpdateKnowledgeInput = z.infer<typeof updateKnowledgeSchema>

// Israeli court types
export const courtTypeEnum = z.enum([
  'SUPREME', // בית המשפט העליון
  'DISTRICT', // בית משפט מחוזי
  'MAGISTRATE', // בית משפט שלום
  'LABOR', // בית דין לעבודה
  'FAMILY', // בית משפט לענייני משפחה
  'ADMINISTRATIVE', // בית משפט לעניינים מנהליים
  'RABBINICAL', // בית דין רבני
  'MILITARY', // בית דין צבאי
  'TRAFFIC', // בית משפט לתעבורה
  'OTHER', // אחר
])

export type CourtType = z.infer<typeof courtTypeEnum>

export const courtTypeLabels: Record<CourtType, string> = {
  SUPREME: 'בית המשפט העליון',
  DISTRICT: 'בית משפט מחוזי',
  MAGISTRATE: 'בית משפט שלום',
  LABOR: 'בית הדין לעבודה',
  FAMILY: 'בית משפט לענייני משפחה',
  ADMINISTRATIVE: 'בית משפט לעניינים מנהליים',
  RABBINICAL: 'בית דין רבני',
  MILITARY: 'בית דין צבאי',
  TRAFFIC: 'בית משפט לתעבורה',
  OTHER: 'אחר',
}

// Statute of limitations configuration (in years/months)
export interface LimitationPeriod {
  type: string
  name: string
  years: number
  months?: number
  description: string
  statute: string // החוק הרלוונטי
}

export const limitationPeriods: LimitationPeriod[] = [
  {
    type: 'CONTRACT_GENERAL',
    name: 'חוזה - כללי',
    years: 7,
    description: 'תביעה חוזית רגילה',
    statute: 'חוק ההתיישנות, תשי"ח-1958, סעיף 5(1)',
  },
  {
    type: 'TORT_GENERAL',
    name: 'נזיקין - כללי',
    years: 7,
    description: 'תביעת נזיקין רגילה',
    statute: 'חוק ההתיישנות, תשי"ח-1958, סעיף 5(1)',
  },
  {
    type: 'TORT_PERSONAL_INJURY',
    name: 'נזקי גוף',
    years: 7,
    description: 'תביעת נזקי גוף',
    statute: 'חוק ההתיישנות, תשי"ח-1958, סעיף 5(1)',
  },
  {
    type: 'REAL_ESTATE',
    name: 'מקרקעין',
    years: 15,
    description: 'תביעה במקרקעין שאינה רשומה',
    statute: 'חוק ההתיישנות, תשי"ח-1958, סעיף 5(2)',
  },
  {
    type: 'REAL_ESTATE_REGISTERED',
    name: 'מקרקעין רשומים',
    years: 25,
    description: 'מקרקעין מוסדרים',
    statute: 'חוק ההתיישנות, תשי"ח-1958, סעיף 5(2)',
  },
  {
    type: 'LABOR',
    name: 'זכויות עבודה',
    years: 7,
    description: 'תביעת זכויות עבודה',
    statute: 'חוק ההתיישנות, תשי"ח-1958, סעיף 5(1)',
  },
  {
    type: 'DEFAMATION',
    name: 'לשון הרע',
    years: 1,
    description: 'תביעת לשון הרע',
    statute: 'חוק איסור לשון הרע, תשכ"ה-1965, סעיף 26',
  },
  {
    type: 'CRIMINAL_MINOR',
    name: 'עבירה קלה',
    years: 1,
    description: 'עבירה שעונשה עד 3 חודשי מאסר',
    statute: 'חוק סדר הדין הפלילי, תשמ"ב-1982, סעיף 9',
  },
  {
    type: 'CRIMINAL_MEDIUM',
    name: 'עוון',
    years: 5,
    description: 'עבירה שעונשה מעל 3 חודשים עד 5 שנות מאסר',
    statute: 'חוק סדר הדין הפלילי, תשמ"ב-1982, סעיף 9',
  },
  {
    type: 'CRIMINAL_FELONY',
    name: 'פשע',
    years: 10,
    description: 'עבירה שעונשה מעל 5 שנות מאסר',
    statute: 'חוק סדר הדין הפלילי, תשמ"ב-1982, סעיף 9',
  },
  {
    type: 'TAX',
    name: 'מיסים',
    years: 6,
    description: 'תביעת החזר מס',
    statute: 'פקודת מס הכנסה, סעיף 160',
  },
  {
    type: 'INSURANCE',
    name: 'ביטוח',
    years: 3,
    description: 'תביעת ביטוח',
    statute: 'חוק חוזה הביטוח, תשמ"א-1981, סעיף 31',
  },
  {
    type: 'ADMINISTRATIVE',
    name: 'מנהלי',
    years: 0,
    months: 45,
    description: 'עתירה מנהלית (45 יום)',
    statute: 'תקנות בתי המשפט לעניינים מנהליים, תקנה 3',
  },
]

// Court deadline rules (Israeli civil procedure)
export interface DeadlineRule {
  type: string
  name: string
  days: number
  businessDays: boolean
  description: string
  reference: string
}

export const courtDeadlines: DeadlineRule[] = [
  {
    type: 'STATEMENT_OF_DEFENSE',
    name: 'כתב הגנה',
    days: 60,
    businessDays: false,
    description: 'הגשת כתב הגנה מיום המצאת כתב התביעה',
    reference: 'תקנות סדר הדין האזרחי, תקנה 13',
  },
  {
    type: 'REPLY',
    name: 'כתב תשובה',
    days: 15,
    businessDays: false,
    description: 'הגשת כתב תשובה מיום המצאת כתב ההגנה',
    reference: 'תקנות סדר הדין האזרחי, תקנה 18',
  },
  {
    type: 'APPEAL',
    name: 'ערעור',
    days: 60,
    businessDays: false,
    description: 'הגשת ערעור על פסק דין',
    reference: 'תקנות סדר הדין האזרחי, תקנה 137',
  },
  {
    type: 'LEAVE_TO_APPEAL',
    name: 'בקשת רשות ערעור',
    days: 30,
    businessDays: false,
    description: 'הגשת בקשת רשות ערעור',
    reference: 'תקנות סדר הדין האזרחי, תקנה 148',
  },
  {
    type: 'SMALL_CLAIMS_DEFENSE',
    name: 'הגנה בתביעות קטנות',
    days: 30,
    businessDays: false,
    description: 'הגשת כתב הגנה בתביעות קטנות',
    reference: 'תקנות שיפוט בתביעות קטנות, תקנה 6',
  },
  {
    type: 'EXECUTION_OBJECTION',
    name: 'התנגדות להוצאה לפועל',
    days: 30,
    businessDays: false,
    description: 'הגשת התנגדות לביצוע שטר',
    reference: 'חוק ההוצאה לפועל, סעיף 81א',
  },
  {
    type: 'ADMINISTRATIVE_PETITION',
    name: 'עתירה מנהלית',
    days: 45,
    businessDays: false,
    description: 'הגשת עתירה מנהלית מיום ההחלטה',
    reference: 'תקנות בתי המשפט לעניינים מנהליים, תקנה 3',
  },
  {
    type: 'LABOR_CLAIM',
    name: 'תביעה בדיני עבודה',
    days: 60,
    businessDays: false,
    description: 'הגשת כתב הגנה בבית הדין לעבודה',
    reference: 'תקנות בית הדין לעבודה, תקנה 13',
  },
]

// Helper function to calculate deadline date
export function calculateDeadline(
  startDate: Date,
  rule: DeadlineRule
): Date {
  const result = new Date(startDate)

  if (rule.businessDays) {
    // Add business days (excluding Friday/Saturday for Israel)
    let daysAdded = 0
    while (daysAdded < rule.days) {
      result.setDate(result.getDate() + 1)
      const day = result.getDay()
      // Skip Friday (5) and Saturday (6) in Israel
      if (day !== 5 && day !== 6) {
        daysAdded++
      }
    }
  } else {
    result.setDate(result.getDate() + rule.days)
  }

  return result
}

// Helper function to calculate limitation date
export function calculateLimitationDate(
  startDate: Date,
  period: LimitationPeriod
): Date {
  const result = new Date(startDate)

  if (period.years > 0) {
    result.setFullYear(result.getFullYear() + period.years)
  }

  if (period.months) {
    result.setMonth(result.getMonth() + period.months)
  }

  return result
}
