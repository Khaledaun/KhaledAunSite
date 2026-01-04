# Billing Skill

> Best practices for time tracking, invoicing, and Israeli tax compliance in LaWra AI.

---

## Overview

LaWra AI provides comprehensive billing features for Israeli law firms:
1. Time tracking (manual + timer)
2. Invoice generation
3. Israeli tax compliance (VAT)
4. Payment tracking
5. Financial reporting

---

## Israeli Tax Requirements

### VAT (מע"מ)

```typescript
// lib/billing/tax.ts
export const ISRAELI_VAT = {
  rate: 0.17, // 17% as of 2024
  rateDisplay: '17%',
  
  calculate: (amount: number) => ({
    beforeVat: amount,
    vatAmount: Math.round(amount * 0.17 * 100) / 100,
    total: Math.round(amount * 1.17 * 100) / 100,
  }),
  
  // Extract VAT from total (reverse calculation)
  extractFromTotal: (total: number) => ({
    beforeVat: Math.round((total / 1.17) * 100) / 100,
    vatAmount: Math.round((total - total / 1.17) * 100) / 100,
    total,
  }),
}
```

### Invoice Requirements (Israel)

Israeli invoices (חשבונית מס) must include:
1. **Business details**: Name, address, registration number
2. **Customer details**: Name, address, ID/company number
3. **Invoice number**: Sequential, unique
4. **Date**: Issue date
5. **Line items**: Description, quantity, unit price
6. **VAT breakdown**: Amount before VAT, VAT amount, total
7. **Payment terms**: Due date
8. **Authorized dealer number** (עוסק מורשה)

```typescript
// lib/billing/invoice-schema.ts
import { z } from 'zod'

export const invoiceSchema = z.object({
  // Header
  invoiceNumber: z.string(),
  issueDate: z.date(),
  dueDate: z.date(),
  
  // Business (law firm)
  business: z.object({
    name: z.string(),
    address: z.string(),
    authorizedDealerNumber: z.string(), // מס' עוסק מורשה
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
  
  // Client
  client: z.object({
    name: z.string(),
    address: z.string().optional(),
    idNumber: z.string().optional(), // ת.ז / ח.פ
  }),
  
  // Items
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    amount: z.number(),
  })),
  
  // Totals
  subtotal: z.number(),
  vatRate: z.number(),
  vatAmount: z.number(),
  total: z.number(),
  
  // Notes
  notes: z.string().optional(),
  paymentInstructions: z.string().optional(),
})
```

---

## Time Entry System

### Activity Types

```typescript
// lib/billing/activity-types.ts
export const ACTIVITY_TYPES = {
  RESEARCH: { he: 'מחקר', en: 'Research', billable: true },
  DRAFTING: { he: 'ניסוח', en: 'Drafting', billable: true },
  HEARING: { he: 'דיון', en: 'Court Hearing', billable: true },
  MEETING_CLIENT: { he: 'פגישת לקוח', en: 'Client Meeting', billable: true },
  MEETING_INTERNAL: { he: 'פגישה פנימית', en: 'Internal Meeting', billable: false },
  PHONE_CALL: { he: 'שיחת טלפון', en: 'Phone Call', billable: true },
  EMAIL: { he: 'התכתבות', en: 'Email/Correspondence', billable: true },
  REVIEW: { he: 'עיון במסמכים', en: 'Document Review', billable: true },
  TRAVEL: { he: 'נסיעה', en: 'Travel', billable: true },
  ADMIN: { he: 'מנהלי', en: 'Administrative', billable: false },
  OTHER: { he: 'אחר', en: 'Other', billable: true },
}

export type ActivityType = keyof typeof ACTIVITY_TYPES
```

### Time Entry Form

```typescript
// lib/schemas/time-entry.ts
import { z } from 'zod'

export const timeEntrySchema = z.object({
  date: z.date(),
  caseId: z.string().optional(),
  clientId: z.string(),
  activityType: z.enum([
    'RESEARCH', 'DRAFTING', 'HEARING', 'MEETING_CLIENT',
    'MEETING_INTERNAL', 'PHONE_CALL', 'EMAIL', 'REVIEW',
    'TRAVEL', 'ADMIN', 'OTHER'
  ]),
  description: z.string().min(1, 'תיאור נדרש'),
  durationMinutes: z.number().min(1, 'משך זמן נדרש'),
  isBillable: z.boolean().default(true),
  hourlyRate: z.number().optional(),
})
```

