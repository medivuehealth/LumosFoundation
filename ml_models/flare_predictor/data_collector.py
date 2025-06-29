"""Data collection system for IBD flare prediction"""

from typing import List, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from data_sources import DataCollector as ExternalDataCollector
from nlp_processor import IBDTextProcessor
from data_anonymizer import DataAnonymizer
from db_handler import DatabaseHandler
from config import DB_CONFIG, DATA_CONFIG
import random
from faker import Faker
import os
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IBDDataCollector:
    """Collect and process IBD data from multiple sources"""
    
    def __init__(self):
        self.external_collector = ExternalDataCollector()
        self.nlp_processor = IBDTextProcessor()
        self.anonymizer = DataAnonymizer()
        self.faker = Faker()
        
        # Initialize data storage
        self.collected_data = {
            'patient_data': [],
            'clinical_measurements': [],
            'symptoms': [],
            'treatments': [],
            'outcomes': []
        }
        
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
        
        self.db_handler = DatabaseHandler(DB_CONFIG)

    def collect_data(self, synthetic_count: int = 100) -> Dict[str, pd.DataFrame]:
        """Collect data from all sources"""
        logger.info("Starting data collection process...")
        
        # Collect external data
        external_data = self._collect_external_data()
        
        # Generate synthetic data
        synthetic_data = self._generate_synthetic_data(synthetic_count)
        
        # Merge and process all data
        combined_data = self._merge_data_sources(external_data, synthetic_data)
        
        # Anonymize the combined dataset
        anonymized_data = self._anonymize_data(combined_data)
        
        logger.info("Data collection completed successfully")
        return anonymized_data
    
    def _collect_external_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Collect data from external sources"""
        logger.info("Collecting data from external sources...")
        
        # Get research data
        research_data = self.external_collector.collect_research_data()
        
        processed_data = {
            'patient_data': [],
            'clinical_measurements': [],
            'symptoms': [],
            'treatments': [],
            'outcomes': []
        }
        
        # Process PubMed articles
        for article in research_data.get('pubmed_articles', []):
            features = self.nlp_processor.process_text(article.get('abstract', ''))
            self._process_extracted_features(features, processed_data)
        
        # Process clinical trials
        for trial in research_data.get('clinical_trials', []):
            if 'EligibilityCriteria' in trial:
                features = self.nlp_processor.process_text(trial['EligibilityCriteria'])
                self._process_extracted_features(features, processed_data)
            
            if 'OutcomeMeasures' in trial:
                features = self.nlp_processor.process_text(trial['OutcomeMeasures'])
                self._process_extracted_features(features, processed_data)
        
        return processed_data
    
    def _generate_synthetic_data(self, count: int) -> Dict[str, List[Dict[str, Any]]]:
        """Generate synthetic IBD patient data"""
        logger.info(f"Generating {count} synthetic patient records...")
        
        synthetic_data = {
            'patient_data': [],
            'clinical_measurements': [],
            'symptoms': [],
            'treatments': [],
            'outcomes': []
        }
        
        for _ in range(count):
            patient_data = self._generate_patient_record()
            
            # Add base patient data
            synthetic_data['patient_data'].append(patient_data['demographics'])
            
            # Add clinical measurements
            synthetic_data['clinical_measurements'].extend(patient_data['measurements'])
            
            # Add symptoms
            synthetic_data['symptoms'].extend(patient_data['symptoms'])
            
            # Add treatments
            synthetic_data['treatments'].extend(patient_data['treatments'])
            
            # Add outcomes
            synthetic_data['outcomes'].extend(patient_data['outcomes'])
        
        return synthetic_data
    
    def _generate_patient_record(self) -> Dict[str, Any]:
        """Generate a single synthetic patient record"""
        current_date = datetime.now()
        
        demographics = {
            'age': np.random.randint(18, 80),
            'gender': np.random.choice(['Male', 'Female']),
            'ethnicity': np.random.choice(['Caucasian', 'African', 'Asian', 'Hispanic']),
            'diagnosis_date': current_date - timedelta(days=np.random.randint(30, 3650))
        }
        
        measurements = []
        symptoms = []
        treatments = []
        outcomes = []
        
        # Generate time series data for the past year
        for days_ago in range(365, 0, -30):
            date = current_date - timedelta(days=days_ago)
            
            # Clinical measurements
            measurements.append({
                'date': date,
                'crp': np.random.lognormal(mean=1.5, sigma=0.5),
                'calprotectin': np.random.lognormal(mean=5.0, sigma=1.0),
                'hemoglobin': np.random.normal(loc=13.5, scale=1.5)
            })
            
            # Symptoms
            if np.random.random() < 0.3:  # 30% chance of symptoms
                symptoms.append({
                    'date': date,
                    'type': np.random.choice(['abdominal pain', 'diarrhea', 'fatigue']),
                    'severity': np.random.choice(['mild', 'moderate', 'severe']),
                    'duration': np.random.randint(1, 14)
                })
            
            # Treatments
            if np.random.random() < 0.4:  # 40% chance of treatment change
                treatments.append({
                    'date': date,
                    'medication': np.random.choice(['mesalamine', 'prednisone', 'infliximab']),
                    'dosage': np.random.choice([20, 40, 60, 80, 100]),
                    'frequency': np.random.choice(['daily', 'weekly', 'biweekly'])
                })
            
            # Outcomes
            if np.random.random() < 0.2:  # 20% chance of outcome change
                outcomes.append({
                    'date': date,
                    'type': np.random.choice(['remission', 'flare', 'response']),
                    'duration': np.random.randint(7, 90)
                })
        
        return {
            'demographics': demographics,
            'measurements': measurements,
            'symptoms': symptoms,
            'treatments': treatments,
            'outcomes': outcomes
        }
    
    def _process_extracted_features(self, features: Dict[str, Any], 
                                  processed_data: Dict[str, List[Dict[str, Any]]]):
        """Process extracted features into structured data"""
        # Process demographics
        if features['demographics']:
            processed_data['patient_data'].append(features['demographics'])
        
        # Process measurements
        for measure_type, measurements in features.get('measurements', {}).items():
            for measurement in measurements:
                processed_data['clinical_measurements'].append({
                    'type': measure_type,
                    **measurement
                })
        
        # Process symptoms
        for symptom_type, symptoms in features.get('symptoms', {}).items():
            for symptom in symptoms:
                processed_data['symptoms'].append({
                    'type': symptom_type,
                    **symptom
                })
        
        # Process treatments
        if 'treatments' in features and 'medications' in features['treatments']:
            for treatment in features['treatments']['medications']:
                processed_data['treatments'].append(treatment)
        
        # Process outcomes
        for outcome_type, outcomes in features.get('outcomes', {}).items():
            for outcome in outcomes:
                processed_data['outcomes'].append({
                    'type': outcome_type,
                    **outcome
                })
    
    def _merge_data_sources(self, external_data: Dict[str, List[Dict[str, Any]]], 
                          synthetic_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, pd.DataFrame]:
        """Merge external and synthetic data"""
        merged_data = {}
        
        for key in external_data.keys():
            # Combine lists from both sources
            combined_list = external_data[key] + synthetic_data[key]
            
            # Convert to DataFrame
            df = pd.DataFrame(combined_list)
            
            # Add source column
            df['data_source'] = ['external'] * len(external_data[key]) + \
                               ['synthetic'] * len(synthetic_data[key])
            
            merged_data[key] = df
        
        return merged_data
    
    def _anonymize_data(self, data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """Anonymize the collected data"""
        anonymized_data = {}
        
        for key, df in data.items():
            anonymized_data[key] = self.anonymizer.anonymize_dataframe(df)
        
        return anonymized_data

    def generate_synthetic_record(self):
        """Generate a single synthetic patient record"""
        record = {
            'anonymous_id': self.anonymizer.generate_anonymous_id(self.faker.uuid4()),
            'age_range': f"{random.randint(0, 17)}-{random.randint(18, 35)}",
            'region': random.choice(self.regions),
            'timestamp': datetime.now() - timedelta(days=random.randint(0, 30))
        }
        
        # Generate numerical features
        for feature, (min_val, max_val) in self.feature_ranges.items():
            record[feature] = round(random.uniform(min_val, max_val), 2)
        
        # Generate categorical features
        record.update({
            'has_allergens': random.choice([True, False]),
            'blood_present': random.choice([True, False]),
            'pain_location': random.choice(self.pain_locations),
            'pain_time': random.choice(['morning', 'afternoon', 'evening', 'night', None]),
            'medication_taken': random.choice([True, False]),
            'medication_type': random.choice(self.medication_types),
            'menstruation': random.choice([True, False]) if random.random() < 0.5 else None,
            'notes': self.generate_synthetic_notes(),
            'flare_occurred': random.choice([True, False])
        })
        
        return record
    
    def generate_synthetic_notes(self):
        """Generate synthetic clinical notes"""
        symptoms = [
            'abdominal pain', 'diarrhea', 'blood in stool',
            'fatigue', 'reduced appetite', 'weight loss',
            'joint pain', 'skin issues', 'fever'
        ]
        
        locations = [
            'lower abdomen', 'upper abdomen', 'left side',
            'right side', 'entire abdomen'
        ]
        
        times = ['morning', 'afternoon', 'evening', 'night']
        
        note_templates = [
            "Patient reports {} in {} during {}.",
            "Experiencing {} and {} in {}.",
            "Primary complaint: {} with associated {}.",
            "{} noted, particularly in {} time.",
            "Patient describes {} with {} symptoms."
        ]
        
        template = random.choice(note_templates)
        symptoms_sample = random.sample(symptoms, 2)
        location = random.choice(locations)
        time = random.choice(times)
        
        return template.format(
            symptoms_sample[0],
            location,
            time if '{}' in template else symptoms_sample[1]
        )

    def generate_and_store_dataset(self, num_samples=5000):
        """Generate and store synthetic dataset"""
        print("Generating synthetic dataset...")
        
        for i in range(num_samples):
            try:
                record = self.generate_synthetic_record()
                self.db_handler.insert_patient_data(record)
                
                if (i + 1) % 100 == 0:
                    print(f"Generated {i + 1} records...")
                    
            except Exception as e:
                print(f"Error storing record {i}: {str(e)}")
                continue
        
        print("\nData generation and storage complete!")
        
        # Calculate and display statistics
        print("\nCalculating dataset statistics...")
        stats = self.get_dataset_statistics()
        
        print("\nDataset Statistics:")
        print("-" * 50)
        print(f"Total records: {stats.get('total_predictions', 0)}")
        print(f"Total flares: {stats.get('total_flares', 0)}")
        print(f"Average flare probability: {stats.get('avg_flare_probability', 0)*100:.2f}%")
        print(f"Unique patients: {stats.get('unique_patients', 0)}")
        
        print("\nClinical Metrics:")
        metrics = self.get_clinical_metrics()
        print(f"Average pain severity: {metrics['avg_pain']:.2f}/10")
        print(f"Average daily bowel movements: {metrics['avg_bowel_frequency']:.1f}")
        print(f"Medication adherence rate: {metrics['medication_adherence']*100:.2f}%")
        
        print("\nCommon Pain Locations:")
        pain_locations = self.get_pain_location_distribution()
        for location, percentage in pain_locations.items():
            if location:
                print(f"{location}: {percentage*100:.1f}%")
        
        # Save statistics to file
        self.save_statistics(stats, metrics, pain_locations)
    
    def get_dataset_statistics(self):
        """Get basic dataset statistics"""
        return self.db_handler.get_flare_statistics(days=30)
    
    def get_clinical_metrics(self):
        """Calculate clinical metrics from the dataset"""
        with self.db_handler.get_connection() as conn:
            query = '''
                SELECT 
                    AVG(pain_severity) as avg_pain,
                    AVG(bowel_frequency) as avg_bowel_frequency,
                    AVG(CASE WHEN medication_taken THEN 1.0 ELSE 0.0 END) as medication_adherence
                FROM patient_data
                WHERE timestamp >= NOW() - INTERVAL '30 days'
            '''
            df = pd.read_sql_query(query, conn)
            return df.iloc[0].to_dict()
    
    def get_pain_location_distribution(self):
        """Calculate distribution of pain locations"""
        with self.db_handler.get_connection() as conn:
            query = '''
                SELECT 
                    pain_location,
                    COUNT(*) / CAST(SUM(COUNT(*)) OVER () AS FLOAT) as percentage
                FROM patient_data
                WHERE timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY pain_location
            '''
            df = pd.read_sql_query(query, conn)
            return df.set_index('pain_location')['percentage'].to_dict()
    
    def save_statistics(self, stats, metrics, pain_locations):
        """Save statistics to a JSON file"""
        statistics = {
            'timestamp': datetime.now().isoformat(),
            'general_stats': stats,
            'clinical_metrics': metrics,
            'pain_locations': pain_locations
        }
        
        output_path = 'data/dataset_statistics.json'
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(statistics, f, indent=4)
        
        print(f"\nStatistics saved to {os.path.abspath(output_path)}") 