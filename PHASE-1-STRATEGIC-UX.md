# Phase 1: Strategic UX Overhaul - Implementation Plan

**Date**: October 21, 2024  
**Goal**: Transform admin dashboard into "Strategic Counsel Dashboard"  
**Time Estimate**: 1-2 days  
**Status**: Ready to Build

---

## 🎯 **STRATEGIC VISION**

Transform generic CMS → Professional counsel command center with:
- ✅ Smart terminology (Insights Engine, not "Blog")
- ✅ Lightweight lead capture (no over-engineering)
- ✅ Case study publishing (with confidentiality)
- ✅ AI configuration management (switchable providers)
- ✅ Clean separation (marketing only, no practice management)

---

## 📊 **NEW INFORMATION ARCHITECTURE**

```
admin.khaledaun.com
│
├── 🏠 Command Center (Dashboard)
│   ├── Quick Stats (posts, leads, case studies)
│   ├── Recent Activity
│   └── Quick Actions
│
├── 💡 Insights Engine (Blog Posts)
│   ├── All Insights (EN/AR)
│   ├── Categories & Tags
│   ├── Drafts vs Published
│   └── AI-Assisted Writing
│
├── ⚖️ Portfolio & Case Studies
│   ├── Litigation
│   ├── Arbitration
│   ├── Advisory
│   ├── Ventures
│   └── Confidentiality Toggle
│
├── 👤 Profile & Presence
│   ├── Hero Titles
│   ├── Bio (EN/AR)
│   ├── Portrait Image
│   ├── Credentials (text list)
│   ├── Addresses (Lisbon, Dubai)
│   └── Social Links
│
├── 📚 Library (Media)
│   ├── Images
│   ├── PDFs
│   ├── Usage Tracking
│   └── Optimization
│
├── 🤖 AI Assistant
│   ├── Content Generation
│   ├── Translation
│   ├── Saved Templates
│   └── **⚙️ AI Configuration** (NEW!)
│
├── 🤝 Leads & Collaborations (NEW!)
│   ├── Contact Form Leads
│   ├── Collaboration Requests
│   ├── Filter & Search
│   └── CSV Export
│
├── 📊 Performance & Reach
│   ├── Site Analytics
│   ├── Top Content
│   └── Traffic Sources
│
└── ⚙️ System Settings
    ├── Site Metadata
    ├── Language Defaults
    └── API Keys
```

---

## 🗄️ **DATABASE SCHEMA ADDITIONS**

### **1. Lead Model** (Mini-CRM Light)

```prisma
model Lead {
  id            String       @id @default(cuid())
  
  // Contact Info
  name          String
  email         String
  organization  String?
  country       String?
  
  // Intent
  interest      LeadInterest
  message       String       @db.Text
  source        LeadSource
  
  // Management
  status        LeadStatus   @default(NEW)
  tags          String[]     @default([])
  nextActionAt  DateTime?
  
  // Metadata
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  // Auto-purge after 12 months
  expiresAt     DateTime?
  
  @@index([status, createdAt])
  @@index([email])
}

enum LeadInterest {
  COLLABORATION
  SPEAKING
  REFERRAL
  PRESS
  GENERAL
}

enum LeadSource {
  CONTACT_FORM
  LINKEDIN_EMBED
  NEWSLETTER
  MANUAL
}

enum LeadStatus {
  NEW
  REPLIED
  SCHEDULED
  ARCHIVED
}
```

---

### **2. Subscriber Model** (Newsletter)

```prisma
model Subscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  source    String   @default("newsletter_signup")
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  
  @@index([email])
}
```

---

### **3. CaseStudy Model** (Portfolio)

