# VIDHUNT News Data Management

## 📁 Directory Structure

```
/data/
├── news/                    # News articles data
│   ├── articles.json       # Complete articles database
│   ├── backup/             # Backup files
│   └── templates/          # Article templates
├── images/                 # Image assets backup
└── README.md              # This file
```

## 📊 Data Organization

### Current Status (2025-08-20)
- **Total Articles**: 109
- **Languages**: 11 (ko, en, ja, zh, es, fr, de, nl, pt, ru, hi)
- **Source Location**: `/services/contentService.ts` (hardcoded)
- **Text Sources**: `/public/contents/01/page1_article[1-10]_[lang].txt`

## 🔄 Usage

### Adding New Articles
1. Create text file: `/public/contents/01/page1_article[N]_[lang].txt`
2. Add image: `/public/contents/01/[N]_thumbnail.png`
3. Update articles.json or run sync script

### Backup & Restore
- **Backup**: All data stored in `/data/news/backup/`
- **Restore**: Use backup files to rebuild contentService.ts

## 🛠 Tools
- Content sync service: `/services/contentSyncService.ts`
- Backup generator: `/scripts/generateBackup.js`
- Data extractor: `/utils/contentUpdateHelper.ts`