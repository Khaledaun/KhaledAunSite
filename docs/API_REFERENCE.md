# LaWra AI - API Reference

> Complete API documentation for all backend routes.

---

## 🔐 Authentication

All API routes require authentication via Supabase Auth. The user session is validated on each request.

```typescript
// Standard auth check pattern
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // User is authenticated, proceed...
}
```

---

## 📂 Clients API

### GET /api/clients

List all clients for the authenticated user.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name |
| `status` | string | Filter by status: `ACTIVE`, `INACTIVE`, `POTENTIAL`, `ARCHIVED` |
| `type` | string | Filter by type: `INDIVIDUAL`, `COMPANY`, `GOVERNMENT` |
| `limit` | number | Results per page (default: 20) |
| `offset` | number | Pagination offset |

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "ישראל ישראלי",
      "clientType": "INDIVIDUAL",
      "idNumber": "123456789",
      "email": "israel@example.com",
      "phone": "050-1234567",
      "status": "ACTIVE",
      "billingRate": 500.00,
      "createdAt": "2025-01-01T00:00:00Z",
      "_count": {
        "cases": 3
      }
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

### POST /api/clients

Create a new client.

**Request Body:**
```json
{
  "name": "ישראל ישראלי",
  "clientType": "INDIVIDUAL",
  "idNumber": "123456789",
  "email": "israel@example.com",
  "phone": "050-1234567",
  "phoneSecondary": "03-1234567",
  "address": "תל אביב, רחוב הרצל 1",
  "billingRate": 500.00,
  "paymentTerms": 30,
  "notes": "לקוח ותיק"
}
```

**Response:** `201 Created`
```json
{
  "id": "clx...",
  "name": "ישראל ישראלי",
  // ... full client object
}
```

### GET /api/clients/[id]

Get a single client with related data.

**Response:**
```json
{
  "id": "clx...",
  "name": "ישראל ישראלי",
  // ... all client fields
  "cases": [
    {
      "id": "...",
      "title": "כהן נגד לוי",
      "status": "ACTIVE"
    }
  ],
  "recentActivity": [
    {
      "type": "TASK_COMPLETED",
      "description": "הושלמה משימה: הכנת כתב תביעה",
      "timestamp": "2025-01-03T14:30:00Z"
    }
  ]
}
```

### PATCH /api/clients/[id]

Update a client.

**Request Body:** Partial client object
```json
{
  "phone": "050-9876543",
  "status": "INACTIVE"
}
```

### DELETE /api/clients/[id]

Delete a client (soft delete - archives).

---

## 📁 Cases API

### GET /api/cases

List all cases.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `clientId` | string | Filter by client |
| `status` | string | Filter by status |
| `practiceArea` | string | Filter by practice area |
| `assigneeId` | string | Filter by assigned team member |
| `search` | string | Search in title, case number |
| `limit` | number | Results per page |
| `offset` | number | Pagination offset |

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "כהן נגד לוי",
      "caseNumber": "CC: 12345-10-25",
      "caseType": "LITIGATION",
      "practiceArea": "CIVIL",
      "status": "ACTIVE",
      "priority": "HIGH",
      "progress": 45,
      "client": {
        "id": "...",
        "name": "דוד כהן"
      },
      "nextHearing": "2025-02-15T09:00:00Z",
      "_count": {
        "tasks": 5,
        "documents": 12
      }
    }
  ],
  "total": 28
}
```

### POST /api/cases

Create a new case.

**Request Body:**
```json
{
  "clientId": "clx...",
  "title": "כהן נגד לוי",
  "caseNumber": "CC: 12345-10-25",
  "caseType": "LITIGATION",
  "practiceArea": "CIVIL",
  "court": "בית משפט השלום תל אביב",
  "judge": "כב' השופט ישראלי",
  "opposingParty": "משה לוי",
  "opposingCounsel": "עו\"ד יעקב",
  "opposingCounselContact": "054-1234567",
  "feeType": "HOURLY",
  "feeAmount": 500.00,
  "deadline": "2025-06-01",
  "description": "תביעה בגין הפרת חוזה",
  "tags": ["חוזים", "מסחרי"]
}
```

### GET /api/cases/[id]

Get case with all related data.

**Response:**
```json
{
  "id": "clx...",
  "title": "כהן נגד לוי",
  // ... all case fields
  "client": { /* full client */ },
  "tasks": [/* tasks array */],
  "documents": [/* documents array */],
  "timeEntries": [/* time entries */],
  "calendarEvents": [/* events */],
  "timeline": [
    {
      "type": "CASE_CREATED",
      "timestamp": "2025-01-01T00:00:00Z",
      "description": "תיק נפתח"
    },
    {
      "type": "DOCUMENT_UPLOADED",
      "timestamp": "2025-01-02T10:00:00Z",
      "description": "הועלה כתב תביעה",
      "documentId": "..."
    }
  ]
}
```

### PATCH /api/cases/[id]

Update case.

### DELETE /api/cases/[id]

Archive case (soft delete).

---

## ✅ Tasks API

### GET /api/tasks

List tasks with optional filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `caseId` | string | Filter by case |
| `clientId` | string | Filter by client |
| `assigneeId` | string | Filter by assignee |
| `status` | string | Filter by status |
| `dueDate` | string | Filter by due date (before/after) |

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "הכן כתב תביעה",
      "description": "...",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "position": 0,
      "dueDate": "2025-01-10",
      "estimatedMinutes": 120,
      "case": {
        "id": "...",
        "title": "כהן נגד לוי"
      },
      "assignee": {
        "id": "...",
        "fullName": "רים רינאוי",
        "initials": "R"
      }
    }
  ]
}
```

