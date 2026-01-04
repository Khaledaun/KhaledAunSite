# LaWra AI - Design System

> Complete UI/UX guidelines for the LaWra AI application.

---

## 🎨 Color System

### Brand Colors

```css
/* Primary - LaWra Blue */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main primary */
--primary-600: #2563eb;  /* Hover */
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### Semantic Colors

```css
/* Status */
--status-active: #22c55e;      /* Green - פעיל */
--status-pending: #f59e0b;     /* Amber - ממתין */
--status-urgent: #ef4444;      /* Red - דחוף */
--status-completed: #6b7280;   /* Gray - הושלם */

/* Calendar Events */
--calendar-meeting: #22c55e;   /* Green - פגישה */
--calendar-hearing: #ef4444;   /* Red - דיון */
--calendar-deadline: #f97316;  /* Orange - מועד אחרון */
--calendar-internal: #3b82f6;  /* Blue - פנימי */
--calendar-marketing: #ec4899; /* Pink - שיווק */

/* Feedback */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Theme Variables (CSS Custom Properties)

```css
:root {
  /* Light Mode */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 217 91% 60%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 217 91% 60%;
  --radius: 0.75rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode values */
}
```

---

## 🔤 Typography

### Font Stack

```css
/* Hebrew (Primary) */
font-family: var(--font-heebo), 'Heebo', Arial, sans-serif;

/* English/Numbers (Secondary) */
font-family: var(--font-inter), 'Inter', sans-serif;

/* Monospace (Code/Numbers) */
font-family: 'JetBrains Mono', monospace;
```

### Font Sizes

| Class | Size | Use Case |
|-------|------|----------|
| `text-xs` | 12px | Badges, timestamps |
| `text-sm` | 14px | Secondary text, labels |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Card titles |
| `text-2xl` | 24px | Section headings |
| `text-3xl` | 30px | Page titles |

### Font Weights

| Class | Weight | Use Case |
|-------|--------|----------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, emphasis |
| `font-semibold` | 600 | Headings, buttons |
| `font-bold` | 700 | Page titles |

---

## 📐 Spacing & Layout

### Spacing Scale

```
4px  → 1 (0.25rem)
8px  → 2 (0.5rem)
12px → 3 (0.75rem)
16px → 4 (1rem)
20px → 5 (1.25rem)
24px → 6 (1.5rem)
32px → 8 (2rem)
40px → 10 (2.5rem)
48px → 12 (3rem)
64px → 16 (4rem)
```

### Layout Patterns

```tsx
// Page container
<div className="space-y-6 p-6">

// Section
<section className="space-y-4">

// Card grid
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

// Form fields
<div className="space-y-4">
  <div className="space-y-2">
    <Label>...</Label>
    <Input />
  </div>
</div>
```

### Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Default | < 640px | Mobile: Stack everything |
| `sm` | ≥ 640px | Small tablets |
| `md` | ≥ 768px | Tablets: Side drawer |
| `lg` | ≥ 1024px | Desktop: Fixed sidebar |
| `xl` | ≥ 1280px | Wide screens |
| `2xl` | ≥ 1536px | Ultra-wide |

---

## 🧱 Component Patterns

### Cards

```tsx
// Standard card
<div className="rounded-2xl border bg-card p-4 shadow-sm">
  <h3 className="text-lg font-semibold mb-4">כותרת</h3>
  {/* content */}
</div>

// Clickable card
<div className="rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">

// Card with header actions
<div className="rounded-2xl border bg-card shadow-sm">
  <div className="flex items-center justify-between p-4 border-b">
    <h3 className="font-semibold">כותרת</h3>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="w-4 h-4" />
    </Button>
  </div>
  <div className="p-4">
    {/* content */}
  </div>
</div>
```

### Buttons

```tsx
// Primary action
<Button>שמור</Button>

// Secondary action
<Button variant="secondary">ביטול</Button>

// Destructive
<Button variant="destructive">מחק</Button>

// Ghost (icon buttons)
<Button variant="ghost" size="icon">
  <Plus className="w-4 h-4" />
</Button>

// With loading
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="w-4 h-4 animate-spin me-2" />}
  שמור
</Button>
```

### Forms

```tsx
<form className="space-y-4">
  {/* Text input */}
  <div className="space-y-2">
    <Label htmlFor="name">שם הלקוח</Label>
    <Input 
      id="name" 
      placeholder="הכנס שם..."
      {...register('name')}
    />
    {errors.name && (
      <p className="text-sm text-destructive">{errors.name.message}</p>
    )}
  </div>

  {/* Select */}
  <div className="space-y-2">
    <Label htmlFor="type">סוג לקוח</Label>
    <Select {...register('type')}>
      <SelectTrigger>
        <SelectValue placeholder="בחר סוג" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="individual">יחיד</SelectItem>
        <SelectItem value="company">חברה</SelectItem>
        <SelectItem value="government">ממשלתי</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* LTR inputs (email, phone, numbers) */}
  <div className="space-y-2">
    <Label htmlFor="email">אימייל</Label>
    <Input 
      id="email" 
      type="email"
      dir="ltr"
      className="text-left"
      {...register('email')}
    />
  </div>

  {/* Actions */}
  <div className="flex gap-3 justify-end pt-4">
    <Button type="button" variant="secondary">ביטול</Button>
    <Button type="submit">שמור</Button>
  </div>
</form>
```

### Tables

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>שם</TableHead>
      <TableHead>סטטוס</TableHead>
      <TableHead>תאריך</TableHead>
      <TableHead className="text-left">פעולות</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id} className="hover:bg-muted/50">
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(item.status)}>
            {item.status}
          </Badge>
        </TableCell>
        <TableCell className="tabular-nums ltr">
          {formatDate(item.date)}
        </TableCell>
        <TableCell className="text-left">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>עריכה</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">מחיקה</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Badges

