# 🌐 Arabic Translation Refinement Guide

## 🎯 **Objective**

Transform literal Arabic translations into culturally appropriate, professional content that:
- Sounds natural to native Arabic speakers
- Reflects business communication norms in MENA region
- Maintains appropriate formality for legal services
- Uses Modern Standard Arabic (الفصحى الحديثة)

---

## 🤖 **AI-Powered Refinement System**

### **How It Works:**

1. **Reads current Arabic translations** from `ar.json`
2. **Creates automatic backup** of original translations
3. **Uses OpenAI GPT-4** to refine each section with cultural awareness
4. **Writes refined translations** back to `ar.json`

### **Cultural Guidelines Applied:**

✅ **Professional Tone** - Appropriate for high-level legal services  
✅ **Modern Standard Arabic** - Universal across MENA region  
✅ **Business Terminology** - Familiar to Arab executives  
✅ **Formal Address** - Respectful without being overly flowery  
✅ **Active Voice** - Direct and authoritative  
✅ **Regional Balance** - Appeals to Gulf, Levant, and North Africa

---

## 🚀 **Running the Refinement**

### **Step 1: Set OpenAI API Key**

The script needs your OpenAI API key (already set in Vercel for the site):

```bash
# Option A: Use the same key from Vercel
# Check Vercel → Settings → Environment Variables → OPENAI_API_KEY

# Option B: Set temporarily for this session (Windows PowerShell)
$env:OPENAI_API_KEY="sk-..."

# Option C: Set temporarily for this session (Linux/Mac)
export OPENAI_API_KEY="sk-..."
```

### **Step 2: Run the Script**

```bash
node scripts/refine-arabic-translations.js
```

### **Expected Output:**

```
🚀 Starting AI-powered Arabic translation refinement...

✅ Created backup at: apps/site/src/messages/ar.backup.json

📝 Refining section 1/10: "Hero"...
✅ Completed "Hero"

📝 Refining section 2/10: "Navigation"...
✅ Completed "Navigation"

... (continues for all sections) ...

✅ Successfully refined all Arabic translations!
📝 Updated file: apps/site/src/messages/ar.json
💾 Backup saved at: apps/site/src/messages/ar.backup.json

🎉 Done! Please review the changes before deploying.
```

---

## 📊 **What Gets Refined**

### **Example Transformations:**

**Before (Literal):**
```json
"greeting": "خالد ن. عون، محامي"
"hireCTA": "تواصل معي"
```

**After (Culturally Refined):**
```json
"greeting": "الأستاذ خالد ن. عون، المحامي والمستشار القانوني"
"hireCTA": "تواصل معنا للاستشارة"
```

### **Changes to Expect:**

- **Titles**: Adding professional honorifics (الأستاذ)
- **Formality**: Using appropriate formal Arabic constructions
- **Terminology**: Legal terms that resonate in Arab business culture
- **Flow**: Natural sentence structure vs. word-for-word translation
- **Respect**: Appropriate level of formality for professional services

---

## ✅ **Review Checklist**

After refinement, manually review these areas:

### **1. Name & Titles**
- [ ] Professional title appropriate (الأستاذ vs. just name)
- [ ] Credentials rendered correctly
- [ ] Formality level matches target audience

### **2. Service Descriptions**
- [ ] Legal terminology accurate and natural
- [ ] Benefits clear and compelling
- [ ] Call-to-actions culturally appropriate

### **3. Navigation & UI**
- [ ] Button text concise and clear
- [ ] Menu items make sense in Arabic
- [ ] Form labels properly phrased

### **4. Professional Tone**
- [ ] Not too casual or too flowery
- [ ] Authoritative but approachable
- [ ] Consistent across all sections

---

## 🔄 **After Refinement**

### **Step 1: Review Changes**

```bash
# View differences (if using git)
git diff apps/site/src/messages/ar.json

# Or compare with backup manually
```

### **Step 2: Test Locally**

```bash
# Run site locally with Arabic locale
cd apps/site
npm run dev
# Visit: http://localhost:3000/ar
```

### **Step 3: Commit & Deploy**

```bash
git add apps/site/src/messages/ar.json scripts/refine-arabic-translations.js
git commit -m "feat: AI-refined Arabic translations for cultural appropriateness"
git push origin main
```

---

## 🎯 **Next Steps After Refinement**

1. ✅ Refined translations ready
2. 🔧 **Fix locale detection** - Make `/ar` actually use Arabic content
3. 🚀 **Deploy** - Push changes to production
4. ✅ **Verify** - Test on `www.khaledaun.com/ar`

---

## 💡 **Re-running for Specific Sections**

If you only want to refine specific sections, modify the script:

```javascript
// In refine-arabic-translations.js, line ~80:
const sections = ['Hero', 'About', 'Services']; // Only these sections
// Instead of:
const sections = Object.keys(currentTranslations); // All sections
```

---

## 🆘 **Troubleshooting**

### **Error: "OPENAI_API_KEY is not set"**
**Solution:** Set the environment variable before running the script

### **Error: "OpenAI API error: 429"**
**Solution:** Rate limited. Wait a minute and try again, or add delays in the script

### **Translations seem weird**
**Solution:** Review the backup file, manually adjust, or re-run with modified prompts

---

**Ready to run?** 🚀

1. Set your `OPENAI_API_KEY`
2. Run `node scripts/refine-arabic-translations.js`
3. Review the refined translations
4. Commit and deploy!

