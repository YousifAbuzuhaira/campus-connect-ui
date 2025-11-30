# Campus Connect Backup & Restore System

This directory contains comprehensive backup and restore tools for the Campus Connect project.

## 🗂️ Scripts Overview

### Database Tools
- **`backup_database.py`** - MongoDB database backup tool
- **`restore_database.py`** - MongoDB database restore tool

### Project Tools  
- **`backup_project.py`** - Full project backup (source code + database + configs)
- **`restore_project.py`** - Full project restore tool

### Windows Batch Files
- **`backup.bat`** - Interactive backup interface for Windows
- **`restore.bat`** - Interactive restore interface for Windows

## 🚀 Quick Start

### For Windows Users
Simply double-click the batch files:
- **`backup.bat`** - Interactive backup menu
- **`restore.bat`** - Interactive restore menu

### For Command Line Users

#### Database Backup
```bash
# Full database backup
python backup_database.py

# Backup to specific directory
python backup_database.py --output ./my-backups

# Backup specific collection
python backup_database.py --collection users

# List collections
python backup_database.py --list
```

#### Database Restore
```bash
# List available backups
python restore_database.py --list

# Restore latest full backup (REQUIRES --confirm)
python restore_database.py --confirm

# Restore specific backup
python restore_database.py --backup-dir full_backup_20231129_143022 --confirm

# Restore single collection file
python restore_database.py --file users_20231129_143022.json.gz --confirm

# Dangerous: Drop existing data before restore
python restore_database.py --backup-dir full_backup_20231129_143022 --drop --confirm
```

#### Full Project Backup
```bash
# Complete project backup (source + database + configs)
python backup_project.py

# Skip database backup
python backup_project.py --no-database

# Custom output directory
python backup_project.py --output ./project-backups
```

#### Full Project Restore
```bash
# List available project backups
python restore_project.py --list

# Restore complete project
python restore_project.py full_project_backup_20231129_143022 --confirm

# Restore without database
python restore_project.py full_project_backup_20231129_143022 --no-database --confirm

# Restore to different location
python restore_project.py full_project_backup_20231129_143022 --target /path/to/new/location --confirm
```

## 📋 Prerequisites

### Python Packages
```bash
pip install motor python-dotenv pymongo
```

### Environment Variables
Ensure your `.env` file contains:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=campus_connect
```

## 📁 Backup Structure

### Database Backups
```
backups/
└── full_backup_20231129_143022/
    ├── backup_info.json              # Backup metadata
    ├── users_20231129_143022.json.gz # Compressed user data
    ├── products_20231129_143022.json.gz
    ├── categories_20231129_143022.json.gz
    └── ...
```

### Project Backups
```
backups/
└── full_project_backup_20231129_143022/
    ├── backup_manifest.json          # Backup metadata
    ├── source_code_20231129_143022.zip # Source code archive
    ├── configs_20231129_143022.json  # Configuration files
    └── database/                     # Database backup
        └── full_backup_20231129_143022/
```

## 🔒 Safety Features

### Confirmation Required
- All restore operations require `--confirm` flag
- Interactive prompts for destructive operations
- Clear warnings before data overwrite

### Backup Validation
- Metadata files for tracking backup integrity
- Document count verification
- Git information preservation
- Error logging and recovery suggestions

## ⚡ Advanced Usage

### Automated Backups
Create scheduled backups using Windows Task Scheduler or cron:

```bash
# Daily database backup at 2 AM
python backup_database.py --output ./daily-backups

# Weekly full project backup
python backup_project.py --output ./weekly-backups
```

### Selective Restore
```bash
# Restore only source code
python restore_project.py backup_dir --no-database --no-configs --confirm

# Restore only configurations
python restore_project.py backup_dir --no-database --no-source --confirm
```

### Cross-Environment Migration
```bash
# Backup from development
python backup_project.py --output ./migration-backup

# Restore to production (different server)
python restore_project.py migration-backup --target /var/www/campus-connect --confirm
```

## 🚨 Important Notes

### Data Safety
- **Always test restores** in a non-production environment first
- **Verify backups** by checking the generated metadata files
- **Keep multiple backup generations** - don't rely on just the latest

### MongoDB Considerations
- Backups are created using MongoDB driver, not `mongodump`
- Large collections are compressed with gzip
- ObjectId fields are properly handled during restore
- Collections are restored with original indexes

### File Exclusions
The following are automatically excluded from source backups:
- `node_modules/`, `__pycache__/`, `.git/`
- `dist/`, `build/`, `venv/`, `.env` files
- Log files, temporary files, and build artifacts

## 🐛 Troubleshooting

### Common Issues

**Connection Failed**
```bash
# Check MongoDB is running
mongosh

# Verify environment variables
python -c "import os; print(os.getenv('MONGODB_URL'))"
```

**Permission Errors**
```bash
# Ensure write permissions
chmod +w ./backups

# Run with appropriate user permissions
```

**Large Backup Files**
- Backups are compressed by default
- Consider excluding large collections if not needed
- Use selective collection backups for partial data

### Getting Help
Run any script with `--help` for detailed options:
```bash
python backup_database.py --help
python restore_database.py --help
```

## 📝 Logging

All operations are logged with timestamps and detailed status information. Check the console output for:
- Connection status
- Backup/restore progress
- Error messages and suggestions
- Completion summaries

---

**⚠️ Remember**: Always test your backup and restore procedures in a safe environment before relying on them in production!