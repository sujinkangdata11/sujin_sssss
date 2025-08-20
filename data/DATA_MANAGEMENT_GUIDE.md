# VIDHUNT News Data Management Guide

## Directory Structure

```
data/
├── backup/           # Complete backups with timestamps
├── source/           # Source file indexes and mappings  
├── generated/        # Auto-generated files
├── schema/           # JSON schemas for validation
├── scripts/          # Data management scripts
├── migrations/       # Data migration scripts
├── logs/            # Operation logs
└── assets/          # Asset management files
```

## File Types

### Backup Files
- `raw-news-data-TIMESTAMP.ts` - Raw extracted TypeScript code
- `backup-metadata-TIMESTAMP.json` - Backup metadata and structure info
- `full-backup-TIMESTAMP.json` - Complete JSON export of all data

### Source Files  
- `content-index.json` - Index of all source text and image files
- `language-mapping.json` - Language code mappings
- `article-mapping.json` - Article ID to file mappings

### Generated Files
- `newsData.json` - Current working data file
- `articles-by-language.json` - Articles organized by language
- `metadata-summary.json` - Summary statistics

### Schema Files
- `article.schema.json` - JSON schema for individual articles
- `news-data.schema.json` - JSON schema for complete news data structure

## Usage

### Adding New Articles

1. **Add source files:**
   ```
   public/contents/01/page1_article[ID]_[LANG].txt
   public/contents/01/[ID]_thumbnail.png
   public/contents/01/[ID]_image_[NUM].png
   ```

2. **Run data sync:**
   ```bash
   npm run data:sync
   ```

3. **Update content service:**
   ```bash
   npm run data:migrate
   ```

### Updating Existing Articles

1. **Edit source files directly**
2. **Run validation:**
   ```bash
   npm run data:validate
   ```
3. **Sync changes:**
   ```bash
   npm run data:sync
   ```

### Backup Operations

**Create backup:**
```bash
npm run data:backup
```

**Restore from backup:**
```bash
npm run data:restore -- --file=backup-TIMESTAMP.json
```

### Data Validation

**Validate all data:**
```bash
npm run data:validate
```

**Check for missing files:**
```bash
npm run data:check-files
```

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
- Run `npm run data:check-files`

**Data validation errors:**
- Check JSON syntax
- Verify required fields
- Run `npm run data:validate`

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
