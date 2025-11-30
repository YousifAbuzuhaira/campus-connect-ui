#!/usr/bin/env python3
"""
MongoDB Database Restore Script for Campus Connect
Restores backups created by backup_database.py
"""

import os
import sys
import json
import gzip
import asyncio
from datetime import datetime
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import argparse
import logging
from bson import ObjectId

# Add parent directory to path to import database module
sys.path.append(str(Path(__file__).parent.parent))

# Load environment variables
load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseRestore:
    def __init__(self):
        self.mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        self.database_name = os.getenv("DATABASE_NAME", "campus_connect")
        self.client = None
        self.db = None
    
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(self.mongodb_url)
            self.db = self.client[self.database_name]
            # Test connection
            await self.client.admin.command('ping')
            logger.info(f"Successfully connected to MongoDB at {self.mongodb_url}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    def convert_object_ids(self, document):
        """Convert string _id back to ObjectId for MongoDB"""
        if '_id' in document and isinstance(document['_id'], str):
            try:
                document['_id'] = ObjectId(document['_id'])
            except Exception:
                # If conversion fails, keep as string or generate new ObjectId
                pass
        return document
    
    async def restore_collection(self, backup_file, drop_existing=False):
        """Restore a single collection from backup file"""
        try:
            backup_file = Path(backup_file)
            
            # Read backup file
            if backup_file.suffix == '.gz':
                with gzip.open(backup_file, 'rt', encoding='utf-8') as f:
                    backup_data = json.load(f)
            else:
                with open(backup_file, 'r', encoding='utf-8') as f:
                    backup_data = json.load(f)
            
            collection_name = backup_data['collection']
            documents = backup_data['documents']
            
            logger.info(f"Restoring {len(documents)} documents to collection '{collection_name}'")
            
            collection = self.db[collection_name]
            
            # Drop existing collection if requested
            if drop_existing:
                await collection.drop()
                logger.info(f"Dropped existing collection '{collection_name}'")
            
            if documents:
                # Convert string IDs back to ObjectId
                processed_docs = [self.convert_object_ids(doc.copy()) for doc in documents]
                
                # Insert documents
                result = await collection.insert_many(processed_docs, ordered=False)
                logger.info(f"Successfully restored {len(result.inserted_ids)} documents to '{collection_name}'")
                
                return len(result.inserted_ids)
            else:
                logger.info(f"No documents to restore for collection '{collection_name}'")
                return 0
                
        except Exception as e:
            logger.error(f"Failed to restore from {backup_file}: {e}")
            raise
    
    async def restore_full_backup(self, backup_dir, drop_existing=False):
        """Restore full database from backup directory"""
        try:
            backup_dir = Path(backup_dir)
            metadata_file = backup_dir / "backup_info.json"
            
            if not metadata_file.exists():
                raise FileNotFoundError(f"Backup metadata file not found: {metadata_file}")
            
            # Read backup metadata
            with open(metadata_file, 'r') as f:
                backup_info = json.load(f)
            
            logger.info(f"Restoring full backup from {backup_dir}")
            logger.info(f"Backup timestamp: {backup_info['timestamp']}")
            logger.info(f"Original database: {backup_info['database_name']}")
            
            total_restored = 0
            
            # Restore each collection
            for collection_name, collection_info in backup_info['collections'].items():
                if 'error' in collection_info:
                    logger.warning(f"Skipping {collection_name} due to backup error: {collection_info['error']}")
                    continue
                
                backup_file = backup_dir / collection_info['file']
                if backup_file.exists():
                    try:
                        restored_count = await self.restore_collection(backup_file, drop_existing)
                        total_restored += restored_count
                    except Exception as e:
                        logger.error(f"Failed to restore collection {collection_name}: {e}")
                else:
                    logger.warning(f"Backup file not found: {backup_file}")
            
            logger.info(f"Full restore completed. Total documents restored: {total_restored}")
            return total_restored
            
        except Exception as e:
            logger.error(f"Failed to restore full backup: {e}")
            raise
    
    async def list_backups(self, backup_dir):
        """List available backups"""
        backup_dir = Path(backup_dir)
        
        if not backup_dir.exists():
            logger.info(f"Backup directory does not exist: {backup_dir}")
            return
        
        logger.info(f"Available backups in {backup_dir}:")
        
        # List full backups
        full_backups = [d for d in backup_dir.iterdir() if d.is_dir() and d.name.startswith('full_backup_')]
        if full_backups:
            logger.info("Full backups:")
            for backup in sorted(full_backups, reverse=True):
                metadata_file = backup / "backup_info.json"
                if metadata_file.exists():
                    with open(metadata_file, 'r') as f:
                        info = json.load(f)
                    logger.info(f"  {backup.name} - {info['timestamp']} - {info['total_documents']} documents")
                else:
                    logger.info(f"  {backup.name} - (metadata missing)")
        
        # List individual collection backups
        collection_backups = [f for f in backup_dir.iterdir() if f.is_file() and f.suffix in ['.json', '.gz']]
        if collection_backups:
            logger.info("Individual collection backups:")
            for backup in sorted(collection_backups, reverse=True):
                logger.info(f"  {backup.name}")

async def main():
    parser = argparse.ArgumentParser(description="Campus Connect Database Restore Tool")
    parser.add_argument("--backup-dir", "-b", help="Backup directory or file to restore from",
                       default=str(Path(__file__).parent / "backups"))
    parser.add_argument("--file", "-f", help="Specific backup file to restore")
    parser.add_argument("--drop", action="store_true", 
                       help="Drop existing collections before restore (DANGEROUS!)")
    parser.add_argument("--list", action="store_true", help="List available backups")
    parser.add_argument("--confirm", action="store_true", 
                       help="Confirm restore operation (required for safety)")
    
    args = parser.parse_args()
    
    restore_tool = DatabaseRestore()
    
    try:
        await restore_tool.connect()
        
        if args.list:
            await restore_tool.list_backups(args.backup_dir)
            return
        
        if not args.confirm:
            logger.error("Restore operation requires --confirm flag for safety")
            logger.error("This operation can overwrite existing data!")
            sys.exit(1)
        
        if args.file:
            # Restore specific file
            if args.drop:
                response = input("WARNING: This will drop the existing collection. Continue? (yes/no): ")
                if response.lower() != 'yes':
                    logger.info("Restore cancelled")
                    return
            
            await restore_tool.restore_collection(args.file, args.drop)
        else:
            # Restore full backup - find latest backup if directory given
            backup_path = Path(args.backup_dir)
            
            if backup_path.is_file():
                # Single file restore
                await restore_tool.restore_collection(backup_path, args.drop)
            else:
                # Directory - find latest full backup
                full_backups = [d for d in backup_path.iterdir() 
                               if d.is_dir() and d.name.startswith('full_backup_')]
                
                if not full_backups:
                    logger.error(f"No full backups found in {backup_path}")
                    sys.exit(1)
                
                latest_backup = max(full_backups, key=lambda x: x.name)
                
                if args.drop:
                    response = input("WARNING: This will drop ALL existing collections. Continue? (yes/no): ")
                    if response.lower() != 'yes':
                        logger.info("Restore cancelled")
                        return
                
                await restore_tool.restore_full_backup(latest_backup, args.drop)
        
    except Exception as e:
        logger.error(f"Restore failed: {e}")
        sys.exit(1)
    finally:
        await restore_tool.disconnect()

if __name__ == "__main__":
    asyncio.run(main())