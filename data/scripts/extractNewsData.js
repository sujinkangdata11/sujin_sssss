#!/usr/bin/env node

/**
 * Data Extraction Script for VIDHUNT News Feed
 * 
 * This script extracts the hardcoded NEWS_DATA from contentService.ts
 * and creates structured JSON files for better data management.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.join(__dirname, '../..');
const CONTENT_SERVICE_PATH = path.join(PROJECT_ROOT, 'services/contentService.ts');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backup');
const SOURCE_DIR = path.join(DATA_DIR, 'source');
const GENERATED_DIR = path.join(DATA_DIR, 'generated');

function extractNewsData() {
  console.log('🔍 Extracting NEWS_DATA from contentService.ts...');
  
  try {
    // Read the contentService.ts file
    const content = fs.readFileSync(CONTENT_SERVICE_PATH, 'utf8');
    
    // Find the NEWS_DATA constant
    const newsDataStart = content.indexOf('const NEWS_DATA: Record<Language, Article[]> = {');
    if (newsDataStart === -1) {
      throw new Error('NEWS_DATA not found in contentService.ts');
    }
    
    // Find the end of the NEWS_DATA object (this is a simplified approach)
    // We'll look for the first occurrence of '};\n' after a significant amount of content
    let braceCount = 0;
    let newsDataEnd = newsDataStart;
    let inString = false;
    let stringChar = '';
    let i = newsDataStart + 'const NEWS_DATA: Record<Language, Article[]> = '.length;
    
    while (i < content.length) {
      const char = content[i];
      const prevChar = i > 0 ? content[i-1] : '';
      
      // Handle string literals
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
      
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            newsDataEnd = i + 1;
            break;
          }
        }
      }
      i++;
    }
    
    // Extract the NEWS_DATA object
    const newsDataStr = content.substring(newsDataStart, newsDataEnd);
    
    // Create a timestamp for this extraction
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save raw extraction
    const rawExtractionPath = path.join(BACKUP_DIR, `raw-news-data-${timestamp}.ts`);
    fs.writeFileSync(rawExtractionPath, newsDataStr);
    console.log(`✅ Raw NEWS_DATA saved to: ${rawExtractionPath}`);
    
    return { newsDataStr, timestamp };
    
  } catch (error) {
    console.error('❌ Error extracting NEWS_DATA:', error.message);
    process.exit(1);
  }
}

function createBackupStructure(timestamp) {
  console.log('📦 Creating backup structure...');
  
  const backupData = {
    meta: {
      version: "1.0.0",
      extractedAt: new Date().toISOString(),
      extractedFrom: "services/contentService.ts",
      totalArticles: 109,
      languages: ['ko', 'en', 'ja', 'zh', 'hi', 'es', 'fr', 'de', 'nl', 'pt', 'ru'],
      description: "Complete backup of hardcoded news data from VIDHUNT"
    },
    structure: {
      contentFiles: "public/contents/01/page1_article[1-10]_[language].txt",
      images: "public/contents/01/[articleId]_image_[number].png",
      thumbnails: "public/contents/01/[articleId]_thumbnail.png"
    }
  };
  
  const backupMetaPath = path.join(BACKUP_DIR, `backup-metadata-${timestamp}.json`);
  fs.writeFileSync(backupMetaPath, JSON.stringify(backupData, null, 2));
  console.log(`✅ Backup metadata saved to: ${backupMetaPath}`);
  
  return backupData;
}

function createSourceDataStructure() {
  console.log('📋 Creating source data structure...');
  
  // Create index of all source files
  const sourceIndex = {
    meta: {
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      description: "Index of all source content files"
    },
    textFiles: [],
    imageFiles: [],
    thumbnailFiles: []
  };
  
  const contentsDir = path.join(PROJECT_ROOT, 'public/contents/01');
  
  if (fs.existsSync(contentsDir)) {
    const files = fs.readdirSync(contentsDir);
    
    files.forEach(file => {
      if (file.endsWith('.txt')) {
        const match = file.match(/page1_article(\d+)_(\w+)\.txt/);
        if (match) {
          sourceIndex.textFiles.push({
            filename: file,
            articleId: parseInt(match[1]),
            language: match[2],
            path: `public/contents/01/${file}`
          });
        }
      } else if (file.endsWith('.png')) {
        if (file.includes('_thumbnail.png')) {
          const match = file.match(/(\d+)_thumbnail\.png/);
          if (match) {
            sourceIndex.thumbnailFiles.push({
              filename: file,
              articleId: parseInt(match[1]),
              path: `public/contents/01/${file}`
            });
          }
        } else if (file.includes('_image_')) {
          const match = file.match(/(\d+)_image_(\d+)\.png/);
          if (match) {
            sourceIndex.imageFiles.push({
              filename: file,
              articleId: parseInt(match[1]),
              imageNumber: parseInt(match[2]),
              path: `public/contents/01/${file}`
            });
          }
        }
      }
    });
  }
  
  const sourceIndexPath = path.join(SOURCE_DIR, 'content-index.json');
  fs.writeFileSync(sourceIndexPath, JSON.stringify(sourceIndex, null, 2));
  console.log(`✅ Source index saved to: ${sourceIndexPath}`);
  
  return sourceIndex;
}

function createSchemaFiles() {
  console.log('📝 Creating schema files...');
  
  const articleSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "VIDHUNT News Article",
    "type": "object",
    "required": ["id", "title", "date", "excerpt", "content", "category"],
    "properties": {
      "id": {
        "type": "number",
        "description": "Unique identifier for the article"
      },
      "title": {
        "type": "string",
        "description": "Article title (may contain newlines)"
      },
      "date": {
        "type": "string",
        "format": "date",
        "description": "Publication date in YYYY-MM-DD format"
      },
      "excerpt": {
        "type": "string",
        "description": "Brief excerpt or summary"
      },
      "content": {
        "type": "string",
        "description": "Full article content with markdown formatting"
      },
      "category": {
        "type": "string",
        "description": "Article category"
      },
      "sourceFile": {
        "type": "string",
        "description": "Optional: source file reference"
      }
    }
  };
  
  const newsDataSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "VIDHUNT News Data Structure",
    "type": "object",
    "required": ["version", "lastUpdated", "totalArticles", "languages", "articles"],
    "properties": {
      "version": {
        "type": "string",
        "description": "Data structure version"
      },
      "lastUpdated": {
        "type": "string",
        "format": "date",
        "description": "Last update date"
      },
      "totalArticles": {
        "type": "number",
        "description": "Total number of articles across all languages"
      },
      "languages": {
        "type": "number",
        "description": "Number of supported languages"
      },
      "articles": {
        "type": "object",
        "patternProperties": {
          "^(en|ko|ja|zh|hi|es|fr|de|nl|pt|ru)$": {
            "type": "array",
            "items": { "$ref": "#/definitions/article" }
          }
        },
        "additionalProperties": false
      }
    },
    "definitions": {
      "article": articleSchema.properties
    }
  };
  
  const schemaDir = path.join(DATA_DIR, 'schema');
  fs.writeFileSync(path.join(schemaDir, 'article.schema.json'), JSON.stringify(articleSchema, null, 2));
  fs.writeFileSync(path.join(schemaDir, 'news-data.schema.json'), JSON.stringify(newsDataSchema, null, 2));
  
  console.log(`✅ Schema files created in: ${schemaDir}`);
}

function createDataManagementGuide() {
  console.log('📚 Creating data management guide...');
  
  const guide = `# VIDHUNT News Data Management Guide

## Directory Structure

\`\`\`
data/
├── backup/           # Complete backups with timestamps
├── source/           # Source file indexes and mappings  
├── generated/        # Auto-generated files
├── schema/           # JSON schemas for validation
├── scripts/          # Data management scripts
├── migrations/       # Data migration scripts
├── logs/            # Operation logs
└── assets/          # Asset management files
\`\`\`

## File Types

### Backup Files
- \`raw-news-data-TIMESTAMP.ts\` - Raw extracted TypeScript code
- \`backup-metadata-TIMESTAMP.json\` - Backup metadata and structure info
- \`full-backup-TIMESTAMP.json\` - Complete JSON export of all data

### Source Files  
- \`content-index.json\` - Index of all source text and image files
- \`language-mapping.json\` - Language code mappings
- \`article-mapping.json\` - Article ID to file mappings

### Generated Files
- \`newsData.json\` - Current working data file
- \`articles-by-language.json\` - Articles organized by language
- \`metadata-summary.json\` - Summary statistics

### Schema Files
- \`article.schema.json\` - JSON schema for individual articles
- \`news-data.schema.json\` - JSON schema for complete news data structure

## Usage

### Adding New Articles

1. **Add source files:**
   \`\`\`
   public/contents/01/page1_article[ID]_[LANG].txt
   public/contents/01/[ID]_thumbnail.png
   public/contents/01/[ID]_image_[NUM].png
   \`\`\`

2. **Run data sync:**
   \`\`\`bash
   npm run data:sync
   \`\`\`

3. **Update content service:**
   \`\`\`bash
   npm run data:migrate
   \`\`\`

### Updating Existing Articles

1. **Edit source files directly**
2. **Run validation:**
   \`\`\`bash
   npm run data:validate
   \`\`\`
3. **Sync changes:**
   \`\`\`bash
   npm run data:sync
   \`\`\`

### Backup Operations

**Create backup:**
\`\`\`bash
npm run data:backup
\`\`\`

**Restore from backup:**
\`\`\`bash
npm run data:restore -- --file=backup-TIMESTAMP.json
\`\`\`

### Data Validation

**Validate all data:**
\`\`\`bash
npm run data:validate
\`\`\`

**Check for missing files:**
\`\`\`bash
npm run data:check-files
\`\`\`

## Migration Path

### Phase 1: Current State (Hardcoded)
- NEWS_DATA hardcoded in contentService.ts
- Content files in public/contents/01/
- Manual updates required

### Phase 2: Hybrid Approach (Recommended)
- Keep hardcoded data as fallback
- Load from JSON files when available
- Gradual migration of content

### Phase 3: Full Dynamic Loading
- Complete removal of hardcoded data
- Database-driven content management
- Real-time content updates

## Best Practices

1. **Always backup before major changes**
2. **Validate data after updates**
3. **Use consistent naming conventions**
4. **Keep source files and generated files in sync**
5. **Test in development before production deployment**

## Troubleshooting

### Common Issues

**Missing source files:**
- Check file naming convention
- Verify file permissions
- Run \`npm run data:check-files\`

**Data validation errors:**
- Check JSON syntax
- Verify required fields
- Run \`npm run data:validate\`

**Image loading issues:**
- Verify image file paths
- Check file extensions (.png)
- Ensure proper naming convention

### Recovery

**If data corruption occurs:**
1. Stop all services
2. Restore from latest backup
3. Validate restored data
4. Restart services

**If source files are missing:**
1. Check backup directory
2. Restore missing files
3. Re-run data sync
`;

  const guidePath = path.join(DATA_DIR, 'DATA_MANAGEMENT_GUIDE.md');
  fs.writeFileSync(guidePath, guide);
  console.log(`✅ Data management guide created: ${guidePath}`);
}

// Main execution
function main() {
  console.log('🚀 Starting VIDHUNT News Data Management Setup...\n');
  
  // Ensure directories exist
  [BACKUP_DIR, SOURCE_DIR, GENERATED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Extract and backup current data
  const { newsDataStr, timestamp } = extractNewsData();
  const backupData = createBackupStructure(timestamp);
  
  // Create source data structure
  const sourceIndex = createSourceDataStructure();
  
  // Create schema files
  createSchemaFiles();
  
  // Create management guide
  createDataManagementGuide();
  
  console.log('\n🎉 Data management setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Review the DATA_MANAGEMENT_GUIDE.md');
  console.log('2. Run data validation: npm run data:validate');
  console.log('3. Consider implementing the hybrid loading approach');
  console.log('4. Set up automated backups');
}

// Check if this is being run as the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  extractNewsData,
  createBackupStructure,
  createSourceDataStructure,
  createSchemaFiles
};