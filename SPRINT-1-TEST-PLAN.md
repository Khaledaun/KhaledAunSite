# Sprint 1 - AI Content System Test Plan

## Overview
This document outlines the testing plan for Sprint 1 of the AI Content Management System.

## Test Environment
- **Admin URL**: https://admin.khaledaun.com
- **Database**: Supabase (production)
- **Deployment**: Vercel

## Prerequisites
- Admin access to the system
- Database tables created (run `RUN-THIS-IN-SUPABASE.sql`)
- Vercel deployment completed

---

## 1. Database Schema Tests

### Test 1.1: Verify Tables Exist
**Steps:**
1. Log into Supabase dashboard
2. Navigate to Table Editor
3. Verify the following tables exist:
   - `ai_topics`
   - `ai_content`
   - `ai_media`

**Expected Result:** All three tables are present with correct schema

**Status:** ⏳ Pending

---

### Test 1.2: Verify Table Relationships
**Steps:**
1. Check `ai_content` table
2. Verify `topic_id` foreign key references `ai_topics(id)`
3. Check `ai_media` table
4. Verify `content_id` foreign key references `ai_content(id)`

**Expected Result:** Foreign key relationships are properly configured

**Status:** ⏳ Pending

---

## 2. Topic Queue Tests

### Test 2.1: Access Topic Queue Page
**Steps:**
1. Navigate to `https://admin.khaledaun.com/admin/topics`
2. Verify page loads without errors

**Expected Result:** Page displays with "Topic Queue" heading and empty state or list of topics

**Status:** ⏳ Pending

---

### Test 2.2: Create New Topic
**Steps:**
1. On Topic Queue page, click "Add Topic" button
2. Fill in the form:
   - Title: "Test Topic 1"
   - Description: "This is a test topic for AI content generation"
   - Priority: "high"
   - Content Type: "blog_post"
3. Click "Create Topic"

**Expected Result:** 
- Topic is created successfully
- Success message appears
- Topic appears in the list with status "pending"

**Status:** ⏳ Pending

---

### Test 2.3: View Topic List
**Steps:**
1. Verify the created topic appears in the list
2. Check that the following fields are displayed:
   - Title
   - Status badge (pending/processing/completed/failed)
   - Priority badge
   - Content type
   - Created date
   - Action buttons

**Expected Result:** All fields display correctly

**Status:** ⏳ Pending

---

### Test 2.4: Edit Topic
**Steps:**
1. Click "Edit" button on a topic
2. Modify the title to "Test Topic 1 - Updated"
3. Change priority to "medium"
4. Click "Save"

**Expected Result:** 
- Topic is updated successfully
- Changes are reflected in the list

**Status:** ⏳ Pending

---

### Test 2.5: Lock/Unlock Topic
**Steps:**
1. Click "Lock" button on a topic
2. Verify status changes to "processing"
3. Click "Unlock" button
4. Verify status changes back to "pending"

**Expected Result:** Status changes correctly and UI updates

**Status:** ⏳ Pending

---

### Test 2.6: Delete Topic
**Steps:**
1. Click "Delete" button on a topic
2. Confirm deletion in the dialog
3. Verify topic is removed from the list

**Expected Result:** Topic is deleted and no longer appears

**Status:** ⏳ Pending

---

### Test 2.7: Topic Filtering/Sorting
**Steps:**
1. Create multiple topics with different statuses and priorities
2. Test filtering by status
3. Test sorting by priority
4. Test sorting by date

**Expected Result:** Filtering and sorting work correctly

**Status:** ⏳ Pending

---

## 3. Content Library Tests

### Test 3.1: Access Content Library Page
**Steps:**
1. Navigate to `https://admin.khaledaun.com/admin/content/library`
2. Verify page loads without errors

**Expected Result:** Page displays with "Content Library" heading

**Status:** ⏳ Pending

---

### Test 3.2: View Content List
**Steps:**
1. Verify the content list displays (may be empty initially)
2. Check that columns include:
   - Title
   - Status
   - Topic reference
   - Content type
   - Created date
   - Actions

**Expected Result:** List displays correctly with proper columns

**Status:** ⏳ Pending

---

### Test 3.3: View Content Details
**Steps:**
1. Click on a content item (if any exist)
2. Verify content details page loads
3. Check that the following are displayed:
   - Full content text
   - Metadata
   - Associated topic
   - Media attachments (if any)

**Expected Result:** Content details display correctly

**Status:** ⏳ Pending

---

### Test 3.4: Edit Content
**Steps:**
1. Click "Edit" on a content item
2. Modify the content text
3. Update metadata
4. Click "Save"

**Expected Result:** Content is updated successfully

**Status:** ⏳ Pending

---

