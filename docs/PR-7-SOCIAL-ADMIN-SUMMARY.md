# PR #7: Phase 8 Full — Social Admin UI + Sanitization

**Branch:** `feat/phase8-social-admin`  
**Status:** ✅ **COMPLETE**  
**Date:** October 16, 2024

---

## 🎯 **OBJECTIVE**

Build admin CRUD interface for social embeds with server-side HTML sanitization and RBAC enforcement.

---

## 📝 **CHANGES MADE**

### **1. Sanitization Utility** (`packages/utils/sanitize.ts`)

**Created comprehensive HTML sanitizer:**
```typescript
export function sanitizeSocialEmbed(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['iframe', 'div', 'span', 'p', 'a', 'blockquote', ...],
    allowedAttributes: {
      iframe: ['src', 'width', 'height', 'frameborder', 'allow', ...],
      // ... strict allowlists
    },
    allowedSchemes: ['http', 'https'],
    disallowedTagsMode: 'discard',  // Drop scripts entirely
  });
}

export function validateEmbedKey(key: string): boolean {
  return /^[A-Z0-9_]+$/.test(key);
}
```

**Key Features:**
- ✅ Strict allowlist (only safe tags/attributes)
- ✅ Scripts automatically stripped
- ✅ Event handlers blocked
- ✅ Only http/https schemes allowed
- ✅ Key validation (uppercase, numbers, underscores)

---

### **2. RBAC Permissions** (`packages/auth/permissions.ts`)

**Added social embed permissions:**
```typescript
export type Permission =
  | ...
  | 'createSocialEmbed'    // EDITOR+
  | 'editSocialEmbed'      // EDITOR+
  | 'deleteSocialEmbed';   // ADMIN+

export const ACL: Record<Permission, Role[]> = {
  ...
  createSocialEmbed: ['EDITOR', 'ADMIN', 'OWNER'],
  editSocialEmbed: ['EDITOR', 'ADMIN', 'OWNER'],
  deleteSocialEmbed: ['ADMIN', 'OWNER'],
};
```

**Permission Matrix:**
| Action | AUTHOR | EDITOR | ADMIN | OWNER |
|--------|--------|--------|-------|-------|
| View   | ❌     | ✅     | ✅    | ✅    |
| Create | ❌     | ✅     | ✅    | ✅    |
| Edit   | ❌     | ✅     | ✅    | ✅    |
| Delete | ❌     | ❌     | ✅    | ✅    |

---

### **3. Admin API Routes**

#### **GET/POST `/api/admin/social`** (`route.ts`)

**GET - List all embeds:**
- ✅ EDITOR+ can view
- ✅ Returns all embeds ordered by creation date

**POST - Upsert embed:**
- ✅ EDITOR+ can create/update
- ✅ Sanitizes HTML before saving
- ✅ Validates key format
- ✅ Sets `updatedBy` to session user
- ✅ Creates audit trail

**Request:**
```json
{
  "key": "LINKEDIN_WALL",
  "html": "<iframe src='...' />",
  "enabled": true
}
```

**Response:**
```json
{
  "embed": {
    "id": "abc123",
    "key": "LINKEDIN_WALL",
    "html": "<iframe src='...' />",  // sanitized
    "enabled": true,
    "updatedBy": "user123",
    "createdAt": "2024-10-16T12:00:00Z",
    "updatedAt": "2024-10-16T12:00:00Z"
  }
}
```

---

#### **GET/PUT/DELETE `/api/admin/social/[key]`** (`[key]/route.ts`)

**GET - Get single embed:**
- ✅ EDITOR+ can view
- ✅ Returns 404 if not found

**PUT - Update embed:**
- ✅ EDITOR+ can update
- ✅ Sanitizes HTML if provided
- ✅ Can update `html` and/or `enabled`
- ✅ Creates audit trail

**DELETE - Delete embed:**
- ✅ ADMIN+ only
- ✅ Returns 403 if EDITOR tries
- ✅ Creates audit trail

---

### **4. Admin UI** (`apps/admin/app/(dashboard)/social/page.tsx`)

**Features:**

**Left Panel - Embeds List:**
- ✅ Shows all embeds with key, enabled status, updated date
- ✅ Click to edit
- ✅ Visual indicator for enabled/disabled
- ✅ "New Embed" button

