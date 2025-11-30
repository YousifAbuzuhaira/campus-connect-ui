#!/usr/bin/env python3
"""
Project Restore Script for Campus Connect
Restores full project backups created by backup_project.py
"""

import os
import sys
import shutil
import zipfile
import asyncio
import json
from datetime import datetime
from pathlib import Path
import argparse
import logging

# Import database restore module
sys.path.append(str(Path(__file__).parent))
from restore_database import DatabaseRestore

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProjectRestore:
    def __init__(self, target_root=None):
        self.target_root = Path(target_root) if target_root else Path(__file__).parent.parent
        
    def restore_source_code(self, source_backup_file, target_dir, overwrite=False):
        """Restore source code from backup ZIP file"""
        logger.info(f"Restoring source code from {source_backup_file}")
        
        if not overwrite and any(target_dir.iterdir()):
            response = input(f"Target directory {target_dir} is not empty. Overwrite? (yes/no): ")
            if response.lower() != 'yes':
                logger.info("Source code restore cancelled")
                return False
        
        # Create target directory
        target_dir.mkdir(parents=True, exist_ok=True)
        
        # Extract source code
        with zipfile.ZipFile(source_backup_file, 'r') as zipf:
            zipf.extractall(target_dir)
        
        logger.info(f"Source code restored to {target_dir}")
        return True
    
    def restore_configurations(self, config_backup_file, target_dir):
        """Restore configuration files from backup"""
        logger.info(f"Restoring configurations from {config_backup_file}")
        
        with open(config_backup_file, 'r', encoding='utf-8') as f:
            config_backup = json.load(f)
        
        restored_count = 0
        
        for config_file, content in config_backup['configs'].items():
            config_path = target_dir / config_file
            
            # Create parent directories if needed
            config_path.parent.mkdir(parents=True, exist_ok=True)
            
            try:
                if isinstance(content, dict):
                    # JSON configuration
                    with open(config_path, 'w', encoding='utf-8') as f:
                        json.dump(content, f, indent=2, ensure_ascii=False)
                elif isinstance(content, str) and not content.startswith('ERROR:'):
                    # Text configuration
                    with open(config_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                else:
                    logger.warning(f"Skipping {config_file} due to backup error")
                    continue
                
                logger.info(f"Restored configuration: {config_file}")
                restored_count += 1
                
            except Exception as e:
                logger.error(f"Failed to restore {config_file}: {e}")
        
        logger.info(f"Restored {restored_count} configuration files")
        return restored_count
    
    async def restore_from_backup(self, backup_dir, restore_database=True, restore_source=True, 
                                restore_configs=True, overwrite=False):
        """Restore project from full backup directory"""
        backup_dir = Path(backup_dir)
        
        # Read backup manifest
        manifest_file = backup_dir / "backup_manifest.json"
        if not manifest_file.exists():
            raise FileNotFoundError(f"Backup manifest not found: {manifest_file}")
        
        with open(manifest_file, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        
        logger.info(f"Restoring project backup from {backup_dir}")
        logger.info(f"Backup timestamp: {manifest['timestamp']}")
        logger.info(f"Original project root: {manifest['project_root']}")
        
        if manifest.get('git_info'):
            git_info = manifest['git_info']
            logger.info(f"Git info - Branch: {git_info.get('current_branch', 'unknown')}")
            if 'last_commit' in git_info:
                commit = git_info['last_commit']
                logger.info(f"Last commit: {commit['hash'][:8]} - {commit['message']}")
        
        # Restore source code
        if restore_source and 'source_code' in manifest['components']:
            source_info = manifest['components']['source_code']
            if source_info['status'] == 'success':
                source_backup_file = backup_dir / source_info['file']
                if source_backup_file.exists():
                    self.restore_source_code(source_backup_file, self.target_root, overwrite)
                else:
                    logger.error(f"Source backup file not found: {source_backup_file}")
            else:
                logger.warning(f"Source code backup was not successful: {source_info.get('error', 'Unknown error')}")
        
        # Restore configurations
        if restore_configs and 'configurations' in manifest['components']:
            config_info = manifest['components']['configurations']
            if config_info['status'] == 'success':
                config_backup_file = backup_dir / config_info['file']
                if config_backup_file.exists():
                    self.restore_configurations(config_backup_file, self.target_root)
                else:
                    logger.error(f"Configuration backup file not found: {config_backup_file}")
            else:
                logger.warning(f"Configuration backup was not successful: {config_info.get('error', 'Unknown error')}")
        
        # Restore database
        if restore_database and 'database' in manifest['components']:
            db_info = manifest['components']['database']
            if db_info['status'] == 'success':
                db_backup_dir = backup_dir / db_info['directory']
                if db_backup_dir.exists():
                    try:
                        db_restore = DatabaseRestore()
                        await db_restore.connect()
                        await db_restore.restore_full_backup(db_backup_dir, drop_existing=overwrite)
                        await db_restore.disconnect()
                    except Exception as e:
                        logger.error(f"Database restore failed: {e}")
                else:
                    logger.error(f"Database backup directory not found: {db_backup_dir}")
            else:
                logger.warning(f"Database backup was not successful: {db_info.get('error', 'Unknown error')}")
        
        logger.info("Project restore completed!")
    
    def list_backups(self, backup_dir):
        """List available project backups"""
        backup_dir = Path(backup_dir)
        
        if not backup_dir.exists():
            logger.info(f"Backup directory does not exist: {backup_dir}")
            return
        
        logger.info(f"Available project backups in {backup_dir}:")
        
        # Find full project backups
        backups = [d for d in backup_dir.iterdir() 
                  if d.is_dir() and d.name.startswith('full_project_backup_')]
        
        if not backups:
            logger.info("No project backups found")
            return
        
        for backup in sorted(backups, reverse=True):
            manifest_file = backup / "backup_manifest.json"
            if manifest_file.exists():
                try:
                    with open(manifest_file, 'r') as f:
                        manifest = json.load(f)
                    
                    logger.info(f"\n  📁 {backup.name}")
                    logger.info(f"     Timestamp: {manifest['timestamp']}")
                    logger.info(f"     Components:")
                    
                    for component, info in manifest['components'].items():
                        status_icon = "✅" if info['status'] == 'success' else "❌"
                        logger.info(f"       {status_icon} {component}")
                    
                    if 'git_info' in manifest and manifest['git_info']:
                        git_info = manifest['git_info']
                        if 'current_branch' in git_info:
                            logger.info(f"     Git branch: {git_info['current_branch']}")
                        
                except Exception as e:
                    logger.warning(f"     (Could not read manifest: {e})")
            else:
                logger.info(f"  📁 {backup.name} (no manifest)")

async def main():
    parser = argparse.ArgumentParser(description="Campus Connect Project Restore Tool")
    parser.add_argument("backup_dir", nargs='?', help="Backup directory to restore from")
    parser.add_argument("--target", "-t", help="Target directory for restore", 
                       default=str(Path(__file__).parent.parent))
    parser.add_argument("--list", action="store_true", help="List available backups")
    parser.add_argument("--backup-root", help="Root directory containing backups",
                       default=str(Path(__file__).parent / "backups"))
    parser.add_argument("--no-database", action="store_true", help="Skip database restore")
    parser.add_argument("--no-source", action="store_true", help="Skip source code restore")
    parser.add_argument("--no-configs", action="store_true", help="Skip configuration restore")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing files without prompting")
    parser.add_argument("--confirm", action="store_true", help="Confirm restore operation")
    
    args = parser.parse_args()
    
    restore_tool = ProjectRestore(args.target)
    
    try:
        if args.list:
            restore_tool.list_backups(args.backup_root)
            return
        
        if not args.backup_dir:
            logger.error("Please specify a backup directory to restore from, or use --list to see available backups")
            sys.exit(1)
        
        if not args.confirm:
            logger.error("Restore operation requires --confirm flag for safety")
            logger.error("This operation can overwrite existing files!")
            sys.exit(1)
        
        backup_path = Path(args.backup_dir)
        if not backup_path.is_absolute():
            backup_path = Path(args.backup_root) / backup_path
        
        if not backup_path.exists():
            logger.error(f"Backup directory does not exist: {backup_path}")
            sys.exit(1)
        
        await restore_tool.restore_from_backup(
            backup_path,
            restore_database=not args.no_database,
            restore_source=not args.no_source,
            restore_configs=not args.no_configs,
            overwrite=args.overwrite
        )
        
    except Exception as e:
        logger.error(f"Restore failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())