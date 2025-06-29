"""Data validation utilities for IBD Flare Predictor"""

import re
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Union, Optional
from datetime import datetime, timedelta
from ..config.settings import VALIDATION_RULES

class DataValidator:
    """Validate and clean IBD-related data"""
    
    def __init__(self, rules: Dict[str, Any] = VALIDATION_RULES):
        """
        Initialize validator with rules
        
        Args:
            rules: Validation rules dictionary
        """
        self.rules = rules
    
    def validate_measurements(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Validate clinical measurements
        
        Args:
            data: DataFrame with measurements
        
        Returns:
            Validated and cleaned DataFrame
        """
        rules = self.rules['measurements']
        clean_data = data.copy()
        
        for measure, constraints in rules.items():
            if measure in clean_data.columns:
                # Apply range constraints
                mask = (clean_data[measure] >= constraints['min']) & \
                      (clean_data[measure] <= constraints['max'])
                
                # Mark outliers as NaN
                clean_data.loc[~mask, measure] = np.nan
                
                # Add unit validation if unit column exists
                unit_col = f"{measure}_unit"
                if unit_col in clean_data.columns:
                    clean_data.loc[clean_data[unit_col] != constraints['unit'], measure] = np.nan
        
        return clean_data
    
    def validate_symptoms(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Validate symptom records
        
        Args:
            data: DataFrame with symptoms
        
        Returns:
            Validated and cleaned DataFrame
        """
        rules = self.rules['symptoms']
        clean_data = data.copy()
        
        # Check required fields
        for field in rules['required_fields']:
            if field not in clean_data.columns:
                raise ValueError(f"Required field '{field}' missing from symptoms data")
        
        # Validate severity levels
        if 'severity' in clean_data.columns:
            mask = clean_data['severity'].isin(rules['severity_levels'])
            clean_data.loc[~mask, 'severity'] = None
        
        # Validate duration
        if 'duration' in clean_data.columns:
            mask = (clean_data['duration'] > 0) & (clean_data['duration'] <= rules['duration_max'])
            clean_data.loc[~mask, 'duration'] = np.nan
        
        return clean_data
    
    def validate_treatments(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Validate treatment records
        
        Args:
            data: DataFrame with treatments
        
        Returns:
            Validated and cleaned DataFrame
        """
        rules = self.rules['treatments']
        clean_data = data.copy()
        
        # Check required fields
        for field in rules['required_fields']:
            if field not in clean_data.columns:
                raise ValueError(f"Required field '{field}' missing from treatments data")
        
        # Validate frequency
        if 'frequency' in clean_data.columns:
            mask = clean_data['frequency'].isin(rules['frequency_options'])
            clean_data.loc[~mask, 'frequency'] = None
        
        return clean_data
    
    def validate_dates(self, data: pd.DataFrame, date_columns: List[str]) -> pd.DataFrame:
        """
        Validate date fields
        
        Args:
            data: DataFrame with date columns
            date_columns: List of date column names
        
        Returns:
            DataFrame with validated dates
        """
        clean_data = data.copy()
        
        for col in date_columns:
            if col in clean_data.columns:
                # Convert to datetime if not already
                if not pd.api.types.is_datetime64_any_dtype(clean_data[col]):
                    try:
                        clean_data[col] = pd.to_datetime(clean_data[col])
                    except Exception:
                        clean_data[col] = pd.NaT
                
                # Remove future dates
                mask = clean_data[col] <= datetime.now()
                clean_data.loc[~mask, col] = pd.NaT
                
                # Remove dates too far in the past (e.g., > 100 years)
                mask = clean_data[col] >= datetime.now() - timedelta(days=36500)
                clean_data.loc[~mask, col] = pd.NaT
        
        return clean_data
    
    def validate_correlations(self, data: pd.DataFrame, 
                            threshold: float = 0.7) -> pd.DataFrame:
        """
        Validate correlations between related measurements
        
        Args:
            data: DataFrame with measurements
            threshold: Correlation threshold for flagging
        
        Returns:
            DataFrame with correlation validation flags
        """
        # Define expected correlations
        correlations = {
            'crp': ['calprotectin', 'hemoglobin'],
            'temperature': ['heart_rate'],
        }
        
        validated_data = data.copy()
        validated_data['correlation_flag'] = False
        
        for primary, related in correlations.items():
            if primary in validated_data.columns:
                for secondary in related:
                    if secondary in validated_data.columns:
                        corr = validated_data[primary].corr(validated_data[secondary])
                        if abs(corr) < threshold:
                            validated_data.loc[
                                (validated_data[primary].notna()) & 
                                (validated_data[secondary].notna()),
                                'correlation_flag'
                            ] = True
        
        return validated_data
    
    def validate_time_series(self, data: pd.DataFrame, 
                           time_col: str,
                           value_cols: List[str],
                           max_gap: timedelta = timedelta(days=90)) -> pd.DataFrame:
        """
        Validate time series data
        
        Args:
            data: DataFrame with time series data
            time_col: Name of timestamp column
            value_cols: List of value columns to validate
            max_gap: Maximum allowed gap between measurements
        
        Returns:
            DataFrame with gap flags
        """
        validated_data = data.copy()
        validated_data['gap_flag'] = False
        
        # Sort by time
        validated_data = validated_data.sort_values(time_col)
        
        # Calculate gaps
        gaps = validated_data[time_col].diff()
        validated_data.loc[gaps > max_gap, 'gap_flag'] = True
        
        # Check for sudden changes
        for col in value_cols:
            if col in validated_data.columns:
                # Calculate rolling statistics
                rolling_mean = validated_data[col].rolling(window=3, center=True).mean()
                rolling_std = validated_data[col].rolling(window=3, center=True).std()
                
                # Flag sudden changes (> 3 standard deviations)
                changes = abs(validated_data[col] - rolling_mean) > (3 * rolling_std)
                validated_data.loc[changes, 'sudden_change_flag'] = True
        
        return validated_data
    
    def get_validation_summary(self, data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """
        Generate validation summary for all data
        
        Args:
            data: Dictionary of DataFrames to validate
        
        Returns:
            Dictionary with validation statistics
        """
        summary = {
            'total_records': {},
            'missing_values': {},
            'invalid_values': {},
            'outliers': {},
            'flags': {}
        }
        
        for key, df in data.items():
            summary['total_records'][key] = len(df)
            
            # Count missing values
            missing = df.isnull().sum()
            summary['missing_values'][key] = missing[missing > 0].to_dict()
            
            # Count invalid values (NaN after validation)
            if key == 'measurements':
                df_validated = self.validate_measurements(df)
                invalid = (df.notna() & df_validated.isna()).sum()
                summary['invalid_values'][key] = invalid[invalid > 0].to_dict()
            
            # Count outliers (for numeric columns)
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                q1 = df[col].quantile(0.25)
                q3 = df[col].quantile(0.75)
                iqr = q3 - q1
                outliers = ((df[col] < (q1 - 1.5 * iqr)) | 
                           (df[col] > (q3 + 1.5 * iqr))).sum()
                if outliers > 0:
                    if key not in summary['outliers']:
                        summary['outliers'][key] = {}
                    summary['outliers'][key][col] = int(outliers)
            
            # Count validation flags
            flag_cols = [col for col in df.columns if col.endswith('_flag')]
            for col in flag_cols:
                if key not in summary['flags']:
                    summary['flags'][key] = {}
                summary['flags'][key][col] = int(df[col].sum())
        
        return summary 