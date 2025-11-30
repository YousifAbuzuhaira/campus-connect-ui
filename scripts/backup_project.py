#!/usr/bin/env python3
"""
Full Project Backup Script for Campus Connect
Creates comprehensive backups including database, source code, and configuration files
"""

import os
import sys
import shutil
import zipfile
import asyncio
import subprocess
from datetime import datetime
from pathlib import Path
import argparse
import logging
import json

# Import database backup module
sys.path.append(str(Path(__file__).parent))
from backup_database import DatabaseBackup

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProjectBackup:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Files and directories to exclude from backup
        self.exclude_patterns = {
            'node_modules',
            '__pycache__',
            '.git',
            'dist',
            'build',
            '.env',
            '.env.local',
            '.env.production',
            'venv',
            '.venv',
            'env',
            '.DS_Store',
            'Thumbs.db',
            '*.log',
            '*.tmp',
            'backups',
            'bun.lockb'
        }
        
        # Critical files to always include
        self.critical_files = {
            'package.json',
            'requirements.txt',
            'pyproject.toml',
            'README.md',
            'DEVELOPMENT.md',
            '.env.example',
            'docker-compose.yml',
            'Dockerfile'
        }
    
    def should_exclude(self, path):
        """Check if a path should be excluded from backup"""
        path_obj = Path(path)
        
        # Always include critical files
        if path_obj.name in self.critical_files:
            return False
        
        # Check exclude patterns
        for pattern in self.exclude_patterns:
            if pattern.startswith('*.'):
                # File extension pattern
                if path_obj.suffix == pattern[1:]:
                    return True
            else:
                # Directory or filename pattern
                if pattern in path_obj.parts or path_obj.name == pattern:
                    return True
        
        return False
    
    def create_source_backup(self, output_dir):
        """Create source code backup"""
        logger.info("Creating source code backup...")
        
        source_backup_file = output_dir / f"source_code_{self.timestamp}.zip"
        
        with zipfile.ZipFile(source_backup_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(self.project_root):
                # Remove excluded directories from dirs list to prevent traversal
                dirs[:] = [d for d in dirs if not self.should_exclude(os.path.join(root, d))]
                
                for file in files:
                    file_path = Path(root) / file
                    
                    if not self.should_exclude(file_path):
                        # Calculate relative path from project root
                        rel_path = file_path.relative_to(self.project_root)
                        zipf.write(file_path, rel_path)
        
        logger.info(f"Source code backup created: {source_backup_file}")
        return source_backup_file
    
    def create_config_backup(self, output_dir):
        """Create configuration files backup"""
        logger.info("Creating configuration backup...")
        
        config_files = [
            'package.json',
            'requirements.txt', 
            'pyproject.toml',
            'tsconfig.json',
            'tsconfig.app.json', 
            'tsconfig.node.json',
            'vite.config.ts',
            'tailwind.config.ts',
            'eslint.config.js',
            'postcss.config.js',
            'components.json',
            'backend/requirements.txt',
            'backend/pyproject.toml'
        ]
        
        config_backup = {
            'timestamp': datetime.now().isoformat(),
            'project_name': 'campus-connect-ui',
            'configs': {}
        }
        
        for config_file in config_files:
            config_path = self.project_root / config_file
            if config_path.exists():
                try:
                    if config_path.suffix == '.json':
                        with open(config_path, 'r', encoding='utf-8') as f:
                            config_backup['configs'][config_file] = json.load(f)
                    else:
                        with open(config_path, 'r', encoding='utf-8') as f:
                            config_backup['configs'][config_file] = f.read()
                except Exception as e:
                    logger.warning(f"Could not backup config file {config_file}: {e}")
                    config_backup['configs'][config_file] = f"ERROR: {str(e)}"
        
        config_backup_file = output_dir / f"configs_{self.timestamp}.json"
        with open(config_backup_file, 'w', encoding='utf-8') as f:
            json.dump(config_backup, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Configuration backup created: {config_backup_file}")
        return config_backup_file
    
    def get_git_info(self):
        """Get Git repository information"""
        git_info = {}
        
        try:
            # Get current branch
            result = subprocess.run(['git', 'branch', '--show-current'], 
                                  capture_output=True, text=True, cwd=self.project_root)
            if result.returncode == 0:
                git_info['current_branch'] = result.stdout.strip()
        except Exception:
            pass
        
        try:
            # Get last commit
            result = subprocess.run(['git', 'log', '-1', '--pretty=format:%H|%s|%an|%ad'], 
                                  capture_output=True, text=True, cwd=self.project_root)
            if result.returncode == 0:
                parts = result.stdout.strip().split('|')
                if len(parts) >= 4:
                    git_info['last_commit'] = {
                        'hash': parts[0],
                        'message': parts[1],
                        'author': parts[2],
                        'date': parts[3]
                    }
        except Exception:
            pass
        
        try:
            # Get remote URL
            result = subprocess.run(['git', 'remote', 'get-url', 'origin'], 
                                  capture_output=True, text=True, cwd=self.project_root)
            if result.returncode == 0:
                git_info['remote_url'] = result.stdout.strip()
        except Exception:
            pass
        
        return git_info
    
    async def create_full_backup(self, output_dir=None, include_database=True):
        """Create comprehensive project backup"""
        if output_dir is None:
            output_dir = self.project_root / "backups"
        
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)
        
        backup_session_dir = output_dir / f"full_project_backup_{self.timestamp}"
        backup_session_dir.mkdir(exist_ok=True)
        
        logger.info(f"Starting full project backup to {backup_session_dir}")
        
        backup_manifest = {
            'timestamp': datetime.now().isoformat(),
            'project_root': str(self.project_root),
            'backup_type': 'full_project',
            'components': {},
            'git_info': self.get_git_info()
        }
        
        try:
            # 1. Create source code backup
            source_backup = self.create_source_backup(backup_session_dir)
            backup_manifest['components']['source_code'] = {
                'file': source_backup.name,
                'status': 'success'
            }
        except Exception as e:
            logger.error(f"Source backup failed: {e}")
            backup_manifest['components']['source_code'] = {
                'status': 'failed',
                'error': str(e)
            }
        
        try:
            # 2. Create configuration backup
            config_backup = self.create_config_backup(backup_session_dir)
            backup_manifest['components']['configurations'] = {
                'file': config_backup.name,
                'status': 'success'
            }
        except Exception as e:
            logger.error(f"Configuration backup failed: {e}")
            backup_manifest['components']['configurations'] = {
                'status': 'failed',
                'error': str(e)
            }
        
        # 3. Create database backup if requested
        if include_database:
            try:
                db_backup = DatabaseBackup()
                await db_backup.connect()
                db_backup_dir = await db_backup.full_backup(backup_session_dir / "database")
                await db_backup.disconnect()
                
                backup_manifest['components']['database'] = {
                    'directory': db_backup_dir.name,
                    'status': 'success'
                }
            except Exception as e:
                logger.error(f"Database backup failed: {e}")
                backup_manifest['components']['database'] = {
                    'status': 'failed',
                    'error': str(e)
                }
        
        # Save backup manifest
        manifest_file = backup_session_dir / "backup_manifest.json"
        with open(manifest_file, 'w', encoding='utf-8') as f:
            json.dump(backup_manifest, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Full project backup completed: {backup_session_dir}")
        return backup_session_dir

async def main():
    parser = argparse.ArgumentParser(description="Campus Connect Full Project Backup Tool")
    parser.add_argument("--output", "-o", help="Output directory for backups")
    parser.add_argument("--no-database", action="store_true", help="Skip database backup")
    parser.add_argument("--project-root", help="Project root directory", 
                       default=str(Path(__file__).parent.parent))
    
    args = parser.parse_args()
    
    try:
        project_backup = ProjectBackup(args.project_root)
        backup_dir = await project_backup.create_full_backup(
            output_dir=args.output,
            include_database=not args.no_database
        )
        
        logger.info(f"Full backup completed successfully!")
        logger.info(f"Backup location: {backup_dir}")
        
    except Exception as e:
        logger.error(f"Backup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())