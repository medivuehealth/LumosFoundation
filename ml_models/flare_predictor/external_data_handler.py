"""Handler for external IBD patient data"""

import pandas as pd
import numpy as np
from datetime import datetime
import uuid
from db_handler import DatabaseHandler
from config import DB_CONFIG
import logging
import os
import sys

# Set up logging
logger = logging.getLogger(__name__)

class ExternalDataHandler:
    def __init__(self):
        self.db = DatabaseHandler(DB_CONFIG)
        
    def load_external_data(self, num_samples=5000):
        """Load external data (simulated for development)"""
        logger.info(f"Loading {num_samples} external records...")
        
        # Generate realistic external data
        records = []
        for _ in range(num_samples):
            record = {
                'anonymous_id': uuid.uuid4().hex,
                'age_range': f"{np.random.randint(2, 8)*10}-{np.random.randint(2, 8)*10+9}",
                'region': np.random.choice(['northeast', 'southeast', 'midwest', 'southwest', 'west']),
                'timestamp': pd.Timestamp.now() - pd.Timedelta(days=np.random.randint(0, 365)),
                'calories': np.random.uniform(1200, 3000),
                'protein': np.random.uniform(30, 150),
                'carbs': np.random.uniform(100, 400),
                'fiber': np.random.uniform(5, 35),
                'meals_per_day': np.random.randint(2, 7),
                'hydration_level': np.random.randint(1, 11),
                'bowel_frequency': np.random.randint(0, 16),
                'bristol_scale': np.random.randint(1, 8),
                'urgency_level': np.random.randint(1, 11),
                'pain_severity': np.random.randint(0, 11),
                'pain_location': np.random.choice(['lower_abdomen', 'upper_abdomen', 'left_side', 'right_side', 'entire_abdomen', None]),
                'pain_time': np.random.choice(['morning', 'afternoon', 'evening', 'night', None]),
                'blood_present': np.random.choice([True, False]),
                'medication_taken': np.random.choice([True, False]),
                'medication_type': np.random.choice(['mesalamine', 'prednisone', 'budesonide', 'azathioprine', 'mercaptopurine', 'infliximab', 'adalimumab', None]),
                'dosage_level': np.random.uniform(0.5, 2.0),
                'sleep_hours': np.random.uniform(4, 12),
                'stress_level': np.random.randint(1, 11),
                'fatigue_level': np.random.randint(1, 11),
                'menstruation': np.random.choice([True, False, None]),
                'has_allergens': np.random.choice([True, False])
            }
            
            # Calculate flare risk based on clinical factors
            risk_score = (
                (record['pain_severity'] / 10) * 0.3 +
                (record['bowel_frequency'] / 15) * 0.2 +
                (record['urgency_level'] / 10) * 0.15 +
                (record['stress_level'] / 10) * 0.15 +
                (record['fatigue_level'] / 10) * 0.1 +
                (1 if record['blood_present'] else 0) * 0.1
            )
            record['flare_occurred'] = np.random.random() < risk_score
            
            records.append(record)
        
        df = pd.DataFrame(records)
        
        # Calculate statistics
        flare_count = df['flare_occurred'].sum()
        flare_percentage = (flare_count / len(df)) * 100
        
        logger.info(f"Loaded {len(df)} external records:")
        logger.info(f"- Flare cases: {flare_count} ({flare_percentage:.2f}%)")
        logger.info(f"- Average pain severity: {df['pain_severity'].mean():.2f}")
        logger.info(f"- Average bowel frequency: {df['bowel_frequency'].mean():.2f}")
        
        return df
    
    def persist_external_data(self, data_df):
        """Persist external data with appropriate metadata"""
        try:
            # Create external data source
            source_info = {
                'source_name': 'External IBD Dataset',
                'source_type': 'External Data',
                'source_description': 'Clinical IBD patient data from external sources',
                'license_type': 'HIPAA Compliant'
            }
            
            # Create external data publisher
            publisher_info = {
                'publisher_name': 'IBD Research Consortium',
                'institution': 'Multi-Center Research Initiative',
                'contact_email': 'research@ibdconsortium.org',
                'website': 'https://ibdconsortium.org'
            }
            
            # Create record metadata
            record_info = {
                'publication_date': datetime.now().date(),
                'data_version': '1.0.0',
                'citation_text': 'IBD Clinical Dataset (2024). IBD Research Consortium',
                'doi': 'https://doi.org/10.xxxx/xxxxx'
            }
            
            # Insert source information
            source_id = self.db.insert_data_source(source_info)
            logger.info(f"Created external data source (ID: {source_id})")
            
            # Insert publisher information
            publisher_id = self.db.insert_publisher(publisher_info)
            logger.info(f"Created external data publisher (ID: {publisher_id})")
            
            # Insert each external record
            total_records = len(data_df)
            successful_inserts = 0
            failed_inserts = []
            
            logger.info(f"Persisting {total_records} external records...")
            
            for idx, row in data_df.iterrows():
                try:
                    # Convert row to dict and handle NaN values
                    row_dict = row.where(pd.notnull(row), None).to_dict()
                    
                    # Insert patient data
                    patient_id, anonymous_id = self.db.insert_patient_data(
                        row_dict,
                        source_id=source_id,
                        publisher_id=publisher_id
                    )
                    
                    # Insert record metadata
                    record_info.update({
                        'patient_data_id': patient_id,
                        'source_id': source_id,
                        'publisher_id': publisher_id
                    })
                    self.db.insert_external_data_record(record_info)
                    
                    successful_inserts += 1
                    
                    if (idx + 1) % 100 == 0:
                        logger.info(f"Processed {idx + 1}/{total_records} records")
                        
                except Exception as e:
                    error_msg = f"Error inserting external record {idx}: {str(e)}"
                    logger.error(error_msg)
                    failed_inserts.append({'index': idx, 'error': str(e)})
                    continue
            
            # Log final statistics
            success_rate = (successful_inserts / total_records) * 100
            logger.info(f"Completed persisting external data:")
            logger.info(f"- Successfully inserted: {successful_inserts} ({success_rate:.2f}%)")
            logger.info(f"- Failed inserts: {len(failed_inserts)}")
            
            if failed_inserts:
                logger.warning("Failed inserts details:")
                for fail in failed_inserts[:5]:
                    logger.warning(f"- Record {fail['index']}: {fail['error']}")
                if len(failed_inserts) > 5:
                    logger.warning(f"... and {len(failed_inserts) - 5} more failures")
            
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