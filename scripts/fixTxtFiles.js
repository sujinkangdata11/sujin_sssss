import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '../public/contents/01');

function fixTxtFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let titleLines = [];
  let excerptLines = [];
  let otherLines = [];
  let currentSection = 'other';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('title: ')) {
      titleLines.push(line.replace('title: ', ''));
      currentSection = 'title';
    } else if (line.startsWith('excerpt: ')) {
      excerptLines.push(line.replace('excerpt: ', ''));
      currentSection = 'excerpt';
    } else if (line.startsWith('category: ') || line.startsWith('date: ')) {
      otherLines.push(line);
      currentSection = 'other';
    } else if (line.trim() === '') {
      otherLines.push(line);
      currentSection = 'other';
    } else if (currentSection === 'title' && !line.includes(':')) {
      titleLines.push(line.trim());
    } else if (currentSection === 'excerpt' && !line.includes(':')) {
      excerptLines.push(line.trim());
    } else {
      otherLines.push(line);
      currentSection = 'other';
    }
  }
  
  // Combine multiline title and excerpt
  const fixedTitle = titleLines.join(' ').trim();
  const fixedExcerpt = excerptLines.join(' ').trim();
  
  // Find where content starts (after empty line)
  const contentStart = otherLines.findIndex((line, index) => 
    line.trim() === '' && index > 0 && !otherLines[index - 1].includes(':')
  );
  
  const metadataLines = otherLines.slice(0, contentStart);
  const contentLines = otherLines.slice(contentStart);
  
  // Rebuild file
  const newContent = [
    `title: ${fixedTitle}`,
    `excerpt: ${fixedExcerpt}`,
    ...metadataLines.filter(line => line.includes('category:') || line.includes('date:')),
    ...contentLines
  ].join('\n');
  
  fs.writeFileSync(filePath, newContent);
  console.log(`Fixed: ${path.basename(filePath)} - Title: "${fixedTitle.substring(0, 50)}..."`);
}

// Process all txt files
const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.txt'));
files.forEach(file => {
  const filePath = path.join(contentDir, file);
  try {
    fixTxtFile(filePath);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`Processed ${files.length} files`);