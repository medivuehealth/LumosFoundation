"""Database configuration for the flare predictor model"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# PostgreSQL Database Configuration
DB_CONFIG = {
    'dbname': os.getenv('FLARE_DB_NAME', 'ibd_flarepredictor'),
    'user': os.getenv('FLARE_DB_USER', 'postgres'),
    'password': os.getenv('FLARE_DB_PASSWORD', 'postgres'),
    'host': os.getenv('FLARE_DB_HOST', 'localhost'),
    'port': os.getenv('FLARE_DB_PORT', '5432')
}

# Connection string format
DB_URL = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}"

# Model Configuration
MODEL_CONFIG = {
    'model_path': os.path.join('trained_models', 'flare_predictor.joblib'),
    'version': '1.0.0'
}

# Data Collection Configuration
DATA_CONFIG = {
    'batch_size': 100,
    'validation_split': 0.2,
    'random_state': 42
} 