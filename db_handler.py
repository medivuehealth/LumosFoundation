"""Database handler for IBD flare predictor"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging
from typing import Dict, Any, List
import pandas as pd
import json
from config import DB_URL

logger = logging.getLogger(__name__)

class DatabaseHandler:
    """Handle database operations for IBD flare predictor"""
    
    def __init__(self, db_config: Dict[str, str]):
        """Initialize database handler with configuration"""
        self.connection_string = DB_URL
        self.create_tables()
    
    def get_connection(self):
        """Get a database connection"""
        return psycopg2.connect(self.connection_string)
    
    def create_tables(self):
        """Create necessary tables if they don't exist"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                # Create patient data table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS patient_data (
                        id SERIAL PRIMARY KEY,
                        patient_id VARCHAR(50) NOT NULL,
                        age_range VARCHAR(20),
                        region VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Create clinical measurements table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS clinical_measurements (
                        id SERIAL PRIMARY KEY,
                        patient_id VARCHAR(50) NOT NULL,
                        measurement_type VARCHAR(50),
                        value FLOAT,
                        unit VARCHAR(20),
                        measured_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (patient_id) REFERENCES patient_data(patient_id)
                    )
                """)
                
                # Create symptoms table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS symptoms (
                        id SERIAL PRIMARY KEY,
                        patient_id VARCHAR(50) NOT NULL,
                        symptom_type VARCHAR(50),
                        severity INTEGER,
                        location VARCHAR(50),
                        recorded_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (patient_id) REFERENCES patient_data(patient_id)
                    )
                """)
                
                # Create treatments table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS treatments (
                        id SERIAL PRIMARY KEY,
                        patient_id VARCHAR(50) NOT NULL,
                        medication_type VARCHAR(50),
                        dosage FLOAT,
                        frequency VARCHAR(20),
                        started_at TIMESTAMP,
                        ended_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (patient_id) REFERENCES patient_data(patient_id)
                    )
                """)
                
                # Create flare predictions table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS flare_predictions (
                        id SERIAL PRIMARY KEY,
                        patient_id VARCHAR(50) NOT NULL,
                        prediction_probability FLOAT,
                        features JSONB,
                        predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (patient_id) REFERENCES patient_data(patient_id)
                    )
                """)
                
                conn.commit()
    
    def insert_patient_data(self, data: Dict[str, Any]):
        """Insert patient data into database"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                # Insert patient data
                cur.execute("""
                    INSERT INTO patient_data (patient_id, age_range, region)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (patient_id) DO NOTHING
                    RETURNING patient_id
                """, (data['patient_id'], data['age_range'], data['region']))
                
                # Insert clinical measurements
                if 'measurements' in data:
                    for measurement in data['measurements']:
                        cur.execute("""
                            INSERT INTO clinical_measurements 
                            (patient_id, measurement_type, value, unit, measured_at)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (
                            data['patient_id'],
                            measurement['type'],
                            measurement['value'],
                            measurement['unit'],
                            measurement['measured_at']
                        ))
                
                # Insert symptoms
                if 'symptoms' in data:
                    for symptom in data['symptoms']:
                        cur.execute("""
                            INSERT INTO symptoms 
                            (patient_id, symptom_type, severity, location, recorded_at)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (
                            data['patient_id'],
                            symptom['type'],
                            symptom['severity'],
                            symptom.get('location'),
                            symptom['recorded_at']
                        ))
                
                # Insert treatments
                if 'treatments' in data:
                    for treatment in data['treatments']:
                        cur.execute("""
                            INSERT INTO treatments 
                            (patient_id, medication_type, dosage, frequency, started_at, ended_at)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (
                            data['patient_id'],
                            treatment['medication_type'],
                            treatment['dosage'],
                            treatment['frequency'],
                            treatment['started_at'],
                            treatment.get('ended_at')
                        ))
                
                # Insert flare prediction
                if 'prediction' in data:
                    cur.execute("""
                        INSERT INTO flare_predictions 
                        (patient_id, prediction_probability, features)
                        VALUES (%s, %s, %s)
                    """, (
                        data['patient_id'],
                        data['prediction']['probability'],
                        json.dumps(data['prediction']['features'])
                    ))
                
                conn.commit()
    
    def get_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """Get all data for a patient"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                # Get patient info
                cur.execute("""
                    SELECT * FROM patient_data WHERE patient_id = %s
                """, (patient_id,))
                patient_info = cur.fetchone()
                
                if not patient_info:
                    return None
                
                # Get measurements
                cur.execute("""
                    SELECT * FROM clinical_measurements 
                    WHERE patient_id = %s 
                    ORDER BY measured_at DESC
                """, (patient_id,))
                measurements = cur.fetchall()
                
                # Get symptoms
                cur.execute("""
                    SELECT * FROM symptoms 
                    WHERE patient_id = %s 
                    ORDER BY recorded_at DESC
                """, (patient_id,))
                symptoms = cur.fetchall()
                
                # Get treatments
                cur.execute("""
                    SELECT * FROM treatments 
                    WHERE patient_id = %s 
                    ORDER BY started_at DESC
                """, (patient_id,))
                treatments = cur.fetchall()
                
                # Get predictions
                cur.execute("""
                    SELECT * FROM flare_predictions 
                    WHERE patient_id = %s 
                    ORDER BY predicted_at DESC
                """, (patient_id,))
                predictions = cur.fetchall()
                
                return {
                    'patient_info': patient_info,
                    'measurements': measurements,
                    'symptoms': symptoms,
                    'treatments': treatments,
                    'predictions': predictions
                }
    
    def get_dataset_statistics(self) -> Dict[str, Any]:
        """Get statistics about the dataset"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                # Get total predictions
                cur.execute("SELECT COUNT(*) FROM flare_predictions")
                total_predictions = cur.fetchone()[0]
                
                # Get total flares (predictions > 0.5)
                cur.execute("""
                    SELECT COUNT(*) FROM flare_predictions 
                    WHERE prediction_probability > 0.5
                """)
                total_flares = cur.fetchone()[0]
                
                # Get average flare probability
                cur.execute("""
                    SELECT AVG(prediction_probability) FROM flare_predictions
                """)
                avg_probability = cur.fetchone()[0] or 0
                
                # Get unique patients
                cur.execute("SELECT COUNT(DISTINCT patient_id) FROM patient_data")
                unique_patients = cur.fetchone()[0]
                
                # Get average pain severity
                cur.execute("""
                    SELECT AVG(severity) FROM symptoms 
                    WHERE symptom_type = 'pain'
                """)
                avg_pain = cur.fetchone()[0] or 0
                
                # Get average bowel frequency
                cur.execute("""
                    SELECT AVG(value) FROM clinical_measurements 
                    WHERE measurement_type = 'bowel_frequency'
                """)
                avg_bowel = cur.fetchone()[0] or 0
                
                # Get medication usage rate
                cur.execute("""
                    SELECT COUNT(DISTINCT patient_id) FROM treatments
                """)
                patients_on_meds = cur.fetchone()[0]
                medication_rate = patients_on_meds / unique_patients if unique_patients > 0 else 0
                
                return {
                    'total_predictions': total_predictions,
                    'total_flares': total_flares,
                    'avg_flare_probability': avg_probability,
                    'unique_patients': unique_patients,
                    'avg_pain_severity': avg_pain,
                    'avg_bowel_frequency': avg_bowel,
                    'medication_usage': medication_rate
                } 