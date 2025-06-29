"""Script to generate and persist synthetic IBD patient data"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import uuid
from db_handler import DatabaseHandler
from config import DB_CONFIG, DATA_CONFIG
import logging
import os
import sys

# Set up logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/synthetic_data.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class SyntheticDataGenerator:
    def __init__(self):
        self.db = DatabaseHandler(DB_CONFIG)
        
        # Define ranges for numerical features
        self.feature_ranges = {
            'calories': (1200, 3000),
            'protein': (30, 150),
            'carbs': (100, 400),
            'fiber': (5, 35),
            'meals_per_day': (2, 6),
            'hydration_level': (1, 10),
            'bowel_frequency': (0, 15),
            'bristol_scale': (1, 7),
            'urgency_level': (1, 10),
            'pain_severity': (0, 10),
            'dosage_level': (0.5, 2.0),
            'sleep_hours': (4, 12),
            'stress_level': (1, 10),
            'fatigue_level': (1, 10)
        }
        
        self.pain_locations = [
            'lower_abdomen', 'upper_abdomen', 'left_side',
            'right_side', 'entire_abdomen', None
        ]
        
        self.medication_types = [
            'mesalamine', 'prednisone', 'budesonide',
            'azathioprine', 'mercaptopurine', 'infliximab',
            'adalimumab', None
        ]
        
        self.regions = [
            'northeast', 'southeast', 'midwest',
            'southwest', 'west'
        ]

    def generate_synthetic_record(self):
        """Generate a single synthetic patient record"""
        record = {
            'anonymous_id': uuid.uuid4().hex,
            'age_range': f"{np.random.randint(2, 8)*10}-{np.random.randint(2, 8)*10+9}",
            'region': np.random.choice(self.regions),
            'timestamp': datetime.now() - timedelta(days=np.random.randint(0, 365))
        }
        
        # Generate numerical features
        for feature, (min_val, max_val) in self.feature_ranges.items():
            record[feature] = round(np.random.uniform(min_val, max_val), 2)
        
        # Generate categorical features
        record.update({
            'has_allergens': np.random.choice([True, False]),
            'blood_present': np.random.choice([True, False]),
            'pain_location': np.random.choice(self.pain_locations),
            'pain_time': np.random.choice(['morning', 'afternoon', 'evening', 'night', None]),
            'medication_taken': np.random.choice([True, False]),
            'medication_type': np.random.choice(self.medication_types),
            'menstruation': np.random.choice([True, False, None]),
        })
        
        # Generate flare prediction based on risk factors
        risk_score = (
            (record['pain_severity'] / 10) * 0.3 +
            (record['bowel_frequency'] / 15) * 0.2 +
            (record['urgency_level'] / 10) * 0.15 +
            (record['stress_level'] / 10) * 0.15 +
            (record['fatigue_level'] / 10) * 0.1 +
            (1 if record['blood_present'] else 0) * 0.1
        )
        record['flare_occurred'] = np.random.random() < risk_score
        
        return record

    def generate_dataset(self, num_samples=1000):
        """Generate a synthetic dataset"""
        logger.info(f"Generating {num_samples} synthetic records...")
        records = []
        for _ in range(num_samples):
            records.append(self.generate_synthetic_record())
        
        df = pd.DataFrame(records)
        
        # Calculate statistics
        flare_count = df['flare_occurred'].sum()
        flare_percentage = (flare_count / len(df)) * 100
        
        logger.info(f"Generated {len(df)} records:")
        logger.info(f"- Flare cases: {flare_count} ({flare_percentage:.2f}%)")
        logger.info(f"- Average pain severity: {df['pain_severity'].mean():.2f}")
        logger.info(f"- Average bowel frequency: {df['bowel_frequency'].mean():.2f}")
        
        return df

    def persist_synthetic_data(self, data_df):
        """Persist synthetic data with appropriate metadata"""
        try:
            # Create synthetic data source
            source_info = {
                'source_name': 'Synthetic IBD Dataset',
                'source_type': 'Synthetic Data',
                'source_description': 'Computer-generated synthetic IBD patient data for model training',
                'license_type': 'MIT'
            }
            
            # Create synthetic data publisher
            publisher_info = {
                'publisher_name': 'IBD Flare Predictor System',
                'institution': 'Automated Data Generation System',
                'contact_email': 'system@ibdpredictor.org',
                'website': 'https://ibdpredictor.org'
            }
            
            # Create record metadata
            record_info = {
                'publication_date': datetime.now().date(),
                'data_version': '1.0.0',
                'citation_text': 'Synthetic IBD Dataset (2024). Generated by IBD Flare Predictor System',
                'doi': None  # Synthetic data doesn't have a DOI
            }
            
            # Instead of truncating all tables, only remove previous synthetic data
            logger.info("Removing previous synthetic data...")
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Delete records associated with synthetic data source
                    cursor.execute("""
                        DELETE FROM external_data_records 
                        WHERE source_id IN (
                            SELECT id FROM data_sources 
                            WHERE source_type = 'Synthetic Data'
                        )
                    """)
                    
                    # Delete patient data associated with synthetic data source
                    cursor.execute("""
                        DELETE FROM patient_data 
                        WHERE data_source_id IN (
                            SELECT id FROM data_sources 
                            WHERE source_type = 'Synthetic Data'
                        )
                    """)
                    
                    # Delete synthetic data sources
                    cursor.execute("""
                        DELETE FROM data_sources 
                        WHERE source_type = 'Synthetic Data'
                    """)
                    
                    # Delete unused publishers
                    cursor.execute("""
                        DELETE FROM publishers 
                        WHERE id NOT IN (
                            SELECT DISTINCT publisher_id FROM patient_data
                            UNION
                            SELECT DISTINCT publisher_id FROM external_data_records
                        )
                    """)
                    
                    conn.commit()
            
            # Reset sequences to their proper values
            self.db.reset_sequences()
            
            # Insert source information
            source_id = self.db.insert_data_source(source_info)
            logger.info(f"Created synthetic data source (ID: {source_id})")
            
            # Insert publisher information
            publisher_id = self.db.insert_publisher(publisher_info)
            logger.info(f"Created synthetic data publisher (ID: {publisher_id})")
            
            # Insert each synthetic record
            total_records = len(data_df)
            successful_inserts = 0
            failed_inserts = []
            
            logger.info(f"Persisting {total_records} synthetic records...")
            
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
                    error_msg = f"Error inserting synthetic record {idx}: {str(e)}"
                    logger.error(error_msg)
                    failed_inserts.append({'index': idx, 'error': str(e)})
                    continue
            
            # Log final statistics
            success_rate = (successful_inserts / total_records) * 100
            logger.info(f"Completed persisting synthetic data:")
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
            logger.error(f"Error persisting synthetic data: {str(e)}")
            raise

def main():
    try:
        logger.info("Starting synthetic data generation process...")
        generator = SyntheticDataGenerator()
        
        # Generate synthetic dataset
        synthetic_data = generator.generate_dataset(num_samples=5000)
        
        # Persist the synthetic data
        stats = generator.persist_synthetic_data(synthetic_data)
        
        # Verify the data
        logger.info("\nVerifying synthetic data...")
        verified_data = generator.db.get_patient_data_with_source(limit=5)
        logger.info("\nSample of persisted synthetic data:")
        print(verified_data[['anonymous_id', 'source_name', 'publisher_name']].head())
        
        logger.info("Synthetic data generation and persistence completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in synthetic data generation: {str(e)}")
        raise

if __name__ == "__main__":
    main() 