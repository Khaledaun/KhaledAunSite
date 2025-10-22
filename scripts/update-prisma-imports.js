const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files that import from @khaledaun/db
const files = execSync('git grep -l "from \'@khaledaun/db\'" apps/admin/', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(f => f);

console.log(`Found ${files.length} files to update`);

files.forEach(file => {
  console.log(`Updating ${file}...`);
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace the import
  content = content.replace(
    /import \{ prisma \} from '@khaledaun\/db';/g,
    "import { prisma } from '@/lib/prisma';"
  );
  
  fs.writeFileSync(file, content, 'utf-8');
});

console.log(`Updated ${files.length} files!`);

