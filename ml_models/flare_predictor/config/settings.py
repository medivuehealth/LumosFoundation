"""Configuration settings for the IBD Flare Predictor system"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "trained_models"
CACHE_DIR = BASE_DIR / "cache"

# Create directories if they don't exist
for directory in [DATA_DIR, MODEL_DIR, CACHE_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# API Keys and External Services
API_KEYS = {
    'pubmed': os.getenv('PUBMED_API_KEY'),
    'clinicaltrials': os.getenv('CLINICALTRIALS_API_KEY'),
    'healthdata': os.getenv('HEALTHDATA_API_KEY'),
    'umls': os.getenv('UMLS_API_KEY'),  # For medical terminology
    'openai': os.getenv('OPENAI_API_KEY'),  # For advanced text processing
}

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('FLARE_DB_HOST', 'localhost'),
    'port': int(os.getenv('FLARE_DB_PORT', 5432)),
    'database': os.getenv('FLARE_DB_NAME', 'ibd_flarepredictor'),
    'user': os.getenv('FLARE_DB_USER', 'postgres'),
    'password': os.getenv('FLARE_DB_PASSWORD'),
    'pool_size': int(os.getenv('DB_POOL_SIZE', 5)),
    'max_overflow': int(os.getenv('DB_MAX_OVERFLOW', 10)),
}

# External APIs Configuration
API_CONFIG = {
    'pubmed': {
        'base_url': 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
        'rate_limit': 3,  # requests per second
        'batch_size': 100,
        'retries': 3,
    },
    'clinicaltrials': {
        'base_url': 'https://clinicaltrials.gov/api',
        'rate_limit': 2,
        'batch_size': 50,
        'retries': 3,
    },
    'healthdata': {
        'base_url': 'https://healthdata.gov/api',
        'rate_limit': 5,
        'cache_ttl': 3600,  # 1 hour
    }
}

# Data Collection Settings
DATA_CONFIG = {
    'synthetic': {
        'min_age': 18,
        'max_age': 80,
        'time_series_length': 365,  # days
        'measurement_frequency': 30,  # days
    },
    'external': {
        'max_articles': 1000,
        'max_trials': 500,
        'cache_duration': 86400,  # 24 hours
    },
    'processing': {
        'batch_size': 100,
        'n_workers': os.cpu_count() or 1,
        'chunk_size': 1000,
    }
}

# NLP Processing Configuration
NLP_CONFIG = {
    'spacy_model': 'en_core_web_sm',
    'max_text_length': 1000000,
    'context_window': 50,  # words
    'min_confidence': 0.7,
    'custom_patterns_file': DATA_DIR / 'nlp_patterns.json',
    'cache_embeddings': True,
}

# Anonymization Settings
ANONYMIZATION_CONFIG = {
    'hash_algorithm': 'sha256',
    'salt_length': 32,
    'id_pattern': r'\b\d{6,}\b',
    'name_pattern': r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b',
    'location_granularity': 'state',
    'age_ranges': [(0, 17), (18, 30), (31, 50), (51, 70), (71, 200)],
}

# Validation Rules
VALIDATION_RULES = {
    'measurements': {
        'crp': {'min': 0, 'max': 300, 'unit': 'mg/L'},
        'calprotectin': {'min': 0, 'max': 3000, 'unit': 'μg/g'},
        'hemoglobin': {'min': 5, 'max': 20, 'unit': 'g/dL'},
        'temperature': {'min': 35, 'max': 42, 'unit': '°C'},
        'heart_rate': {'min': 40, 'max': 200, 'unit': 'bpm'},
    },
    'symptoms': {
        'severity_levels': ['mild', 'moderate', 'severe'],
        'duration_max': 90,  # days
        'required_fields': ['type', 'severity', 'duration'],
    },
    'treatments': {
        'required_fields': ['medication', 'dosage', 'frequency'],
        'frequency_options': ['daily', 'weekly', 'biweekly', 'monthly'],
    }
}

# Logging Configuration
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level': 'INFO',
            'formatter': 'standard',
            'class': 'logging.StreamHandler',
        },
        'file': {
            'level': 'INFO',
            'formatter': 'standard',
            'class': 'logging.FileHandler',
            'filename': 'ibd_predictor.log',
            'mode': 'a',
        },
    },
    'loggers': {
        '': {  # root logger
            'handlers': ['default', 'file'],
            'level': 'INFO',
            'propagate': True
        }
    }
} 