```prisma
model CaseStudy {
  id            String        @id @default(cuid())
  
  // Classification
  type          CaseStudyType
  confidential  Boolean       @default(false)
  
  // Content (Problem → Strategy → Outcome)
  title         String
  slug          String        @unique
  problem       String        @db.Text
  strategy      String        @db.Text
  outcome       String        @db.Text
  
  // Metadata
  categories    String[]      @default([])  // ["International Arbitration", "Conflict Prevention"]
  practiceArea  String?       // "Arbitration", "Litigation", etc.
  year          Int?
  jurisdiction  String?
  
  // Publishing
  published     Boolean       @default(false)
  publishedAt   DateTime?
  
  // Timestamps
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  // Relations
  authorId      String
  author        User          @relation(fields: [authorId], references: [id])
  
  // Media
  featuredImageId String?
  featuredImage   MediaAsset?  @relation(fields: [featuredImageId], references: [id])
  
  @@index([type, published])
  @@index([slug])
}

enum CaseStudyType {
  LITIGATION
  ARBITRATION
  ADVISORY
  VENTURE
}
```

---

### **4. AIConfig Model** (AI Provider Management)

```prisma
model AIConfig {
  id          String   @id @default(cuid())
  
  // Provider Info
  provider    AIProvider
  name        String           // "OpenAI GPT-4", "Anthropic Claude 3.5"
  
  // Credentials
  apiKey      String           // Encrypted in production
  
  // Model Settings
  model       String           // "gpt-4-turbo", "claude-3-5-sonnet-20241022"
  
  // Use Cases (what this config is used for)
  useCases    AIUseCase[]      @default([])
  
  // Prompts
  systemPrompt String?         @db.Text
  
  // Status
  active      Boolean          @default(true)
  isDefault   Boolean          @default(false)
  
  // Metadata
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  @@index([provider, active])
}

enum AIProvider {
  OPENAI
  ANTHROPIC
  COHERE
  CUSTOM
}

enum AIUseCase {
  CONTENT_GENERATION
  TRANSLATION
  EMAIL_MARKETING
  SEO_OPTIMIZATION
  CONTENT_IMPROVEMENT
  URL_EXTRACTION
}
```

---

### **5. AIPromptTemplate Model** (Saved Prompts)

```prisma
model AIPromptTemplate {
  id          String   @id @default(cuid())
  
  // Template Info
  name        String           // "Arbitration Watch Digest"
  description String?          @db.Text
  category    String           // "arbitration", "conflict_prevention", "linkedin"
  
  // Prompt
  prompt      String           @db.Text
  
  // Settings
  useCase     AIUseCase
  tone        String?          // "professional", "casual", "technical"
  language    String?          // "en", "ar"
  
  // Usage
  usageCount  Int              @default(0)
  
  // Metadata
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  @@index([category])
}
```

---

### **6. Update User Model**

```prisma
model User {
  // ... existing fields ...
  
  // New relations
  leads         Lead[]        @relation("UserLeads")
  caseStudies   CaseStudy[]
}
```

---

### **7. Update Post Model** (Add categories)

```prisma
model Post {
  // ... existing fields ...
  
  // Enhanced categorization
  category      PostCategory?
  practiceArea  String[]      @default([])  // ["International Arbitration", "Conflict Prevention"]
  tags          String[]      @default([])
}

enum PostCategory {
  INSIGHT
  CASE_STUDY
  VENTURE_UPDATE
  ARBITRATION_WATCH
}
```

---

## 🎨 **UI COMPONENTS TO BUILD**

### **1. Sidebar Navigation** (NEW)

