# 🌐 Configure Social Media Buttons

## Current Status
The social media buttons in the header are **conditionally rendered** - they only appear if their corresponding environment variables are set in Vercel.

## 🎨 Design Change (Just Applied)
**Before:** White icons on dark blue background (hard to see)
**After:** Dark blue icons on golden background (clearly visible) ✨

---

## 🔧 How to Enable Social Media Buttons

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select project: **`khaledaun-site`** (or whatever your site project is called)
3. Click **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add the following variables for **all environments** (Production, Preview, Development):

#### Instagram Button
- **Key:** `NEXT_PUBLIC_INSTAGRAM_URL`
- **Value:** `https://instagram.com/yourusername`
- ✅ Check: Production
- ✅ Check: Preview
- ✅ Check: Development

#### LinkedIn Button
- **Key:** `NEXT_PUBLIC_LINKEDIN_URL`
- **Value:** `https://linkedin.com/in/khaledaun`
- ✅ Check: Production
- ✅ Check: Preview
- ✅ Check: Development

### Step 3: Redeploy
After adding the variables:
1. Go to **Deployments** tab
2. Click **...** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

---

## 🎨 Button Appearance

Once configured, the buttons will appear in the header (top right):

```
┌─────────────────────────────────────────────────────┐
│  Khaled Aun    Home About ... Contact  🟡 🟡 العربية│
└─────────────────────────────────────────────────────┘
                                           ↑  ↑
                                    Instagram LinkedIn
```

**Visual Style:**
- 🟡 Golden circular background
- 🔵 Dark blue (navy) icon
- ✨ Shadow effect for depth
- 🎯 Hover effect: slightly lighter golden

---

## 📱 Mobile Behavior

The social media buttons are **hidden on mobile** and appear in the mobile menu instead.

- **Desktop:** Visible in header
- **Mobile:** Hidden in header, available in slide-out menu

---

## 🧪 Testing

### After Adding Variables:
1. Visit: https://www.khaledaun.com
2. Look at top-right of header (desktop view)
3. Should see two golden circles with dark blue icons
4. Hover over them to see the hover effect
5. Click to verify they link to correct URLs

### If Still Not Showing:
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Wait 5 minutes for CDN cache to clear
- Check Vercel deployment logs for errors

---

## 🔍 Technical Details

### Code Location
`apps/site/src/components/site/Header.js` (lines 78-106)

### Conditional Rendering Logic
```jsx
{process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
  <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} ...>
    <Instagram className="w-5 h-5 fill-current" />
  </a>
)}
```

### Why `NEXT_PUBLIC_` Prefix?
Next.js requires the `NEXT_PUBLIC_` prefix for environment variables that need to be accessible in the browser (client-side). Without this prefix, the variable is only available server-side.

---

## 🎯 Recommended URLs

### LinkedIn
**Format:** `https://linkedin.com/in/khaledaun`
- This is your professional profile URL
- Should match your actual LinkedIn username

### Instagram
**Format:** `https://instagram.com/yourusername`
- Replace `yourusername` with your actual Instagram handle
- Or remove this variable if you don't want an Instagram button

---

## 🚫 To Remove a Button

If you don't want one of the buttons to show:

1. Simply **don't add** that environment variable
2. Or **delete** the existing variable from Vercel
3. The button will automatically disappear

**Example:** If you only want LinkedIn and not Instagram:
- ✅ Add `NEXT_PUBLIC_LINKEDIN_URL`
- ❌ Don't add `NEXT_PUBLIC_INSTAGRAM_URL`

---

## 📞 Support

If buttons still don't appear after following these steps:
1. Check Vercel environment variables are saved
2. Verify deployment completed successfully
3. Hard refresh your browser
4. Check browser console for JavaScript errors
5. Wait a few minutes for CDN propagation

---

Generated: October 23, 2025
Commit: `f669b31`

