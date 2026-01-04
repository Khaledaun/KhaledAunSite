import { z } from 'zod'

// Document types matching Prisma enum
export const documentTypes = [
  'CLAIM',
  'DEFENSE',
  'REPLY',
  'COUNTERCLAIM',
  'MOTION',
  'URGENT_MOTION',
  'EX_PARTE',
  'AFFIDAVIT',
  'EXPERT_OPINION',
  'EVIDENCE',
  'JUDGMENT',
  'DECISION',
  'ORDER',
  'CONTRACT',
  'AGREEMENT',
  'MOU',
  'NDA',
  'LETTER',
  'DEMAND_LETTER',
  'OPINION',
] as const

export type DocumentType = (typeof documentTypes)[number]

// Hebrew labels for document types
export const documentTypeLabels: Record<DocumentType, string> = {
  CLAIM: 'כתב תביעה',
  DEFENSE: 'כתב הגנה',
  REPLY: 'כתב תשובה',
  COUNTERCLAIM: 'תביעה שכנגד',
  MOTION: 'בקשה',
  URGENT_MOTION: 'בקשה דחופה',
  EX_PARTE: 'בקשה במעמד צד אחד',
  AFFIDAVIT: 'תצהיר',
  EXPERT_OPINION: 'חוות דעת מומחה',
  EVIDENCE: 'ראיה',
  JUDGMENT: 'פסק דין',
  DECISION: 'החלטה',
  ORDER: 'צו',
  CONTRACT: 'חוזה',
  AGREEMENT: 'הסכם',
  MOU: 'מזכר הבנות',
  NDA: 'הסכם סודיות',
  LETTER: 'מכתב',
  DEMAND_LETTER: 'מכתב התראה',
  OPINION: 'חוות דעת',
}

// Template categories
export const templateCategories = [
  'litigation',
  'contracts',
  'letters',
  'court',
] as const

export type TemplateCategory = (typeof templateCategories)[number]

export const templateCategoryLabels: Record<TemplateCategory, string> = {
  litigation: 'ליטיגציה',
  contracts: 'חוזים',
  letters: 'מכתבים',
  court: 'בית משפט',
}

// Document templates
export interface DocumentTemplate {
  id: string
  category: TemplateCategory
  documentType: DocumentType
  name: string
  description: string
  requiredFields: string[]
}

export const documentTemplates: DocumentTemplate[] = [
  // Litigation
  {
    id: 'claim',
    category: 'litigation',
    documentType: 'CLAIM',
    name: 'כתב תביעה',
    description: 'תבנית סטנדרטית לכתב תביעה אזרחי',
    requiredFields: ['client.name', 'case.court', 'opposingParty.name'],
  },
  {
    id: 'defense',
    category: 'litigation',
    documentType: 'DEFENSE',
    name: 'כתב הגנה',
    description: 'תבנית סטנדרטית לכתב הגנה',
    requiredFields: ['client.name', 'case.number', 'case.court'],
  },
  {
    id: 'motion',
    category: 'litigation',
    documentType: 'MOTION',
    name: 'בקשה',
    description: 'תבנית כללית לבקשה',
    requiredFields: ['client.name', 'case.number', 'case.court'],
  },
  {
    id: 'urgent-motion',
    category: 'litigation',
    documentType: 'URGENT_MOTION',
    name: 'בקשה דחופה',
    description: 'תבנית לבקשה דחופה',
    requiredFields: ['client.name', 'case.number', 'case.court'],
  },
  {
    id: 'affidavit',
    category: 'litigation',
    documentType: 'AFFIDAVIT',
    name: 'תצהיר',
    description: 'תבנית לתצהיר',
    requiredFields: ['client.name', 'client.idNumber'],
  },
  // Contracts
  {
    id: 'retainer',
    category: 'contracts',
    documentType: 'AGREEMENT',
    name: 'הסכם שכר טרחה',
    description: 'הסכם שכר טרחה עם לקוח',
    requiredFields: ['client.name', 'client.idNumber'],
  },
  {
    id: 'nda',
    category: 'contracts',
    documentType: 'NDA',
    name: 'הסכם סודיות',
    description: 'הסכם סודיות (NDA)',
    requiredFields: ['client.name'],
  },
  {
    id: 'general-contract',
    category: 'contracts',
    documentType: 'CONTRACT',
    name: 'חוזה כללי',
    description: 'תבנית חוזה כללית',
    requiredFields: ['client.name'],
  },
  // Letters
  {
    id: 'demand-letter',
    category: 'letters',
    documentType: 'DEMAND_LETTER',
    name: 'מכתב התראה',
    description: 'מכתב התראה לפני נקיטת הליכים משפטיים',
    requiredFields: ['client.name', 'opposingParty.name'],
  },
  {
    id: 'legal-opinion',
    category: 'letters',
    documentType: 'OPINION',
    name: 'חוות דעת',
    description: 'חוות דעת משפטית',
    requiredFields: ['client.name'],
  },
  // Court
  {
    id: 'power-of-attorney',
    category: 'court',
    documentType: 'CONTRACT',
    name: 'ייפוי כוח',
    description: 'ייפוי כוח לייצוג בבית המשפט',
    requiredFields: ['client.name', 'client.idNumber', 'case.court'],
  },
]

// Document generation input schema
export const generateDocumentSchema = z.object({
  templateId: z.string(),
  caseId: z.string().optional(),
  client: z.object({
    name: z.string().min(1, 'שם הלקוח נדרש'),
    idNumber: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }),
  case: z.object({
    number: z.string().optional(),
    court: z.string().optional(),
    judge: z.string().optional(),
    title: z.string().optional(),
  }).optional(),
  opposingParty: z.object({
    name: z.string().optional(),
    counsel: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  customFields: z.record(z.string()).optional(),
  customContent: z.string().optional(),
})

export type GenerateDocumentInput = z.infer<typeof generateDocumentSchema>

// Document upload input schema
export const uploadDocumentSchema = z.object({
  caseId: z.string().optional(),
  documentType: z.enum(documentTypes).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>

// Document update schema
export const updateDocumentSchema = z.object({
  documentType: z.enum(documentTypes).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