**Right Panel - Editor:**
- ✅ Key input (uppercase, numbers, underscores only)
- ✅ Key locked after creation (can't change)
- ✅ HTML textarea (12 rows, monospace font)
- ✅ Enabled checkbox
- ✅ Save button (upserts)
- ✅ Delete button (ADMIN+ only, shown when editing)
- ✅ Security notice explaining sanitization

**Data Test IDs (for E2E):**
- `social-new` - New embed button
- `social-form` - Editor form
- `social-key-input` - Key input field
- `social-html-input` - HTML textarea
- `social-enabled-checkbox` - Enabled toggle
- `social-save` - Save button
- `social-delete` - Delete button
- `social-embed-{KEY}` - Individual embed in list

**UX:**
- ✅ Real-time key validation (uppercase conversion)
- ✅ Disabled key field when editing (prevents change)
- ✅ Inline help text for each field
- ✅ Yellow security notice banner
- ✅ Confirm dialog before delete
- ✅ Success/error alerts

---

## 📊 **FILES TOUCHED**

| File | Status | Lines |
|------|--------|-------|
| `packages/utils/sanitize.ts` | **Created** | 85 |
| `packages/auth/permissions.ts` | Modified | +15 |
| `apps/admin/app/api/admin/social/route.ts` | **Created** | 145 |
| `apps/admin/app/api/admin/social/[key]/route.ts` | **Created** | 215 |
| `apps/admin/app/(dashboard)/social/page.tsx` | **Created** | 365 |

**Total:** 5 files, ~825 lines added

---

## ✅ **ACCEPTANCE CRITERIA**

- [x] Sanitization utility created with strict allowlists
- [x] Key validation (uppercase, numbers, underscores)
- [x] RBAC permissions added (EDITOR create/edit, ADMIN delete)
- [x] API routes with permission checks
- [x] HTML sanitized on every save
- [x] Audit trail created for all operations
- [x] Admin UI with CRUD functionality
- [x] Data test IDs for E2E stability
- [x] Security notice displayed
- [x] Confirms before delete

---

## 🧪 **MANUAL TESTING**

### **Test 1: Create Embed**
```
1. Login as EDITOR
2. Go to /social
3. Click "New Embed"
4. Enter key: LINKEDIN_WALL
5. Paste iframe code from LinkedIn
6. Check "Enabled"
7. Click "Save"
✅ Embed created, appears in list
```

### **Test 2: Sanitization (XSS Prevention)**
```
1. Create embed with: <script>alert('XSS')</script><iframe src='...' />
2. Save
3. Edit again
✅ Script removed, only iframe remains
```

### **Test 3: Edit Embed**
```
1. Click existing embed
2. Modify HTML
3. Toggle enabled
4. Save
✅ Changes persisted
```

### **Test 4: Delete (EDITOR)**
```
1. Login as EDITOR
2. Try to delete
✅ Returns 403 Forbidden
```

### **Test 5: Delete (ADMIN)**
```
1. Login as ADMIN
2. Delete embed
3. Confirm dialog
✅ Embed deleted
```

### **Test 6: Key Validation**
```
1. Try key: "linkedin wall" (lowercase + space)
✅ Converts to "LINKEDIN_WALL" (uppercase, space removed would fail)
✅ Shows validation error for invalid characters
```

---

## 🔒 **SECURITY**

### **XSS Prevention:**
```html
Input:
<script>alert('XSS')</script>
<iframe src="javascript:alert('XSS')"></iframe>
<img onerror="alert('XSS')">
<div onclick="alert('XSS')">Click</div>

Output (after sanitization):
<!-- scripts completely removed -->
<!-- javascript: scheme blocked -->
<!-- img tag not allowed -->
<div>Click</div>  <!-- onclick removed -->
```

### **SQL Injection Prevention:**
- ✅ Prisma parameterized queries
- ✅ No raw SQL

### **RBAC Enforcement:**
- ✅ All routes check session user
- ✅ Permission required for every operation
- ✅ Returns 401 if not logged in
- ✅ Returns 403 if insufficient role

---

## 📋 **SANITIZATION ALLOWLIST**

**Allowed Tags:**
- `iframe` - For embeds
- `div`, `span`, `p`, `section`, `article` - For structure
- `a` - For links
- `blockquote` - For quotes

**Allowed Attributes:**
- `iframe`: src, width, height, frameborder, allow, allowfullscreen, title, style, class
- `a`: href, target, rel, class
- `div`: class, id, data-*, style
- `span`: class, id, data-*
- `p`, `blockquote`: class, id

**Blocked:**
- `<script>`, `<style>`, `<object>`, `<embed>`
- Event handlers: `onclick`, `onerror`, `onload`, etc.
- `javascript:` scheme
- All other tags and attributes not explicitly allowed

---

## 🎯 **USE CASES**

### **LinkedIn Company Embed:**
```html
<iframe 
  src="https://www.linkedin.com/embed/feed/update/..." 
  height="600" 
  width="500" 
  frameborder="0" 
  allowfullscreen 
  title="LinkedIn Feed">
</iframe>
```
✅ **Allowed** - Valid LinkedIn iframe

### **Twitter/X Timeline:**
```html
<a 
  class="twitter-timeline" 
  href="https://twitter.com/username">
  Tweets by @username
</a>
<script async src="https://platform.twitter.com/widgets.js"></script>
```
✅ **Partially Allowed** - Link stays, script removed  
⚠️ **Note:** Twitter widgets might not work without script

### **Malicious Attempt:**
```html
<script>
  fetch('/api/admin/posts').then(r => r.json()).then(console.log);
</script>
```
❌ **Blocked** - Script completely removed

---

## 🔄 **NEXT STEPS (PR #8)**

- Create site API route `/api/social-embed/[key]`
- Add 5-minute caching
- Update LinkedIn section component
- Render using `dangerouslySetInnerHTML` (safe because pre-sanitized)
- Hide section when disabled

---

**PR #7 Status:** ✅ **COMPLETE — READY FOR PR #8**

**Commits:**
```
feat(utils): add social embed HTML sanitization with strict allowlist
feat(auth): add social embed RBAC permissions (EDITOR+ create/edit, ADMIN+ delete)
feat(admin): add social embeds CRUD API with sanitization and audit trails
feat(admin): add social embeds management UI with security notice
```

