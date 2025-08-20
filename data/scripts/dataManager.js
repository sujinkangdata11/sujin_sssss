#!/usr/bin/env node

/**
 * VIDHUNT Data Management CLI
 * 
 * This script provides utilities for managing news content data
 * Usage: node dataManager.js [command] [options]
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

const commands = {
  backup: createBackup,
  restore: restoreFromBackup,
  validate: validateData,
  checkFiles: checkMissingFiles,
  sync: syncData,
  stats: showStatistics,
  help: showHelp
};

function createBackup() {
  console.log('📦 Creating backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const newsDataPath = path.join(DATA_DIR, 'newsData.json');
  
  if (!fs.existsSync(newsDataPath)) {
    console.error('❌ No newsData.json found to backup');
    return;
  }
  
  const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf8'));
  
  const backup = {
    meta: {
      backupType: 'manual',
      createdAt: new Date().toISOString(),
      version: newsData.version || '1.0.0',
      description: 'Manual backup created via dataManager'
    },
    data: newsData
  };
  
  const backupPath = path.join(BACKUP_DIR, `manual-backup-${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  
  console.log(`✅ Backup created: ${backupPath}`);
  console.log(`   Articles: ${newsData.totalArticles}`);
  console.log(`   Languages: ${newsData.languages}`);
}

function restoreFromBackup() {
  const backupFile = process.argv[3];
  
  if (!backupFile) {
    console.error('❌ Please specify a backup file');
    console.log('Usage: node dataManager.js restore [backup-file]');
    
    // Show available backups
    console.log('\n📁 Available backups:');
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, 10);
    
    backups.forEach(backup => {
      const stat = fs.statSync(path.join(BACKUP_DIR, backup));
      console.log(`   ${backup} (${stat.mtime.toISOString().split('T')[0]})`);
    });
    
    return;
  }
  
  const backupPath = path.join(BACKUP_DIR, backupFile);
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    return;
  }
  
  console.log(`🔄 Restoring from: ${backupFile}`);
  
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const newsData = backup.data || backup; // Handle both formats
  
  // Create current backup first
  createBackup();
  
  // Restore data
  const newsDataPath = path.join(DATA_DIR, 'newsData.json');
  fs.writeFileSync(newsDataPath, JSON.stringify(newsData, null, 2));
  
  console.log(`✅ Data restored successfully`);
  console.log(`   Articles: ${newsData.totalArticles}`);
  console.log(`   Languages: ${newsData.languages}`);
}

function validateData() {
  console.log('✅ Validating data...');
  
  const newsDataPath = path.join(DATA_DIR, 'newsData.json');
  
  if (!fs.existsSync(newsDataPath)) {
    console.error('❌ newsData.json not found');
    return false;
  }
  
  let newsData;
  try {
    newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf8'));
  } catch (error) {
    console.error('❌ Invalid JSON format:', error.message);
    return false;
  }
  
  const errors = [];
  const warnings = [];
  
  // Check required top-level fields
  const requiredFields = ['version', 'lastUpdated', 'totalArticles', 'languages', 'articles'];
  requiredFields.forEach(field => {
    if (!newsData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate articles structure
  if (newsData.articles) {
    const expectedLanguages = ['ko', 'en', 'ja', 'zh', 'hi', 'es', 'fr', 'de', 'nl', 'pt', 'ru'];
    const actualLanguages = Object.keys(newsData.articles);
    
    expectedLanguages.forEach(lang => {
      if (!newsData.articles[lang]) {
        warnings.push(`Missing language: ${lang}`);
      } else {
        const articles = newsData.articles[lang];
        if (!Array.isArray(articles)) {
          errors.push(`Articles for ${lang} is not an array`);
        } else {
          articles.forEach((article, index) => {
            const requiredArticleFields = ['id', 'title', 'date', 'excerpt', 'content', 'category'];
            requiredArticleFields.forEach(field => {
              if (!article[field]) {
                errors.push(`${lang}[${index}]: Missing ${field}`);
              }
            });
            
            // Check for reasonable content length
            if (article.content && article.content.length < 100) {
              warnings.push(`${lang}[${index}]: Very short content (${article.content.length} chars)`);
            }
          });
        }
      }
    });
  }
  
  // Report results
  console.log(`\n📊 Validation Results:`);
  console.log(`   Total Articles: ${newsData.totalArticles}`);
  console.log(`   Languages: ${actualLanguages.length}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors:`);
    errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings:`);
    warnings.slice(0, 10).forEach(warning => console.log(`   - ${warning}`));
    if (warnings.length > 10) {
      console.log(`   ... and ${warnings.length - 10} more warnings`);
    }
  }
  
  if (errors.length === 0) {
    console.log(`\n✅ Data validation passed!`);
    return true;
  } else {
    console.log(`\n❌ Data validation failed with ${errors.length} errors`);
    return false;
  }
}

function checkMissingFiles() {
  console.log('📁 Checking for missing files...');
  
  const newsDataPath = path.join(DATA_DIR, 'newsData.json');
  
  if (!fs.existsSync(newsDataPath)) {
    console.error('❌ newsData.json not found');
    return;
  }
  
  const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf8'));
  const contentsDir = path.join(PROJECT_ROOT, 'public/contents/01');
  
  let missingTextFiles = 0;
  let missingImages = 0;
  let missingThumbnails = 0;
  
  console.log('\n🔍 Checking source files...');
  
  // Check for text files
  Object.keys(newsData.articles).forEach(lang => {
    newsData.articles[lang].forEach(article => {
      const textFile = path.join(contentsDir, `page1_article${article.id}_${lang}.txt`);
      if (!fs.existsSync(textFile)) {
        console.log(`   ❌ Missing: page1_article${article.id}_${lang}.txt`);
        missingTextFiles++;
      }
      
      // Check for thumbnail
      const thumbnailFile = path.join(contentsDir, `${article.id}_thumbnail.png`);
      if (!fs.existsSync(thumbnailFile)) {
        console.log(`   ❌ Missing: ${article.id}_thumbnail.png`);
        missingThumbnails++;
      }
      
      // Check for images referenced in content
      const imageMatches = article.content.match(/\[IMAGE:([^\]]+)\]/g);
      if (imageMatches) {
        imageMatches.forEach(match => {
          const imageName = match.replace(/\[IMAGE:([^\]]+)\]/, '$1');
          const imageFile = path.join(contentsDir, imageName);
          if (!fs.existsSync(imageFile)) {
            console.log(`   ❌ Missing: ${imageName} (referenced in ${lang} article ${article.id})`);
            missingImages++;
          }
        });
      }
    });
  });
  
  console.log(`\\n📊 Missing Files Summary:`);
  console.log(`   Text files: ${missingTextFiles}`);
  console.log(`   Images: ${missingImages}`);
  console.log(`   Thumbnails: ${missingThumbnails}`);
  
  if (missingTextFiles + missingImages + missingThumbnails === 0) {
    console.log(`\\n✅ All files are present!`);
  } else {
    console.log(`\\n⚠️  Total missing files: ${missingTextFiles + missingImages + missingThumbnails}`);
  }
}

function syncData() {
  console.log('🔄 Syncing data...');
  
  // Re-run the complete extraction
  console.log('Running complete data extraction...');
  
  import('./extractFullNewsData.js')
    .then(() => {
      console.log('✅ Data sync completed');
    })
    .catch(error => {
      console.error('❌ Error during sync:', error.message);
    });
}

function showStatistics() {
  console.log('📊 Showing statistics...');
  
  const statsPath = path.join(GENERATED_DIR, 'data-statistics.json');
  
  if (!fs.existsSync(statsPath)) {
    console.log('No statistics file found. Running data sync...');
    syncData();
    return;
  }
  
  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  
  console.log(`\\n📈 VIDHUNT Content Statistics`);
  console.log(`   Generated: ${stats.meta.generatedAt.split('T')[0]}`);
  console.log(`   Version: ${stats.meta.version}`);
  
  console.log(`\\n📊 Overview:`);
  console.log(`   Total Articles: ${stats.overview.totalArticles}`);
  console.log(`   Languages: ${stats.overview.totalLanguages}`);
  console.log(`   Average per Language: ${stats.overview.averageArticlesPerLanguage}`);
  
  console.log(`\\n📝 Content:`);
  console.log(`   Total Characters: ${stats.content.totalCharacters.toLocaleString()}`);
  console.log(`   Average Length: ${stats.content.averageContentLength} chars`);
  
  if (stats.content.shortestArticle) {
    console.log(`   Shortest: ${stats.content.shortestArticle.title.substring(0, 30)}... (${stats.content.shortestArticle.length} chars)`);
  }
  
  if (stats.content.longestArticle) {
    console.log(`   Longest: ${stats.content.longestArticle.title.substring(0, 30)}... (${stats.content.longestArticle.length} chars)`);
  }
  
  console.log(`\\n🌍 Languages:`);
  Object.keys(stats.languages).forEach(lang => {
    const langStats = stats.languages[lang];
    console.log(`   ${lang}: ${langStats.articleCount} articles, ${langStats.averageLength} avg chars`);
  });
}

function showHelp() {
  console.log(`
🚀 VIDHUNT Data Manager

Commands:
  backup                    Create a manual backup of current data
  restore [backup-file]     Restore data from backup
  validate                  Validate data integrity
  check-files               Check for missing source files
  sync                      Re-sync data from source files
  stats                     Show content statistics
  help                      Show this help message

Examples:
  node dataManager.js backup
  node dataManager.js restore manual-backup-2025-08-20.json
  node dataManager.js validate
  node dataManager.js check-files
  node dataManager.js sync
  node dataManager.js stats

Files:
  data/newsData.json                Main data file
  data/backup/                      Backup files
  data/generated/                   Generated files
  data/source/                      Source indexes
  public/contents/01/               Source content files
  `);
}

// Main execution
function main() {
  const command = process.argv[2];
  
  if (!command) {
    showHelp();
    return;
  }
  
  if (commands[command]) {
    commands[command]();
  } else {
    console.error(`❌ Unknown command: ${command}`);
    console.log('Run "node dataManager.js help" for available commands');
  }
}

// Check if this is being run as the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}