### Test 3.5: Publish Content
**Steps:**
1. Select a content item with status "draft"
2. Click "Publish" button
3. Verify status changes to "published"

**Expected Result:** Status updates correctly

**Status:** ⏳ Pending

---

### Test 3.6: Delete Content
**Steps:**
1. Click "Delete" on a content item
2. Confirm deletion
3. Verify content is removed

**Expected Result:** Content is deleted successfully

**Status:** ⏳ Pending

---

## 4. Media Library Tests

### Test 4.1: Access Media Library Page
**Steps:**
1. Navigate to `https://admin.khaledaun.com/admin/media`
2. Verify page loads without errors

**Expected Result:** Page displays with "Media Library" heading and upload area

**Status:** ⏳ Pending

---

### Test 4.2: Upload Image
**Steps:**
1. Click upload area or drag-and-drop an image file
2. Select a JPG or PNG image (< 5MB)
3. Wait for upload to complete

**Expected Result:** 
- Upload progress indicator appears
- Image is uploaded successfully
- Thumbnail appears in the media grid
- Success message displays

**Status:** ⏳ Pending

---

### Test 4.3: Upload Multiple Images
**Steps:**
1. Select multiple images at once (3-5 images)
2. Upload them simultaneously

**Expected Result:** 
- All images upload successfully
- Progress shown for each
- All thumbnails appear in grid

**Status:** ⏳ Pending

---

### Test 4.4: View Image Details
**Steps:**
1. Click on an uploaded image
2. Verify modal/detail view opens
3. Check that the following are displayed:
   - Full-size image
   - File name
   - File size
   - Upload date
   - URL/path
   - Associated content (if any)

**Expected Result:** All details display correctly

**Status:** ⏳ Pending

---

### Test 4.5: Copy Image URL
**Steps:**
1. Click "Copy URL" button on an image
2. Paste the URL in a new browser tab

**Expected Result:** 
- URL is copied to clipboard
- Image loads when URL is accessed

**Status:** ⏳ Pending

---

### Test 4.6: Delete Image
**Steps:**
1. Click "Delete" button on an image
2. Confirm deletion
3. Verify image is removed from grid

**Expected Result:** Image is deleted successfully

**Status:** ⏳ Pending

---

### Test 4.7: Upload Invalid File
**Steps:**
1. Try to upload a non-image file (e.g., .txt, .pdf)
2. Try to upload an image larger than 5MB

**Expected Result:** 
- Error message appears
- Upload is rejected
- User is informed of the issue

**Status:** ⏳ Pending

---

## 5. Navigation Tests

### Test 5.1: Admin Sidebar Navigation
**Steps:**
1. Log into admin panel
2. Verify sidebar contains new menu items:
   - "Topic Queue" under "AI Content"
   - "Content Library" under "AI Content"
   - "Media Library" under "AI Content"
3. Click each menu item

**Expected Result:** 
- All menu items are visible
- Clicking navigates to correct page
- Active state highlights current page

**Status:** ⏳ Pending

---

### Test 5.2: Breadcrumb Navigation
**Steps:**
1. Navigate to a deep page (e.g., content details)
2. Check breadcrumb trail
3. Click breadcrumb links to navigate back

**Expected Result:** Breadcrumbs work correctly

**Status:** ⏳ Pending

---

## 6. API Endpoint Tests

### Test 6.1: Topic API - GET /api/topics
**Steps:**
1. Open browser DevTools Network tab
2. Navigate to Topic Queue page
3. Verify API call to `/api/topics`
4. Check response status and data

**Expected Result:** 
- Status: 200 OK
- Returns array of topics
- Proper JSON structure

**Status:** ⏳ Pending

---

### Test 6.2: Topic API - POST /api/topics
**Steps:**
1. Create a new topic via UI
2. Monitor network request
3. Verify POST request to `/api/topics`

**Expected Result:** 
- Status: 201 Created
- Returns created topic with ID

**Status:** ⏳ Pending

---

### Test 6.3: Topic API - PUT /api/topics/[id]
**Steps:**
1. Edit a topic via UI
2. Monitor network request
3. Verify PUT request

**Expected Result:** 
- Status: 200 OK
- Returns updated topic

**Status:** ⏳ Pending

---

### Test 6.4: Topic API - DELETE /api/topics/[id]
**Steps:**
1. Delete a topic via UI
2. Monitor network request
3. Verify DELETE request

**Expected Result:** 
- Status: 200 OK
- Topic is removed from database

**Status:** ⏳ Pending

---

### Test 6.5: Content API - GET /api/content
**Steps:**
1. Navigate to Content Library
2. Verify API call
3. Check response

**Expected Result:** 
- Status: 200 OK
- Returns array of content items

**Status:** ⏳ Pending

---