```tsx
// Status badges
<Badge variant="default">פעיל</Badge>
<Badge variant="secondary">ממתין</Badge>
<Badge variant="destructive">דחוף</Badge>
<Badge variant="outline">טיוטה</Badge>

// Custom status classes
<span className="lawra-badge lawra-badge-active">פעיל</span>
<span className="lawra-badge lawra-badge-pending">ממתין</span>
<span className="lawra-badge lawra-badge-urgent">דחוף</span>
```

### Avatars

```tsx
// User avatar
<Avatar className="w-10 h-10">
  <AvatarImage src={user.avatar} />
  <AvatarFallback className="bg-primary text-primary-foreground">
    {getInitials(user.name)}
  </AvatarFallback>
</Avatar>

// Avatar group (team members)
<div className="flex -space-x-2 space-x-reverse">
  {members.map((member) => (
    <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
      <AvatarFallback className={member.color}>
        {member.initials}
      </AvatarFallback>
    </Avatar>
  ))}
</div>
```

---

## 📱 Responsive Patterns

### Sidebar Behavior

```tsx
// Desktop: Fixed sidebar
<aside className="hidden lg:flex w-64 flex-col border-e">

// Mobile: Hamburger menu
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="lg:hidden">
      <Menu className="w-5 h-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-64">
    <Sidebar />
  </SheetContent>
</Sheet>
```

### Grid Patterns

```tsx
// Cards that stack on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Two-column form on desktop
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Main content + sidebar
<div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
```

---

## 🔄 RTL-Specific Patterns

### Logical Properties

```css
/* ❌ Don't use physical */
margin-left: 1rem;
padding-right: 2rem;
text-align: left;
border-left: 1px solid;

/* ✅ Use logical */
margin-inline-start: 1rem;  /* ms-4 in Tailwind */
padding-inline-end: 2rem;   /* pe-8 in Tailwind */
text-align: start;
border-inline-start: 1px solid;
```

### Tailwind RTL Classes

| Physical | Logical | RTL Result |
|----------|---------|------------|
| `ml-4` | `ms-4` | margin-right |
| `mr-4` | `me-4` | margin-left |
| `pl-4` | `ps-4` | padding-right |
| `pr-4` | `pe-4` | padding-left |
| `left-0` | `start-0` | right: 0 |
| `right-0` | `end-0` | left: 0 |
| `text-left` | `text-start` | text-align: right |
| `text-right` | `text-end` | text-align: left |
| `border-l` | `border-s` | border-right |
| `border-r` | `border-e` | border-left |

### Icon Flipping

```tsx
// Icons that indicate direction need flipping
<ChevronLeft className="w-4 h-4 rtl-flip" />
<ChevronRight className="w-4 h-4 rtl-flip" />
<ArrowRight className="w-4 h-4 rtl-flip" />

// CSS
.rtl-flip {
  transform: scaleX(-1);
}
```

### LTR Islands

```tsx
// Numbers stay LTR
<span className="tabular-nums ltr">{caseNumber}</span>

// Email input
<Input type="email" dir="ltr" className="text-left" />

// Phone input
<Input type="tel" dir="ltr" className="text-left" />

// Case number
<span className="case-number">{`CC: ${number}`}</span>
```

---

## ✨ Animations & Transitions

### Standard Transitions

```css
/* Hover effects */
transition-colors      /* 150ms color changes */
transition-shadow      /* Shadow on hover */
transition-opacity     /* Fade in/out */
transition-transform   /* Scale/move */
transition-all         /* All properties */
```

### Loading States

```tsx
// Skeleton loading
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />

// Spinner
<Loader2 className="w-4 h-4 animate-spin" />

// Pulse
<div className="animate-pulse-subtle">
```

### Page Transitions

```tsx
// Using framer-motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
>
```

---

## 🖼 Icons

### Icon Library

Using **Lucide React** for all icons.

```tsx
import { 
  Home,
  Users,
  FolderOpen,
  CheckSquare,
  FileText,
  Brain,
  Receipt,
  Calendar,
  Settings,
  Search,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
```

### Icon Sizes

| Size | Class | Use Case |
|------|-------|----------|
| 16px | `w-4 h-4` | Inline, buttons |
| 20px | `w-5 h-5` | Sidebar, standard |
| 24px | `w-6 h-6` | Headers |
| 32px | `w-8 h-8` | Empty states |

---

## 📋 Component Library Reference

### Installed UI Components

```
components/ui/
├── avatar.tsx
├── badge.tsx
├── button.tsx
├── calendar.tsx
├── card.tsx
├── checkbox.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── input.tsx
├── label.tsx
├── popover.tsx
├── scroll-area.tsx
├── select.tsx
├── separator.tsx
├── sheet.tsx
├── skeleton.tsx
├── table.tsx
├── tabs.tsx
├── textarea.tsx
├── toast.tsx
├── toaster.tsx
├── tooltip.tsx
└── use-toast.tsx
```

---

## 🎯 Design Principles

1. **Clarity over cleverness** - Legal work is serious; UI should be clear
2. **Information density** - Lawyers need to see data; don't over-simplify
3. **Progressive disclosure** - Show essentials first, details on demand
4. **Consistent patterns** - Same action = same UI everywhere
5. **Mobile-ready** - Works in courtroom from phone
6. **Accessibility** - Keyboard nav, screen readers, color contrast

---

*Based on the mockup design provided by the founder.*