### POST /api/tasks

Create task.

**Request Body:**
```json
{
  "title": "הכן כתב תביעה",
  "description": "לכלול את כל הנספחים",
  "caseId": "clx...",
  "assigneeId": "clx...",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-01-10",
  "estimatedMinutes": 120,
  "tags": ["דחוף", "ליטיגציה"]
}
```

### PATCH /api/tasks/[id]

Update task. Used for:
- Editing details
- Changing status (drag-and-drop)
- Updating position (reordering)

**Request Body:**
```json
{
  "status": "DONE",
  "completedAt": "2025-01-05T14:30:00Z"
}
```

### PATCH /api/tasks/reorder

Batch update positions after drag-and-drop.

**Request Body:**
```json
{
  "updates": [
    { "id": "task1", "status": "IN_PROGRESS", "position": 0 },
    { "id": "task2", "status": "IN_PROGRESS", "position": 1 },
    { "id": "task3", "status": "TODO", "position": 0 }
  ]
}
```

---

## 📄 Documents API

### GET /api/documents

List documents.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `caseId` | string | Filter by case |
| `documentType` | string | Filter by type |
| `search` | string | Search filename, content |

### POST /api/documents/upload

Upload a document file.

**Request:** `multipart/form-data`
```
file: File
caseId: string
documentType: string (optional)
description: string (optional)
```

**Response:**
```json
{
  "id": "clx...",
  "filename": "כתב_תביעה.pdf",
  "storagePath": "documents/clx.../כתב_תביעה.pdf",
  "mimeType": "application/pdf",
  "size": 245678,
  "documentType": "CLAIM"
}
```

### POST /api/documents/generate

Generate a document from template.

**Request Body:**
```json
{
  "templateId": "claim",
  "caseId": "clx...",
  "variables": {
    "customField": "value"
  },
  "options": {
    "format": "docx",
    "aiEnhance": false
  }
}
```

**Response:** Returns the generated document as download or saves to case.

### GET /api/documents/[id]

Get document metadata.

### GET /api/documents/[id]/download

Download document file.

### DELETE /api/documents/[id]

Delete document.

---

## 🤖 AI API

### POST /api/ai/chat

Chat with Legal Mind AI.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "מה ההבדל בין תביעה ייצוגית לתביעה רגילה?" }
  ],
  "clientId": "clx...",
  "caseId": "clx...",
  "conversationId": "clx..."
}
```

**Response:** Server-Sent Events (streaming)
```
data: {"type": "text-delta", "content": "תביעה ייצוגית היא..."}
data: {"type": "text-delta", "content": " תביעה המוגשת..."}
data: {"type": "done", "conversationId": "clx..."}
```

### POST /api/ai/summarize

Summarize a document.

**Request Body:**
```json
{
  "documentId": "clx...",
  "style": "brief" | "detailed" | "bullet-points"
}
```

**Response:**
```json
{
  "summary": "המסמך עוסק ב...",
  "keyPoints": [
    "נקודה 1",
    "נקודה 2"
  ],
  "entities": {
    "parties": ["כהן", "לוי"],
    "dates": ["2025-01-01"],
    "amounts": ["₪50,000"]
  }
}
```

### GET /api/ai/agents/[clientId]

Get AI agent context for a specific client.

**Response:**
```json
{
  "clientId": "clx...",
  "context": {
    "clientSummary": "לקוח עסקי, 3 תיקים פתוחים...",
    "preferences": ["מעדיף תקשורת במייל", "דחוף לו עניין X"],
    "recentTopics": ["חוזה השכרה", "סכסוך עם שותף"]
  },
  "conversations": [/* recent conversations */]
}
```

### POST /api/ai/agents/[clientId]

Update client agent context.

---

## ⏱ Time Entries API

### GET /api/time-entries

List time entries.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `caseId` | string | Filter by case |
| `clientId` | string | Filter by client |
| `invoiceId` | string | Filter by invoice |
| `startDate` | string | From date |
| `endDate` | string | To date |
| `billable` | boolean | Filter billable only |

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "date": "2025-01-03",
      "durationMinutes": 90,
      "activityType": "RESEARCH",
      "description": "מחקר פסיקה בנושא חוזים",
      "isBillable": true,
      "hourlyRate": 500.00,
      "case": {
        "id": "...",
        "title": "כהן נגד לוי"
      }
    }
  ],
  "summary": {
    "totalMinutes": 450,
    "billableMinutes": 400,
    "totalAmount": 3333.33
  }
}
```

