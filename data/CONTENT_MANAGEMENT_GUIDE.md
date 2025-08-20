# VIDHUNT Content Management Guide

## Overview

This guide provides comprehensive instructions for managing the VIDHUNT news feed content system. The system has been redesigned from hardcoded data to a flexible, JSON-based approach with proper backup and validation systems.

## System Architecture

### Current Structure

```
data/
├── newsData.json           # Main data file (109 articles, 11 languages)
├── backup/                 # Timestamped backups
│   ├── raw-news-data-*.ts      # Raw TypeScript extractions
│   ├── backup-metadata-*.json  # Backup metadata
│   └── full-backup-*.json      # Complete data snapshots
├── generated/              # Auto-generated files
│   ├── complete-news-data.json     # Complete dataset
│   ├── data-statistics.json       # Content statistics
│   ├── articles-*.json            # Per-language files
│   ├── articles-by-language.json  # Language-organized data
│   └── content-manifest.json      # File relationship mapping
├── source/                 # Source file indexes
│   └── content-index.json      # Index of all source files
├── schema/                 # JSON validation schemas
│   ├── article.schema.json     # Article structure schema
│   └── news-data.schema.json   # Complete data schema
├── scripts/               # Management utilities
│   ├── dataManager.js         # CLI management tool
│   ├── extractFullNewsData.js # Data extraction utility
│   └── createJsonExport.js    # JSON export creator
└── DATA_MANAGEMENT_GUIDE.md  # This guide
```

### Source Files Structure

```
public/contents/01/
├── page1_article[1-10]_[lang].txt  # Article content (109 files)
├── [articleId]_thumbnail.png       # Thumbnails (10 files)
└── [articleId]_image_[num].png     # Content images (varies)
```

## Daily Operations

### 1. Adding New Articles

**Step 1: Create source files**
```bash
# Add text content
public/contents/01/page1_article11_ko.txt
public/contents/01/page1_article11_en.txt
# ... for all 11 languages

# Add images
public/contents/01/11_thumbnail.png
public/contents/01/11_image_1.png
public/contents/01/11_image_2.png
```

**Step 2: Sync data**
```bash
npm run data:sync
```

**Step 3: Validate**
```bash
npm run data:validate
npm run data:check-files
```

### 2. Updating Existing Articles

**Step 1: Edit source files directly**
- Modify text files in `public/contents/01/`
- Replace images as needed

**Step 2: Re-sync**
```bash
npm run data:sync
npm run data:validate
```

### 3. Backup Operations

**Create manual backup:**
```bash
npm run data:backup
```

**Restore from backup:**
```bash
npm run data:restore manual-backup-2025-08-20.json
```

**View statistics:**
```bash
npm run data:stats
```

## Content Format Specifications

### Text File Format

Each `page1_article[ID]_[LANG].txt` should follow this structure:

```
Article Title (can contain newlines)
Brief excerpt or summary
Full article content with markdown formatting

## Headings supported
[IMAGE:XX_image_Y.png] - Image references
[[purple:highlighted text]] - Purple highlighting
**bold text** - Bold formatting
```

### Image Naming Convention

- Thumbnails: `[articleId]_thumbnail.png`
- Content images: `[articleId]_image_[number].png`
- Admin uploads: `admin_[timestamp].png`

### Language Codes

Supported languages:
- `ko` - Korean (한국어)
- `en` - English
- `ja` - Japanese (日本語) 
- `zh` - Chinese (中文)
- `hi` - Hindi (हिन्दी)
- `es` - Spanish (Español)
- `fr` - French (Français)
- `de` - German (Deutsch)
- `nl` - Dutch (Nederlands)
- `pt` - Portuguese (Português)
- `ru` - Russian (Русский)

## Management Commands

### Core Commands

```bash
# Data management
npm run data:help          # Show all available commands
npm run data:sync          # Re-extract all data from source files
npm run data:validate      # Validate data integrity
npm run data:stats         # Show content statistics
npm run data:check-files   # Check for missing files

# Backup operations
npm run data:backup        # Create manual backup
npm run data:restore       # Restore from backup (interactive)

# Advanced operations
npm run data:extract       # Extract raw data from contentService.ts
npm run data:export        # Create comprehensive JSON exports
```

### Command Examples

**Check system status:**
```bash
npm run data:stats
```

**Validate all content:**
```bash
npm run data:validate
npm run data:check-files
```

**Create backup before major changes:**
```bash
npm run data:backup
# Make your changes...
npm run data:sync
npm run data:validate
```

**Recover from issues:**
```bash
npm run data:restore
# Choose from available backups
```

## Data Validation Rules

### Article Requirements

