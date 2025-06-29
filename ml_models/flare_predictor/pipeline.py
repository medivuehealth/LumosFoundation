"""Data pipeline for IBD Flare Predictor"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
import pandas as pd
from datetime import datetime
from pathlib import Path

from data_collector import IBDDataCollector
from utils.validators import DataValidator
from utils.medical_text import MedicalTextProcessor
from data_anonymizer import DataAnonymizer
from config.settings import (
    DATA_CONFIG,
    NLP_CONFIG,
    VALIDATION_RULES,
    DATA_DIR
)

logger = logging.getLogger(__name__)

class DataPipeline:
    """Pipeline for collecting and processing IBD data"""
    
    def __init__(self):
        """Initialize pipeline components"""
        self.collector = IBDDataCollector()
        self.validator = DataValidator()
        self.text_processor = MedicalTextProcessor()
        self.anonymizer = DataAnonymizer()
        
        # Create output directory
        self.output_dir = DATA_DIR / 'processed'
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def run(self, synthetic_count: int = 100) -> Dict[str, Any]:
        """
        Run the complete data pipeline
        
        Args:
            synthetic_count: Number of synthetic records to generate
        
        Returns:
            Dictionary with pipeline results and statistics
        """
        logger.info("Starting data pipeline...")
        start_time = datetime.now()
        
        try:
            # Step 1: Collect data
            logger.info("Collecting data...")
            raw_data = await self._collect_data(synthetic_count)
            
            # Step 2: Process text data
            logger.info("Processing medical text...")
            processed_data = self._process_text_data(raw_data)
            
            # Step 3: Validate data
            logger.info("Validating data...")
            validated_data = self._validate_data(processed_data)
            
            # Step 4: Anonymize data
            logger.info("Anonymizing data...")
            anonymized_data = self._anonymize_data(validated_data)
            
            # Step 5: Save processed data
            logger.info("Saving processed data...")
            self._save_data(anonymized_data)
            
            # Generate pipeline statistics
            stats = self._generate_statistics(
                raw_data,
                processed_data,
                validated_data,
                anonymized_data
            )
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            logger.info(f"Pipeline completed successfully in {duration:.2f} seconds")
            return {
                'status': 'success',
                'duration': duration,
                'statistics': stats
            }
            
        except Exception as e:
            logger.error(f"Pipeline failed: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    async def _collect_data(self, synthetic_count: int) -> Dict[str, pd.DataFrame]:
        """Collect data from all sources"""
        # Collect external data
        external_data = await self.collector.collect_external_data()
        
        # Generate synthetic data
        synthetic_data = self.collector.generate_synthetic_data(synthetic_count)
        
        # Merge data sources
        merged_data = {}
        for key in external_data.keys():
            if key in synthetic_data:
                merged_data[key] = pd.concat([
                    external_data[key],
                    synthetic_data[key]
                ], ignore_index=True)
        
        return merged_data
    
    def _process_text_data(self, data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """Process medical text in the data"""
        processed_data = {}
        
        for key, df in data.items():
            processed_df = df.copy()
            
            # Process text columns
            text_columns = df.select_dtypes(include=['object']).columns
            for col in text_columns:
                if isinstance(df[col].iloc[0], str):
                    # Extract features from text
                    features = processed_df[col].apply(self.text_processor.process_text)
                    
                    # Add extracted features as new columns
                    for feature_type in ['SYMPTOM', 'MEDICATION', 'MEASUREMENT']:
                        processed_df[f'{col}_{feature_type.lower()}'] = features.apply(
                            lambda x: [
                                item['text'] 
                                for item in x.get('entities', {}).get(feature_type, [])
                            ]
                        )
                    
                    # Add severity information
                    processed_df[f'{col}_severity'] = features.apply(
                        lambda x: max(
                            [item.get('severity', 0) or 0 
                             for items in x.get('entities', {}).values()
                             for item in items],
                            default=0
                        )
                    )
            
            processed_data[key] = processed_df
        
        return processed_data
    
    def _validate_data(self, data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """Validate all data"""
        validated_data = {}
        
        # Validate measurements
        if 'measurements' in data:
            validated_data['measurements'] = self.validator.validate_measurements(
                data['measurements']
            )
        
        # Validate symptoms
        if 'symptoms' in data:
            validated_data['symptoms'] = self.validator.validate_symptoms(
                data['symptoms']
            )
        
        # Validate treatments
        if 'treatments' in data:
            validated_data['treatments'] = self.validator.validate_treatments(
                data['treatments']
            )
        
        # Validate dates across all dataframes
        for key, df in validated_data.items():
            date_columns = df.select_dtypes(include=['datetime64']).columns
            if date_columns.any():
                validated_data[key] = self.validator.validate_dates(df, date_columns)
        
        # Validate time series data
        for key, df in validated_data.items():
            if 'date' in df.columns:
                numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
                validated_data[key] = self.validator.validate_time_series(
                    df,
                    'date',
                    numeric_cols
                )
        
        return validated_data
    
    def _anonymize_data(self, data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """Anonymize all data"""
        anonymized_data = {}
        
        for key, df in data.items():
            anonymized_data[key] = self.anonymizer.anonymize_dataframe(df)
        
        return anonymized_data
    
    def _save_data(self, data: Dict[str, pd.DataFrame]):
        """Save processed data to files"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        for key, df in data.items():
            # Save to CSV
            csv_path = self.output_dir / f"{key}_{timestamp}.csv"
            df.to_csv(csv_path, index=False)
            
            # Save to Parquet for efficient storage
            parquet_path = self.output_dir / f"{key}_{timestamp}.parquet"
            df.to_parquet(parquet_path, index=False)
    
    def _generate_statistics(self, raw_data: Dict[str, pd.DataFrame],
                           processed_data: Dict[str, pd.DataFrame],
                           validated_data: Dict[str, pd.DataFrame],
                           anonymized_data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """Generate pipeline statistics"""
        stats = {
            'raw_data': {},
            'processed_data': {},
            'validated_data': {},
            'anonymized_data': {}
        }
        
        # Raw data statistics
        for key, df in raw_data.items():
            stats['raw_data'][key] = {
                'records': len(df),
                'columns': len(df.columns),
                'missing_values': df.isnull().sum().sum()
            }
        
        # Processed data statistics
        for key, df in processed_data.items():
            stats['processed_data'][key] = {
                'records': len(df),
                'columns': len(df.columns),
                'extracted_features': len([
                    col for col in df.columns 
                    if any(suffix in col for suffix in ['_symptom', '_medication', '_measurement'])
                ])
            }
        
        # Validation statistics
        validation_summary = self.validator.get_validation_summary(validated_data)
        stats['validated_data'] = validation_summary
        
        # Anonymization statistics
        for key, df in anonymized_data.items():
            stats['anonymized_data'][key] = {
                'records': len(df),
                'columns': len(df.columns),
                'anonymized_fields': len([
                    col for col in df.columns 
                    if col.endswith('_anonymized')
                ])
            }
        
        return stats 