### POST /api/time-entries

Create time entry.

**Request Body:**
```json
{
  "caseId": "clx...",
  "date": "2025-01-03",
  "durationMinutes": 90,
  "activityType": "RESEARCH",
  "description": "מחקר פסיקה בנושא חוזים",
  "isBillable": true,
  "hourlyRate": 500.00
}
```

### POST /api/time-entries/timer

Start/stop timer.

**Request Body:**
```json
{
  "action": "start" | "stop",
  "caseId": "clx...",
  "description": "עבודה על תיק"
}
```

---

## 🧾 Invoices API

### GET /api/invoices

List invoices.

### POST /api/invoices

Create invoice.

**Request Body:**
```json
{
  "clientId": "clx...",
  "timeEntryIds": ["clx...", "clx..."],
  "issueDate": "2025-01-05",
  "dueDate": "2025-02-04",
  "notes": "תשלום תוך 30 יום"
}
```

### GET /api/invoices/[id]

Get invoice with line items.

### PATCH /api/invoices/[id]

Update invoice status.

```json
{
  "status": "SENT" | "PAID" | "PARTIAL",
  "paidAmount": 5000.00,
  "paidDate": "2025-01-20"
}
```

### GET /api/invoices/[id]/pdf

Generate PDF download.

---

## 📅 Calendar API

### GET /api/calendar

Get events.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `start` | string | Start date |
| `end` | string | End date |
| `caseId` | string | Filter by case |
| `eventType` | string | Filter by type |

### POST /api/calendar

Create event.

**Request Body:**
```json
{
  "title": "דיון קדם משפט",
  "caseId": "clx...",
  "startTime": "2025-02-15T09:00:00Z",
  "endTime": "2025-02-15T10:00:00Z",
  "location": "בית משפט השלום ת\"א, אולם 5",
  "eventType": "HEARING",
  "description": "הכנה: להביא את כל המסמכים"
}
```

### POST /api/calendar/sync

Sync with external calendar.

**Request Body:**
```json
{
  "provider": "outlook" | "google",
  "action": "pull" | "push" | "full"
}
```

---

## 🔍 Search API

### GET /api/search

Global search across all entities.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query |
| `types` | string[] | Entity types to search |

**Response:**
```json
{
  "results": [
    {
      "type": "case",
      "id": "clx...",
      "title": "כהן נגד לוי",
      "subtitle": "CC: 12345-10-25",
      "highlight": "...חוזה עם <mark>כהן</mark>..."
    },
    {
      "type": "client",
      "id": "clx...",
      "title": "דוד כהן",
      "subtitle": "לקוח פעיל"
    },
    {
      "type": "document",
      "id": "clx...",
      "title": "כתב תביעה",
      "subtitle": "תיק: כהן נגד לוי"
    }
  ]
}
```

---

## ❌ Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "שדה חובה חסר",
    "details": {
      "field": "name",
      "issue": "required"
    }
  }
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `CONFLICT` | 409 | Duplicate/conflict |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 📊 Zod Schemas

All API inputs are validated with Zod. Schemas are in `lib/schemas/`.

```typescript
// lib/schemas/client.ts
import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(1, 'שם חובה'),
  clientType: z.enum(['INDIVIDUAL', 'COMPANY', 'GOVERNMENT']),
  idNumber: z.string().optional(),
  email: z.string().email('אימייל לא תקין').optional(),
  phone: z.string().optional(),
  billingRate: z.number().positive().optional(),
  paymentTerms: z.number().int().min(0).default(30),
})

export type ClientInput = z.infer<typeof clientSchema>
```

---

*For implementation details, see the source code in `app/api/`.*
