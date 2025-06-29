"""Script to generate synthetic IBD patient data with improved clinical distributions"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from sqlalchemy import create_engine
import logging
import os
import sys
from config import DB_CONFIG

# Set up logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/synthetic_data_generation.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class SyntheticDataGenerator:
    def __init__(self):
        self.engine = create_engine(
            f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
            f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        )
        
        # Clinical parameters based on medical literature
        self.pain_locations = {
            'Lower Right Quadrant': 0.35,
            'Lower Left Quadrant': 0.25,
            'Periumbilical': 0.20,
            'Upper Abdomen': 0.15,
            'Diffuse': 0.05
        }
        
        self.pain_timing = {
            'Post-meal': 0.40,
            'Early Morning': 0.25,
            'Random': 0.20,
            'Night': 0.15
        }
        
        self.medication_types = {
            'Mesalamine': 0.30,
            'Corticosteroids': 0.25,
            'Immunomodulators': 0.20,
            'Biologics': 0.15,
            'None': 0.10
        }
        
    def generate_patient_record(self):
        """Generate a single synthetic patient record with clinical correlations"""
        
        # Base probability of flare (will be modified by other factors)
        flare_base_prob = 0.4
        
        # Generate pain severity (0-10 scale)
        pain_severity = np.random.gamma(shape=2.0, scale=2.0)
        pain_severity = min(10, pain_severity)
        
        # Pain severity increases flare probability
        flare_prob = flare_base_prob + (pain_severity / 20)
        
        # Generate bowel frequency (movements per day)
        if np.random.random() < flare_prob:
            bowel_freq = np.random.normal(6, 2)
        else:
            bowel_freq = np.random.normal(2, 1)
        bowel_freq = max(0, min(15, bowel_freq))
        
        # Generate other clinical parameters
        urgency = min(10, max(0, np.random.normal(pain_severity * 0.8, 2)))
        stress = min(10, max(0, np.random.normal(7 if np.random.random() < flare_prob else 4, 2)))
        fatigue = min(10, max(0, np.random.normal(pain_severity * 0.7, 2)))
        
        # Nutrition factors
        calories = np.random.normal(1800 if np.random.random() < flare_prob else 2200, 300)
        protein = np.random.normal(60 if np.random.random() < flare_prob else 80, 15)
        fiber = np.random.normal(15 if np.random.random() < flare_prob else 25, 5)
        
        # Generate categorical variables using weighted probabilities
        pain_location = np.random.choice(
            list(self.pain_locations.keys()),
            p=list(self.pain_locations.values())
        )
        
        pain_time = np.random.choice(
            list(self.pain_timing.keys()),
            p=list(self.pain_timing.values())
        )
        
        medication_type = np.random.choice(
            list(self.medication_types.keys()),
            p=list(self.medication_types.values())
        )
        
        # Final flare probability adjustments based on all factors
        flare_prob += (bowel_freq - 3) * 0.05  # Increased bowel frequency raises flare probability
        flare_prob += (urgency - 5) * 0.03     # Higher urgency raises flare probability
        flare_prob += (stress - 5) * 0.02      # Higher stress raises flare probability
        flare_prob = min(0.95, max(0.05, flare_prob))  # Keep probability between 0.05 and 0.95
        
        # Determine final flare status
        flare_occurred = np.random.random() < flare_prob
        
        # Generate timestamp within last 30 days
        timestamp = datetime.now() - timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        return {
            'timestamp': timestamp,
            'pain_severity': round(pain_severity, 2),
            'pain_location': pain_location,
            'pain_time': pain_time,
            'bowel_frequency': round(bowel_freq, 1),
            'urgency_level': round(urgency, 2),
            'blood_present': np.random.random() < (0.6 if flare_occurred else 0.1),
            'stress_level': round(stress, 2),
            'fatigue_level': round(fatigue, 2),
            'medication_type': medication_type,
            'medication_taken': np.random.random() < 0.85,
            'calories': round(calories, 1),
            'protein': round(protein, 1),
            'fiber': round(fiber, 1),
            'flare_occurred': flare_occurred,
            'data_source_id': 2  # ID for synthetic data source
        }
        
    def generate_dataset(self, n_records):
        """Generate multiple synthetic patient records"""
        logger.info(f"Generating {n_records} synthetic patient records...")
        
        records = []
        for i in range(n_records):
            if i % 100 == 0:
                logger.info(f"Generated {i} records...")
            records.append(self.generate_patient_record())
            
        df = pd.DataFrame(records)
        return df
        
    def save_to_database(self, df):
        """Save the generated data to the database"""
        try:
            df.to_sql(
                'patient_data',
                self.engine,
                if_exists='append',
                index=False
            )
            logger.info(f"Successfully saved {len(df)} records to database")
            
        except Exception as e:
            logger.error(f"Error saving to database: {str(e)}")
            raise
            
    def analyze_generated_data(self, df):
        """Analyze the distributions of generated data"""
        logger.info("\nGenerated Data Analysis:")
        
        # Analyze flare distribution
        flare_rate = df['flare_occurred'].mean()
        logger.info(f"Flare Rate: {flare_rate:.2%}")
        
        # Analyze numerical features
        numerical_features = [
            'pain_severity', 'bowel_frequency', 'urgency_level',
            'stress_level', 'fatigue_level', 'calories', 'protein', 'fiber'
        ]
        
        for feature in numerical_features:
            stats = df[feature].describe()
            logger.info(f"\n{feature} statistics:")
            logger.info(f"Mean: {stats['mean']:.2f}")
            logger.info(f"Std: {stats['std']:.2f}")
            logger.info(f"Min: {stats['min']:.2f}")
            logger.info(f"Max: {stats['max']:.2f}")
            
        # Analyze categorical features
        categorical_features = [
            'pain_location', 'pain_time', 'medication_type',
            'blood_present', 'medication_taken'
        ]
        
        for feature in categorical_features:
            dist = df[feature].value_counts(normalize=True)
            logger.info(f"\n{feature} distribution:")
            for category, freq in dist.items():
                logger.info(f"{category}: {freq:.2%}")

def main():
    try:
        generator = SyntheticDataGenerator()
        
        # Generate new synthetic data
        n_records = 5000
        df = generator.generate_dataset(n_records)
        
        # Analyze the generated data
        generator.analyze_generated_data(df)
        
        # Save to database
        generator.save_to_database(df)
        
        logger.info("Synthetic data generation completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in synthetic data generation: {str(e)}")
        raise

if __name__ == "__main__":
    main() 