### Timer Implementation

```typescript
// lib/stores/timer-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TimerState {
  isRunning: boolean
  startTime: number | null
  caseId: string | null
  description: string
  elapsed: number // in seconds
  
  start: (caseId?: string, description?: string) => void
  stop: () => { durationMinutes: number; caseId: string | null; description: string }
  pause: () => void
  resume: () => void
  reset: () => void
  tick: () => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      startTime: null,
      caseId: null,
      description: '',
      elapsed: 0,
      
      start: (caseId, description = '') => {
        set({
          isRunning: true,
          startTime: Date.now(),
          caseId: caseId || null,
          description,
          elapsed: 0,
        })
      },
      
      stop: () => {
        const state = get()
        const durationMinutes = Math.ceil(state.elapsed / 60)
        
        set({
          isRunning: false,
          startTime: null,
          elapsed: 0,
        })
        
        return {
          durationMinutes,
          caseId: state.caseId,
          description: state.description,
        }
      },
      
      pause: () => set({ isRunning: false }),
      
      resume: () => set({ isRunning: true, startTime: Date.now() }),
      
      reset: () => set({
        isRunning: false,
        startTime: null,
        caseId: null,
        description: '',
        elapsed: 0,
      }),
      
      tick: () => {
        const state = get()
        if (state.isRunning && state.startTime) {
          const now = Date.now()
          const additionalSeconds = Math.floor((now - state.startTime) / 1000)
          set({
            elapsed: state.elapsed + additionalSeconds,
            startTime: now,
          })
        }
      },
    }),
    {
      name: 'lawra-timer',
    }
  )
)
```

### Timer Component

```tsx
// components/billing/timer-widget.tsx
'use client'

import { useEffect } from 'react'
import { useTimerStore } from '@/lib/stores/timer-store'
import { Button } from '@/components/ui/button'
import { Play, Pause, Square } from 'lucide-react'

export function TimerWidget() {
  const { isRunning, elapsed, caseId, start, stop, pause, resume, tick } = useTimerStore()
  
  // Tick every second
  useEffect(() => {
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [tick])
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  
  const handleStop = async () => {
    const { durationMinutes, caseId, description } = stop()
    
    // Open time entry form with pre-filled data
    // Or auto-save if all data is present
  }
  
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
      <span className="font-mono text-lg tabular-nums ltr">
        {formatTime(elapsed)}
      </span>
      
      {!isRunning ? (
        <Button size="icon" variant="ghost" onClick={() => start()}>
          <Play className="w-4 h-4" />
        </Button>
      ) : (
        <Button size="icon" variant="ghost" onClick={pause}>
          <Pause className="w-4 h-4" />
        </Button>
      )}
      
      <Button size="icon" variant="ghost" onClick={handleStop} disabled={elapsed === 0}>
        <Square className="w-4 h-4" />
      </Button>
    </div>
  )
}
```

---

## Invoice Generation

### Generate Invoice Number

```typescript
// lib/billing/invoice-number.ts
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  
  // Get last invoice number for this year
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: { startsWith: `INV-${year}-` },
    },
    orderBy: { invoiceNumber: 'desc' },
  })
  
  let sequence = 1
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2])
    sequence = lastSequence + 1
  }
  
  return `INV-${year}-${sequence.toString().padStart(4, '0')}`
}
```

### Create Invoice from Time Entries

