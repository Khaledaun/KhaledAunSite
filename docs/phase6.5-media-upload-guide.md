# Phase 6.5: Media Upload Guide

**Version**: 1.0  
**Last Updated**: October 20, 2024  
**Status**: ✅ Complete

---

## 📚 **TABLE OF CONTENTS**

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Uploading Media](#uploading-media)
4. [Managing Media](#managing-media)
5. [Using Media in Posts](#using-media-in-posts)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 **OVERVIEW**

Phase 6.5 introduces a comprehensive media management system that allows you to:
- Upload images, videos, and PDFs
- Organize media in folders with tags
- Auto-generate thumbnails and optimize images
- Insert media into blog posts with a WYSIWYG editor
- Manage media metadata (alt text, captions)
- Search and filter your media library

---

## 🚀 **GETTING STARTED**

### **Prerequisites**

1. **Database Setup**
   - Run migration: `tsx packages/db/scripts/migrate-phase6.5-media.ts`
   - Execute Supabase SQL: `packages/db/sql/phase6.5-storage-setup.sql`

2. **Dependencies**
   - Ensure all packages are installed: `npm install`
   - Generate Prisma client: `npx prisma generate`

3. **Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key for storage access
   - `DATABASE_URL`: PostgreSQL connection string

### **Access Media Library**

Navigate to: `/admin/media`

---

## 📤 **UPLOADING MEDIA**

### **Supported File Types**

| Type | Formats | Max Size |
|------|---------|----------|
| Images | JPG, JPEG, PNG, GIF, WebP | 50MB |
| Videos | MP4, WebM | 50MB |
| Documents | PDF | 50MB |

### **Upload Methods**

#### **Method 1: Drag & Drop**

1. Go to Media Library (`/admin/media`)
2. Drag files from your computer
3. Drop them onto the upload zone
4. Wait for upload to complete

#### **Method 2: Click to Select**

1. Go to Media Library
2. Click on the upload zone
3. Select files from file picker
4. Click "Open" to upload

### **What Happens During Upload**

1. **File Validation**: Type and size checks
2. **Image Processing** (for images):
   - Auto-resize to max 2000×2000px
   - Quality optimization (85%)
   - Thumbnail generation (400×400px)
   - Metadata extraction (width, height)
3. **Storage**: Upload to Supabase Storage
4. **Database**: Save metadata to PostgreSQL
5. **Display**: Show in media grid

### **Upload Examples**

```typescript
// Programmatic upload (API)
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'blog');
formData.append('altText', 'Description of image');
formData.append('caption', 'Optional caption');
formData.append('tags', JSON.stringify(['featured', 'hero']));

const response = await fetch('/api/admin/media/upload', {
  method: 'POST',
  body: formData,
});

const { media } = await response.json();
console.log('Uploaded:', media.url);
```

---

## 📁 **MANAGING MEDIA**

### **Media Library Interface**

The media library shows all uploaded files in a responsive grid:

- **Thumbnails**: For images
- **Icons**: For videos (🎥) and PDFs (📄)
- **Search bar**: Find media by name, alt text, or tags
- **Filter dropdown**: Show only images, videos, or PDFs

### **Viewing Media Details**

Click on any media item to open the detail modal:

**Information Displayed**:
- Large preview (for images)
- Filename and type
- File size
- Dimensions (for images/videos)
- Upload date
- Uploader name/email

**Actions Available**:
- Copy public URL to clipboard
- Edit metadata
- Delete media

### **Editing Media Metadata**

In the media detail modal, you can edit:

1. **Alt Text** (for accessibility)
   - Describe the image content
   - Important for SEO and screen readers
   - Required for images

2. **Caption**
   - Optional descriptive text
   - Shown below images in posts

3. **Tags**
   - Comma-separated keywords
   - Used for search and organization
   - Examples: `blog, featured, hero, avatar`

**Save Changes**: Click "💾 Save Changes" button

### **Organizing with Folders**

During upload, specify a folder:

```typescript
formData.append('folder', 'blog');  // or 'avatars', 'covers', etc.
```

Common folder structure:
- `blog/` - Blog post images
- `avatars/` - User avatars
- `covers/` - Cover/hero images
- `icons/` - Icons and logos
- `uploads/` - General uploads

### **Searching Media**

Use the search bar to find media by:
- Original filename
- Alt text
- Tags

**Example**: Search for "hero" finds all media with "hero" in filename, alt text, or tags.

### **Filtering Media**

Use the filter dropdown to show:
- **All Types**: Everything
- **Images**: Only images
- **Videos**: Only videos
- **PDFs**: Only PDFs

---

## ✍️ **USING MEDIA IN POSTS**

### **Rich Text Editor**

The new TipTap editor provides WYSIWYG editing with media support.

**Access**: Go to any post edit page (`/admin/posts/{id}` or `/admin/posts/new`)

### **Inserting Images**

**Method 1: From Media Library**

1. Click the 🖼️ (image) button in the toolbar
2. Select image from media picker
3. Image is inserted at cursor position

**Method 2: By URL**

1. Click the 🖼️ button
2. Cancel the media picker
3. Enter image URL manually (if prompted)

### **Formatting Options**

The rich text editor supports:

**Text Formatting**:
- **Bold**: Ctrl+B or click **B**
- *Italic*: Ctrl+I or click *I*
- ~~Strikethrough~~: Click S̶
- `Code`: Click </>

**Headings**:
- H1, H2, H3 buttons
- Use H2 for main sections
- Use H3 for subsections
- (H1 is typically the post title)

**Lists**:
- Bullet list: Click • List
- Numbered list: Click 1. List
- Blockquote: Click "

**Links**:
1. Select text
2. Click 🔗 (link) button
3. Enter URL
4. Click "Add"

**To remove a link**: Select linked text, click ⛓️‍💥

### **Keyboard Shortcuts**

| Action | Shortcut |
|--------|----------|
| Bold | Ctrl+B |
| Italic | Ctrl+I |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |

---

## ✅ **BEST PRACTICES**

### **Image Optimization**

1. **Upload high-quality originals**: System will optimize automatically
2. **Use appropriate formats**:
   - JPEG for photos
   - PNG for graphics with transparency
   - WebP for best compression (modern browsers)
3. **Keep files under 5MB** when possible (50MB is max)

### **Alt Text**

**Good Alt Text**:
- ✅ "Woman working on laptop in a coffee shop"
- ✅ "Chart showing 50% increase in sales"
- ✅ "Red sports car on mountain road"

**Bad Alt Text**:
- ❌ "Image" or "Photo"
- ❌ Empty/missing
- ❌ File name like "IMG_1234.jpg"

**Tips**:
- Be descriptive and specific
- Keep it concise (125 characters or less)
- Don't start with "Image of..." or "Picture of..."
- Include relevant keywords naturally

### **Captions**

Use captions when:
- Context is needed (e.g., "Screenshot from admin dashboard")
- Attribution is required (e.g., "Photo by John Doe")
- Additional information helps (e.g., "Before and after comparison")

### **Tags**

**Tagging Strategy**:
- Use consistent, lowercase tags
- Common tags: `blog`, `featured`, `hero`, `avatar`, `icon`
- Category tags: `tech`, `business`, `tutorial`
- Status tags: `approved`, `review`

### **Organization**

1. **Use folders** to separate different types of media
2. **Tag consistently** for easy searching
3. **Delete unused media** to save storage
4. **Name files descriptively** before uploading

---

## 🐛 **TROUBLESHOOTING**

### **Upload Fails**

**"Invalid file type"**
- Solution: Check supported formats (see Supported File Types)
- Only JPG, PNG, GIF, WebP, MP4, WebM, PDF are allowed

**"File too large"**
- Solution: Reduce file size to under 50MB
- For images: Use compression tools
- For videos: Reduce quality or length

**"Upload failed"**
- Solution: Check network connection
- Solution: Verify Supabase credentials
- Solution: Check browser console for errors

### **Media Not Appearing**

**After upload, media doesn't show**
- Refresh the page
- Check if upload actually succeeded (look for success message)
- Check network tab in browser dev tools

**Thumbnails not loading**
- Thumbnails are generated asynchronously
- May take a few seconds for large images
- Refresh page if thumbnails don't appear

### **Cannot Delete Media**

**"Cannot delete media: it is being used in posts"**
- Media is referenced in one or more posts
- Remove media from posts first, then delete
- Or keep the media for post history

### **Storage Issues**

**Running out of storage**
- Check Supabase storage limits
- Delete unused media
- Archive old media
- Upgrade Supabase plan if needed

---

## 📊 **API REFERENCE**

### **Upload Endpoint**

```typescript
POST /api/admin/media/upload

Headers:
  Content-Type: multipart/form-data

Body:
  file: File (required)
  folder: string (optional, default: "uploads")
  altText: string (optional)
  caption: string (optional)
  tags: string[] (optional)

Response:
  {
    success: true,
    media: {
      id: string,
      url: string,
      thumbnailUrl: string,
      // ... more fields
    }
  }
```

### **List Media**

```typescript
GET /api/admin/media/upload?page=1&limit=24&type=image&search=keyword

Response:
  {
    media: MediaAsset[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      pages: number
    }
  }
```

### **Get Media**

```typescript
GET /api/admin/media/[id]

Response:
  {
    media: MediaAsset
  }
```

### **Update Media**

```typescript
PATCH /api/admin/media/[id]

Body:
  {
    alt: string,
    caption: string,
    folder: string,
    tags: string[]
  }

Response:
  {
    media: MediaAsset
  }
```

### **Delete Media**

```typescript
DELETE /api/admin/media/[id]

Response:
  {
    success: true
  }
```

---

## 🔗 **RELATED DOCUMENTATION**

- [Rich Text Editor Guide](./phase6.5-rich-text-editor.md)
- [Pre-Publish Checklist](./phase6.5-pre-publish-checklist.md)
- [Supabase Storage Setup](./phase6.5-supabase-storage-setup.md)

---

**Questions?** Check the troubleshooting section or consult the API reference.

**Last Updated**: October 20, 2024  
**Version**: 1.0



