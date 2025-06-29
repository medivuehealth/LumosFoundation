"""Script for detailed feature importance analysis of the flare predictor model"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.inspection import permutation_importance
from sklearn.preprocessing import LabelEncoder
import joblib
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
        logging.FileHandler('logs/feature_analysis.log'),
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

class FeatureAnalyzer:
    def __init__(self):
        self.db = DatabaseHandler(DB_CONFIG)
        self.model = joblib.load('models/flare_predictor_1.0.0.joblib')
        
    def load_data(self):
        """Load data from database"""
        with self.db.get_connection() as conn:
            query = """
                SELECT 
                    pd.*,
                    ds.source_type
                FROM patient_data pd
                JOIN data_sources ds ON pd.data_source_id = ds.id
            """
            df = pd.read_sql(query, conn)
            return df
            
    def analyze_feature_importance(self, X, y):
        """Analyze feature importance using multiple methods"""
        # 1. Random Forest built-in feature importance
        rf_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        # 2. Permutation importance
        perm_importance = permutation_importance(
            self.model, X, y,
            n_repeats=10,
            random_state=42,
            n_jobs=-1
        )
        
        perm_importance_df = pd.DataFrame({
            'feature': X.columns,
            'importance_mean': perm_importance.importances_mean,
            'importance_std': perm_importance.importances_std
        }).sort_values('importance_mean', ascending=False)
        
        return rf_importance, perm_importance_df
        
    def analyze_feature_interactions(self, X, y):
        """Analyze interactions between top features"""
        top_features = self.model.feature_importances_.argsort()[-5:][::-1]
        feature_names = X.columns[top_features]
        
        interactions = []
        for i in range(len(top_features)):
            for j in range(i + 1, len(top_features)):
                feat1, feat2 = feature_names[i], feature_names[j]
                correlation = X[feat1].corr(X[feat2])
                interactions.append({
                    'feature1': feat1,
                    'feature2': feat2,
                    'correlation': correlation
                })
        
        return pd.DataFrame(interactions)
        
    def plot_feature_importance(self, rf_importance, perm_importance):
        """Create visualizations for feature importance"""
        # Create directory for plots
        os.makedirs('analysis_results', exist_ok=True)
        
        # 1. Random Forest Feature Importance Plot
        plt.figure(figsize=(12, 6))
        sns.barplot(
            data=rf_importance.head(15),
            x='importance',
            y='feature'
        )
        plt.title('Top 15 Features by Random Forest Importance')
        plt.tight_layout()
        plt.savefig('analysis_results/rf_feature_importance.png')
        plt.close()
        
        # 2. Permutation Importance Plot
        plt.figure(figsize=(12, 6))
        sns.barplot(
            data=perm_importance.head(15),
            x='importance_mean',
            y='feature',
            xerr=perm_importance['importance_std']
        )
        plt.title('Top 15 Features by Permutation Importance')
        plt.tight_layout()
        plt.savefig('analysis_results/permutation_importance.png')
        plt.close()
        
    def analyze_feature_thresholds(self, X, y):
        """Analyze critical thresholds for top features"""
        top_features = self.model.feature_importances_.argsort()[-5:][::-1]
        feature_names = X.columns[top_features]
        
        thresholds = []
        for feature in feature_names:
            if X[feature].dtype in ['int64', 'float64']:
                percentiles = np.percentile(X[feature], [25, 50, 75])
                mean_flare_rates = []
                
                for threshold in percentiles:
                    flare_rate = y[X[feature] > threshold].mean()
                    mean_flare_rates.append(flare_rate)
                
                thresholds.append({
                    'feature': feature,
                    'p25_threshold': percentiles[0],
                    'p50_threshold': percentiles[1],
                    'p75_threshold': percentiles[2],
                    'p25_flare_rate': mean_flare_rates[0],
                    'p50_flare_rate': mean_flare_rates[1],
                    'p75_flare_rate': mean_flare_rates[2]
                })
        
        return pd.DataFrame(thresholds)

def main():
    try:
        logger.info("Starting feature analysis...")
        
        # Initialize analyzer
        analyzer = FeatureAnalyzer()
        
        # Load data
        df = analyzer.load_data()
        
        # Preprocess data
        df_processed, label_encoders = preprocess_data(df)
        
        # Prepare features and target
        X = df_processed.drop(['flare_occurred'], axis=1)
        y = df_processed['flare_occurred']
        
        # Analyze feature importance
        rf_importance, perm_importance = analyzer.analyze_feature_importance(X, y)
        
        # Plot feature importance
        analyzer.plot_feature_importance(rf_importance, perm_importance)
        
        # Analyze feature interactions
        interactions = analyzer.analyze_feature_interactions(X, y)
        
        # Analyze feature thresholds
        thresholds = analyzer.analyze_feature_thresholds(X, y)
        
        # Save results
        rf_importance.to_csv('analysis_results/rf_feature_importance.csv', index=False)
        perm_importance.to_csv('analysis_results/permutation_importance.csv', index=False)
        interactions.to_csv('analysis_results/feature_interactions.csv', index=False)
        thresholds.to_csv('analysis_results/feature_thresholds.csv', index=False)
        
        logger.info("Feature analysis completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in feature analysis: {str(e)}")
        raise

if __name__ == "__main__":
    main() 