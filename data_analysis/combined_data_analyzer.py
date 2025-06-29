"""Script to analyze and compare external and synthetic IBD patient data"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sqlalchemy import create_engine
import logging
import os
import sys
from scipy import stats
from config import DB_CONFIG

# Set up logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/combined_analysis.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class CombinedDataAnalyzer:
    def __init__(self):
        self.engine = create_engine(
            f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
            f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        )
        
    def load_data(self):
        """Load both external and synthetic data from database"""
        try:
            query = """
                SELECT 
                    pd.*,
                    ds.source_type
                FROM patient_data pd
                JOIN data_sources ds ON pd.data_source_id = ds.id
            """
            df = pd.read_sql(query, self.engine)
            return df
            
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
            
    def analyze_distributions(self, df):
        """Analyze and compare distributions between external and synthetic data"""
        logger.info("\nAnalyzing distributions between external and synthetic data:")
        
        # Split data by source
        external_data = df[df['source_type'] == 'external']
        synthetic_data = df[df['source_type'] == 'synthetic']
        
        # Analyze flare rates
        logger.info("\nFlare Rates:")
        ext_flare_rate = external_data['flare_occurred'].mean()
        syn_flare_rate = synthetic_data['flare_occurred'].mean()
        logger.info(f"External Data: {ext_flare_rate:.2%}")
        logger.info(f"Synthetic Data: {syn_flare_rate:.2%}")
        
        # Create directory for plots
        os.makedirs('analysis_results', exist_ok=True)
        
        # Analyze numerical features
        numerical_features = [
            'pain_severity', 'bowel_frequency', 'urgency_level',
            'stress_level', 'fatigue_level', 'calories', 'protein', 'fiber'
        ]
        
        for feature in numerical_features:
            # Calculate statistics
            ext_stats = external_data[feature].describe()
            syn_stats = synthetic_data[feature].describe()
            
            logger.info(f"\n{feature} Statistics:")
            logger.info("External Data:")
            logger.info(f"Mean: {ext_stats['mean']:.2f}")
            logger.info(f"Std: {ext_stats['std']:.2f}")
            logger.info("Synthetic Data:")
            logger.info(f"Mean: {syn_stats['mean']:.2f}")
            logger.info(f"Std: {syn_stats['std']:.2f}")
            
            # Perform KS test
            ks_stat, p_value = stats.ks_2samp(
                external_data[feature],
                synthetic_data[feature]
            )
            logger.info(f"KS test p-value: {p_value:.4f}")
            
            # Create distribution plot
            plt.figure(figsize=(12, 6))
            sns.kdeplot(
                data=external_data,
                x=feature,
                label='External Data',
                fill=True,
                alpha=0.5
            )
            sns.kdeplot(
                data=synthetic_data,
                x=feature,
                label='Synthetic Data',
                fill=True,
                alpha=0.5
            )
            plt.title(f'{feature} Distribution Comparison')
            plt.legend()
            plt.savefig(f'analysis_results/{feature}_distribution.png')
            plt.close()
            
    def analyze_correlations(self, df):
        """Analyze and compare feature correlations between datasets"""
        logger.info("\nAnalyzing feature correlations:")
        
        numerical_features = [
            'pain_severity', 'bowel_frequency', 'urgency_level',
            'stress_level', 'fatigue_level', 'calories', 'protein', 'fiber'
        ]
        
        # Calculate correlations for each dataset
        external_corr = df[df['source_type'] == 'external'][numerical_features].corr()
        synthetic_corr = df[df['source_type'] == 'synthetic'][numerical_features].corr()
        
        # Plot correlation matrices
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(20, 8))
        
        sns.heatmap(
            external_corr,
            annot=True,
            cmap='coolwarm',
            center=0,
            fmt='.2f',
            ax=ax1
        )
        ax1.set_title('External Data Correlations')
        
        sns.heatmap(
            synthetic_corr,
            annot=True,
            cmap='coolwarm',
            center=0,
            fmt='.2f',
            ax=ax2
        )
        ax2.set_title('Synthetic Data Correlations')
        
        plt.tight_layout()
        plt.savefig('analysis_results/correlation_comparison.png')
        plt.close()
        
        # Calculate correlation differences
        correlation_diff = abs(external_corr - synthetic_corr)
        logger.info("\nLargest correlation differences:")
        for i in range(len(numerical_features)):
            for j in range(i+1, len(numerical_features)):
                diff = correlation_diff.iloc[i, j]
                if diff > 0.1:  # Only show significant differences
                    logger.info(
                        f"{numerical_features[i]} vs {numerical_features[j]}: "
                        f"Difference = {diff:.3f}"
                    )
                    
    def analyze_categorical_features(self, df):
        """Analyze categorical feature distributions"""
        categorical_features = [
            'pain_location', 'pain_time', 'medication_type',
            'blood_present', 'medication_taken'
        ]
        
        for feature in categorical_features:
            # Calculate distributions
            ext_dist = df[df['source_type'] == 'external'][feature].value_counts(normalize=True)
            syn_dist = df[df['source_type'] == 'synthetic'][feature].value_counts(normalize=True)
            
            # Create comparison plot
            plt.figure(figsize=(12, 6))
            width = 0.35
            x = np.arange(len(set(df[feature].unique())))
            
            plt.bar(x - width/2, ext_dist, width, label='External')
            plt.bar(x + width/2, syn_dist, width, label='Synthetic')
            
            plt.title(f'{feature} Distribution Comparison')
            plt.xticks(x, ext_dist.index, rotation=45)
            plt.legend()
            plt.tight_layout()
            plt.savefig(f'analysis_results/{feature}_comparison.png')
            plt.close()
            
            # Calculate chi-square test
            contingency = pd.crosstab(df[feature], df['source_type'])
            chi2, p_value = stats.chi2_contingency(contingency)[:2]
            
            logger.info(f"\n{feature} Distribution:")
            logger.info("External Data:")
            for cat, freq in ext_dist.items():
                logger.info(f"{cat}: {freq:.2%}")
            logger.info("\nSynthetic Data:")
            for cat, freq in syn_dist.items():
                logger.info(f"{cat}: {freq:.2%}")
            logger.info(f"Chi-square test p-value: {p_value:.4f}")
            
    def analyze_flare_predictors(self, df):
        """Analyze feature importance for flare prediction in both datasets"""
        logger.info("\nAnalyzing flare predictors:")
        
        numerical_features = [
            'pain_severity', 'bowel_frequency', 'urgency_level',
            'stress_level', 'fatigue_level', 'calories', 'protein', 'fiber'
        ]
        
        for source_type in ['external', 'synthetic']:
            source_data = df[df['source_type'] == source_type]
            
            logger.info(f"\n{source_type.capitalize()} Data:")
            for feature in numerical_features:
                # Calculate mean values for flare vs non-flare
                flare_mean = source_data[source_data['flare_occurred']][feature].mean()
                no_flare_mean = source_data[~source_data['flare_occurred']][feature].mean()
                
                # Perform t-test
                t_stat, p_value = stats.ttest_ind(
                    source_data[source_data['flare_occurred']][feature],
                    source_data[~source_data['flare_occurred']][feature]
                )
                
                logger.info(f"\n{feature}:")
                logger.info(f"Flare mean: {flare_mean:.2f}")
                logger.info(f"No flare mean: {no_flare_mean:.2f}")
                logger.info(f"Difference: {flare_mean - no_flare_mean:.2f}")
                logger.info(f"T-test p-value: {p_value:.4f}")

def main():
    try:
        analyzer = CombinedDataAnalyzer()
        
        # Load data
        df = analyzer.load_data()
        
        # Perform analyses
        analyzer.analyze_distributions(df)
        analyzer.analyze_correlations(df)
        analyzer.analyze_categorical_features(df)
        analyzer.analyze_flare_predictors(df)
        
        logger.info("Combined data analysis completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in combined data analysis: {str(e)}")
        raise

if __name__ == "__main__":
    main() 