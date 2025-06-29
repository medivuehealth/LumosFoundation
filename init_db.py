import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'ibd_flarepredictor'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD'),
}

def create_database():
    """Create the database if it doesn't exist"""
    # Connect to PostgreSQL server
    conn = psycopg2.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database='postgres'  # Connect to default database first
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    cursor = conn.cursor()
    
    try:
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (DB_CONFIG['database'],))
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Creating database {DB_CONFIG['database']}...")
            cursor.execute(f"CREATE DATABASE {DB_CONFIG['database']}")
            print("Database created successfully!")
        else:
            print(f"Database {DB_CONFIG['database']} already exists.")
    
    finally:
        cursor.close()
        conn.close()

def create_tables():
    """Create necessary tables in the database"""
    # Connect to the target database
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # Create patient_data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS patient_data (
                id SERIAL PRIMARY KEY,
                anonymous_id VARCHAR(64),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                age_range VARCHAR(10),
                region VARCHAR(20),
                calories FLOAT,
                protein FLOAT,
                carbs FLOAT,
                fiber FLOAT,
                has_allergens BOOLEAN,
                meals_per_day INTEGER,
                hydration_level INTEGER,
                bowel_frequency INTEGER,
                bristol_scale INTEGER,
                urgency_level INTEGER,
                blood_present BOOLEAN,
                pain_location VARCHAR(50),
                pain_severity INTEGER,
                pain_time VARCHAR(20),
                medication_taken BOOLEAN,
                medication_type VARCHAR(50),
                dosage_level FLOAT,
                sleep_hours FLOAT,
                stress_level INTEGER,
                menstruation BOOLEAN,
                fatigue_level INTEGER,
                de_identified_notes TEXT,
                flare_occurred BOOLEAN
            )
        ''')
        
        # Create predictions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id SERIAL PRIMARY KEY,
                patient_data_id INTEGER REFERENCES patient_data(id),
                anonymous_id VARCHAR(64),
                prediction BOOLEAN,
                probability FLOAT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create model_metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS model_metrics (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metric_name VARCHAR(50),
                metric_value FLOAT,
                model_version VARCHAR(20)
            )
        ''')
        
        # Commit the changes
        conn.commit()
        print("Tables created successfully!")
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("Initializing database...")
    create_database()
    create_tables()
    print("Database initialization completed!") 