"""Script to analyze feature importance and relationships in the IBD flare predictor"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
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

class FeatureAnalyzer:
    def __init__(self):
        self.db = DatabaseHandler(DB_CONFIG)
        self.model = joblib.load('models/flare_predictor_1.0.0.joblib')
        self.scaler = joblib.load('models/scaler_1.0.0.joblib')
        
        # Load feature importance
        self.feature_importance = pd.read_csv('model_artifacts/feature_importance_1.0.0.csv')
        
    def load_data(self):
        """Load data from database"""
        try:
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
                
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
            
    def analyze_feature_importance(self):
        """Analyze and visualize feature importance"""
        try:
            # Create feature importance plot
            plt.figure(figsize=(12, 8))
            sns.barplot(
                data=self.feature_importance.head(15),
                x='importance',
                y='feature'
            )
            plt.title('Top 15 Most Important Features for IBD Flare Prediction')
            plt.xlabel('Feature Importance')
            plt.ylabel('Feature')
            plt.tight_layout()
            plt.savefig('model_artifacts/feature_importance.png')
            plt.close()
            
            # Log feature importance analysis
            logger.info("\nFeature Importance Analysis:")
            logger.info("\nTop 15 Features:")
            for _, row in self.feature_importance.head(15).iterrows():
                logger.info(f"- {row['feature']}: {row['importance']:.4f}")
                
        except Exception as e:
            logger.error(f"Error analyzing feature importance: {str(e)}")
            raise
            
    def analyze_feature_relationships(self, df):
        """Analyze relationships between important features and flare occurrence"""
        try:
            top_numerical_features = [
                'pain_severity', 'bowel_frequency', 'urgency_level',
                'stress_level', 'fatigue_level'
            ]
            
            # Create correlation matrix
            correlation_matrix = df[top_numerical_features + ['flare_occurred']].corr()
            
            # Plot correlation heatmap
            plt.figure(figsize=(10, 8))
            sns.heatmap(
                correlation_matrix,
                annot=True,
                cmap='coolwarm',
                center=0,
                fmt='.2f'
            )
            plt.title('Correlation Matrix of Top Features')
            plt.tight_layout()
            plt.savefig('model_artifacts/feature_correlations.png')
            plt.close()
            
            # Analyze feature distributions by flare status
            for feature in top_numerical_features:
                plt.figure(figsize=(10, 6))
                sns.boxplot(x='flare_occurred', y=feature, data=df)
                plt.title(f'{feature} Distribution by Flare Status')
                plt.tight_layout()
                plt.savefig(f'model_artifacts/{feature}_distribution.png')
                plt.close()
                
                # Calculate statistics
                stats = df.groupby('flare_occurred')[feature].agg(['mean', 'std', 'min', 'max'])
                logger.info(f"\nStatistics for {feature}:")
                logger.info(f"No Flare: mean={stats.loc[False, 'mean']:.2f}, std={stats.loc[False, 'std']:.2f}")
                logger.info(f"Flare: mean={stats.loc[True, 'mean']:.2f}, std={stats.loc[True, 'std']:.2f}")
                
        except Exception as e:
            logger.error(f"Error analyzing feature relationships: {str(e)}")
            raise
            
    def analyze_categorical_features(self, df):
        """Analyze categorical feature distributions and their impact"""
        try:
            categorical_features = [
                'pain_location', 'pain_time', 'medication_type',
                'region', 'blood_present', 'medication_taken'
            ]
            
            for feature in categorical_features:
                # Calculate flare rates by category
                flare_rates = df.groupby(feature)['flare_occurred'].agg(['count', 'mean'])
                flare_rates = flare_rates.sort_values('mean', ascending=False)
                
                # Plot flare rates
                plt.figure(figsize=(12, 6))
                sns.barplot(
                    data=flare_rates.reset_index(),
                    x=feature,
                    y='mean'
                )
                plt.title(f'Flare Rate by {feature}')
                plt.xticks(rotation=45)
                plt.ylabel('Flare Rate')
                plt.tight_layout()
                plt.savefig(f'model_artifacts/{feature}_flare_rates.png')
                plt.close()
                
                # Log statistics
                logger.info(f"\nFlare rates by {feature}:")
                for idx, row in flare_rates.iterrows():
                    logger.info(f"- {idx}: {row['mean']:.2%} ({row['count']} samples)")
                    
        except Exception as e:
            logger.error(f"Error analyzing categorical features: {str(e)}")
            raise

def main():
    try:
        logger.info("Starting feature analysis...")
        
        # Initialize analyzer
        analyzer = FeatureAnalyzer()
        
        # Load data
        df = analyzer.load_data()
        
        # Analyze feature importance
        analyzer.analyze_feature_importance()
        
        # Analyze feature relationships
        analyzer.analyze_feature_relationships(df)
        
        # Analyze categorical features
        analyzer.analyze_categorical_features(df)
        
        logger.info("Feature analysis completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in feature analysis: {str(e)}")
        raise

if __name__ == "__main__":
    main() 