# Phase 6.5: Rich Media Management - Implementation Plan

**Status**: 🟡 IN PROGRESS  
**Start Date**: October 20, 2024  
**Estimated Completion**: 55-85 hours  
**Priority**: HIGH (Foundation for Phases 7 & 9)

---

## 🎯 **OBJECTIVES**

Transform the CMS from markdown-only to a rich media platform with:
1. **Media Library**: Upload, organize, and manage images/videos
2. **Rich Text Editor**: WYSIWYG editing experience (TipTap)
3. **Image Optimization**: Automatic resizing and compression
4. **Pre-Publish Validator**: Quality checks before publishing
5. **RBAC Integration**: Permission-based media access

---

## 📊 **PHASE BREAKDOWN**

### **Part 1: Database Schema & Storage (8-12 hours)**

#### **1.1 Media Model Schema**
```prisma
// packages/db/prisma/schema.prisma

model Media {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // File information
  filename      String
  originalName  String
  mimeType      String
  size          Int      // bytes
  url           String   // Supabase Storage URL
  thumbnailUrl  String?  // Optimized thumbnail
  
  // Metadata
  width         Int?
  height        Int?
  duration      Int?     // for videos (seconds)
  altText       String?
  caption       String?
  
  // Organization
  folder        String?  // e.g., "blog", "avatars", "covers"
  tags          String[] // searchable tags
  
  // Ownership & RBAC
  uploadedBy    String
  uploader      User     @relation(fields: [uploadedBy], references: [id])
  
  // Usage tracking
  usedInPosts   Post[]   @relation("PostMedia")
  
  @@index([uploadedBy])
  @@index([folder])
  @@index([mimeType])
}

// Add to Post model
model Post {
  // ... existing fields ...
  media         Media[]  @relation("PostMedia")
  featuredImage Media?   @relation("FeaturedImage", fields: [featuredImageId], references: [id])
  featuredImageId String?
}
```

#### **1.2 Supabase Storage Setup**
```sql
-- Run in Supabase SQL Editor

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf']
);

-- Storage policies
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OWNER')
    )
  )
);
```

---

### **Part 2: Upload API & Processing (12-18 hours)**

#### **2.1 Upload API Endpoint**
```typescript
// apps/admin/app/api/admin/media/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@khaledaun/auth';
import { supabase } from '@khaledaun/db';
import { prisma } from '@khaledaun/db';
import sharp from 'sharp';
import { z } from 'zod';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'application/pdf'
];

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

const uploadSchema = z.object({
  folder: z.string().optional().default('uncategorized'),
  altText: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = uploadSchema.parse({
      folder: formData.get('folder'),
      altText: formData.get('altText'),
      caption: formData.get('caption'),
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
    });

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${user.id}/${metadata.folder}/${timestamp}-${randomString}.${extension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process image (if image)
    let processedBuffer = buffer;
    let width: number | null = null;
    let height: number | null = null;
    let thumbnailUrl: string | null = null;

    if (file.type.startsWith('image/')) {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      width = metadata.width || null;
      height = metadata.height || null;

      // Optimize original
      processedBuffer = await image
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Create thumbnail
      const thumbnailBuffer = await sharp(buffer)
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailFilename = filename.replace(/\.[^.]+$/, '-thumb.jpg');
      
      const { error: thumbError } = await supabase.storage
        .from('media')
        .upload(thumbnailFilename, thumbnailBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (!thumbError) {
        const { data: thumbData } = supabase.storage
          .from('media')
          .getPublicUrl(thumbnailFilename);
        thumbnailUrl = thumbData.publicUrl;
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filename, processedBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filename);

    // Save to database
    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: urlData.publicUrl,
        thumbnailUrl,
        width,
        height,
        altText: metadata.altText,
        caption: metadata.caption,
        folder: metadata.folder,
        tags: metadata.tags,
        uploadedBy: user.id,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
```

#### **2.2 Media List API**
```typescript
// apps/admin/app/api/admin/media/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@khaledaun/auth';
import { prisma } from '@khaledaun/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');

    const where: any = {};

    if (folder) where.folder = folder;
    if (type) where.mimeType = { startsWith: type };
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
```

---

### **Part 3: Media Library UI (15-20 hours)**

