"""Script to retrieve external de-identified IBD data with labels"""

from db_handler import DatabaseHandler
from config import DB_CONFIG
import pandas as pd
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_external_data(limit=None):
    """
    Retrieve external de-identified data with flare labels
    
    Args:
        limit (int, optional): Maximum number of records to retrieve. If None, retrieves all records.
    
    Returns:
        pd.DataFrame: De-identified patient data with flare labels
    """
    try:
        # Initialize database connection
        db = DatabaseHandler(DB_CONFIG)
        
        # Get patient data
        if limit:
            data = db.get_patient_data(limit=limit)
        else:
            # Get all data by setting a very high limit
            data = db.get_patient_data(limit=1000000)
        
        # Get basic statistics
        total_records = len(data)
        flare_count = data['flare_occurred'].sum()
        flare_percentage = (flare_count / total_records) * 100 if total_records > 0 else 0
        
        logger.info(f"Retrieved {total_records} records")
        logger.info(f"Number of flare cases: {flare_count} ({flare_percentage:.2f}%)")
        
        # Select relevant features and labels
        features = [
            'anonymous_id', 'age_range', 'region',
            'calories', 'protein', 'carbs', 'fiber',
            'has_allergens', 'meals_per_day', 'hydration_level',
            'bowel_frequency', 'bristol_scale', 'urgency_level',
            'blood_present', 'pain_location', 'pain_severity',
            'pain_time', 'medication_taken', 'medication_type',
            'dosage_level', 'sleep_hours', 'stress_level',
            'menstruation', 'fatigue_level', 'timestamp'
        ]
        
        label = 'flare_occurred'
        
        # Create feature matrix X and label vector y
        X = data[features]
        y = data[label]
        
        return X, y, data
        
    except Exception as e:
        logger.error(f"Error retrieving data: {str(e)}")
        raise

if __name__ == "__main__":
    # Example usage
    X, y, full_data = get_external_data()
    
    # Display sample of the data
    print("\nSample of retrieved data:")
    print(full_data.head())
    
    # Display feature statistics
    print("\nFeature statistics:")
    print(X.describe())
    
    # Display label distribution
    print("\nLabel distribution:")
    print(y.value_counts(normalize=True)) 