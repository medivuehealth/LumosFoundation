#!/usr/bin/env python3
"""
Test script to analyze model predictions with high-risk indicators
"""

import pandas as pd
import numpy as np
import joblib
import os
from model import FlarePredictorModel

def test_high_risk_scenarios():
    """Test various high-risk scenarios to understand model behavior"""
    
    # Initialize model
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'flare_predictor_1.0.0.joblib')
    scaler_path = os.path.join(os.path.dirname(__file__), 'models', 'scaler_1.0.0.joblib')
    
    try:
        # Load model and scaler
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        print("✓ Model and scaler loaded successfully")
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        return
    
    # Test scenarios
    test_cases = [
        {
            'name': 'High Risk - Blood + High Bowel Frequency + High Pain',
            'data': {
                'calories': 500,
                'protein': 25,
                'carbs': 60,
                'fiber': 5,
                'has_allergens': 'no',
                'meals_per_day': 3,
                'hydration_level': 5,
                'bowel_frequency': 8,
                'bristol_scale': 6,
                'urgency_level': 8,
                'blood_present': 'yes',
                'pain_location': 'lower_abdomen',
                'pain_severity': 9,
                'pain_time': 'night',
                'medication_taken': 'yes',
                'medication_type': 'immunosuppressant',
                'dosage_level': 3,
                'sleep_hours': 6,
                'stress_level': 8,
                'menstruation': 'not_applicable',
                'fatigue_level': 7
            }
        },
        {
            'name': 'Very High Risk - All Indicators',
            'data': {
                'calories': 300,
                'protein': 15,
                'carbs': 40,
                'fiber': 2,
                'has_allergens': 'no',
                'meals_per_day': 2,
                'hydration_level': 3,
                'bowel_frequency': 10,
                'bristol_scale': 7,
                'urgency_level': 10,
                'blood_present': 'yes',
                'pain_location': 'full_abdomen',
                'pain_severity': 10,
                'pain_time': 'variable',
                'medication_taken': 'no',
                'medication_type': 'None',
                'dosage_level': 0,
                'sleep_hours': 4,
                'stress_level': 10,
                'menstruation': 'not_applicable',
                'fatigue_level': 10
            }
        },
        {
            'name': 'Medium Risk - Some Indicators',
            'data': {
                'calories': 800,
                'protein': 40,
                'carbs': 80,
                'fiber': 8,
                'has_allergens': 'no',
                'meals_per_day': 3,
                'hydration_level': 7,
                'bowel_frequency': 6,
                'bristol_scale': 5,
                'urgency_level': 5,
                'blood_present': 'yes',
                'pain_location': 'lower_abdomen',
                'pain_severity': 6,
                'pain_time': 'morning',
                'medication_taken': 'yes',
                'medication_type': 'biologic',
                'dosage_level': 2,
                'sleep_hours': 7,
                'stress_level': 5,
                'menstruation': 'not_applicable',
                'fatigue_level': 4
            }
        },
        {
            'name': 'Low Risk - Baseline',
            'data': {
                'calories': 1200,
                'protein': 60,
                'carbs': 120,
                'fiber': 15,
                'has_allergens': 'no',
                'meals_per_day': 4,
                'hydration_level': 8,
                'bowel_frequency': 2,
                'bristol_scale': 4,
                'urgency_level': 2,
                'blood_present': 'no',
                'pain_location': 'None',
                'pain_severity': 1,
                'pain_time': 'None',
                'medication_taken': 'yes',
                'medication_type': 'immunosuppressant',
                'dosage_level': 2,
                'sleep_hours': 8,
                'stress_level': 2,
                'menstruation': 'not_applicable',
                'fatigue_level': 2
            }
        }
    ]
    
    print("\n" + "="*80)
    print("MODEL PREDICTION ANALYSIS")
    print("="*80)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. {test_case['name']}")
        print("-" * 60)
        
        # Create DataFrame
        df = pd.DataFrame([test_case['data']])
        
        try:
            # Make prediction
            prediction = model.predict(df)
            probability = model.predict_proba(df)[0][1]
            
            print(f"Prediction: {prediction}")
            print(f"Probability: {probability:.4f} ({probability*100:.2f}%)")
            print(f"Risk Level: {'HIGH' if probability > 0.7 else 'MEDIUM' if probability > 0.3 else 'LOW'}")
            
            # Show key risk factors
            risk_factors = []
            if test_case['data']['blood_present'] == 'yes':
                risk_factors.append("Blood present")
            if test_case['data']['bowel_frequency'] > 6:
                risk_factors.append(f"High bowel frequency ({test_case['data']['bowel_frequency']})")
            if test_case['data']['pain_severity'] > 7:
                risk_factors.append(f"High pain severity ({test_case['data']['pain_severity']})")
            if test_case['data']['urgency_level'] > 7:
                risk_factors.append(f"High urgency level ({test_case['data']['urgency_level']})")
            
            if risk_factors:
                print(f"Risk Factors: {', '.join(risk_factors)}")
            
        except Exception as e:
            print(f"Error making prediction: {e}")
    
    print("\n" + "="*80)
    print("ANALYSIS COMPLETE")
    print("="*80)

if __name__ == "__main__":
    test_high_risk_scenarios() 