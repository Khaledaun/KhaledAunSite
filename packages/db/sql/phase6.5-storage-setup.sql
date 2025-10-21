-- Phase 6.5: Supabase Storage Setup
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CREATE STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true, -- Public bucket for easy access
  52428800, -- 50MB limit (50 * 1024 * 1024)
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. STORAGE POLICIES
-- ============================================

-- Policy: Authenticated users can upload media to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Public can view all media
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy: Users can update their own media
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete own media, Admins can delete any
CREATE POLICY "Users can delete own media, admins can delete any"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (
    -- User can delete own files
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Admin/Owner can delete any files
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role IN ('ADMIN', 'OWNER')
    )
  )
);

-- ============================================
-- 3. VERIFY SETUP
-- ============================================

-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'media';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Test folder structure
-- Folders will be created automatically on first upload:
-- /media/{userId}/{folder}/{filename}
-- Example: /media/abc123/blog/2024-image.jpg