```typescript
// apps/admin/components/Sidebar.tsx

const navigation = [
  { name: 'Command Center', icon: HomeIcon, href: '/', current: true },
  { 
    name: 'Insights Engine', 
    icon: LightBulbIcon, 
    href: '/posts',
    children: [
      { name: 'All Insights', href: '/posts' },
      { name: 'New Insight', href: '/posts/new' },
      { name: 'Categories', href: '/posts/categories' },
    ]
  },
  { 
    name: 'Portfolio & Case Studies', 
    icon: BriefcaseIcon, 
    href: '/case-studies',
    children: [
      { name: 'All Cases', href: '/case-studies' },
      { name: 'New Case', href: '/case-studies/new' },
    ]
  },
  { 
    name: 'Profile & Presence', 
    icon: UserIcon, 
    href: '/profile',
    children: [
      { name: 'Hero & Bio', href: '/profile/hero' },
      { name: 'Credentials', href: '/profile/credentials' },
    ]
  },
  { name: 'Library', icon: PhotoIcon, href: '/media' },
  { 
    name: 'AI Assistant', 
    icon: SparklesIcon, 
    href: '/ai',
    children: [
      { name: 'Templates', href: '/ai/templates' },
      { name: 'Configuration', href: '/ai/config' },
      { name: 'History', href: '/ai/history' },
    ]
  },
  { name: 'Leads & Collaborations', icon: UsersIcon, href: '/leads' },
  { name: 'Performance', icon: ChartBarIcon, href: '/analytics' },
  { name: 'Settings', icon: CogIcon, href: '/settings' },
];
```

---

### **2. Leads Table** (NEW)

```typescript
// apps/admin/app/(dashboard)/leads/page.tsx

<LeadsTable 
  leads={leads}
  onFilter={handleFilter}
  onExport={exportToCSV}
  onReply={openMailto}
  onArchive={archiveLead}
/>
```

Features:
- Filter by: status, source, interest, date range
- Sort by: date, name, status
- Quick actions: Reply (mailto), Schedule (calendar link), Archive
- Bulk export to CSV
- Auto-highlight "NEW" leads
- Show "next action" reminders

---

### **3. Case Study Form** (NEW)

```typescript
// apps/admin/app/(dashboard)/case-studies/new/page.tsx

<CaseStudyForm>
  <TypeSelector options={["Litigation", "Arbitration", "Advisory", "Venture"]} />
  
  <ConfidentialToggle 
    label="Make this case anonymous"
    help="Removes client names and identifying details"
  />
  
  <Section title="Problem">
    <RichTextEditor placeholder="What was the challenge or dispute?" />
  </Section>
  
  <Section title="Strategy">
    <RichTextEditor placeholder="How did you approach it?" />
  </Section>
  
  <Section title="Outcome">
    <RichTextEditor placeholder="What was achieved?" />
  </Section>
  
  <PracticeAreaPicker />
  <CategoryTags />
  <FeaturedImagePicker />
  
  <PublishButton />
</CaseStudyForm>
```

---

### **4. AI Configuration UI** (NEW - YOUR KEY REQUEST!)

```typescript
// apps/admin/app/(dashboard)/ai/config/page.tsx

<AIConfigManager>
  {/* List of AI Providers */}
  <AIProviderList>
    <AIProviderCard 
      name="OpenAI GPT-4 Turbo"
      status="active"
      useCases={["content", "translation", "seo"]}
      onEdit={openEditModal}
    />
    <AIProviderCard 
      name="Anthropic Claude 3.5"
      status="inactive"
      useCases={["email_marketing"]}
      onEdit={openEditModal}
    />
    <AddProviderButton />
  </AIProviderList>
  
  {/* Edit Modal */}
  <AIConfigModal>
    <ProviderSelector options={["OpenAI", "Anthropic", "Cohere"]} />
    
    <APIKeyInput 
      type="password"
      placeholder="sk-proj-..."
      help="Your API key (encrypted at rest)"
    />
    
    <ModelInput 
      provider={selectedProvider}
      options={modelsByProvider[selectedProvider]}
      placeholder="gpt-4-turbo-2024-04-09"
    />
    
    <UseCaseCheckboxes 
      options={[
        "Content Generation",
        "Translation",
        "Email Marketing",
        "SEO Optimization",
        "Content Improvement"
      ]}
    />
    
    <SystemPromptEditor 
      placeholder="You are a professional legal content writer..."
      help="Override default system prompt"
    />
    
    <TestButton onClick={testConnection} />
    <SaveButton />
  </AIConfigModal>
</AIConfigManager>
```

**Features:**
- ✅ Multiple AI providers (OpenAI, Anthropic, Cohere, custom)
- ✅ Assign providers to specific use cases
- ✅ Edit prompts per provider
- ✅ Test connection before saving
- ✅ Set default provider per use case
- ✅ Track usage/cost per provider