```typescript
// lib/billing/create-invoice.ts
interface CreateInvoiceParams {
  clientId: string
  timeEntryIds: string[]
  issueDate?: Date
  dueDate?: Date
  notes?: string
}

export async function createInvoice(params: CreateInvoiceParams) {
  const { clientId, timeEntryIds, issueDate = new Date(), notes } = params
  
  // Get client
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })
  if (!client) throw new Error('לקוח לא נמצא')
  
  // Calculate due date from payment terms
  const dueDate = params.dueDate || new Date(
    issueDate.getTime() + (client.paymentTerms || 30) * 24 * 60 * 60 * 1000
  )
  
  // Get time entries
  const timeEntries = await prisma.timeEntry.findMany({
    where: {
      id: { in: timeEntryIds },
      isBillable: true,
      invoiceId: null, // Not already invoiced
    },
    include: { case: true },
  })
  
  if (timeEntries.length === 0) {
    throw new Error('לא נמצאו רישומי זמן לחיוב')
  }
  
  // Calculate totals
  const lineItems = timeEntries.map(entry => {
    const hours = entry.durationMinutes / 60
    const rate = entry.hourlyRate || client.billingRate || 0
    const amount = hours * rate
    
    return {
      description: `${entry.case?.title || 'כללי'} - ${entry.description}`,
      quantity: hours,
      unitPrice: rate,
      amount: Math.round(amount * 100) / 100,
      timeEntryId: entry.id,
    }
  })
  
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const vatAmount = Math.round(subtotal * ISRAELI_VAT.rate * 100) / 100
  const total = subtotal + vatAmount
  
  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber()
  
  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      userId: getCurrentUserId(),
      clientId,
      invoiceNumber,
      issueDate,
      dueDate,
      status: 'DRAFT',
      subtotal,
      vatRate: ISRAELI_VAT.rate,
      vatAmount,
      total,
      notes,
      lineItems: {
        create: lineItems,
      },
    },
    include: { lineItems: true },
  })
  
  // Link time entries to invoice
  await prisma.timeEntry.updateMany({
    where: { id: { in: timeEntryIds } },
    data: { invoiceId: invoice.id },
  })
  
  return invoice
}
```

### PDF Generation

```typescript
// lib/billing/generate-pdf.ts
import { jsPDF } from 'jspdf'
// Note: jsPDF has limited Hebrew support, consider using Puppeteer for better results

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      lineItems: true,
    },
  })
  
  if (!invoice) throw new Error('חשבונית לא נמצאה')
  
  // Better approach: Use HTML template + Puppeteer
  const html = renderInvoiceHTML(invoice)
  const pdf = await htmlToPdf(html)
  
  return pdf
}

function renderInvoiceHTML(invoice: Invoice): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&display=swap');
    body { font-family: 'Heebo', sans-serif; direction: rtl; }
    .header { text-align: center; margin-bottom: 2rem; }
    .details { display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: right; }
    th { background: #f5f5f5; }
    .totals { text-align: left; }
    .amount { direction: ltr; text-align: left; }
  </style>
</head>
<body>
  <div class="header">
    <h1>חשבונית מס</h1>
    <p>מס' ${invoice.invoiceNumber}</p>
  </div>
  
  <div class="details">
    <div>
      <strong>לכבוד:</strong><br>
      ${invoice.client.name}<br>
      ${invoice.client.address || ''}
    </div>
    <div>
      <strong>תאריך:</strong> ${formatHebrewDate(invoice.issueDate)}<br>
      <strong>לתשלום עד:</strong> ${formatHebrewDate(invoice.dueDate)}
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>תיאור</th>
        <th>כמות</th>
        <th>מחיר</th>
        <th>סה"כ</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.lineItems.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="amount">${item.quantity.toFixed(2)}</td>
          <td class="amount">₪${item.unitPrice.toFixed(2)}</td>
          <td class="amount">₪${item.amount.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="totals">
    <p>סה"כ לפני מע"מ: <span class="amount">₪${invoice.subtotal.toFixed(2)}</span></p>
    <p>מע"מ (17%): <span class="amount">₪${invoice.vatAmount.toFixed(2)}</span></p>
    <p><strong>סה"כ לתשלום: <span class="amount">₪${invoice.total.toFixed(2)}</span></strong></p>
  </div>
  
  ${invoice.notes ? `<p>הערות: ${invoice.notes}</p>` : ''}
</body>
</html>
  `
}
```

---

## Payment Tracking

```typescript
// lib/billing/payments.ts
interface RecordPaymentParams {
  invoiceId: string
  amount: number
  paymentDate?: Date
  paymentMethod?: string
  reference?: string
}

export async function recordPayment(params: RecordPaymentParams) {
  const { invoiceId, amount, paymentDate = new Date(), paymentMethod, reference } = params
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })
  
  if (!invoice) throw new Error('חשבונית לא נמצאה')
  
  const newPaidAmount = (invoice.paidAmount || 0) + amount
  
  let newStatus: InvoiceStatus
  if (newPaidAmount >= invoice.total) {
    newStatus = 'PAID'
  } else if (newPaidAmount > 0) {
    newStatus = 'PARTIAL'
  } else {
    newStatus = invoice.status
  }
  
  // Create payment record
  await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      paymentDate,
      paymentMethod,
      reference,
    },
  })
  
  // Update invoice
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: newPaidAmount,
      paidDate: newStatus === 'PAID' ? paymentDate : undefined,
      status: newStatus,
    },
  })
}
```

---

## Financial Reports

### Monthly Revenue Report

```typescript
// lib/billing/reports.ts
interface RevenueReportParams {
  startDate: Date
  endDate: Date
}

