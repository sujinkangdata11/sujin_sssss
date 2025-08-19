import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '../public/contents/01');

const languages = ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'nl', 'pt', 'ru', 'hi'];

function parseContentFile(content) {
  const lines = content.split('\n');
  let title = '';
  let excerpt = '';
  let category = 'General';
  let date = '2025-08-18';
  let contentStart = 0;
  
  // Parse metadata
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') {
      contentStart = i + 1;
      break;
    }
    if (line.startsWith('title: ')) {
      title = lines[i].replace('title: ', '');
      // Handle multiline titles
      if (i + 1 < lines.length && !lines[i + 1].includes(':') && lines[i + 1].trim() !== '') {
        title += '\\n' + lines[i + 1].trim();
      }
    }
    if (line.startsWith('excerpt: ')) {
      excerpt = line.replace('excerpt: ', '');
    }
    if (line.startsWith('category: ')) {
      category = line.replace('category: ', '');
    }
    if (line.startsWith('date: ')) {
      date = line.replace('date: ', '');
    }
  }
  
  const contentLines = lines.slice(contentStart).join('\\n').trim();
  
  return { title, excerpt, category, date, content: contentLines };
}

function generateHardcodedFunction(language) {
  const articles = [];
  
  for (let i = 1; i <= 10; i++) {
    const filename = `page1_article${i}_${language}.txt`;
    const filePath = path.join(contentDir, filename);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = parseContentFile(content);
      
      articles.push({
        id: i,
        ...parsed
      });
    }
  }
  
  return articles;
}

// Generate hardcoded functions for all languages
const allLanguagesData = {};

languages.forEach(lang => {
  allLanguagesData[lang] = generateHardcodedFunction(lang);
});

console.log('// Generated hardcoded content for all languages');
console.log('// Add this to contentService.ts loadArticlesForPage function');
console.log();

languages.forEach(lang => {
  console.log(`  // ${lang.toUpperCase()} articles`);
  console.log(`  if (pageNumber === 1 && language === '${lang}') {`);
  
  allLanguagesData[lang].forEach(article => {
    console.log(`    articles.push({`);
    console.log(`      id: ${article.id},`);
    console.log(`      title: "${article.title.replace(/"/g, '\\"')}",`);
    console.log(`      excerpt: "${article.excerpt.replace(/"/g, '\\"')}",`);
    console.log(`      content: \`${article.content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,`);
    console.log(`      category: "${article.category}",`);
    console.log(`      date: "${article.date}"`);
    console.log(`    });`);
  });
  
  console.log(`  }`);
  console.log();
});

console.log('// End of generated content');