---

### **5. AI Prompt Templates UI** (NEW)

```typescript
// apps/admin/app/(dashboard)/ai/templates/page.tsx

<PromptTemplateManager>
  <TemplateGrid>
    <TemplateCard 
      name="Arbitration Watch Digest"
      category="arbitration"
      prompt="Summarize this ICC/DIAC update in 3 key points..."
      usageCount={47}
      onUse={applyTemplate}
      onEdit={editTemplate}
    />
    <TemplateCard 
      name="Conflict Prevention Digest"
      category="conflict_prevention"
      onUse={applyTemplate}
    />
    <TemplateCard 
      name="LinkedIn Summary"
      category="linkedin"
      onUse={applyTemplate}
    />
    <NewTemplateButton />
  </TemplateGrid>
  
  {/* Template Editor */}
  <TemplateEditor>
    <NameInput />
    <CategoryInput />
    <PromptTextarea />
    <UseCaseSelector />
    <ToneSelector />
    <LanguageSelector />
    <SaveButton />
  </TemplateEditor>
</PromptTemplateManager>
```

---

### **6. Profile & Presence Page** (NEW)

```typescript
// apps/admin/app/(dashboard)/profile/page.tsx

<ProfileManager>
  <Section title="Hero Titles">
    <HeroTitlesEditor />  {/* Existing component */}
  </Section>
  
  <Section title="Biography">
    <BilingualEditor>
      <Tab label="English">
        <RichTextEditor content={bioEN} />
      </Tab>
      <Tab label="Arabic">
        <RichTextEditor content={bioAR} rtl />
      </Tab>
    </BilingualEditor>
  </Section>
  
  <Section title="Portrait">
    <ImageUploader 
      current={portraitImage}
      aspectRatio="1:1"
      maxSize="2MB"
    />
  </Section>
  
  <Section title="Credentials">
    <TextareaList 
      placeholder="Bar Association of Portugal
Dubai International Arbitration Centre (DIAC) Panel
Certified Mediator - ICC"
      help="One credential per line"
    />
  </Section>
  
  <Section title="Addresses">
    <AddressManager>
      <Address city="Lisbon" country="Portugal" />
      <Address city="Dubai" country="UAE" />
    </AddressManager>
  </Section>
  
  <Section title="Social Links">
    <LinkManager 
      links={["LinkedIn", "Email", "WhatsApp"]}
    />
  </Section>
  
  <PublishButton label="Update Public Profile" />
</ProfileManager>
```

---

## 🔌 **API ENDPOINTS TO BUILD**

### **Leads API**

```typescript
// GET /api/admin/leads
// - Filter: ?status=NEW&source=CONTACT_FORM&interest=COLLABORATION
// - Sort: ?sort=createdAt&order=desc
// - Pagination: ?page=1&limit=50
// - Search: ?q=company+name

// POST /api/admin/leads
// - Create lead from contact form
// - Rate limiting: 10/hour per IP
// - Email validation
// - Auto-set expiresAt (12 months)

// PUT /api/admin/leads/:id
// - Update status, tags, nextActionAt
// - Admin only

// GET /api/admin/leads/export
// - Export to CSV
// - Apply current filters
```

---

### **Case Studies API**

```typescript
// GET /api/admin/case-studies
// - Filter: ?type=ARBITRATION&confidential=false&published=true

// POST /api/admin/case-studies
// - Create case study

// PUT /api/admin/case-studies/:id
// - Update case study

// POST /api/admin/case-studies/:id/publish
// - Publish + revalidate /cases/[slug]

// DELETE /api/admin/case-studies/:id
// - Soft delete
```

---

### **AI Config API**