#### **3.1 Media Library Page**
```typescript
// apps/admin/app/(dashboard)/media/page.tsx

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface Media {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploader: {
    name: string | null;
    email: string;
  };
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // Fetch media
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/media');
      const data = await response.json();
      setMedia(data.media);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'uploads');
      
      try {
        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          setMedia(prev => [data.media, ...prev]);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <p className="text-gray-600 mt-2">
          Upload and manage images, videos, and files
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center mb-8 cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-gray-600">
          {uploading ? (
            <p>Uploading...</p>
          ) : isDragActive ? (
            <p>Drop files here...</p>
          ) : (
            <>
              <p className="text-lg mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm">
                Supports: Images (JPG, PNG, GIF, WebP), Videos (MP4), up to 50MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
            onClick={() => setSelectedMedia(item)}
          >
            {item.mimeType.startsWith('image/') ? (
              <Image
                src={item.thumbnailUrl || item.url}
                alt={item.originalName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <span className="text-2xl">📄</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <MediaDetailModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onDelete={(id) => {
            setMedia(prev => prev.filter(m => m.id !== id));
            setSelectedMedia(null);
          }}
        />
      )}
    </div>
  );
}
```

---

### **Part 4: Rich Text Editor Integration (10-15 hours)**

#### **4.1 TipTap Editor Component**
```typescript
// apps/admin/components/RichTextEditor.tsx

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageInsert?: () => void;
}

export function RichTextEditor({
  content,
  onChange,
  onImageInsert,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="border-b p-2 flex gap-2 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded ${
            editor.isActive('bold') ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded ${
            editor.isActive('italic') ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded ${
            editor.isActive('bulletList') ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
        >
          • List
        </button>
        {onImageInsert && (
          <button
            onClick={onImageInsert}
            className="px-3 py-1 rounded hover:bg-gray-100"
          >
            🖼️ Image
          </button>
        )}
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[400px] focus:outline-none"
      />
    </div>
  );
}
```

---

### **Part 5: Pre-Publish Validator (8-12 hours)**

#### **5.1 Validation Service**
```typescript
// packages/utils/validator.ts

import { z } from 'zod';
import cheerio from 'cheerio';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

interface PostContent {
  title: string;
  excerpt?: string;
  content: string;
  featuredImageId?: string;
  locale: string;
}

export async function validatePost(post: PostContent): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Load content with Cheerio
  const $ = cheerio.load(post.content);

  // 1. Check title length
  if (post.title.length < 10) {
    errors.push('Title too short (minimum 10 characters)');
    score -= 20;
  } else if (post.title.length > 60) {
    warnings.push('Title too long for SEO (recommended: 50-60 characters)');
    score -= 5;
  }

  // 2. Check excerpt
  if (!post.excerpt || post.excerpt.length < 50) {
    warnings.push('Excerpt missing or too short (recommended: 120-160 characters)');
    score -= 10;
  }

  // 3. Check content length
  const textContent = $.text();
  const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
  
  if (wordCount < 300) {
    warnings.push(`Content too short (${wordCount} words, recommended: 300+ words)`);
    score -= 15;
  }

  // 4. Check for images
  const images = $('img');
  if (images.length === 0) {
    warnings.push('No images in content');
    score -= 10;
  }

  // 5. Check image alt text
  images.each((i, img) => {
    const alt = $(img).attr('alt');
    if (!alt || alt.trim() === '') {
      errors.push(`Image ${i + 1} missing alt text (accessibility issue)`);
      score -= 5;
    }
  });

  // 6. Check for broken links
  const links = $('a[href]');
  const brokenLinks: string[] = [];
  
  for (let i = 0; i < links.length; i++) {
    const href = $(links[i]).attr('href');
    if (href && href.startsWith('http')) {
      try {
        const response = await fetch(href, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        if (!response.ok) {
          brokenLinks.push(href);
        }
      } catch (error) {
        brokenLinks.push(href);
      }
    }
  }

  if (brokenLinks.length > 0) {
    warnings.push(`${brokenLinks.length} potentially broken link(s): ${brokenLinks.slice(0, 3).join(', ')}`);
    score -= brokenLinks.length * 3;
  }

  // 7. Check for featured image
  if (!post.featuredImageId) {
    warnings.push('No featured image set');
    score -= 10;
  }

  // 8. Check headings structure
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  
  if (h1Count > 1) {
    errors.push('Multiple H1 headings found (SEO issue)');
    score -= 10;
  }
  
  if (h2Count === 0 && wordCount > 500) {
    warnings.push('No H2 headings (improves readability)');
    score -= 5;
  }

  // 9. Readability check (Flesch Reading Ease approximation)
  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const syllables = estimateSyllables(textContent);
  const fleschScore = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount);
  
  if (fleschScore < 30) {
    warnings.push('Content may be difficult to read (consider simpler language)');
    score -= 5;
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, Math.min(100, score)),
  };
}

function estimateSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let syllableCount = 0;
  
  for (const word of words) {
    const vowels = word.match(/[aeiouy]+/g);
    syllableCount += vowels ? vowels.length : 1;
  }
  
  return syllableCount;
}
```

