#!/usr/bin/env python3
"""
MongoDB Database Backup Script for Campus Connect
Creates backups of all collections with timestamp and compression
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

# Add parent directory to path to import database module
sys.path.append(str(Path(__file__).parent.parent))

# Load environment variables
load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseBackup:
    def __init__(self):
        self.mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        self.database_name = os.getenv("DATABASE_NAME", "campus_connect")
        self.client = None
        self.db = None
        
        # Collections to backup
        self.collections = [
            "users",
            "products",
            "categories", 
            "chats",
            "messages",
            "reports",
            "featuredProducts",
            "ratings"
        ]
    
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
    
    async def backup_collection(self, collection_name, output_dir):
        """Backup a single collection"""
        try:
            collection = self.db[collection_name]
            documents = []
            
            # Get all documents from collection
            async for document in collection.find({}):
                # Convert ObjectId to string for JSON serialization
                if '_id' in document:
                    document['_id'] = str(document['_id'])
                documents.append(document)
            
            # Create backup file path
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = output_dir / f"{collection_name}_{timestamp}.json.gz"
            
            # Write compressed backup
            with gzip.open(backup_file, 'wt', encoding='utf-8') as f:
                json.dump({
                    'collection': collection_name,
                    'timestamp': datetime.now().isoformat(),
                    'count': len(documents),
                    'documents': documents
                }, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Backed up {len(documents)} documents from {collection_name} to {backup_file}")
            return backup_file, len(documents)
            
        except Exception as e:
            logger.error(f"Failed to backup collection {collection_name}: {e}")
            raise
    
    async def full_backup(self, output_dir=None):
        """Create full database backup"""
        if output_dir is None:
            output_dir = Path(__file__).parent / "backups"
        
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_session_dir = output_dir / f"full_backup_{timestamp}"
        backup_session_dir.mkdir(exist_ok=True)
        
        logger.info(f"Starting full database backup to {backup_session_dir}")
        
        backup_info = {
            'timestamp': datetime.now().isoformat(),
            'database_name': self.database_name,
            'collections': {},
            'total_documents': 0
        }
        
        # Backup each collection
        for collection_name in self.collections:
            try:
                backup_file, doc_count = await self.backup_collection(collection_name, backup_session_dir)
                backup_info['collections'][collection_name] = {
                    'file': str(backup_file.name),
                    'document_count': doc_count
                }
                backup_info['total_documents'] += doc_count
            except Exception as e:
                logger.error(f"Failed to backup {collection_name}: {e}")
                backup_info['collections'][collection_name] = {
                    'error': str(e)
                }
        
        # Write backup metadata
        metadata_file = backup_session_dir / "backup_info.json"
        with open(metadata_file, 'w') as f:
            json.dump(backup_info, f, indent=2)
        
        logger.info(f"Full backup completed. Total documents: {backup_info['total_documents']}")
        logger.info(f"Backup saved to: {backup_session_dir}")
        
        return backup_session_dir
    
    async def list_collections(self):
        """List all collections in the database"""
        try:
            collections = await self.db.list_collection_names()
            logger.info(f"Available collections: {collections}")
            return collections
        except Exception as e:
            logger.error(f"Failed to list collections: {e}")
            raise

async def main():
    parser = argparse.ArgumentParser(description="Campus Connect Database Backup Tool")
    parser.add_argument("--output", "-o", help="Output directory for backups", 
                       default=str(Path(__file__).parent / "backups"))
    parser.add_argument("--collection", "-c", help="Backup specific collection only")
    parser.add_argument("--list", action="store_true", help="List available collections")
    
    args = parser.parse_args()
    
    backup_tool = DatabaseBackup()
    
    try:
        await backup_tool.connect()
        
        if args.list:
            await backup_tool.list_collections()
        elif args.collection:
            # Backup specific collection
            output_dir = Path(args.output)
            output_dir.mkdir(exist_ok=True)
            await backup_tool.backup_collection(args.collection, output_dir)
        else:
            # Full backup
            await backup_tool.full_backup(args.output)
            
    except Exception as e:
        logger.error(f"Backup failed: {e}")
        sys.exit(1)
    finally:
        await backup_tool.disconnect()

if __name__ == "__main__":
    asyncio.run(main())