/**
 * AI-Powered Arabic Translation Refinement
 * 
 * This script uses OpenAI to refine Arabic translations to be:
 * - Culturally appropriate for Arabic-speaking professionals
 * - Natural and professional for legal/business context
 * - Respectful of Arabic business communication norms
 * - Proper formal Arabic (Fusha) for professional services
 */

const fs = require('fs');
const path = require('path');

// Check if OPENAI_API_KEY is available
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is not set');
  console.log('\n📝 To run this script:');
  console.log('   1. Set OPENAI_API_KEY in your environment or .env file');
  console.log('   2. Run: node scripts/refine-arabic-translations.js');
  process.exit(1);
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are an expert Arabic translator and cultural consultant specializing in legal and business communications for the Middle East and North Africa (MENA) region.

Your task is to refine existing Arabic translations to make them:
1. **Culturally Appropriate**: Use language that resonates with Arab professionals and business leaders
2. **Professional & Formal**: Use Modern Standard Arabic (الفصحى الحديثة) appropriate for legal services
3. **Natural**: Avoid literal translations that sound awkward or machine-translated
4. **Respectful**: Use appropriate formality levels for a senior legal consultant
5. **Business-Oriented**: Use terminology familiar to Arab business executives and decision-makers

IMPORTANT GUIDELINES:
- Maintain professional tone appropriate for high-level legal services
- Use formal address forms (أنت for direct address, avoiding overly casual language)
- Preserve legal terminology accuracy while making it culturally natural
- Consider regional preferences (Gulf, Levant, North Africa) and aim for universal MENA appeal
- Avoid overly flowery language that may seem insincere
- Use active voice and direct language common in business Arabic

When refining translations:
- Keep the meaning identical to the original
- Make the Arabic sound natural to a native speaker
- Ensure it sounds professional and authoritative
- Consider how a top-tier Arab law firm would present itself`;

const USER_PROMPT_TEMPLATE = (section, translations) => `Please refine the following Arabic translations for the "${section}" section of a legal professional's website.

Current translations (may be literal or awkward):
${JSON.stringify(translations, null, 2)}

Please provide refined, culturally appropriate, and professional Arabic translations that:
1. Sound natural to native Arabic speakers in a business/legal context
2. Maintain the professional tone expected for a senior legal consultant
3. Are culturally appropriate for MENA region business professionals
4. Use proper Modern Standard Arabic (Fusha) for formal business communication

Respond ONLY with a valid JSON object using the same keys, with refined Arabic translations as values. Do not include any explanation or markdown formatting.`;

async function refineTranslations(section, translations) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: USER_PROMPT_TEMPLATE(section, translations) }
        ],
        temperature: 0.3, // Lower temperature for more consistent, professional output
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const refinedText = data.choices[0].message.content.trim();
    
    // Parse the JSON response
    const refined = JSON.parse(refinedText);
    return refined;
  } catch (error) {
    console.error(`❌ Error refining section "${section}":`, error.message);
    return translations; // Return original on error
  }
}

async function main() {
  console.log('🚀 Starting AI-powered Arabic translation refinement...\n');
  
  // Read current Arabic translations
  const arPath = path.join(__dirname, '../apps/site/src/messages/ar.json');
  const currentTranslations = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
  
  // Create backup
  const backupPath = path.join(__dirname, '../apps/site/src/messages/ar.backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(currentTranslations, null, 2));
  console.log('✅ Created backup at:', backupPath);
  
  const refinedTranslations = {};
  const sections = Object.keys(currentTranslations);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    console.log(`\n📝 Refining section ${i + 1}/${sections.length}: "${section}"...`);
    
    const refined = await refineTranslations(section, currentTranslations[section]);
    refinedTranslations[section] = refined;
    
    console.log(`✅ Completed "${section}"`);
    
    // Add a small delay to avoid rate limiting
    if (i < sections.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Write refined translations
  fs.writeFileSync(arPath, JSON.stringify(refinedTranslations, null, 2));
  console.log('\n✅ Successfully refined all Arabic translations!');
  console.log('📝 Updated file:', arPath);
  console.log('💾 Backup saved at:', backupPath);
  console.log('\n🎉 Done! Please review the changes before deploying.');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

