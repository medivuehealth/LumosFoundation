"""Script to perform hyperparameter tuning for the flare predictor model"""

import pandas as pd
import numpy as np
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import make_scorer, roc_auc_score, precision_score, recall_score
from sklearn.preprocessing import LabelEncoder
import logging
import os
import sys
from db_handler import DatabaseHandler
from config import DB_CONFIG

# Set up logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/hyperparameter_tuning.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def preprocess_data(df):
    """Preprocess the data for model training"""
    # Drop non-numeric columns that aren't useful for prediction
    drop_columns = ['id', 'patient_id', 'data_source_id', 'created_at', 'updated_at', 'source_type']
    df = df.drop([col for col in drop_columns if col in df.columns], axis=1)
    
    # Handle categorical variables
    categorical_columns = df.select_dtypes(include=['object']).columns
    label_encoders = {}
    
    for column in categorical_columns:
        label_encoders[column] = LabelEncoder()
        df[column] = label_encoders[column].fit_transform(df[column].astype(str))
    
    # Convert boolean columns to int
    bool_columns = df.select_dtypes(include=['bool']).columns
    for column in bool_columns:
        df[column] = df[column].astype(int)
    
    # Handle any remaining non-numeric columns
    for column in df.columns:
        if df[column].dtype not in ['int64', 'float64']:
            df[column] = pd.to_numeric(df[column], errors='coerce')
    
    # Fill missing values
    df = df.fillna(df.mean())
    
    return df, label_encoders

def load_data():
    """Load and preprocess data"""
    db = DatabaseHandler(DB_CONFIG)
    with db.get_connection() as conn:
        query = """
            SELECT 
                pd.*,
                ds.source_type
            FROM patient_data pd
            JOIN data_sources ds ON pd.data_source_id = ds.id
        """
        df = pd.read_sql(query, conn)
    return df

def perform_grid_search(X, y):
    """Perform grid search for hyperparameter tuning"""
    # Define parameter grid
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [5, 10, 15, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
        'class_weight': ['balanced', 'balanced_subsample'],
        'max_features': ['sqrt', 'log2']
    }
    
    # Define scoring metrics
    scoring = {
        'auc': 'roc_auc',
        'precision': 'precision_weighted',
        'recall': 'recall_weighted',
        'f1': 'f1_weighted'
    }
    
    # Initialize model
    rf = RandomForestClassifier(random_state=42)
    
    # Perform grid search
    grid_search = GridSearchCV(
        estimator=rf,
        param_grid=param_grid,
        scoring=scoring,
        refit='auc',
        cv=5,
        n_jobs=-1,
        verbose=2
    )
    
    # Fit grid search
    grid_search.fit(X, y)
    
    return grid_search

def save_results(grid_search):
    """Save grid search results"""
    # Get all results
    results = pd.DataFrame(grid_search.cv_results_)
    
    # Sort by mean test AUC score
    results = results.sort_values('mean_test_auc', ascending=False)
    
    # Save to CSV
    results.to_csv('model_artifacts/hyperparameter_tuning_results.csv', index=False)
    
    # Log best parameters and scores
    logger.info("\nBest parameters:")
    logger.info(grid_search.best_params_)
    
    logger.info("\nBest scores:")
    logger.info(f"AUC: {grid_search.cv_results_['mean_test_auc'][grid_search.best_index_]:.4f}")
    logger.info(f"Precision: {grid_search.cv_results_['mean_test_precision'][grid_search.best_index_]:.4f}")
    logger.info(f"Recall: {grid_search.cv_results_['mean_test_recall'][grid_search.best_index_]:.4f}")
    logger.info(f"F1: {grid_search.cv_results_['mean_test_f1'][grid_search.best_index_]:.4f}")

def main():
    try:
        logger.info("Starting hyperparameter tuning...")
        
        # Load data
        df = load_data()
        
        # Preprocess data
        df_processed, label_encoders = preprocess_data(df)
        
        # Prepare features and target
        X = df_processed.drop(['flare_occurred'], axis=1)
        y = df_processed['flare_occurred']
        
        # Perform grid search
        grid_search = perform_grid_search(X, y)
        
        # Save results
        save_results(grid_search)
        
        logger.info("Hyperparameter tuning completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in hyperparameter tuning: {str(e)}")
        raise

if __name__ == "__main__":
    main() 