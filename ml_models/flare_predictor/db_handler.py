import psycopg2
from psycopg2.extras import RealDictCursor
from config import DB_CONFIG
import logging

logger = logging.getLogger(__name__)

class DatabaseHandler:
    def __init__(self, db_config=None):
        self.db_config = db_config or DB_CONFIG
        self.conn = None
        self.cursor = None

    def connect(self):
        try:
            self.conn = psycopg2.connect(
                dbname=self.db_config['database'],
                user=self.db_config['user'],
                password=self.db_config['password'],
                host=self.db_config['host'],
                port=self.db_config['port']
            )
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            logger.info("Successfully connected to PostgreSQL database")
        except Exception as e:
            logger.error(f"Error connecting to PostgreSQL database: {e}")
            raise

    def disconnect(self):
        try:
            if self.cursor:
                self.cursor.close()
            if self.conn:
                self.conn.close()
                logger.info("Database connection closed")
        except Exception as e:
            logger.error(f"Error closing database connection: {e}")
            raise

    def execute_query(self, query, params=None):
        try:
            if not self.conn or self.conn.closed:
                self.connect()
            self.cursor.execute(query, params)
            self.conn.commit()
            return self.cursor.fetchall()
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            self.conn.rollback()
            raise

    def get_patient_data(self, user_id):
        query = """
                        SELECT 
                calories, protein, carbs, fiber, has_allergens,
                meals_per_day, hydration_level, bowel_frequency,
                bristol_scale, urgency_level, blood_present,
                pain_location, pain_severity, pain_time,
                medication_taken, medication_type, dosage_level,
                sleep_hours, stress_level, menstruation,
                fatigue_level
            FROM patient_records
            WHERE user_id = %s
            ORDER BY timestamp DESC
            LIMIT 1;
        """
        return self.execute_query(query, (user_id,))

    def save_prediction(self, user_id, prediction, features, confidence):
        query = """
            INSERT INTO flare_predictions 
            (user_id, prediction, features, confidence, timestamp)
            VALUES (%s, %s, %s, %s, NOW())
            RETURNING id;
        """
        return self.execute_query(query, (user_id, prediction, features, confidence))

    def get_prediction_history(self, user_id, limit=10):
        query = """
            SELECT prediction, confidence, timestamp
            FROM flare_predictions
            WHERE user_id = %s
            ORDER BY timestamp DESC
            LIMIT %s;
        """
        return self.execute_query(query, (user_id, limit))

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect() 