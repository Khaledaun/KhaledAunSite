# Hebrew RTL Skill

> Best practices for building Hebrew-first, RTL interfaces in LaWra AI.

---

## Overview

LaWra AI is a **Hebrew-first application** serving Israeli law firms. Proper RTL (Right-to-Left) implementation is critical for usability and professionalism.

---

## Core Setup

### HTML Document

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
```

### Fonts

```tsx
// app/layout.tsx
import { Heebo, Inter } from 'next/font/google'

// Hebrew font (primary)
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
})

// English/numbers font (secondary)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Apply in layout
<html className={`${heebo.variable} ${inter.variable}`}>
```

### Tailwind Config

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-heebo)', 'Heebo', 'Arial', 'sans-serif'],
        heebo: ['var(--font-heebo)', 'Heebo', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
    },
  },
}
```

---

## Logical Properties

### The Problem

Physical properties (left/right) break in RTL:

```css
/* ❌ WRONG - breaks in RTL */
.button-icon {
  margin-left: 8px;
}

/* ✅ CORRECT - works in RTL */
.button-icon {
  margin-inline-start: 8px;
}
```

### Tailwind Mapping

| Physical | Logical | RTL Result |
|----------|---------|------------|
| `ml-*` | `ms-*` | margin-right |
| `mr-*` | `me-*` | margin-left |
| `pl-*` | `ps-*` | padding-right |
| `pr-*` | `pe-*` | padding-left |
| `left-*` | `start-*` | right |
| `right-*` | `end-*` | left |
| `text-left` | `text-start` | text-align: right |
| `text-right` | `text-end` | text-align: left |
| `border-l-*` | `border-s-*` | border-right |
| `border-r-*` | `border-e-*` | border-left |
| `rounded-l-*` | `rounded-s-*` | border-radius right |
| `rounded-r-*` | `rounded-e-*` | border-radius left |

### Examples

```tsx
// ❌ Wrong
<div className="ml-4 pl-2 text-left border-l">

// ✅ Correct
<div className="ms-4 ps-2 text-start border-s">

// ❌ Wrong - absolute positioning
<button className="absolute right-4 top-4">

// ✅ Correct
<button className="absolute end-4 top-4">
```

---

## Bidirectional Text

### LTR Islands

Some content must remain LTR even in RTL context:

```tsx
// Email addresses
<Input type="email" dir="ltr" className="text-left" />

// Phone numbers
<Input type="tel" dir="ltr" className="text-left" />

// URLs
<Input type="url" dir="ltr" className="text-left" />

// Numbers
<span className="tabular-nums ltr">{amount}</span>

// Case numbers
<span className="case-number ltr">CC: 12345-10-25</span>

// Code
<code className="font-mono ltr">{codeSnippet}</code>
```

### CSS Classes

```css
/* globals.css */
.ltr,
[dir="ltr"],
input[type="email"],
input[type="tel"],
input[type="number"],
input[type="url"],
.font-mono,
code {
  direction: ltr;
  text-align: left;
}

/* Case numbers */
.case-number {
  direction: ltr;
  unicode-bidi: embed;
}

/* Let browser decide for mixed content */
.bidi-auto {
  unicode-bidi: plaintext;
}
```

### Input Component

```tsx
// components/ui/input.tsx
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, className, ...props }, ref) => {
    // Auto-detect LTR input types
    const isLTR = ['email', 'url', 'tel', 'number'].includes(type || '')
    
    return (
      <input
        type={type}
        dir={isLTR ? 'ltr' : undefined}
        className={cn(
          'flex h-10 w-full rounded-md border...',
          isLTR && 'text-left',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

---

## Icons

### Directional Icons

Icons that imply direction need flipping:

```tsx
// Icons that NEED flipping in RTL
const directionalIcons = [
  ChevronLeft,    // → becomes ←
  ChevronRight,   // ← becomes →
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Reply,
  Forward,
  ExternalLink,
  Undo,
  Redo,
]

// Icons that DON'T need flipping
const neutralIcons = [
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Check,
  X,
  Search,
  Settings,
  // Most icons are neutral
]
```

### Implementation

```tsx
// CSS class
.rtl-flip {
  transform: scaleX(-1);
}

// Component usage
<ChevronLeft className="w-4 h-4 rtl-flip" />

// Or create a wrapper
function DirectionalIcon({ 
  icon: Icon, 
  className, 
  ...props 
}: { icon: LucideIcon } & LucideProps) {
  return <Icon className={cn('rtl-flip', className)} {...props} />
}

// Usage
<DirectionalIcon icon={ChevronRight} className="w-4 h-4" />
```

### Navigation Arrows

```tsx
// Pagination
<Button>
  <ChevronRight className="w-4 h-4 rtl-flip" />
  הבא
</Button>

<Button>
  הקודם
  <ChevronLeft className="w-4 h-4 rtl-flip" />
</Button>

// Back button
<Link href="/clients">
  <ArrowRight className="w-4 h-4 rtl-flip me-2" />
  חזרה לרשימה
</Link>
```

---

## Layout Patterns

### Sidebar Layout

```tsx
// Sidebar on the RIGHT in RTL
<div className="flex">
  <main className="flex-1">{children}</main>
  <aside className="w-64 border-s">{/* Note: border-s = border-left in RTL */}</aside>
</div>

// Or use border-e for sidebar
<div className="flex">
  <aside className="w-64 border-e">{sidebar}</aside>
  <main className="flex-1">{children}</main>
</div>
```

### Form Layout

```tsx
// Labels on the right (natural in RTL)
<div className="space-y-4">
  <div className="space-y-2">
    <Label>שם</Label> {/* Automatically right-aligned */}
    <Input />
  </div>
