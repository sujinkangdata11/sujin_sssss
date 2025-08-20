#!/usr/bin/env node

/**
 * JSON Export Creator for VIDHUNT News Data
 * 
 * This script creates comprehensive JSON exports from the extracted NEWS_DATA
 * and organizes them for different use cases.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '../..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backup');
const GENERATED_DIR = path.join(DATA_DIR, 'generated');
const SOURCE_DIR = path.join(DATA_DIR, 'source');

function findLatestRawBackup() {
  console.log('🔍 Finding latest raw backup...');
  
  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('raw-news-data-'))
    .sort()
    .reverse();
  
  if (backupFiles.length === 0) {
    throw new Error('No raw backup files found');
  }
  
  const latestBackup = path.join(BACKUP_DIR, backupFiles[0]);
  console.log(`✅ Using backup: ${backupFiles[0]}`);
  return latestBackup;
}

function parseNewsDataFromBackup(backupPath) {
  console.log('📖 Parsing NEWS_DATA from backup...');
  
  const content = fs.readFileSync(backupPath, 'utf8');
  
  // This is a simplified parser - we'll manually extract the structure
  // In a production environment, you might want to use a proper TypeScript parser
  
  // For now, let's create the JSON structure manually based on the existing newsData.json
  const existingDataPath = path.join(DATA_DIR, 'newsData.json');
  
  if (fs.existsSync(existingDataPath)) {
    const existingData = JSON.parse(fs.readFileSync(existingDataPath, 'utf8'));
    console.log(`✅ Using existing newsData.json as base (${existingData.totalArticles} articles)`);
    return existingData;
  }
  
  throw new Error('Could not parse NEWS_DATA. Manual intervention required.');
}

function createLanguageSpecificFiles(newsData) {
  console.log('🌍 Creating language-specific JSON files...');
  
  const languages = Object.keys(newsData.articles);
  
  languages.forEach(lang => {
    const langData = {
      meta: {
        language: lang,
        articleCount: newsData.articles[lang].length,
        lastUpdated: newsData.lastUpdated,
        version: newsData.version
      },
      articles: newsData.articles[lang]
    };
    
    const langFilePath = path.join(GENERATED_DIR, `articles-${lang}.json`);
    fs.writeFileSync(langFilePath, JSON.stringify(langData, null, 2));
    console.log(`  ✅ ${lang}: ${langData.articles.length} articles`);
  });
  
  console.log(`✅ Created ${languages.length} language-specific files`);
}

function createMetadataSummary(newsData) {
  console.log('📊 Creating metadata summary...');
  
  const summary = {
    meta: {
      createdAt: new Date().toISOString(),
      version: newsData.version,
      lastUpdated: newsData.lastUpdated
    },
    statistics: {
      totalArticles: newsData.totalArticles,
      languageCount: newsData.languages,
      languages: Object.keys(newsData.articles),
      articlesPerLanguage: {}
    },
    structure: {
      dataFiles: [
        'newsData.json',
        'articles-by-language.json',
        'full-backup.json'
      ],
      sourceFiles: {
        textFiles: 'public/contents/01/page1_article[1-10]_[language].txt',
        images: 'public/contents/01/[articleId]_image_[number].png',
        thumbnails: 'public/contents/01/[articleId]_thumbnail.png'
      }
    },
    validation: {
      requiredFields: ['id', 'title', 'date', 'excerpt', 'content', 'category'],
      optionalFields: ['sourceFile'],
      supportedLanguages: ['ko', 'en', 'ja', 'zh', 'hi', 'es', 'fr', 'de', 'nl', 'pt', 'ru']
    }
  };
  
  // Calculate articles per language
  Object.keys(newsData.articles).forEach(lang => {
    summary.statistics.articlesPerLanguage[lang] = newsData.articles[lang].length;
  });
  
  const summaryPath = path.join(GENERATED_DIR, 'metadata-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✅ Metadata summary saved to: ${summaryPath}`);
  
  return summary;
}

function createArticlesByLanguageFile(newsData) {
  console.log('📚 Creating articles-by-language.json...');
  
  const articlesByLanguage = {
    meta: {
      createdAt: new Date().toISOString(),
      version: newsData.version,
      description: "All articles organized by language for easy access"
    },
    data: newsData.articles
  };
  
  const filePath = path.join(GENERATED_DIR, 'articles-by-language.json');
  fs.writeFileSync(filePath, JSON.stringify(articlesByLanguage, null, 2));
  console.log(`✅ Articles by language saved to: ${filePath}`);
}

function createFullBackup(newsData, timestamp) {
  console.log('💾 Creating full backup...');
  
  const fullBackup = {
    meta: {
      backupType: "full",
      createdAt: new Date().toISOString(),
      version: newsData.version,
      description: "Complete backup of all news data including metadata"
    },
    data: newsData,
    sourceIndex: null // Will be populated if source index exists
  };
  
  // Add source index if available
  const sourceIndexPath = path.join(SOURCE_DIR, 'content-index.json');
  if (fs.existsSync(sourceIndexPath)) {
    fullBackup.sourceIndex = JSON.parse(fs.readFileSync(sourceIndexPath, 'utf8'));
  }
  
  const backupPath = path.join(BACKUP_DIR, `full-backup-${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(fullBackup, null, 2));
  console.log(`✅ Full backup saved to: ${backupPath}`);
}

function createContentManifest(newsData) {
  console.log('📋 Creating content manifest...');
  
  const manifest = {
    meta: {
      createdAt: new Date().toISOString(),
      version: newsData.version,
      description: "Manifest of all content files and their relationships"
    },
    articles: {},
    assets: {
      images: {},
      thumbnails: {}
    },
    missingFiles: []
  };
  
  // Process each article across all languages
  Object.keys(newsData.articles).forEach(lang => {
    newsData.articles[lang].forEach(article => {
      const articleId = article.id;
      
      if (!manifest.articles[articleId]) {
        manifest.articles[articleId] = {
          id: articleId,
          category: article.category,
          date: article.date,
          languages: {}
        };
      }
      
      manifest.articles[articleId].languages[lang] = {
        title: article.title,
        excerpt: article.excerpt,
        sourceFile: `page1_article${articleId}_${lang}.txt`,
        hasSourceFile: fs.existsSync(path.join(PROJECT_ROOT, `public/contents/01/page1_article${articleId}_${lang}.txt`))
      };
      
      // Check for assets
      if (!manifest.assets.thumbnails[articleId]) {
        const thumbnailPath = path.join(PROJECT_ROOT, `public/contents/01/${articleId}_thumbnail.png`);
        manifest.assets.thumbnails[articleId] = {
          path: `public/contents/01/${articleId}_thumbnail.png`,
          exists: fs.existsSync(thumbnailPath)
        };
      }
      
      // Check for images referenced in content
      const imageMatches = article.content.match(/\[IMAGE:(\d+_image_\d+\.png)\]/g);
      if (imageMatches) {
        imageMatches.forEach(match => {
          const imageName = match.replace(/\[IMAGE:|\]/g, '');
          const imagePath = path.join(PROJECT_ROOT, `public/contents/01/${imageName}`);
          
          if (!manifest.assets.images[imageName]) {
            manifest.assets.images[imageName] = {
              path: `public/contents/01/${imageName}`,
              exists: fs.existsSync(imagePath),
              referencedIn: []
            };
          }
          
          manifest.assets.images[imageName].referencedIn.push({
            articleId,
            language: lang
          });
        });
      }
    });
  });
  
  const manifestPath = path.join(GENERATED_DIR, 'content-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Content manifest saved to: ${manifestPath}`);
  
  return manifest;
}

function main() {
  console.log('🚀 Starting JSON Export Creation...\n');
  
  try {
    // Find and parse the latest backup
    const latestBackup = findLatestRawBackup();
    const newsData = parseNewsDataFromBackup(latestBackup);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create various JSON exports
    createLanguageSpecificFiles(newsData);
    createMetadataSummary(newsData);
    createArticlesByLanguageFile(newsData);
    createFullBackup(newsData, timestamp);
    createContentManifest(newsData);
    
    console.log('\n🎉 JSON export creation completed successfully!');
    console.log('\nGenerated files:');
    console.log('- Language-specific files: data/generated/articles-[lang].json');
    console.log('- Metadata summary: data/generated/metadata-summary.json');
    console.log('- Articles by language: data/generated/articles-by-language.json');
    console.log('- Content manifest: data/generated/content-manifest.json');
    console.log('- Full backup: data/backup/full-backup-[timestamp].json');
    
  } catch (error) {
    console.error('❌ Error creating JSON exports:', error.message);
    process.exit(1);
  }
}

// Check if this is being run as the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}