Each article must have:
- `id`: Unique number (1-10 currently)
- `title`: Non-empty string
- `date`: YYYY-MM-DD format
- `excerpt`: Brief summary
- `content`: Full article content
- `category`: Content category

### File Requirements

- Text files: Must exist for each article/language combination
- Images: Referenced images must exist in contents directory
- Thumbnails: Each article should have a thumbnail

### Validation Levels

1. **Errors** (blocking): Missing required fields, malformed JSON
2. **Warnings** (advisory): Missing files, short content, inconsistencies

## Migration Strategies

### Phase 1: Current State ✅
- Hardcoded NEWS_DATA in contentService.ts
- Text files in public/contents/01/
- Manual data management

### Phase 2: Hybrid Approach (Recommended)
```javascript
// In contentService.ts
import { loadNewsData } from '../data/dataLoader.js';

let NEWS_DATA = null;

// Try to load from JSON, fallback to hardcoded
try {
  NEWS_DATA = await loadNewsData();
} catch (error) {
  console.warn('Using hardcoded fallback data');
  NEWS_DATA = HARDCODED_NEWS_DATA; // Keep original as fallback
}
```

### Phase 3: Full Dynamic Loading
```javascript
// Real-time loading from JSON/API
export async function getArticles(language) {
  return await fetch(`/api/articles/${language}`).then(r => r.json());
}
```

## Troubleshooting

### Common Issues

**"No newsData.json found"**
```bash
npm run data:extract
npm run data:sync
```

**"Data validation failed"**
```bash
npm run data:validate  # See specific errors
# Fix source files based on errors
npm run data:sync
```

**"Missing source files"**
```bash
npm run data:check-files  # See which files are missing
# Add missing files to public/contents/01/
npm run data:sync
```

**"JSON syntax error"**
```bash
npm run data:restore      # Restore from backup
# Or fix JSON manually and validate
npm run data:validate
```

### Recovery Procedures

**Complete data loss:**
1. `npm run data:restore` (choose latest backup)
2. `npm run data:validate`
3. `npm run data:check-files`

**Corrupted source files:**
1. Check `data/backup/` for recent backups
2. Restore individual text files from backup
3. `npm run data:sync`

**Build failures:**
1. `npm run data:validate` (check for data errors)
2. Ensure contentService.ts can load data properly
3. Consider hybrid migration if needed

## Performance Considerations

### File Sizes
- Current dataset: ~127KB total content
- Average article: ~1,200 characters
- JSON files: ~200KB (complete dataset)

### Loading Strategies
- Lazy loading by language
- Caching with version checking
- Progressive content loading

### Optimization Tips
1. Use language-specific JSON files for faster loading
2. Implement content caching in browser
3. Consider CDN for images
4. Compress JSON in production builds

## Security Considerations

### Content Validation
- Sanitize user input if admin editing is added
- Validate image uploads
- Check for malicious content in text files

### File Access
- Limit file system access to data directory
- Validate file paths to prevent directory traversal
- Use proper file permissions

## Future Enhancements

### Planned Features
1. **Admin Web Interface**
   - Visual content editor
   - Image upload management
   - Real-time preview

2. **Content Versioning**
   - Track changes over time
   - Compare versions
   - Rollback capabilities

3. **Multi-site Support**
   - Multiple content sets
   - Site-specific configurations
   - Shared asset management

4. **Advanced Analytics**
   - Content performance tracking
   - User engagement metrics
   - A/B testing support

### Development Roadmap

**Q1 2025**
- Implement hybrid loading approach
- Add content versioning
- Create admin web interface

**Q2 2025**
- Add multi-language content sync
- Implement automated translations
- Enhanced image management

**Q3 2025**
- Performance optimization
- Advanced caching strategies
- Content analytics integration

## Support and Maintenance

### Regular Tasks
- **Weekly**: Create data backups
- **Monthly**: Validate all content and files
- **Quarterly**: Review and update documentation

### Monitoring
- Check for missing files monthly
- Validate data integrity after updates
- Monitor file sizes and performance

### Updates
- Keep backup retention policy (recommend 3 months)
- Update documentation when adding features
- Test migration procedures periodically

## Quick Reference

### Most Used Commands
```bash
npm run data:stats         # Quick status check
npm run data:backup        # Before making changes
npm run data:sync          # After editing content
npm run data:validate      # Check everything is OK
```

### Emergency Commands
```bash
npm run data:restore       # Recover from backup
npm run data:check-files   # Find missing files
npm run data:help          # When in doubt
```

### File Locations
- Main data: `data/newsData.json`
- Backups: `data/backup/`
- Content: `public/contents/01/`
- Scripts: `data/scripts/`

---

For additional support or questions, refer to the generated documentation files or run `npm run data:help`.