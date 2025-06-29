"""Script to train the IBD flare prediction model"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import logging
import os
import sys
from datetime import datetime
from db_handler import DatabaseHandler
from config import DB_CONFIG

# Set up logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/model_training.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class FlarePredictor:
    def __init__(self):
        self.db = DatabaseHandler(DB_CONFIG)
        self.model = None
        self.scaler = None
        self.model_version = '1.0.0'  # Added model version
        
        # Define features to use for prediction
        self.numerical_features = [
            'calories', 'protein', 'carbs', 'fiber',
            'meals_per_day', 'hydration_level', 'bowel_frequency',
            'bristol_scale', 'urgency_level', 'pain_severity',
            'dosage_level', 'sleep_hours', 'stress_level',
            'fatigue_level'
        ]
        
        self.categorical_features = [
            'pain_location', 'pain_time', 'blood_present',
            'medication_taken', 'medication_type', 'menstruation',
            'has_allergens', 'region'
        ]
        
    def load_data(self):
        """Load data from database"""
        try:
            with self.db.get_connection() as conn:
                # Load all patient data
                query = """
                    SELECT 
                        pd.*,
                        ds.source_type
                    FROM patient_data pd
                    JOIN data_sources ds ON pd.data_source_id = ds.id
                """
                df = pd.read_sql(query, conn)
                
                logger.info(f"Loaded {len(df)} records from database")
                logger.info(f"Data distribution by source:")
                for source_type, count in df['source_type'].value_counts().items():
                    logger.info(f"- {source_type}: {count} records")
                
                return df
                
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
            
    def preprocess_data(self, df):
        """Preprocess the data for training"""
        try:
            # Create feature matrix X and target vector y
            X = df[self.numerical_features + self.categorical_features].copy()
            y = df['flare_occurred']
            
            # Handle categorical variables
            X = pd.get_dummies(X, columns=self.categorical_features, drop_first=True)
            
            # Scale numerical features
            self.scaler = StandardScaler()
            X[self.numerical_features] = self.scaler.fit_transform(X[self.numerical_features])
            
            logger.info(f"Preprocessed data shape: {X.shape}")
            logger.info(f"Number of features: {X.shape[1]}")
            
            return X, y
            
        except Exception as e:
            logger.error(f"Error preprocessing data: {str(e)}")
            raise
            
    def train_model(self, X, y):
        """Train the model"""
        try:
            # Split data into training and testing sets
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            logger.info("Training Random Forest Classifier...")
            
            # Initialize and train the model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test)
            y_pred_proba = self.model.predict_proba(X_test)[:, 1]
            
            # Calculate metrics
            logger.info("\nModel Performance:")
            logger.info("\nClassification Report:")
            logger.info("\n" + classification_report(y_test, y_pred))
            
            logger.info("\nConfusion Matrix:")
            logger.info("\n" + str(confusion_matrix(y_test, y_pred)))
            
            auc_roc = roc_auc_score(y_test, y_pred_proba)
            logger.info(f"\nROC-AUC Score: {auc_roc:.4f}")
            
            # Get feature importance
            feature_importance = pd.DataFrame({
                'feature': X.columns,
                'importance': self.model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            logger.info("\nTop 10 Most Important Features:")
            logger.info("\n" + str(feature_importance.head(10)))
            
            # Save model performance metrics to database
            self.save_metrics(y_test, y_pred, y_pred_proba, feature_importance)
            
            return {
                'X_train': X_train,
                'X_test': X_test,
                'y_train': y_train,
                'y_test': y_test,
                'y_pred': y_pred,
                'y_pred_proba': y_pred_proba,
                'feature_importance': feature_importance
            }
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise
            
    def save_metrics(self, y_test, y_pred, y_pred_proba, feature_importance):
        """Save model metrics to database"""
        try:
            # Store numeric metrics
            metrics = {
                'accuracy': float((y_test == y_pred).mean()),
                'roc_auc': float(roc_auc_score(y_test, y_pred_proba)),
                'true_positive_rate': float((y_pred & y_test).sum() / y_test.sum()),
                'false_positive_rate': float((y_pred & ~y_test).sum() / (~y_test).sum()),
                'precision': float((y_pred & y_test).sum() / y_pred.sum()),
                'recall': float((y_pred & y_test).sum() / y_test.sum())
            }
            
            # Save each metric separately
            for metric_name, metric_value in metrics.items():
                self.db.insert_model_metrics({
                    'metric_name': metric_name,
                    'metric_value': metric_value
                }, model_version=self.model_version)
            
            # Save model artifacts to files
            os.makedirs('model_artifacts', exist_ok=True)
            
            # Save feature importance
            feature_importance.to_csv(f'model_artifacts/feature_importance_{self.model_version}.csv')
            
            # Save confusion matrix and classification report
            with open(f'model_artifacts/model_report_{self.model_version}.txt', 'w') as f:
                f.write("Classification Report:\n")
                f.write(classification_report(y_test, y_pred))
                f.write("\nConfusion Matrix:\n")
                f.write(str(confusion_matrix(y_test, y_pred)))
            
            logger.info("Saved model metrics to database and artifacts to files")
            
        except Exception as e:
            logger.error(f"Error saving metrics: {str(e)}")
            raise
            
    def save_model(self):
        """Save the trained model and scaler"""
        try:
            # Create models directory if it doesn't exist
            os.makedirs('models', exist_ok=True)
            
            # Save model and scaler
            model_path = f'models/flare_predictor_{self.model_version}.joblib'
            scaler_path = f'models/scaler_{self.model_version}.joblib'
            
            joblib.dump(self.model, model_path)
            joblib.dump(self.scaler, scaler_path)
            
            logger.info(f"Saved model to {model_path}")
            logger.info(f"Saved scaler to {scaler_path}")
            
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
            raise

def main():
    try:
        logger.info("Starting model training process...")
        
        # Initialize predictor
        predictor = FlarePredictor()
        
        # Load data
        df = predictor.load_data()
        
        # Preprocess data
        X, y = predictor.preprocess_data(df)
        
        # Train model
        results = predictor.train_model(X, y)
        
        # Save model and scaler
        predictor.save_model()
        
        logger.info("Model training process completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in model training process: {str(e)}")
        raise

if __name__ == "__main__":
    main() 