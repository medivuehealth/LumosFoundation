"""Configuration settings for the IBD flare predictor"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
DB_CONFIG = {
    'user': os.getenv('FLARE_DB_USER', 'postgres'),
    'password': os.getenv('FLARE_DB_PASSWORD', 'postgres'),
    'host': os.getenv('FLARE_DB_HOST', 'localhost'),
    'port': os.getenv('FLARE_DB_PORT', '5432'),
    'database': os.getenv('FLARE_DB_NAME', 'ibd_flarepredictor')
}

# Model configuration
MODEL_VERSION = '1.0.0'
MODEL_PATH = os.path.join('models', f'flare_predictor_{MODEL_VERSION}.joblib')
SCALER_PATH = os.path.join('models', f'scaler_{MODEL_VERSION}.joblib')

# Feature configuration
FEATURE_COLUMNS = [
    'calories', 'protein', 'carbs', 'fiber', 'has_allergens',
    'meals_per_day', 'hydration_level', 'bowel_frequency',
    'bristol_scale', 'urgency_level', 'blood_present',
    'pain_severity', 'medication_taken', 'dosage_level',
    'sleep_hours', 'stress_level', 'fatigue_level'
]

CATEGORICAL_FEATURES = [
    'has_allergens', 'blood_present', 'medication_taken',
    'pain_location', 'pain_time', 'medication_type'
]

NUMERICAL_FEATURES = [
    'calories', 'protein', 'carbs', 'fiber', 'meals_per_day',
    'hydration_level', 'bowel_frequency', 'bristol_scale',
    'urgency_level', 'pain_severity', 'dosage_level',
    'sleep_hours', 'stress_level', 'fatigue_level'
]

# API configuration
API_HOST = os.getenv('API_HOST', 'localhost')
API_PORT = int(os.getenv('API_PORT', '5000'))
API_DEBUG = os.getenv('API_DEBUG', 'True').lower() == 'true'

# Model Configuration
MODEL_CONFIG = {
    'model_path': MODEL_PATH,
    'version': MODEL_VERSION
}

# Data Collection Configuration
DATA_CONFIG = {
    'batch_size': 100,
    'validation_split': 0.2,
    'random_state': 42,
    'max_retries': 3,
    'timeout': 30
}

# Logging Configuration
LOG_CONFIG = {
    'level': os.getenv('LOG_LEVEL', 'INFO'),
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': os.path.join('logs', 'flare_predictor.log')
} 