export async function generateRevenueReport(params: RevenueReportParams) {
  const { startDate, endDate } = params
  
  // Get invoices in period
  const invoices = await prisma.invoice.findMany({
    where: {
      issueDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      client: true,
      payments: true,
    },
  })
  
  // Calculate metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0)
  const totalOutstanding = totalInvoiced - totalPaid
  
  // By client
  const byClient = invoices.reduce((acc, inv) => {
    const clientName = inv.client.name
    if (!acc[clientName]) {
      acc[clientName] = { invoiced: 0, paid: 0 }
    }
    acc[clientName].invoiced += inv.total
    acc[clientName].paid += inv.paidAmount || 0
    return acc
  }, {} as Record<string, { invoiced: number; paid: number }>)
  
  return {
    period: { startDate, endDate },
    totalInvoiced,
    totalPaid,
    totalOutstanding,
    invoiceCount: invoices.length,
    byClient,
    vatCollected: invoices.reduce((sum, inv) => sum + inv.vatAmount, 0),
  }
}
```

### Unbilled Time Report

```typescript
export async function getUnbilledTimeSummary() {
  const unbilledEntries = await prisma.timeEntry.findMany({
    where: {
      isBillable: true,
      invoiceId: null,
    },
    include: {
      client: true,
      case: true,
    },
  })
  
  const totalMinutes = unbilledEntries.reduce((sum, e) => sum + e.durationMinutes, 0)
  const totalAmount = unbilledEntries.reduce((sum, e) => {
    const hours = e.durationMinutes / 60
    const rate = e.hourlyRate || e.client.billingRate || 0
    return sum + (hours * rate)
  }, 0)
  
  // Group by client
  const byClient = unbilledEntries.reduce((acc, entry) => {
    const clientId = entry.clientId
    if (!acc[clientId]) {
      acc[clientId] = {
        clientName: entry.client.name,
        minutes: 0,
        amount: 0,
        entries: [],
      }
    }
    const hours = entry.durationMinutes / 60
    const rate = entry.hourlyRate || entry.client.billingRate || 0
    acc[clientId].minutes += entry.durationMinutes
    acc[clientId].amount += hours * rate
    acc[clientId].entries.push(entry)
    return acc
  }, {} as Record<string, any>)
  
  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    totalAmount,
    byClient: Object.values(byClient),
    entryCount: unbilledEntries.length,
  }
}
```

---

## Dashboard Widgets

### Billing Stats Component

```tsx
// components/dashboard/billing-stats.tsx
export async function BillingStats() {
  const thisMonth = {
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  }
  
  const [revenue, unbilled] = await Promise.all([
    generateRevenueReport(thisMonth),
    getUnbilledTimeSummary(),
  ])
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        title="הכנסות החודש"
        value={formatCurrency(revenue.totalPaid)}
        change={/* vs last month */}
      />
      <StatCard
        title="שעות לא מחויבות"
        value={`${unbilled.totalHours.toFixed(1)} שעות`}
        subtitle={formatCurrency(unbilled.totalAmount)}
      />
      <StatCard
        title="חשבוניות פתוחות"
        value={formatCurrency(revenue.totalOutstanding)}
      />
      <StatCard
        title="מע״מ לתשלום"
        value={formatCurrency(revenue.vatCollected)}
      />
    </div>
  )
}
```

---

## Best Practices

1. **Always validate rates** - Ensure hourly rate is set before creating time entries
2. **Round appropriately** - Use 2 decimal places for currency
3. **Time rounding** - Consider 6-minute increments (0.1 hour) for billing
4. **Audit trail** - Log all changes to invoices and payments
5. **Backup** - Export invoice data regularly for accounting
6. **Compliance** - Consult with accountant for Israeli tax requirements

---

## Dependencies

```json
{
  "jspdf": "^2.5.1",
  "puppeteer": "^21.0.0",
  "date-fns": "^3.0.0"
}
```

---

*Always consult with a licensed accountant for tax compliance.*