</div>

// Inline form with label
<div className="flex items-center gap-4">
  <Label className="w-24">שם:</Label>
  <Input className="flex-1" />
</div>
```

### Data Tables

```tsx
<Table>
  <TableHeader>
    <TableRow>
      {/* First column is on the RIGHT in RTL */}
      <TableHead>שם</TableHead>
      <TableHead>תאריך</TableHead>
      {/* Actions column should be on the LEFT */}
      <TableHead className="text-start">פעולות</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>ישראל ישראלי</TableCell>
      <TableCell className="tabular-nums ltr">01.01.2025</TableCell>
      <TableCell className="text-start">
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
        </Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Date & Number Formatting

### Hebrew Dates

```typescript
// lib/utils/format.ts
export function formatHebrewDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}
// Output: "01.01.2025"

export function formatHebrewDateLong(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
// Output: "1 בינואר 2025"

export function formatRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('he', { numeric: 'auto' })
  const diff = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return rtf.format(diff, 'day')
}
// Output: "מחר", "אתמול", "בעוד 3 ימים"
```

### Currency

```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
  }).format(amount)
}
// Output: "₪1,234.56"

// Note: Display with LTR to keep number readable
<span className="tabular-nums ltr">{formatCurrency(amount)}</span>
```

### Numbers

```typescript
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('he-IL').format(num)
}
// Output: "1,234,567"

// Phone numbers (keep LTR)
export function formatPhone(phone: string): string {
  // 0501234567 → 050-123-4567
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
}
<span className="ltr">{formatPhone(client.phone)}</span>
```

---

## Common UI Text

### Translations Reference

```typescript
// lib/i18n/he.ts
export const hebrewText = {
  // Actions
  save: 'שמור',
  cancel: 'ביטול',
  delete: 'מחק',
  edit: 'עריכה',
  add: 'הוסף',
  new: 'חדש',
  search: 'חיפוש',
  filter: 'סינון',
  export: 'ייצוא',
  import: 'ייבוא',
  
  // Navigation
  back: 'חזרה',
  next: 'הבא',
  previous: 'הקודם',
  home: 'בית',
  
  // Status
  active: 'פעיל',
  inactive: 'לא פעיל',
  pending: 'ממתין',
  completed: 'הושלם',
  cancelled: 'בוטל',
  draft: 'טיוטה',
  
  // Time
  today: 'היום',
  yesterday: 'אתמול',
  tomorrow: 'מחר',
  thisWeek: 'השבוע',
  thisMonth: 'החודש',
  
  // Entities
  client: 'לקוח',
  clients: 'לקוחות',
  case: 'תיק',
  cases: 'תיקים',
  task: 'משימה',
  tasks: 'משימות',
  document: 'מסמך',
  documents: 'מסמכים',
  
  // Messages
  loading: 'טוען...',
  noResults: 'לא נמצאו תוצאות',
  error: 'שגיאה',
  success: 'הצלחה',
  confirmDelete: 'האם אתה בטוח שברצונך למחוק?',
}
```

---

## Testing RTL

### Checklist

- [ ] Text alignment is correct (right-aligned by default)
- [ ] Icons pointing in correct direction
- [ ] Form labels on correct side
- [ ] Numbers and dates remain readable
- [ ] Email/phone inputs are LTR
- [ ] Scrollbars on correct side
- [ ] Dropdowns open correctly
- [ ] Modal close buttons positioned correctly
- [ ] Keyboard navigation works (Tab order)
- [ ] Toast notifications appear from correct side

### Browser Testing

```typescript
// In Playwright tests
test('RTL layout is correct', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Check document direction
  const html = page.locator('html')
  await expect(html).toHaveAttribute('dir', 'rtl')
  await expect(html).toHaveAttribute('lang', 'he')
  
  // Check sidebar is on right
  const sidebar = page.locator('aside')
  const box = await sidebar.boundingBox()
  expect(box.x).toBeGreaterThan(500) // On right side
  
  // Check text alignment
  const heading = page.locator('h1').first()
  const styles = await heading.evaluate(el => 
    window.getComputedStyle(el).textAlign
  )
  expect(styles).toBe('start') // or 'right'
})
```

---

## Common Mistakes

### ❌ Mistake 1: Hardcoded directions

```tsx
// ❌ Wrong
<div className="ml-4 text-left">

// ✅ Correct
<div className="ms-4 text-start">
```

### ❌ Mistake 2: Forgetting icon flip

```tsx
// ❌ Wrong - arrow points wrong way
<Button>
  Next <ChevronRight />
</Button>

// ✅ Correct
<Button>
  הבא <ChevronLeft className="rtl-flip" />
</Button>
```

### ❌ Mistake 3: LTR content without isolation

```tsx
// ❌ Wrong - number gets mixed in
<span>מחיר: 1,234.56 ש"ח</span>

// ✅ Correct - isolate the number
<span>מחיר: <span className="ltr">₪1,234.56</span></span>
```

### ❌ Mistake 4: Flexbox order assumptions

```tsx
// ❌ Wrong - assumes LTR order
<div className="flex">
  <span>Label</span>
  <span>Value</span>
</div>

// ✅ Correct - order is reversed in RTL naturally
// Just verify the visual result
```

---

## Print Styles

```css
@media print {
  body {
    direction: rtl;
  }
  
  .ltr {
    direction: ltr;
  }
  
  .no-print {
    display: none !important;
  }
}
```

---

*Always test in both Chrome and Safari - they handle RTL slightly differently.*
