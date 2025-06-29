import numpy as np
import pandas as pd

def generate_synthetic_data(n_samples=1000):
    """Generate synthetic IBD patient data for model training"""
    np.random.seed(42)
    
    # Define all possible categorical values
    categorical_values = {
        'has_allergens': ['yes', 'no'],
        'blood_present': ['yes', 'no'],
        'pain_location': ['lower_abdomen', 'upper_abdomen', 'full_abdomen', 'None'],
        'pain_time': ['morning', 'afternoon', 'evening', 'night', 'variable', 'None'],
        'medication_taken': ['yes', 'no'],
        'medication_type': ['biologic', 'immunosuppressant', 'steroid', 'None'],
        'menstruation': ['yes', 'no', 'not_applicable']
    }
    
    data = {
        # Diet features
        'calories': np.random.normal(2000, 500, n_samples),
        'protein': np.random.normal(70, 20, n_samples),
        'carbs': np.random.normal(250, 50, n_samples),
        'fiber': np.random.normal(25, 8, n_samples),
        'has_allergens': np.random.choice(categorical_values['has_allergens'], n_samples),
        'meals_per_day': np.random.normal(3, 1, n_samples),
        'hydration_level': np.random.normal(8, 2, n_samples),
        
        # Bowel habits
        'bowel_frequency': np.random.normal(5, 2, n_samples),
        'bristol_scale': np.random.randint(1, 8, n_samples),
        'urgency_level': np.random.randint(1, 11, n_samples),
        'blood_present': np.random.choice(categorical_values['blood_present'], n_samples),
        
        # Pain
        'pain_location': np.random.choice(categorical_values['pain_location'], n_samples),
        'pain_severity': np.random.randint(0, 11, n_samples),
        'pain_time': np.random.choice(categorical_values['pain_time'], n_samples),
        
        # Medications
        'medication_taken': np.random.choice(categorical_values['medication_taken'], n_samples),
        'medication_type': np.random.choice(categorical_values['medication_type'], n_samples),
        'dosage_level': np.random.normal(100, 20, n_samples),
        
        # Other
        'sleep_hours': np.random.normal(7, 2, n_samples),
        'stress_level': np.random.randint(1, 11, n_samples),
        'menstruation': np.random.choice(categorical_values['menstruation'], n_samples),
        'fatigue_level': np.random.randint(1, 11, n_samples)
    }
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Clean up the data
    df['calories'] = df['calories'].clip(500, 4000)
    df['protein'] = df['protein'].clip(0, 200)
    df['carbs'] = df['carbs'].clip(0, 500)
    df['fiber'] = df['fiber'].clip(0, 50)
    df['meals_per_day'] = df['meals_per_day'].clip(1, 8)
    df['hydration_level'] = df['hydration_level'].clip(1, 10)
    df['bowel_frequency'] = df['bowel_frequency'].clip(0, 15)
    df['sleep_hours'] = df['sleep_hours'].clip(0, 14)
    
    # Generate labels (flare-up probability increases with certain conditions)
    prob_flare = (
        (df['pain_severity'] > 7) * 0.3 +
        (df['bowel_frequency'] > 6) * 0.2 +
        (df['blood_present'] == 'yes') * 0.3 +
        (df['stress_level'] > 7) * 0.2 +
        (df['medication_taken'] == 'no') * 0.2 +
        (df['sleep_hours'] < 5) * 0.2 +
        (df['hydration_level'] < 4) * 0.1 +
        (df['pain_location'] != 'None') * 0.1
    )
    
    # Normalize probabilities
    prob_flare = prob_flare / prob_flare.max()
    
    # Generate labels
    labels = (prob_flare > np.random.random(n_samples)).astype(int)
    
    return df, labels

if __name__ == "__main__":
    # Generate synthetic data
    X, y = generate_synthetic_data(1000)
    
    # Save to CSV
    X.to_csv('synthetic_ibd_data.csv', index=False)
    pd.Series(y).to_csv('synthetic_ibd_labels.csv', index=False) 