from model import FlarePredictorModel
from generate_data import generate_synthetic_data
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import json
import os
import joblib

# PostgreSQL configuration
DB_CONFIG = {
    'dbname': 'ibd_flarepredictor',
    'user': 'postgres',
    'password': 'postgres',
    'host': 'localhost',
    'port': 5432
}

def train_and_evaluate():
    # Create model directory if it doesn't exist
    os.makedirs('trained_models', exist_ok=True)
    
    # Generate synthetic data
    print("Generating synthetic data...")
    X, y = generate_synthetic_data(2000)
    
    # Initialize model with database connection
    print("Training model...")
    model = FlarePredictorModel(db_path=DB_CONFIG)
    
    # Create and fit preprocessor first
    print("Creating and fitting preprocessor...")
    X_processed = model.preprocess_features(X)  # This will create and fit the preprocessor
    
    # Create and train the model
    print("Training model...")
    model.model = model.create_model()
    model.model.fit(X_processed, y)
    
    # Save both model and preprocessor
    print("Saving model and preprocessor...")
    model_path = 'trained_models/flare_predictor.joblib'
    joblib.dump((model.model, model.preprocessor), model_path)
    
    # Verify the save
    print("Verifying saved model...")
    loaded = joblib.load(model_path)
    if not (isinstance(loaded, tuple) and len(loaded) == 2):
        raise ValueError("Failed to save model and preprocessor correctly")
    
    print("Model and preprocessor saved successfully")

if __name__ == "__main__":
    train_and_evaluate()
    
    # After successful test, copy to final location
    import shutil
    import os
    
    FINAL_DB_PATH = "C:/Aryan/ml/database/flarepredictor.db"
    os.makedirs(os.path.dirname(FINAL_DB_PATH), exist_ok=True)
    
    try:
        shutil.copy2('trained_models/flare_predictor.joblib', FINAL_DB_PATH)
        print(f"\nDatabase successfully copied to {FINAL_DB_PATH}")
    except Exception as e:
        print(f"\nWarning: Could not copy database to final location: {e}")
        print(f"The model and database are still available at trained_models/flare_predictor.joblib") 