---

## 📦 **DEPENDENCIES TO INSTALL**

```json
{
  "dependencies": {
    "@tiptap/react": "^2.1.13",
    "@tiptap/starter-kit": "^2.1.13",
    "@tiptap/extension-image": "^2.1.13",
    "@tiptap/extension-link": "^2.1.13",
    "react-dropzone": "^14.2.3",
    "sharp": "^0.33.0",
    "cheerio": "^1.0.0-rc.12"
  },
  "devDependencies": {
    "@types/cheerio": "^0.22.35"
  }
}
```

---

## 🧪 **TESTING CHECKLIST**

### **E2E Tests** (`apps/tests/e2e/media-management.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Media Management', () => {
  test('should upload image successfully', async ({ page }) => {
    // Login as EDITOR
    await page.goto('/admin/media');
    
    // Upload image
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-fixtures/sample-image.jpg');
    
    // Verify upload
    await expect(page.locator('text=Upload successful')).toBeVisible();
  });

  test('should display media in grid', async ({ page }) => {
    await page.goto('/admin/media');
    
    // Check grid layout
    const mediaGrid = await page.locator('[data-testid="media-grid"]');
    await expect(mediaGrid).toBeVisible();
  });

  test('should insert image into post editor', async ({ page }) => {
    await page.goto('/admin/posts/new');
    
    // Open media library
    await page.click('button:has-text("Insert Image")');
    
    // Select image
    await page.click('[data-testid="media-item"]:first-child');
    
    // Verify image inserted
    const editor = await page.locator('.tiptap');
    await expect(editor.locator('img')).toBeVisible();
  });

  test('should run pre-publish validation', async ({ page }) => {
    await page.goto('/admin/posts/new');
    
    // Fill minimal content
    await page.fill('input[name="title"]', 'Short');
    
    // Try to publish
    await page.click('button:has-text("Publish")');
    
    // Check validation errors
    await expect(page.locator('text=Title too short')).toBeVisible();
  });
});
```

---

## 📝 **DOCUMENTATION TO CREATE**

1. **Media Upload Guide** (`docs/media-upload-guide.md`)
2. **Rich Text Editor Guide** (`docs/rich-text-editor.md`)
3. **Pre-Publish Checklist** (`docs/pre-publish-checklist.md`)
4. **Supabase Storage Setup** (`docs/supabase-storage-setup.md`)

---

## ✅ **ACCEPTANCE CRITERIA**

- [ ] Can upload images/videos via drag-and-drop
- [ ] Media library displays all uploaded files in grid
- [ ] Can search and filter media
- [ ] Can insert media into post editor
- [ ] Rich text editor has formatting toolbar
- [ ] Pre-publish validator shows errors/warnings
- [ ] RBAC enforced (AUTHOR+ can upload)
- [ ] Image optimization works automatically
- [ ] E2E tests pass
- [ ] Documentation complete

---

## 📊 **PROGRESS TRACKING**

| Task | Hours Est. | Status |
|------|-----------|--------|
| Database schema | 4-6h | ⏳ Pending |
| Supabase Storage setup | 4-6h | ⏳ Pending |
| Upload API | 6-8h | ⏳ Pending |
| Media list API | 3-4h | ⏳ Pending |
| Media library UI | 10-12h | ⏳ Pending |
| TipTap integration | 8-10h | ⏳ Pending |
| Pre-publish validator | 6-8h | ⏳ Pending |
| E2E tests | 8-10h | ⏳ Pending |
| Documentation | 6-8h | ⏳ Pending |
| **Total** | **55-85h** | **0% Complete** |

---

**Next Step**: Update database schema and create migration


