# Sprint 2: Technical Specification & Implementation Guide

**Version**: 1.0  
**Date**: October 28, 2024  
**Status**: 🟢 READY TO IMPLEMENT  
**Estimated Duration**: 40-48 hours (5-6 days)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Component Specifications](#component-specifications)
4. [API Endpoints](#api-endpoints)
5. [Database Schema Updates](#database-schema-updates)
6. [SEO Analysis Engine](#seo-analysis-engine)
7. [AIO Optimization Engine](#aio-optimization-engine)
8. [UI Components](#ui-components)
9. [Implementation Phases](#implementation-phases)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting](#troubleshooting)

---

## Executive Summary

### Goal
Transform Sprint 1's backend infrastructure into a **fully functional content management system** with integrated **SEO and AI Optimization** capabilities.

### Current State (Sprint 1 Complete)
✅ Database tables created (topics, content_library, media_library)  
✅ CRUD API endpoints operational  
✅ Prisma integration working  
✅ Authentication & RBAC in place  
✅ Skeleton UI pages exist but are non-functional  

### Target State (Sprint 2 Complete)
✅ Fully functional admin UI for all features  
✅ Rich text editor for content creation  
✅ Drag & drop media uploads  
✅ Real-time SEO analysis (0-100 score)  
✅ Real-time AIO optimization (0-100 score)  
✅ Pre-publish checklists  
✅ Dashboard with analytics  
✅ Complete workflow: Topic → Content → Media → SEO → Publish  

### Key Features
1. **Topic Queue Management** - Full CRUD with UI
2. **Content Library** - Rich editor with SEO/AIO panels
3. **Media Library** - Upload, organize, optimize
4. **SEO Analysis** - Real-time scoring and suggestions
5. **AIO Optimization** - AI search engine optimization
6. **Dashboard** - Analytics and quick actions

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Topic Queue  │  │Content Editor│  │Media Library │      │
│  │     UI       │  │   + SEO/AIO  │  │      UI      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│              Next.js Admin Application                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Components Layer                   │   │
│  │  • Forms  • Tables  • Editors  • Dashboards          │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │           Client-Side Analysis Layer                  │   │
│  │  • SEO Analyzer  • AIO Optimizer  • Real-time Checks │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │              API Routes Layer                         │   │
│  │  /api/topics  /api/content-library  /api/media       │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼───────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────┐
│                 Prisma ORM Layer                          │
│  • Type-safe queries  • Migrations  • Schema validation  │
└───────────────────────┬───────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────┐
│          Supabase PostgreSQL Database                     │
│  • topics  • content_library  • media_library            │
│  • Row-Level Security  • Realtime subscriptions          │
└───────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**:
- Next.js 14.2.33 (React 18, App Router)
- TailwindCSS 3.4 (Styling)
- Headless UI (Components)
- TipTap 2.1 (Rich text editor)
- TanStack Table 8.10 (Data tables)
- React Hook Form 7.48 (Forms)
- React Dropzone 14.2 (File uploads)
- Recharts 2.10 (Charts)

**Backend**:
- Next.js API Routes (Serverless)
- Prisma 5.22 (ORM)
- Supabase (Database + Storage)

**Analysis Engines**:
- Custom SEO Analyzer (TypeScript)
- Custom AIO Optimizer (TypeScript)
- Readability algorithms (Flesch-Kincaid)
- NLP libraries (compromise.js)

---

## Component Specifications

### 1. Topic Queue Management

#### File Structure
```
apps/admin/app/(dashboard)/topics/
├── page.tsx                    # List all topics
├── new/page.tsx               # Create new topic
└── [id]/page.tsx              # Edit topic

apps/admin/components/topics/
├── TopicList.tsx              # Main list component
├── TopicForm.tsx              # Create/edit form
├── TopicCard.tsx              # Individual topic card
├── TopicFilters.tsx           # Filter sidebar
├── TopicActions.tsx           # Action menu
└── TopicStatusBadge.tsx       # Status indicator
```

#### TopicList Component
```typescript
// apps/admin/components/topics/TopicList.tsx
import { useTopics } from '@/lib/hooks/useTopics';
import { DataTable } from '@/components/shared/DataTable';

interface Topic {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  keywords: string[];
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function TopicList() {
  const { topics, loading, error, deleteTopic, updateStatus } = useTopics();

  const columns = [
    { header: 'Title', accessor: 'title', sortable: true },
    { header: 'Status', accessor: 'status', sortable: true },
    { header: 'Priority', accessor: 'priority', sortable: true },
    { header: 'Keywords', accessor: 'keywords', cell: (row) => row.keywords.join(', ') },
    { header: 'Created', accessor: 'createdAt', sortable: true },
    { header: 'Actions', accessor: 'actions', cell: (row) => <TopicActions topic={row} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Topic Queue</h1>
        <Link href="/topics/new">
          <Button>+ New Topic</Button>
        </Link>
      </div>
      
      <TopicFilters />
      
      <DataTable
        columns={columns}
        data={topics}
        loading={loading}
        error={error}
        onRowClick={(topic) => router.push(`/topics/${topic.id}`)}
      />
    </div>
  );
}
```

#### TopicForm Component
```typescript
// apps/admin/components/topics/TopicForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const topicSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  sourceType: z.enum(['manual', 'rss', 'api', 'scrape']).default('manual'),
  keywords: z.array(z.string()),
  priority: z.number().min(0).max(10).default(0),
  userNotes: z.string().optional(),
});

type TopicFormData = z.infer<typeof topicSchema>;

export function TopicForm({ topic, onSubmit }: TopicFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: topic,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput
        label="Title"
        {...register('title')}
        error={errors.title?.message}
        required
      />
      
      <FormTextarea
        label="Description"
        {...register('description')}
        rows={4}
      />
      
      <FormInput
        label="Source URL"
        type="url"
        {...register('sourceUrl')}
        error={errors.sourceUrl?.message}
      />
      
      <KeywordInput
        label="Keywords"
        {...register('keywords')}
      />
      
      <FormSelect
        label="Priority"
        {...register('priority')}
        options={[
          { value: 0, label: 'Low' },
          { value: 5, label: 'Medium' },
          { value: 10, label: 'High' },
        ]}
      />
      
      <div className="flex gap-2">
        <Button type="submit" variant="primary">Save Topic</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
```

---

### 2. Content Library with SEO/AIO

#### File Structure
```
apps/admin/app/(dashboard)/content/
├── library/page.tsx           # List all content
├── new/page.tsx              # Create new content
└── [id]/
    ├── page.tsx              # Edit content
    └── preview/page.tsx      # Preview content

apps/admin/components/content/
├── ContentList.tsx           # Main list
├── ContentForm.tsx           # Form wrapper
├── ContentEditor.tsx         # TipTap editor
├── ContentPreview.tsx        # Preview component
├── ContentSEOPanel.tsx       # SEO analysis sidebar
├── ContentAIOPanel.tsx       # AIO optimization sidebar
├── ContentMetadata.tsx       # Meta tags editor
└── PrePublishChecklist.tsx   # Publish validation
```

#### ContentEditor Component
```typescript
// apps/admin/components/content/ContentEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useSEOAnalysis } from '@/lib/hooks/useSEOAnalysis';
import { useAIOAnalysis } from '@/lib/hooks/useAIOAnalysis';

export function ContentEditor({ content, onChange }: ContentEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: content.content,
    onUpdate: ({ editor }) => {
      onChange({ ...content, content: editor.getHTML() });
    },
  });

  const seoAnalysis = useSEOAnalysis(content);
  const aioAnalysis = useAIOAnalysis(content);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main Editor */}
      <div className="col-span-8 space-y-4">
        <FormInput
          label="Title"
          value={content.title}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          required
        />
        
        <FormInput
          label="Slug"
          value={content.slug}
          onChange={(e) => onChange({ ...content, slug: e.target.value })}
          helper={`URL: /blog/${content.slug}`}
        />
        
        <div className="border rounded-lg p-4">
          <label className="block text-sm font-medium mb-2">Content</label>
          <EditorContent editor={editor} className="prose max-w-none" />
        </div>
        
        <FormTextarea
          label="Excerpt"
          value={content.excerpt}
          onChange={(e) => onChange({ ...content, excerpt: e.target.value })}
          rows={3}
        />
        
        <FormInput
          label="Featured Image"
          value={content.featuredImageId}
          readOnly
          rightIcon={<MediaPickerButton onSelect={(id) => onChange({ ...content, featuredImageId: id })} />}
        />
      </div>
      
      {/* SEO/AIO Sidebar */}
      <div className="col-span-4 space-y-4">
        <ContentSEOPanel analysis={seoAnalysis} content={content} onChange={onChange} />
        <ContentAIOPanel analysis={aioAnalysis} content={content} onChange={onChange} />
      </div>
    </div>
  );
}
```

#### ContentSEOPanel Component
```typescript
// apps/admin/components/content/ContentSEOPanel.tsx
export function ContentSEOPanel({ analysis, content, onChange }: SEOPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      {/* SEO Score */}
      <div className="text-center">
        <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
          {analysis.score}/100
        </div>
        <div className="text-sm text-gray-600 mt-1">SEO Score</div>
      </div>
      
      {/* Issues */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Issues</h3>
        {analysis.issues.map((issue, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className={issue.severity === 'error' ? '❌' : '⚠️'}>{issue.message}</span>
            {issue.fix && (
              <button
                onClick={() => applyFix(issue)}
                className="text-blue-600 hover:underline text-xs"
              >
                Fix
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Strengths</h3>
          {analysis.strengths.map((strength, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-green-600">
              ✅ {strength}
            </div>
          ))}
        </div>
      )}
      
      {/* Meta Fields */}
      <div className="space-y-3 pt-3 border-t">
        <FormInput
          label="Meta Title"
          value={content.seoTitle || content.title}
          onChange={(e) => onChange({ ...content, seoTitle: e.target.value })}
          helper={`${(content.seoTitle || content.title).length}/60 characters`}
        />
        
        <FormTextarea
          label="Meta Description"
          value={content.seoDescription}
          onChange={(e) => onChange({ ...content, seoDescription: e.target.value })}
          rows={3}
          helper={`${(content.seoDescription || '').length}/160 characters`}
        />
        
        <KeywordInput
          label="Focus Keywords"
          value={content.keywords}
          onChange={(keywords) => onChange({ ...content, keywords })}
        />
      </div>
      
      {/* Readability */}
      <div className="pt-3 border-t">
        <h3 className="font-semibold text-sm mb-2">Readability</h3>
        <div className="space-y-1 text-sm">
          <div>Grade: {analysis.readability.grade}</div>
          <div>Reading Time: {analysis.readability.readingTime} min</div>
          <div>Word Count: {analysis.readability.wordCount}</div>
        </div>
      </div>
    </div>
  );
}
```

#### ContentAIOPanel Component
```typescript
// apps/admin/components/content/ContentAIOPanel.tsx
export function ContentAIOPanel({ analysis, content, onChange }: AIOPanelProps) {
  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      {/* AIO Score */}
      <div className="text-center">
        <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
          {analysis.score}/100
        </div>
        <div className="text-sm text-gray-600 mt-1">AIO Score</div>
      </div>
      
      {/* ChatGPT Optimization */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          🤖 ChatGPT Optimization
        </h3>
        <div className="space-y-1 text-sm">
          <ProgressBar
            label="Citation Quality"
            value={analysis.chatGPTOptimization.citationQuality}
          />
          <ProgressBar
            label="Fact Density"
            value={analysis.chatGPTOptimization.factDensity}
          />
          <div className="flex items-center gap-2">
            {analysis.chatGPTOptimization.structuredData ? '✅' : '❌'}
            <span>Structured Data</span>
          </div>
        </div>
      </div>
      
      {/* Perplexity Optimization */}
      <div className="space-y-2 pt-3 border-t">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          🔍 Perplexity Optimization
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            {analysis.perplexityOptimization.questionAnswerFormat ? '✅' : '❌'}
            <span>Q&A Format</span>
          </div>
          <div>Fact Boxes: {analysis.perplexityOptimization.factBoxes}</div>
          <div>Sources: {analysis.perplexityOptimization.sources}</div>
        </div>
      </div>
      
      {/* Google SGE Optimization */}
      <div className="space-y-2 pt-3 border-t">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          🔵 Google SGE
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            {analysis.googleSGEOptimization.keyTakeaways ? '✅' : '❌'}
            <span>Key Takeaways</span>
          </div>
          <div className="flex items-center gap-2">
            {analysis.googleSGEOptimization.bulletSummaries ? '✅' : '❌'}
            <span>Bullet Summaries</span>
          </div>
          <div>Expert Quotes: {analysis.googleSGEOptimization.expertQuotes}</div>
        </div>
      </div>
      
      {/* Schema Markup */}
      <div className="pt-3 border-t">
        <h3 className="font-semibold text-sm mb-2">Schema Markup</h3>
        <select
          className="w-full border rounded px-3 py-2 text-sm"
          value={content.schemaType}
          onChange={(e) => onChange({ ...content, schemaType: e.target.value })}
        >
          <option value="">None</option>
          <option value="Article">Article</option>
          <option value="BlogPosting">Blog Posting</option>
          <option value="FAQ">FAQ</option>
          <option value="HowTo">How-To</option>
        </select>
        {content.schemaType && (
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={() => generateSchemaMarkup(content)}
          >
            Generate Schema
          </Button>
        )}
      </div>
      
      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="pt-3 border-t">
          <h3 className="font-semibold text-sm mb-2">Recommendations</h3>
          <ul className="space-y-1 text-sm">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-600">💡</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

### 3. Media Library

#### File Structure
```
apps/admin/app/(dashboard)/media/
├── page.tsx                   # Media library grid
└── upload/page.tsx           # Upload page

apps/admin/components/media/
├── MediaGrid.tsx             # Grid view
├── MediaUpload.tsx           # Drag & drop upload
├── MediaCard.tsx             # Individual media card
├── MediaEditor.tsx           # Edit metadata modal
├── MediaPicker.tsx           # Select media modal
└── MediaFolders.tsx          # Folder navigation
```

#### MediaUpload Component
```typescript
// apps/admin/components/media/MediaUpload.tsx
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';

export function MediaUpload({ onUploadComplete }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (files) => {
      setUploading(true);
      
      for (const file of files) {
        try {
          // Upload to Supabase Storage
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/media-library/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) throw new Error('Upload failed');
          
          const { media } = await response.json();
          onUploadComplete(media);
          
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      setUploading(false);
      setProgress(0);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${uploading ? 'pointer-events-none opacity-50' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      {uploading ? (
        <div className="space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p>Uploading... {progress}%</p>
        </div>
      ) : (
        <>
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
          </p>
          <p className="text-xs text-gray-500">
            Images, videos, PDFs up to 10MB
          </p>
        </>
      )}
    </div>
  );
}
```

#### MediaCard Component
```typescript
// apps/admin/components/media/MediaCard.tsx
export function MediaCard({ media, onEdit, onDelete, onSelect }: MediaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <div className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-100 relative">
        {media.type === 'image' ? (
          <img
            src={media.thumbnailUrl || media.url}
            alt={media.altText || media.filename}
            className="w-full h-full object-cover"
          />
        ) : media.type === 'video' ? (
          <video src={media.url} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <DocumentIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button size="sm" onClick={() => onSelect(media)}>
            Select
          </Button>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium truncate">{media.originalFilename}</p>
        <p className="text-xs text-gray-500">
          {formatBytes(media.sizeBytes)} • {formatDate(media.createdAt)}
        </p>
        
        {/* Tags */}
        {media.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {media.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {media.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{media.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="absolute top-2 right-2">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              <DotsVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onEdit(media)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(media.url)}>
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(media.url, '_blank')}>
              View Full Size
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(media)} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
```

---

## SEO Analysis Engine

### File: `packages/utils/seo-analyzer.ts`

```typescript
/**
 * SEO Analysis Engine
 * Analyzes content and provides SEO scores and recommendations
 */

export interface SEOAnalysis {
  score: number; // 0-100
  issues: SEOIssue[];
  warnings: SEOWarning[];
  recommendations: string[];
  strengths: string[];
  readability: ReadabilityScore;
  keywords: KeywordAnalysis[];
  headings: HeadingAnalysis;
  meta: MetaAnalysis;
}

export interface SEOIssue {
  type: 'meta_title' | 'meta_description' | 'keywords' | 'headings' | 'images' | 'links' | 'content';
  severity: 'error' | 'warning' | 'info';
  message: string;
  fix?: string;
  impact: number; // How much this affects the score
}

export interface ReadabilityScore {
  fleschKincaid: number;
  grade: string;
  readingTime: number;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
}

export interface KeywordAnalysis {
  keyword: string;
  count: number;
  density: number; // Percentage
  optimal: boolean;
  positions: number[]; // Where the keyword appears
}

export interface HeadingAnalysis {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  structure: 'excellent' | 'good' | 'poor';
  issues: string[];
}

export interface MetaAnalysis {
  titleLength: number;
  titleOptimal: boolean;
  descriptionLength: number;
  descriptionOptimal: boolean;
  hasKeywordInTitle: boolean;
  hasKeywordInDescription: boolean;
}

/**
 * Main SEO analysis function
 */
export function analyzeSEO(content: {
  title: string;
  description?: string;
  content: string;
  keywords: string[];
  slug: string;
  excerpt?: string;
}): SEOAnalysis {
  const issues: SEOIssue[] = [];
  const warnings: SEOWarning[] = [];
  const recommendations: string[] = [];
  const strengths: string[] = [];
  
  let score = 100; // Start with perfect score and deduct points
  
  // 1. Analyze Meta Title (15 points)
  const metaTitle = content.title;
  if (!metaTitle) {
    issues.push({
      type: 'meta_title',
      severity: 'error',
      message: 'Meta title is missing',
      impact: 15,
    });
    score -= 15;
  } else if (metaTitle.length < 30) {
    issues.push({
      type: 'meta_title',
      severity: 'warning',
      message: 'Meta title is too short (< 30 characters)',
      fix: 'Expand title to 50-60 characters',
      impact: 5,
    });
    score -= 5;
  } else if (metaTitle.length > 60) {
    issues.push({
      type: 'meta_title',
      severity: 'warning',
      message: 'Meta title is too long (> 60 characters)',
      fix: 'Shorten title to 50-60 characters',
      impact: 5,
    });
    score -= 5;
  } else {
    strengths.push('Meta title length is optimal (30-60 characters)');
  }
  
  // Check if primary keyword is in title
  const primaryKeyword = content.keywords[0];
  if (primaryKeyword && !metaTitle.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    issues.push({
      type: 'meta_title',
      severity: 'warning',
      message: `Primary keyword "${primaryKeyword}" not in title`,
      impact: 5,
    });
    score -= 5;
  } else if (primaryKeyword) {
    strengths.push('Primary keyword appears in title');
  }
  
  // 2. Analyze Meta Description (10 points)
  const metaDescription = content.description || content.excerpt || '';
  if (!metaDescription) {
    issues.push({
      type: 'meta_description',
      severity: 'error',
      message: 'Meta description is missing',
      impact: 10,
    });
    score -= 10;
  } else if (metaDescription.length < 120) {
    issues.push({
      type: 'meta_description',
      severity: 'warning',
      message: 'Meta description is too short (< 120 characters)',
      fix: 'Expand description to 150-160 characters',
      impact: 5,
    });
    score -= 5;
  } else if (metaDescription.length > 160) {
    issues.push({
      type: 'meta_description',
      severity: 'info',
      message: 'Meta description is too long (> 160 characters)',
      fix: 'Shorten description to 150-160 characters',
      impact: 3,
    });
    score -= 3;
  } else {
    strengths.push('Meta description length is optimal (120-160 characters)');
  }
  
  // 3. Analyze Content Length (10 points)
  const plainText = stripHtml(content.content);
  const wordCount = countWords(plainText);
  if (wordCount < 300) {
    issues.push({
      type: 'content',
      severity: 'error',
      message: `Content is too short (${wordCount} words, recommended 800+)`,
      impact: 10,
    });
    score -= 10;
  } else if (wordCount < 800) {
    issues.push({
      type: 'content',
      severity: 'warning',
      message: `Content could be longer (${wordCount} words, recommended 800+)`,
      impact: 5,
    });
    score -= 5;
  } else {
    strengths.push(`Good content length (${wordCount} words)`);
  }
  
  // 4. Analyze Heading Structure (15 points)
  const headings = analyzeHeadings(content.content);
  if (headings.h1Count === 0) {
    issues.push({
      type: 'headings',
      severity: 'error',
      message: 'No H1 heading found',
      impact: 8,
    });
    score -= 8;
  } else if (headings.h1Count > 1) {
    issues.push({
      type: 'headings',
      severity: 'warning',
      message: `Multiple H1 headings found (${headings.h1Count})`,
      fix: 'Use only one H1 heading per page',
      impact: 5,
    });
    score -= 5;
  } else {
    strengths.push('Proper H1 usage (exactly one H1)');
  }
  
  if (headings.h2Count === 0) {
    issues.push({
      type: 'headings',
      severity: 'warning',
      message: 'No H2 headings found',
      fix: 'Add H2 headings to structure your content',
      impact: 4,
    });
    score -= 4;
  } else if (headings.h2Count >= 2) {
    strengths.push(`Good use of H2 headings (${headings.h2Count})`);
  }
  
  // 5. Analyze Keyword Density (15 points)
  const keywordAnalysis = analyzeKeywordDensity(plainText, content.keywords);
  keywordAnalysis.forEach((kw) => {
    if (kw.density < 0.5) {
      issues.push({
        type: 'keywords',
        severity: 'warning',
        message: `Keyword "${kw.keyword}" density too low (${kw.density.toFixed(1)}%, recommended 1-2%)`,
        impact: 3,
      });
      score -= 3;
    } else if (kw.density > 3) {
      issues.push({
        type: 'keywords',
        severity: 'warning',
        message: `Keyword "${kw.keyword}" density too high (${kw.density.toFixed(1)}%, recommended 1-2%)`,
        fix: 'Reduce keyword usage to avoid over-optimization',
        impact: 3,
      });
      score -= 3;
    } else {
      strengths.push(`Good keyword density for "${kw.keyword}" (${kw.density.toFixed(1)}%)`);
    }
  });
  
  // 6. Analyze Images (10 points)
  const images = extractImages(content.content);
  const imagesWithoutAlt = images.filter((img) => !img.alt || img.alt.trim() === '');
  if (images.length > 0 && imagesWithoutAlt.length > 0) {
    issues.push({
      type: 'images',
      severity: 'warning',
      message: `${imagesWithoutAlt.length} image(s) without alt text`,
      fix: 'Add descriptive alt text to all images',
      impact: 5,
    });
    score -= 5;
  } else if (images.length > 0) {
    strengths.push('All images have alt text');
  }
  
  // 7. Analyze Internal Links (10 points)
  const links = extractLinks(content.content);
  const internalLinks = links.filter((link) => link.internal);
  if (internalLinks.length === 0) {
    issues.push({
      type: 'links',
      severity: 'info',
      message: 'No internal links found',
      fix: 'Add 2-3 internal links to related content',
      impact: 5,
    });
    score -= 5;
  } else if (internalLinks.length >= 2) {
    strengths.push(`Good internal linking (${internalLinks.length} links)`);
  }
  
  // 8. Analyze Readability (10 points)
  const readability = analyzeReadability(plainText);
  if (readability.fleschKincaid < 60) {
    issues.push({
      type: 'content',
      severity: 'info',
      message: `Content is difficult to read (score: ${readability.fleschKincaid}/100)`,
      fix: 'Simplify sentences and use shorter words',
      impact: 5,
    });
    score -= 5;
  } else if (readability.fleschKincaid >= 70) {
    strengths.push(`Excellent readability (score: ${readability.fleschKincaid}/100)`);
  }
  
  // 9. Analyze URL/Slug (5 points)
  if (!content.slug || content.slug.length === 0) {
    issues.push({
      type: 'meta_title',
      severity: 'error',
      message: 'URL slug is missing',
      impact: 5,
    });
    score -= 5;
  } else if (content.slug.length > 75) {
    issues.push({
      type: 'meta_title',
      severity: 'info',
      message: 'URL slug is too long',
      fix: 'Keep URL slug under 75 characters',
      impact: 2,
    });
    score -= 2;
  } else if (primaryKeyword && content.slug.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    strengths.push('Primary keyword in URL slug');
  }
  
  // Ensure score doesn't go below 0
  score = Math.max(0, Math.min(100, score));
  
  // Generate recommendations
  if (score < 80) {
    recommendations.push('Focus on addressing high-impact issues first');
  }
  if (wordCount < 800) {
    recommendations.push('Expand content to at least 800 words');
  }
  if (internalLinks.length < 2) {
    recommendations.push('Add 2-3 internal links to related content');
  }
  if (images.length === 0) {
    recommendations.push('Add relevant images to improve engagement');
  }
  
  return {
    score,
    issues,
    warnings,
    recommendations,
    strengths,
    readability,
    keywords: keywordAnalysis,
    headings,
    meta: {
      titleLength: metaTitle.length,
      titleOptimal: metaTitle.length >= 30 && metaTitle.length <= 60,
      descriptionLength: metaDescription.length,
      descriptionOptimal: metaDescription.length >= 120 && metaDescription.length <= 160,
      hasKeywordInTitle: primaryKeyword ? metaTitle.toLowerCase().includes(primaryKeyword.toLowerCase()) : false,
      hasKeywordInDescription: primaryKeyword ? metaDescription.toLowerCase().includes(primaryKeyword.toLowerCase()) : false,
    },
  };
}

/**
 * Analyze readability using Flesch-Kincaid algorithm
 */
export function analyzeReadability(text: string): ReadabilityScore {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  const sentenceCount = sentences.length;
  const wordCount = words.length;
  const syllableCount = syllables;
  
  // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
  const fleschKincaid = 206.835
    - 1.015 * (wordCount / sentenceCount)
    - 84.6 * (syllableCount / wordCount);
  
  let grade = 'Unknown';
  if (fleschKincaid >= 90) grade = 'Very Easy (5th grade)';
  else if (fleschKincaid >= 80) grade = 'Easy (6th grade)';
  else if (fleschKincaid >= 70) grade = 'Fairly Easy (7th grade)';
  else if (fleschKincaid >= 60) grade = 'Standard (8th-9th grade)';
  else if (fleschKincaid >= 50) grade = 'Fairly Difficult (10th-12th grade)';
  else if (fleschKincaid >= 30) grade = 'Difficult (College)';
  else grade = 'Very Difficult (College graduate)';
  
  return {
    fleschKincaid: Math.round(fleschKincaid),
    grade,
    readingTime: Math.ceil(wordCount / 200), // Assuming 200 words per minute
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(wordCount / sentenceCount),
  };
}

/**
 * Analyze keyword density
 */
export function analyzeKeywordDensity(text: string, keywords: string[]): KeywordAnalysis[] {
  const lowercaseText = text.toLowerCase();
  const wordCount = countWords(text);
  
  return keywords.map((keyword) => {
    const lowercaseKeyword = keyword.toLowerCase();
    const regex = new RegExp(`\\b${escapeRegex(lowercaseKeyword)}\\b`, 'gi');
    const matches = lowercaseText.match(regex) || [];
    const count = matches.length;
    const density = (count / wordCount) * 100;
    const optimal = density >= 0.5 && density <= 3;
    
    // Find positions
    const positions: number[] = [];
    let match;
    while ((match = regex.exec(lowercaseText)) !== null) {
      positions.push(match.index);
    }
    
    return {
      keyword,
      count,
      density,
      optimal,
      positions,
    };
  });
}

/**
 * Analyze heading structure
 */
export function analyzeHeadings(html: string): HeadingAnalysis {
  const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>.*?<\/h2>/gi) || [];
  const h3Matches = html.match(/<h3[^>]*>.*?<\/h3>/gi) || [];
  const h4Matches = html.match(/<h4[^>]*>.*?<\/h4>/gi) || [];
  
  const h1Count = h1Matches.length;
  const h2Count = h2Matches.length;
  const h3Count = h3Matches.length;
  const h4Count = h4Matches.length;
  
  const issues: string[] = [];
  let structure: 'excellent' | 'good' | 'poor' = 'excellent';
  
  if (h1Count === 0) {
    issues.push('Missing H1 heading');
    structure = 'poor';
  } else if (h1Count > 1) {
    issues.push('Multiple H1 headings');
    structure = 'good';
  }
  
  if (h2Count === 0) {
    issues.push('No H2 headings');
    if (structure === 'excellent') structure = 'good';
  }
  
  if (h2Count > 0 && h3Count > h2Count * 3) {
    issues.push('Too many H3 headings relative to H2');
  }
  
  return {
    h1Count,
    h2Count,
    h3Count,
    h4Count,
    structure,
    issues,
  };
}

// Helper functions
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractImages(html: string): Array<{ src: string; alt: string }> {
  const regex = /<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi;
  const images: Array<{ src: string; alt: string }> = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    images.push({ src: match[1], alt: match[2] });
  }
  return images;
}

function extractLinks(html: string): Array<{ href: string; internal: boolean; text: string }> {
  const regex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
  const links: Array<{ href: string; internal: boolean; text: string }> = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const internal = href.startsWith('/') || href.includes(process.env.NEXT_PUBLIC_SITE_URL || '');
    links.push({ href, internal, text: stripHtml(match[2]) });
  }
  return links;
}
```

---

## AIO Optimization Engine

### File: `packages/utils/aio-optimizer.ts`

```typescript
/**
 * AIO (AI Optimization) Engine
 * Optimizes content for AI search engines (ChatGPT, Perplexity, Google SGE)
 */

export interface AIOAnalysis {
  score: number; // 0-100
  chatGPTOptimization: ChatGPTOptimization;
  perplexityOptimization: PerplexityOptimization;
  googleSGEOptimization: GoogleSGEOptimization;
  structuredData: StructuredDataAnalysis;
  recommendations: string[];
}

export interface ChatGPTOptimization {
  citationQuality: number; // 0-100
  factDensity: number; // 0-100
  structuredData: boolean;
  quotableSnippets: number;
  sourceAttribution: boolean;
}

export interface PerplexityOptimization {
  questionAnswerFormat: boolean;
  factBoxes: number;
  sources: number;
  clearSections: boolean;
}

export interface GoogleSGEOptimization {
  keyTakeaways: boolean;
  bulletSummaries: boolean;
  expertQuotes: number;
  visualElements: number;
}

export interface StructuredDataAnalysis {
  hasSchema: boolean;
  schemaType?: string;
  completeness: number; // 0-100
}

/**
 * Main AIO analysis function
 */
export function analyzeAIO(content: {
  title: string;
  content: string;
  excerpt?: string;
  schema?: any;
  keywords?: string[];
}): AIOAnalysis {
  let score = 0;
  const recommendations: string[] = [];
  
  // 1. ChatGPT Optimization (35 points)
  const chatGPTOpt = analyzeChatGPTOptimization(content);
  score += (chatGPTOpt.citationQuality + chatGPTOpt.factDensity) / 2 * 0.35;
  
  if (chatGPTOpt.citationQuality < 70) {
    recommendations.push('Add more factual citations and data points');
  }
  if (!chatGPTOpt.structuredData) {
    recommendations.push('Add structured data (Schema.org markup)');
  }
  if (chatGPTOpt.quotableSnippets < 3) {
    recommendations.push('Create more quotable, standalone snippets');
  }
  
  // 2. Perplexity Optimization (30 points)
  const perplexityOpt = analyzePerplexityOptimization(content);
  let perplexityScore = 0;
  if (perplexityOpt.questionAnswerFormat) perplexityScore += 40;
  if (perplexityOpt.clearSections) perplexityScore += 30;
  perplexityScore += Math.min(30, perplexityOpt.factBoxes * 10);
  score += perplexityScore * 0.30;
  
  if (!perplexityOpt.questionAnswerFormat) {
    recommendations.push('Structure content in Q&A format');
  }
  if (perplexityOpt.factBoxes < 2) {
    recommendations.push('Add highlighted fact boxes or statistics');
  }
  
  // 3. Google SGE Optimization (25 points)
  const googleSGEOpt = analyzeGoogleSGEOptimization(content);
  let sgeScore = 0;
  if (googleSGEOpt.keyTakeaways) sgeScore += 40;
  if (googleSGEOpt.bulletSummaries) sgeScore += 30;
  sgeScore += Math.min(30, googleSGEOpt.expertQuotes * 15);
  score += sgeScore * 0.25;
  
  if (!googleSGEOpt.keyTakeaways) {
    recommendations.push('Add a "Key Takeaways" section at the beginning');
  }
  if (!googleSGEOpt.bulletSummaries) {
    recommendations.push('Include bullet point summaries');
  }
  
  // 4. Structured Data (10 points)
  const structuredData = analyzeStructuredData(content);
  if (structuredData.hasSchema) {
    score += structuredData.completeness * 0.10;
  } else {
    recommendations.push('Add Schema.org markup (Article, FAQ, or HowTo)');
  }
  
  return {
    score: Math.round(score),
    chatGPTOptimization: chatGPTOpt,
    perplexityOptimization: perplexityOpt,
    googleSGEOptimization: googleSGEOpt,
    structuredData,
    recommendations,
  };
}

/**
 * Analyze ChatGPT optimization
 */
function analyzeChatGPTOptimization(content: {
  title: string;
  content: string;
}): ChatGPTOptimization {
  const plainText = stripHtml(content.content);
  
  // Citation quality: Look for numbers, statistics, sources
  const hasNumbers = /\d+(%|percent|\s+(percent|million|billion|thousand))/.test(plainText);
  const hasStatistics = /(according to|study|research|survey|data|report)/i.test(plainText);
  const hasSources = /(source:|via|according to|cited|reference)/i.test(plainText);
  
  let citationQuality = 0;
  if (hasNumbers) citationQuality += 40;
  if (hasStatistics) citationQuality += 30;
  if (hasSources) citationQuality += 30;
  
  // Fact density: Count factual statements
  const sentences = plainText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const factualSentences = sentences.filter((s) =>
    /\d+/.test(s) || /(is|are|was|were|has|have)\s+\w+/.test(s)
  );
  const factDensity = Math.min(100, (factualSentences.length / sentences.length) * 150);
  
  // Quotable snippets: Short, complete statements
  const quotableSnippets = sentences.filter((s) => {
    const words = s.split(/\s+/).length;
    return words >= 10 && words <= 25 && /^[A-Z]/.test(s.trim());
  }).length;
  
  return {
    citationQuality,
    factDensity: Math.round(factDensity),
    structuredData: !!content.schema,
    quotableSnippets,
    sourceAttribution: hasSources,
  };
}

/**
 * Analyze Perplexity optimization
 */
function analyzePerplexityOptimization(content: {
  content: string;
}): PerplexityOptimization {
  const html = content.content;
  const plainText = stripHtml(html);
  
  // Q&A format: Look for questions and answers
  const hasQuestions = /\?/g.test(plainText);
  const questionCount = (plainText.match(/\?/g) || []).length;
  const questionAnswerFormat = questionCount >= 2;
  
  // Fact boxes: Look for blockquotes or highlighted sections
  const factBoxes = (html.match(/<blockquote|<aside|<div class=".*?(highlight|fact|stat)/gi) || []).length;
  
  // Sources: Look for links and citations
  const sources = (html.match(/<a href/gi) || []).length;
  
  // Clear sections: Look for H2/H3 headings
  const headings = (html.match(/<h[23]/gi) || []).length;
  const clearSections = headings >= 3;
  
  return {
    questionAnswerFormat,
    factBoxes,
    sources,
    clearSections,
  };
}

/**
 * Analyze Google SGE optimization
 */
function analyzeGoogleSGEOptimization(content: {
  content: string;
  excerpt?: string;
}): GoogleSGEOptimization {
  const html = content.content;
  const plainText = stripHtml(html);
  
  // Key takeaways: Look for summary sections
  const keyTakeaways =
    /key takeaways|in summary|tldr|quick summary|at a glance/i.test(plainText);
  
  // Bullet summaries: Look for lists
  const bulletLists = (html.match(/<[uo]l>/gi) || []).length;
  const bulletSummaries = bulletLists >= 1;
  
  // Expert quotes: Look for blockquotes with attribution
  const expertQuotes = (html.match(/<blockquote[\s\S]*?<\/blockquote>/gi) || []).length;
  
  // Visual elements: Images, videos, diagrams
  const images = (html.match(/<img/gi) || []).length;
  const videos = (html.match(/<video|<iframe/gi) || []).length;
  const visualElements = images + videos;
  
  return {
    keyTakeaways,
    bulletSummaries,
    expertQuotes,
    visualElements,
  };
}

/**
 * Analyze structured data
 */
function analyzeStructuredData(content: {
  schema?: any;
}): StructuredDataAnalysis {
  if (!content.schema) {
    return {
      hasSchema: false,
      completeness: 0,
    };
  }
  
  const schema = content.schema;
  const requiredFields = ['@context', '@type', 'headline', 'author', 'datePublished'];
  const optionalFields = ['image', 'description', 'publisher', 'dateModified'];
  
  let completeness = 0;
  requiredFields.forEach((field) => {
    if (schema[field]) completeness += 60 / requiredFields.length;
  });
  optionalFields.forEach((field) => {
    if (schema[field]) completeness += 40 / optionalFields.length;
  });
  
  return {
    hasSchema: true,
    schemaType: schema['@type'],
    completeness: Math.round(completeness),
  };
}

/**
 * Generate Schema.org markup
 */
export function generateSchemaMarkup(
  type: 'Article' | 'BlogPosting' | 'FAQ' | 'HowTo',
  data: {
    title: string;
    description: string;
    author?: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    url?: string;
    keywords?: string[];
  }
): Record<string, any> {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    headline: data.title,
    description: data.description,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
  };
  
  if (data.author) {
    baseSchema.author = {
      '@type': 'Person',
      name: data.author,
    };
  }
  
  if (data.image) {
    baseSchema.image = data.image;
  }
  
  if (data.url) {
    baseSchema.url = data.url;
  }
  
  if (data.keywords && data.keywords.length > 0) {
    baseSchema.keywords = data.keywords.join(', ');
  }
  
  // Type-specific enhancements
  if (type === 'Article' || type === 'BlogPosting') {
    baseSchema.publisher = {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME || 'Your Site',
      logo: {
        '@type': 'ImageObject',
        url: process.env.NEXT_PUBLIC_SITE_LOGO || '',
      },
    };
  }
  
  return baseSchema;
}

// Helper function
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
```

---

## Database Schema Updates

### SQL Migration: `add-seo-aio-fields.sql`

```sql
-- Sprint 2: Add SEO and AIO tracking fields
-- Run this in Supabase SQL Editor

-- 1. Add SEO/AIO fields to content_library
ALTER TABLE content_library 
ADD COLUMN IF NOT EXISTS seo_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS aio_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS readability_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS schema_markup JSONB,
ADD COLUMN IF NOT EXISTS last_seo_check TIMESTAMP,
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS seo_description VARCHAR(200),
ADD COLUMN IF NOT EXISTS slug VARCHAR(200);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_seo_score ON content_library(seo_score);
CREATE INDEX IF NOT EXISTS idx_content_aio_score ON content_library(aio_score);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content_library(slug);

-- 3. Add unique constraint on slug (for URL uniqueness)
ALTER TABLE content_library 
ADD CONSTRAINT unique_content_slug UNIQUE (slug);

-- 4. Add SEO fields to media_library
ALTER TABLE media_library
ADD COLUMN IF NOT EXISTS alt_text_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS file_size_optimal BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS format_recommended VARCHAR(20);

-- 5. Create analytics table for tracking
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_library(id) ON DELETE CASCADE,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  avg_time_on_page INT DEFAULT 0, -- in seconds
  bounce_rate FLOAT DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_content ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON content_analytics(date);

-- 6. Create SEO issues table for tracking problems
CREATE TABLE IF NOT EXISTS seo_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_library(id) ON DELETE CASCADE,
  issue_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL, -- error, warning, info
  message TEXT NOT NULL,
  fix_suggestion TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_issues_content ON seo_issues(content_id);
CREATE INDEX IF NOT EXISTS idx_seo_issues_resolved ON seo_issues(resolved);

-- 7. Add dashboard stats view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM topics) as total_topics,
  (SELECT COUNT(*) FROM topics WHERE status = 'pending') as pending_topics,
  (SELECT COUNT(*) FROM content_library) as total_content,
  (SELECT COUNT(*) FROM content_library WHERE status = 'draft') as draft_content,
  (SELECT COUNT(*) FROM content_library WHERE status = 'published') as published_content,
  (SELECT COUNT(*) FROM media_library) as total_media,
  (SELECT ROUND(AVG(seo_score)) FROM content_library WHERE seo_score > 0) as avg_seo_score,
  (SELECT ROUND(AVG(aio_score)) FROM content_library WHERE aio_score > 0) as avg_aio_score,
  (SELECT COUNT(*) FROM seo_issues WHERE NOT resolved) as open_seo_issues;

-- Grant permissions
GRANT SELECT ON dashboard_stats TO authenticated;
```

---

## Implementation Phases

### Phase 1: Foundation & Utilities (Day 1)

**Tasks**:
1. ✅ Install dependencies
2. ✅ Run database migration
3. ✅ Create SEO analyzer (`packages/utils/seo-analyzer.ts`)
4. ✅ Create AIO optimizer (`packages/utils/aio-optimizer.ts`)
5. ✅ Create shared UI components (`DataTable`, `Modal`, `Toast`)
6. ✅ Create hooks (`useTopics`, `useContent`, `useMedia`, `useSEOAnalysis`)

**Deliverables**:
- SEO analysis engine working with test cases
- AIO optimization engine working with test cases
- Shared components library
- Custom hooks for data fetching

**Testing**:
```bash
# Test SEO analyzer
npm test packages/utils/seo-analyzer.test.ts

# Test AIO optimizer
npm test packages/utils/aio-optimizer.test.ts
```

---

### Phase 2: Topic Queue UI (Day 2)

**Tasks**:
1. ✅ Build `TopicList` component
2. ✅ Build `TopicForm` component
3. ✅ Build `TopicFilters` component
4. ✅ Implement topic pages (list, new, edit)
5. ✅ Connect to API endpoints
6. ✅ Add loading states and error handling

**Deliverables**:
- Fully functional topic queue management
- Create, read, update, delete topics via UI
- Filter and search functionality
- Lock/unlock topics

**Testing**:
- Manual testing of all CRUD operations
- Test filters and search
- Test lock/unlock functionality

---

### Phase 3: Content Library UI (Day 3-4)

**Tasks**:
1. ✅ Build `ContentEditor` with TipTap
2. ✅ Build `ContentSEOPanel`
3. ✅ Build `ContentAIOPanel`
4. ✅ Build `ContentPreview`
5. ✅ Implement content pages (list, new, edit, preview)
6. ✅ Integrate SEO analysis
7. ✅ Integrate AIO optimization
8. ✅ Add real-time feedback

**Deliverables**:
- Rich text editor for content creation
- Real-time SEO scoring and suggestions
- Real-time AIO optimization feedback
- Preview functionality
- Metadata editor

**Testing**:
- Test content creation and editing
- Verify SEO scores calculate correctly
- Verify AIO scores calculate correctly
- Test preview mode

---

### Phase 4: Media Library UI (Day 5)

**Tasks**:
1. ✅ Build `MediaUpload` with drag & drop
2. ✅ Build `MediaGrid` component
3. ✅ Build `MediaCard` component
4. ✅ Build `MediaEditor` modal
5. ✅ Build `MediaPicker` for content editor
6. ✅ Implement media pages
7. ✅ Connect to Supabase Storage

**Deliverables**:
- Drag & drop file upload
- Media grid with thumbnails
- Edit metadata (alt text, tags)
- Media picker integration
- Folder organization

**Testing**:
- Test file uploads (various formats)
- Test metadata editing
- Test media picker in content editor
- Test folder navigation

---

### Phase 5: Dashboard & Integration (Day 6)

**Tasks**:
1. ✅ Build dashboard widgets
2. ✅ Add SEO health widget
3. ✅ Add content pipeline widget
4. ✅ Implement quick actions
5. ✅ Add charts/graphs
6. ✅ Build pre-publish checklist
7. ✅ Integrate workflow (topic → content → media → publish)
8. ✅ Polish UI/UX
9. ✅ Fix bugs
10. ✅ Write documentation

**Deliverables**:
- Complete dashboard with analytics
- Pre-publish validation checklist
- Smooth workflow integration
- Polished UI
- User documentation

**Testing**:
- E2E testing of complete workflow
- Test dashboard data accuracy
- Test pre-publish checklist
- Performance testing

---

## Deployment Guide

### Prerequisites
- ✅ Sprint 1 deployed and operational
- ✅ Database migration SQL script ready
- ✅ Environment variables configured
- ✅ Supabase Storage bucket created

### Step 1: Database Migration

```bash
# 1. Connect to Supabase SQL Editor
# 2. Run the migration script
# File: add-seo-aio-fields.sql

# 3. Verify tables updated
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'content_library' 
AND column_name IN ('seo_score', 'aio_score', 'schema_markup');

# Should return 3 rows
```

### Step 2: Install Dependencies

```bash
# In workspace root
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image
npm install @tanstack/react-table react-hook-form @hookform/resolvers/zod
npm install react-dropzone recharts date-fns clsx

# In admin app
cd apps/admin
npm install
```

### Step 3: Update Prisma Schema

```bash
# Update schema with new fields
# File: apps/admin/prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Verify
npx prisma validate
```

### Step 4: Build and Test Locally

```bash
# Start admin app
cd apps/admin
npm run dev

# In another terminal, run tests
npm test

# Verify all features work:
# - Create topic
# - Create content with SEO panel
# - Upload media
# - View dashboard
```

### Step 5: Deploy to Vercel

```bash
# Commit changes
git add -A
git commit -m "feat: Sprint 2 - Complete Admin UI with SEO/AIO optimization"
git push origin main

# Vercel will automatically deploy
# Monitor deployment at https://vercel.com/dashboard
```

### Step 6: Verify Deployment

```bash
# Run smoke tests
node test-sprint-1.js

# Manually test:
# 1. Create a topic
# 2. Create content from topic
# 3. Check SEO score
# 4. Upload media
# 5. Publish content
# 6. View dashboard
```

### Step 7: Monitor

```bash
# Check Vercel logs for errors
# Monitor Supabase dashboard for performance
# Track SEO scores in dashboard
```

---

## Troubleshooting

### Issue: TipTap Editor Not Loading

**Symptoms**: Blank editor, console errors about missing extensions

**Solution**:
```bash
# Reinstall TipTap packages
npm uninstall @tiptap/react @tiptap/starter-kit
npm install @tiptap/react @tiptap/starter-kit --force

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: SEO Score Always 0

**Symptoms**: SEO panel shows 0/100 score

**Solution**:
```typescript
// Check if SEO analyzer is being called
console.log('Analyzing SEO:', content);
const analysis = analyzeSEO(content);
console.log('SEO Analysis:', analysis);

// Verify content has required fields
// - title (string)
// - content (HTML string)
// - keywords (array)
```

### Issue: Media Upload Fails

**Symptoms**: Upload spinner forever, 500 error

**Solution**:
```bash
# 1. Check Supabase Storage bucket exists
# Go to Supabase Dashboard → Storage
# Verify "media" bucket exists and is public

# 2. Check SUPABASE_SERVICE_ROLE_KEY in Vercel
# Must be service role key, not anon key

# 3. Check file size limit
# Default: 10MB, adjust in MediaUpload component
```

### Issue: Database Connection Errors

**Symptoms**: API routes return 500, "Can't reach database"

**Solution**:
```bash
# 1. Verify DATABASE_URL uses Transaction Pooler
echo $DATABASE_URL
# Should contain: aws-region.pooler.supabase.com

# 2. Verify DIRECT_URL is set
echo $DIRECT_URL
# Should contain: db.PROJECT_REF.supabase.co

# 3. Redeploy without cache
# Vercel Dashboard → Deployments → Redeploy (uncheck cache)
```

### Issue: Dashboard Shows No Data

**Symptoms**: All widgets show 0 or empty

**Solution**:
```sql
-- Check if dashboard_stats view exists
SELECT * FROM dashboard_stats;

-- If error, recreate view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM topics) as total_topics,
  (SELECT COUNT(*) FROM content_library) as total_content,
  (SELECT COUNT(*) FROM media_library) as total_media;
  
-- Grant permissions
GRANT SELECT ON dashboard_stats TO authenticated;
```

---

## Testing Strategy

### Unit Tests

```typescript
// packages/utils/__tests__/seo-analyzer.test.ts
import { analyzeSEO, analyzeReadability } from '../seo-analyzer';

describe('SEO Analyzer', () => {
  it('should calculate SEO score correctly', () => {
    const content = {
      title: 'How to Optimize for SEO in 2024',
      description: 'Learn the best SEO practices for 2024 including keyword optimization, meta tags, and content structure.',
      content: '<h1>SEO Guide</h1><p>This is a comprehensive guide...</p>',
      keywords: ['SEO', 'optimization'],
      slug: 'how-to-optimize-seo-2024',
    };
    
    const analysis = analyzeSEO(content);
    
    expect(analysis.score).toBeGreaterThan(70);
    expect(analysis.meta.titleOptimal).toBe(true);
  });
  
  it('should detect missing meta description', () => {
    const content = {
      title: 'Test Article',
      content: '<p>Content here</p>',
      keywords: ['test'],
      slug: 'test',
    };
    
    const analysis = analyzeSEO(content);
    
    const metaIssue = analysis.issues.find(i => i.type === 'meta_description');
    expect(metaIssue).toBeDefined();
    expect(metaIssue.severity).toBe('error');
  });
});
```

### Integration Tests

```typescript
// apps/admin/__tests__/content-workflow.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentEditor from '@/components/content/ContentEditor';

describe('Content Workflow', () => {
  it('should create content and show SEO score', async () => {
    const user = userEvent.setup();
    
    render(<ContentEditor />);
    
    // Fill in form
    await user.type(screen.getByLabelText('Title'), 'Test Article');
    await user.type(screen.getByLabelText('Content'), 'This is test content...');
    
    // Wait for SEO analysis
    await waitFor(() => {
      expect(screen.getByText(/SEO Score:/)).toBeInTheDocument();
    });
    
    // Verify score is displayed
    const score = screen.getByText(/\d+\/100/);
    expect(score).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// apps/tests/e2e/sprint-2-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('Complete content creation workflow with SEO', async ({ page }) => {
  // 1. Login
  await page.goto('https://admin.khaledaun.com/auth/login');
  await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL);
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');
  
  // 2. Create topic
  await page.goto('https://admin.khaledaun.com/topics/new');
  await page.fill('input[name="title"]', 'E2E Test Topic');
  await page.fill('textarea[name="description"]', 'This is a test topic');
  await page.click('button[type="submit"]');
  
  // 3. Create content from topic
  await page.click('text=Create Content');
  await expect(page.locator('input[name="title"]')).toHaveValue('E2E Test Topic');
  
  // 4. Add content and check SEO
  await page.fill('.tiptap', 'This is test content with keywords...');
  await expect(page.locator('text=SEO Score:')).toBeVisible();
  
  const seoScore = await page.locator('[data-testid="seo-score"]').textContent();
  expect(parseInt(seoScore)).toBeGreaterThan(0);
  
  // 5. Upload media
  await page.click('text=Add Featured Image');
  await page.setInputFiles('input[type="file"]', 'test-image.jpg');
  await expect(page.locator('text=Upload complete')).toBeVisible();
  
  // 6. Publish
  await page.click('button:has-text("Publish")');
  await expect(page.locator('text=Content published')).toBeVisible();
  
  // 7. Verify on dashboard
  await page.goto('https://admin.khaledaun.com/command-center');
  await expect(page.locator('text=Published')).toContainText('1');
});
```

---

## Success Criteria

Sprint 2 is considered **COMPLETE** when:

### Functional Requirements ✅
- [ ] All UI pages are functional (topics, content, media, dashboard)
- [ ] Users can create/edit/delete topics through UI
- [ ] Users can create/edit/delete content through UI
- [ ] Users can upload/edit/delete media through UI
- [ ] Rich text editor works properly
- [ ] Drag & drop file upload works
- [ ] All forms validate correctly
- [ ] All data persists to database

### SEO/AIO Requirements ✅
- [ ] SEO score calculates for all content (0-100)
- [ ] AIO score calculates for all content (0-100)
- [ ] Real-time SEO feedback appears in sidebar
- [ ] Real-time AIO feedback appears in sidebar
- [ ] Pre-publish checklist shows issues
- [ ] Meta title/description editor works
- [ ] Keyword analysis displays correctly
- [ ] Readability score displays
- [ ] Schema markup can be generated

### Dashboard Requirements ✅
- [ ] Dashboard shows accurate statistics
- [ ] SEO health widget displays average scores
- [ ] Content pipeline widget shows workflow status
- [ ] Charts/graphs render correctly
- [ ] Quick actions work
- [ ] Recent activity feed updates

### Performance Requirements ✅
- [ ] Page load time < 2 seconds
- [ ] SEO analysis completes < 500ms
- [ ] AIO analysis completes < 500ms
- [ ] File upload < 5 seconds per MB
- [ ] No memory leaks in editor

### Testing Requirements ✅
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E workflow test passes
- [ ] Manual testing checklist complete
- [ ] No console errors
- [ ] No linting errors

### Documentation Requirements ✅
- [ ] User guide written
- [ ] API documentation updated
- [ ] SEO best practices guide created
- [ ] AIO optimization guide created
- [ ] Deployment guide verified

### Deployment Requirements ✅
- [ ] Database migration successful
- [ ] Deployed to Vercel production
- [ ] All environment variables set
- [ ] Smoke tests pass in production
- [ ] No breaking changes to Sprint 1

---

## Post-Sprint 2 Roadmap

### Sprint 3: AI Automation (Optional)
- RSS feed integration for topic generation
- AI-powered content generation (OpenAI/Anthropic)
- Automated SEO suggestions
- Content scheduling and auto-publishing

### Sprint 4: Analytics & Insights (Optional)
- Google Analytics integration
- Content performance tracking
- A/B testing for titles/descriptions
- Competitive analysis

### Sprint 5: Multi-user & Collaboration (Optional)
- Enhanced RBAC (multiple roles)
- Content approval workflow
- Comments and reviews
- Activity log

---

**Document Version**: 1.0  
**Last Updated**: October 28, 2024  
**Status**: 🟢 READY FOR IMPLEMENTATION

---

## Quick Reference

### Key Files to Create
```
packages/utils/seo-analyzer.ts
packages/utils/aio-optimizer.ts
apps/admin/components/topics/TopicList.tsx
apps/admin/components/content/ContentEditor.tsx
apps/admin/components/content/ContentSEOPanel.tsx
apps/admin/components/content/ContentAIOPanel.tsx
apps/admin/components/media/MediaUpload.tsx
apps/admin/app/(dashboard)/topics/page.tsx
apps/admin/app/(dashboard)/content/library/page.tsx
apps/admin/app/(dashboard)/media/page.tsx
```

### Key Commands
```bash
# Install dependencies
npm install @tiptap/react @tanstack/react-table react-hook-form react-dropzone

# Run database migration
# Copy SQL from add-seo-aio-fields.sql to Supabase SQL Editor

# Generate Prisma client
npx prisma generate

# Start development
npm run dev

# Run tests
npm test

# Deploy
git push origin main
```

### Key URLs
- Admin: https://admin.khaledaun.com
- Supabase: https://supabase.com/dashboard
- Vercel: https://vercel.com/dashboard

---

**END OF TECHNICAL SPECIFICATION**