### Test 6.6: Media API - POST /api/media/upload
**Steps:**
1. Upload an image via UI
2. Monitor network request
3. Verify multipart/form-data upload

**Expected Result:** 
- Status: 200 OK
- Returns media object with URL

**Status:** ⏳ Pending

---

### Test 6.7: Media API - GET /api/media
**Steps:**
1. Navigate to Media Library
2. Verify API call
3. Check response

**Expected Result:** 
- Status: 200 OK
- Returns array of media items

**Status:** ⏳ Pending

---

## 7. Error Handling Tests

### Test 7.1: Network Error Handling
**Steps:**
1. Disconnect internet
2. Try to load a page
3. Try to submit a form

**Expected Result:** 
- Appropriate error messages display
- User is informed of network issue

**Status:** ⏳ Pending

---

### Test 7.2: Validation Error Handling
**Steps:**
1. Try to create a topic with empty title
2. Try to upload a file that's too large
3. Try to submit invalid data

**Expected Result:** 
- Validation errors display
- Form doesn't submit
- User is guided to fix issues

**Status:** ⏳ Pending

---

### Test 7.3: 404 Error Handling
**Steps:**
1. Navigate to non-existent topic: `/admin/topics/999999`
2. Navigate to non-existent content: `/admin/content/999999`

**Expected Result:** 
- 404 page displays
- User can navigate back

**Status:** ⏳ Pending

---

## 8. Performance Tests

### Test 8.1: Page Load Time
**Steps:**
1. Clear browser cache
2. Navigate to each main page
3. Measure load time (using DevTools Performance tab)

**Expected Result:** Pages load in < 3 seconds

**Status:** ⏳ Pending

---

### Test 8.2: Large List Performance
**Steps:**
1. Create 50+ topics
2. Navigate to Topic Queue
3. Test scrolling and filtering performance

**Expected Result:** UI remains responsive

**Status:** ⏳ Pending

---

### Test 8.3: Image Upload Performance
**Steps:**
1. Upload a 4.9MB image
2. Measure upload time

**Expected Result:** Upload completes in reasonable time (< 30 seconds)

**Status:** ⏳ Pending

---

## 9. Security Tests

### Test 9.1: Authentication Required
**Steps:**
1. Log out of admin panel
2. Try to access `/admin/topics` directly
3. Try to access `/admin/content/library` directly

**Expected Result:** 
- Redirected to login page
- Cannot access without authentication

**Status:** ⏳ Pending

---

### Test 9.2: Authorization Check
**Steps:**
1. Log in with a non-admin user (if applicable)
2. Try to access AI Content pages

**Expected Result:** 
- Access denied or redirected
- Proper authorization checks in place

**Status:** ⏳ Pending

---

### Test 9.3: SQL Injection Protection
**Steps:**
1. Try to create a topic with title: `'; DROP TABLE ai_topics; --`
2. Try to search with malicious input

**Expected Result:** 
- Input is sanitized
- No SQL injection occurs
- Data is properly escaped

**Status:** ⏳ Pending

---

## 10. Mobile Responsiveness Tests

### Test 10.1: Mobile Layout - Topic Queue
**Steps:**
1. Open Topic Queue on mobile device or use DevTools mobile emulation
2. Test all functionality

**Expected Result:** 
- Layout adapts to mobile screen
- All features work on mobile
- Touch targets are appropriate size

**Status:** ⏳ Pending

---

### Test 10.2: Mobile Layout - Content Library
**Steps:**
1. Open Content Library on mobile
2. Test navigation and actions

**Expected Result:** Mobile-friendly layout and functionality

**Status:** ⏳ Pending

---

### Test 10.3: Mobile Layout - Media Library
**Steps:**
1. Open Media Library on mobile
2. Test image upload via mobile

**Expected Result:** 
- Upload works on mobile
- Grid layout adapts
- Images display correctly

**Status:** ⏳ Pending

---

## Test Summary

### Statistics
- **Total Tests**: 47
- **Passed**: 0
- **Failed**: 0
- **Pending**: 47

### Critical Issues
*To be filled during testing*

### Non-Critical Issues
*To be filled during testing*

### Recommendations
*To be filled after testing*

---

## Testing Checklist

- [ ] All database tables created
- [ ] All pages accessible
- [ ] All CRUD operations work
- [ ] API endpoints respond correctly
- [ ] Error handling works
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] Security measures in place
- [ ] Performance acceptable
- [ ] No console errors

---

## Next Steps After Testing

1. Fix any critical bugs found
2. Document known issues
3. Create user documentation
4. Plan Sprint 2 features
5. Deploy fixes to production

---

**Test Date**: TBD  
**Tester**: TBD  
**Environment**: Production (admin.khaledaun.com)

