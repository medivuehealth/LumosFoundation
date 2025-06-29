"""Script to import both external and synthetic data in the correct order"""

import logging
import os
import sys
from db_handler import DatabaseHandler
from config import DB_CONFIG
from external_data_handler import ExternalDataHandler
from synthetic_data_generator import SyntheticDataGenerator

# Set up logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/data_import.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def import_all_data():
    """Import both external and synthetic data while maintaining proper sequencing"""
    try:
        logger.info("Starting data import process...")
        
        # Initialize handlers
        db = DatabaseHandler(DB_CONFIG)
        external_handler = ExternalDataHandler()
        synthetic_generator = SyntheticDataGenerator()
        
        # Step 1: Truncate all tables but preserve sequences
        logger.info("Truncating all tables while preserving sequences...")
        db.truncate_all_tables()
        
        # Step 2: Import external data first
        logger.info("Importing external data...")
        external_data = external_handler.load_external_data()
        external_stats = external_handler.persist_external_data(external_data)
        logger.info(f"External data import complete: {external_stats['successful_inserts']} records")
        
        # Step 3: Generate and import synthetic data
        logger.info("Generating and importing synthetic data...")
        synthetic_data = synthetic_generator.generate_dataset(num_samples=5000)
        synthetic_stats = synthetic_generator.persist_synthetic_data(synthetic_data)
        logger.info(f"Synthetic data import complete: {synthetic_stats['successful_inserts']} records")
        
        # Step 4: Verify data import
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                # Check data sources
                cursor.execute("""
                    SELECT source_type, COUNT(*) 
                    FROM data_sources 
                    GROUP BY source_type
                """)
                source_stats = cursor.fetchall()
                logger.info("\nData source statistics:")
                for source_type, count in source_stats:
                    logger.info(f"- {source_type}: {count} sources")
                
                # Check record counts
                cursor.execute("""
                    SELECT 
                        ds.source_type,
                        COUNT(pd.id) as record_count,
                        SUM(CASE WHEN pd.flare_occurred THEN 1 ELSE 0 END) as flare_count
                    FROM patient_data pd
                    JOIN data_sources ds ON pd.data_source_id = ds.id
                    GROUP BY ds.source_type
                """)
                record_stats = cursor.fetchall()
                logger.info("\nRecord statistics:")
                for source_type, record_count, flare_count in record_stats:
                    flare_percentage = (flare_count / record_count * 100) if record_count > 0 else 0
                    logger.info(f"- {source_type}:")
                    logger.info(f"  * Total records: {record_count}")
                    logger.info(f"  * Flare cases: {flare_count} ({flare_percentage:.2f}%)")
        
        logger.info("\nData import process completed successfully!")
        
        return {
            'external_stats': external_stats,
            'synthetic_stats': synthetic_stats
        }
        
    except Exception as e:
        logger.error(f"Error during data import: {str(e)}")
        raise

if __name__ == "__main__":
    import_all_data() 