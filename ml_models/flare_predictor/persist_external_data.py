"""Script to persist external de-identified data with source and publisher information"""

from db_handler import DatabaseHandler
from config import DB_CONFIG, LOG_CONFIG
import logging
from datetime import datetime
import pandas as pd
import os
import sys

# Set up logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=getattr(logging, LOG_CONFIG['level']),
    format=LOG_CONFIG['format'],
    handlers=[
        logging.FileHandler(LOG_CONFIG['file']),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class ExternalDataPersistence:
    def __init__(self):
        try:
            self.db = DatabaseHandler(DB_CONFIG)
            logger.info("Successfully initialized database connection")
        except Exception as e:
            logger.error(f"Failed to initialize database connection: {str(e)}")
            raise
        
    def persist_external_data(self, data_df, source_info, publisher_info, record_info):
        """
        Persist external de-identified data with source and publisher information
        
        Args:
            data_df (pd.DataFrame): DataFrame containing the external data
            source_info (dict): Information about the data source
            publisher_info (dict): Information about the publisher
            record_info (dict): Information about the data record
        """
        try:
            # Clear existing data and reset sequences
            logger.info("Clearing existing data and resetting sequences...")
            self.db.truncate_all_tables()
            
            # Insert source information
            source_id = self.db.insert_data_source(source_info)
            logger.info(f"Inserted data source: {source_info['source_name']} (ID: {source_id})")
            
            # Insert publisher information
            publisher_id = self.db.insert_publisher(publisher_info)
            logger.info(f"Inserted publisher: {publisher_info['publisher_name']} (ID: {publisher_id})")
            
            # Insert each patient record
            total_records = len(data_df)
            successful_inserts = 0
            failed_inserts = []
            
            logger.info(f"Starting to process {total_records} records...")
            
            for idx, row in data_df.iterrows():
                try:
                    # Convert row to dict and handle NaN values
                    row_dict = row.where(pd.notnull(row), None).to_dict()
                    
                    # Remove any existing id from the data
                    if 'id' in row_dict:
                        del row_dict['id']
                    
                    # Insert patient data with source and publisher references
                    patient_id, anonymous_id = self.db.insert_patient_data(
                        row_dict,
                        source_id=source_id,
                        publisher_id=publisher_id
                    )
                    
                    # Insert external data record
                    record_info.update({
                        'patient_data_id': patient_id,
                        'source_id': source_id,
                        'publisher_id': publisher_id
                    })
                    self.db.insert_external_data_record(record_info)
                    
                    successful_inserts += 1
                    
                    if (idx + 1) % 100 == 0:
                        logger.info(f"Processed {idx + 1}/{total_records} records ({successful_inserts} successful)")
                        
                except Exception as e:
                    error_msg = f"Error inserting record {idx}: {str(e)}"
                    logger.error(error_msg)
                    failed_inserts.append({'index': idx, 'error': str(e)})
                    continue
            
            # Log final statistics
            success_rate = (successful_inserts / total_records) * 100
            logger.info(f"Completed processing {total_records} records:")
            logger.info(f"- Successfully inserted: {successful_inserts} ({success_rate:.2f}%)")
            logger.info(f"- Failed inserts: {len(failed_inserts)}")
            
            if failed_inserts:
                logger.warning("Failed inserts details:")
                for fail in failed_inserts[:5]:  # Show first 5 failures
                    logger.warning(f"- Record {fail['index']}: {fail['error']}")
                if len(failed_inserts) > 5:
                    logger.warning(f"... and {len(failed_inserts) - 5} more failures")
            
            # Return statistics
            return {
                'total_records': total_records,
                'successful_inserts': successful_inserts,
                'failed_inserts': failed_inserts,
                'source_id': source_id,
                'publisher_id': publisher_id,
                'success_rate': success_rate
            }
            
        except Exception as e:
            logger.error(f"Error persisting external data: {str(e)}")
            raise

def main():
    try:
        logger.info("Starting external data persistence process...")
        persister = ExternalDataPersistence()
        
        # Example source information
        source_info = {
            'source_name': 'IBD Research Database',
            'source_type': 'Clinical Database',
            'source_url': 'https://example.com/ibd-database',
            'source_description': 'Comprehensive IBD patient data from multiple clinical trials',
            'license_type': 'CC BY-NC-SA 4.0'
        }
        
        # Example publisher information
        publisher_info = {
            'publisher_name': 'International IBD Research Consortium',
            'institution': 'Global Health Institute',
            'contact_email': 'research@ibdconsortium.org',
            'website': 'https://ibdconsortium.org'
        }
        
        # Example record information
        record_info = {
            'publication_date': datetime.now().date(),
            'data_version': '2.0.0',
            'citation_text': 'IBD Research Consortium (2024). IBD Patient Database v2.0.0',
            'doi': '10.1234/ibd.2024.v2'
        }
        
        logger.info("Getting external data...")
        from get_external_data import get_external_data
        X, y, data = get_external_data()
        
        logger.info("Persisting data...")
        stats = persister.persist_external_data(data, source_info, publisher_info, record_info)
        
        # Display results
        logger.info("\nPersistence Statistics:")
        logger.info(f"Total records processed: {stats['total_records']}")
        logger.info(f"Successfully inserted: {stats['successful_inserts']} ({stats['success_rate']:.2f}%)")
        logger.info(f"Failed inserts: {len(stats['failed_inserts'])}")
        logger.info(f"Source ID: {stats['source_id']}")
        logger.info(f"Publisher ID: {stats['publisher_id']}")
        
        # Verify the data
        logger.info("\nVerifying persisted data...")
        verified_data = persister.db.get_patient_data_with_source(limit=5)
        logger.info("\nSample of persisted data with source information:")
        print(verified_data[['anonymous_id', 'source_name', 'publisher_name', 'doi']].head())
        
        logger.info("External data persistence process completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in main: {str(e)}")
        raise

if __name__ == "__main__":
    main() 