```typescript
// GET /api/admin/ai/config
// - List all AI providers
// - Show active/default status

// POST /api/admin/ai/config
// - Add new AI provider
// - Encrypt API key

// PUT /api/admin/ai/config/:id
// - Update provider settings
// - Test connection

// DELETE /api/admin/ai/config/:id
// - Remove provider (if not default)

// POST /api/admin/ai/config/:id/test
// - Test connection with sample request
// - Return success/error + latency
```

---

### **AI Templates API**

```typescript
// GET /api/admin/ai/templates
// - List all saved templates
// - Filter by category

// POST /api/admin/ai/templates
// - Create new template

// PUT /api/admin/ai/templates/:id
// - Update template
// - Increment usageCount when used

// DELETE /api/admin/ai/templates/:id
// - Delete template
```

---

### **Update AI Generation API**

```typescript
// POST /api/admin/ai/generate
// NOW: Select AI provider from dropdown
// BEFORE: Hard-coded to OpenAI

const handler = async (req: NextRequest) => {
  const { type, content, aiConfigId } = await req.json();
  
  // Get AI config
  const aiConfig = await prisma.aiConfig.findUnique({
    where: { id: aiConfigId || getDefaultForUseCase(type) }
  });
  
  // Use configured provider
  const result = await generateWithProvider(aiConfig, content);
  
  return result;
};
```

---

## 🔒 **SECURITY & GUARDRAILS**

### **1. No Financial Data**
- ❌ No retainer tracking
- ❌ No billing fields
- ❌ No payment info
- ✅ Only public-facing content

### **2. Auto-Purge Leads**
```typescript
// Cron job (daily)
const purgeOldLeads = async () => {
  await prisma.lead.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
      tags: { notHas: "keep" }
    }
  });
};
```

### **3. Audit Log**
```typescript
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // "PUBLISH_POST", "EDIT_CASE_STUDY", "CREATE_LEAD"
  resource  String   // "Post", "CaseStudy", "Lead"
  resourceId String
  changes   Json?
  createdAt DateTime @default(now())
  
  @@index([userId, createdAt])
  @@index([resource, resourceId])
}
```

### **4. API Key Encryption**
```typescript
// Store AI keys encrypted
import { encrypt, decrypt } from '@/lib/crypto';

const saveAPIKey = async (key: string) => {
  const encrypted = encrypt(key);
  await prisma.aiConfig.update({ data: { apiKey: encrypted } });
};

const getAPIKey = async (configId: string) => {
  const config = await prisma.aiConfig.findUnique({ where: { id: configId } });
  return decrypt(config.apiKey);
};
```

### **5. Rate Limiting**
```typescript
// Contact form: 10 submissions/hour per IP
// AI generation: 50 requests/hour per user
```

---

## 📱 **PUBLIC SITE CONNECTIONS**

### **Contact Form → Leads**

```typescript
// apps/site/app/[locale]/contact/page.tsx

const handleSubmit = async (data: ContactFormData) => {
  await fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      organization: data.company,
      country: data.country,
      interest: data.interest,
      message: data.message,
      source: 'CONTACT_FORM'
    })
  });
  
  // Show success message
  setSuccess("Thank you! I'll respond within 24 hours.");
};
```

---

### **Case Studies → Public Pages**

```typescript
// apps/site/app/[locale]/cases/[slug]/page.tsx

export default async function CaseStudyPage({ params }) {
  const caseStudy = await prisma.caseStudy.findUnique({
    where: { 
      slug: params.slug,
      published: true,
      // Show anonymized if confidential
    }
  });
  
  return (
    <article>
      <h1>{caseStudy.title}</h1>
      <Badge>{caseStudy.type}</Badge>
      
      <Section title="The Challenge">
        {caseStudy.problem}
      </Section>
      
      <Section title="Our Approach">
        {caseStudy.strategy}
      </Section>
      
      <Section title="The Outcome">
        {caseStudy.outcome}
      </Section>
      
      <Categories items={caseStudy.categories} />
    </article>
  );
}
```

---

### **Profile → About Page**

