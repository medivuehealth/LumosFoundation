from generate_data import generate_synthetic_data
import pandas as pd

# Generate data
X, y = generate_synthetic_data(n_samples=1000)

# Check unique values for categorical columns
categorical_features = [
    'has_allergens', 'blood_present', 'pain_location', 'pain_time',
    'medication_taken', 'medication_type', 'menstruation'
]

print("Unique values in categorical features:")
print("-" * 40)
for feature in categorical_features:
    unique_values = sorted(X[feature].unique())
    print(f"{feature}: {unique_values}")
    print(f"Value counts for {feature}:")
    print(X[feature].value_counts())
    print() 