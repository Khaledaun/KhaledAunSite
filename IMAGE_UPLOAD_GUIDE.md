# Image Upload Guide for Khaled Aun Website

## 📸 Required Images

### 1. **Hero Section Portrait** (REQUIRED)
- **Location**: `apps/site/public/images/hero/khaled-portrait.jpg`
- **Recommended Size**: 600x600px or larger (square or portrait orientation)
- **Format**: JPG or PNG
- **Description**: Professional portrait photo for the hero section and about section
- **Usage**: Main hero image and rotating circular image in About section

### 2. **Background Images** (Optional)
- **Location**: `apps/site/public/images/bg/`
- **Files**:
  - `bg1.jpg` - Can be used for section backgrounds
  - `bg2.jpg` - Alternative background
  - `bg3.jpg` - Alternative background
- **Recommended Size**: 1920x1080px or larger
- **Format**: JPG
- **Description**: Subtle background images for various sections

### 3. **Logo** (Optional)
- **Location**: `apps/site/public/images/`
- **Files**:
  - `logo-dark.png` - Logo for light backgrounds
  - `logo-light.png` - Logo for dark backgrounds
- **Recommended Size**: 200x50px (or maintain aspect ratio)
- **Format**: PNG (with transparency)

## 🎯 Current Image References in Code

The following images are currently referenced and should be uploaded:

1. **Hero/About Portrait**:
   - `HeroDennis.js`: `/images/hero/khaled-portrait.jpg`
   - `AboutDennis.js`: `/images/hero/khaled-portrait.jpg`

## 📝 How to Upload

### Option 1: Direct Upload (Recommended)
1. Navigate to `C:\Users\aunka\OneDrive\Documents\github-repos\KhaledAunSite\apps\site\public\images\hero\`
2. Copy your professional portrait photo
3. Rename it to `khaled-portrait.jpg`
4. Paste it in the `hero` folder

### Option 2: Via Git
1. Place images in the correct directories
2. Run:
   ```bash
   git add apps/site/public/images/
   git commit -m "Add professional photos"
   git push origin feat/dennis-design-implementation
   ```

## 🎨 Image Optimization Tips

- **Compress images** before uploading (use tools like TinyPNG or ImageOptim)
- **Recommended formats**:
  - Photos: JPG (for smaller file size)
  - Logos/Graphics: PNG (for transparency)
- **Max file size**: Keep under 500KB per image for fast loading

## 🔧 Fallback Behavior

If images are not uploaded, the site will:
- Show Next.js placeholder images
- Display alt text for accessibility
- Continue to function normally (no errors)

## ✅ Next Steps

After uploading your portrait:
1. The dev server at `http://localhost:3001` will automatically reload
2. Check both `/en` and `/ar` versions
3. Test dark/light mode to ensure image looks good in both themes

---

**Note**: The most important image is your professional portrait (`khaled-portrait.jpg`). Upload this first to see immediate results in the Hero and About sections!