```typescript
// apps/site/app/[locale]/about/page.tsx

export default async function AboutPage({ params }) {
  const profile = await getProfile(params.locale);
  
  return (
    <>
      <Hero titles={profile.heroTitles} />
      
      <Bio content={profile.bio[params.locale]} />
      
      <Portrait src={profile.portraitUrl} />
      
      <Credentials items={profile.credentials} />
      
      <Addresses locations={profile.addresses} />
      
      <Experiences items={profile.experiences} />
      
      <CTAButton>Collaborate with Us</CTAButton>
    </>
  );
}
```

---

## 🎯 **IMPLEMENTATION SEQUENCE**

### **Step 1: Database Migration** (30 min)
1. Add all new models to `schema.prisma`
2. Run `npx prisma db push`
3. Test in Prisma Studio

### **Step 2: Sidebar Navigation** (1 hour)
1. Create `components/Sidebar.tsx`
2. Update `app/(dashboard)/layout.tsx`
3. Add Heroicons
4. Make responsive (collapsible on mobile)

### **Step 3: Leads Module** (3 hours)
1. Build Leads API (`/api/admin/leads`)
2. Create LeadsTable component
3. Add filters, search, CSV export
4. Connect contact form
5. Test rate limiting

### **Step 4: Case Studies** (3 hours)
1. Build Case Study API
2. Create CaseStudyForm component
3. Add Problem/Strategy/Outcome editors
4. Build public case study pages
5. Test publish → revalidate

### **Step 5: AI Configuration** (4 hours)
1. Build AI Config API
2. Create AIConfigManager UI
3. Add encryption for API keys
4. Update AI generation to use configs
5. Test with multiple providers

### **Step 6: AI Templates** (2 hours)
1. Build Templates API
2. Create PromptTemplateManager UI
3. Add pre-built templates
4. Integrate with AI Assistant

### **Step 7: Profile & Presence** (2 hours)
1. Create ProfileManager page
2. Combine existing Hero components
3. Add bio, credentials, addresses
4. Update public About page

### **Step 8: Rename & Polish** (1 hour)
1. Rename all sections
2. Update navigation labels
3. Add breadcrumbs
4. Test all flows

**Total Time: ~16 hours (~2 days)**

---

## ✅ **ACCEPTANCE CRITERIA**

### **Must Have:**
- [x] Sidebar navigation with all sections
- [x] Leads table with filters + CSV export
- [x] Contact form creates leads
- [x] Case study CRUD with Problem/Strategy/Outcome
- [x] AI config UI (add/edit providers, models, prompts)
- [x] AI template manager (saved prompts)
- [x] Profile & Presence page
- [x] Public case study pages
- [x] Auto-purge old leads (12 months)
- [x] API key encryption
- [x] Rate limiting on public endpoints

### **Nice to Have:**
- [ ] Bulk lead actions
- [ ] Lead export to email marketing tool
- [ ] Case study templates by type
- [ ] AI cost tracking per provider
- [ ] Audit log UI

---

## 🚀 **DEPLOYMENT STRATEGY**

### **Option 1: Deploy Current First, Then Add (RECOMMENDED)**
1. **Today:** Deploy Phase 6.5 + 7 (media + AI)
2. **Test:** Use in production for 1 day
3. **Tomorrow:** Build Phase 1 Strategic UX
4. **Deploy:** Push as v0.8.0

**Pros:**
- Get current features live NOW
- Test before adding more
- Iterative, safe approach

### **Option 2: Build Everything First**
1. **Today + Tomorrow:** Build all Phase 1 features
2. **Day 3:** Deploy everything together

**Pros:**
- One big launch
- Complete vision

**Cons:**
- Delays going live by 2 days
- More can go wrong

---

## 🤔 **YOUR DECISION**

Which approach do you prefer?

**A)** Deploy current Phase 6.5 + 7 NOW, build Strategic UX tomorrow  
*("Ship fast, iterate smart")*

**B)** Build all Strategic UX features first, deploy everything together  
*("One complete launch")*

**C)** Build JUST the AI Configuration UI today, deploy with current features  
*("Prioritize what you need most")*

**What feels right?** 🎯

