import pandas as pd
import numpy as np
import joblib
from datetime import datetime
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score
from db_handler import DatabaseHandler

class FlarePredictorModel:
    def __init__(self, db_path):
        self.model = None
        self.preprocessor = None
        self.db_path = db_path
        self.db_handler = DatabaseHandler(db_path)
        self.model_version = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.feature_names = [
            # Diet features
            'calories', 'protein', 'carbs', 'fiber', 'has_allergens', 'meals_per_day', 'hydration_level',
            
            # Bowel habits
            'bowel_frequency', 'bristol_scale', 'urgency_level', 'blood_present',
            
            # Pain
            'pain_location', 'pain_severity', 'pain_time',
            
            # Medications
            'medication_taken', 'medication_type', 'dosage_level',
            
            # Other
            'sleep_hours', 'stress_level', 'menstruation', 'fatigue_level'
        ]
        
        self.numeric_features = [
            'calories', 'protein', 'carbs', 'fiber', 'meals_per_day', 'hydration_level',
            'bowel_frequency', 'bristol_scale', 'urgency_level', 'pain_severity',
            'sleep_hours', 'stress_level', 'fatigue_level', 'dosage_level'
        ]
        
        self.categorical_features = [
            'has_allergens', 'blood_present', 'pain_location', 'pain_time',
            'medication_taken', 'medication_type', 'menstruation'
        ]

    def load_model(self, model_path):
        """Load the trained model from disk"""
        try:
            model_data = joblib.load(model_path)
            if isinstance(model_data, tuple) and len(model_data) == 2:
                self.model, self.preprocessor = model_data
            else:
                # Create preprocessing pipeline if not loaded
                numeric_transformer = Pipeline(steps=[
                    ('scaler', StandardScaler())
                ])
                
                categorical_transformer = Pipeline(steps=[
                    ('onehot', OneHotEncoder(handle_unknown='ignore'))
                ])
                
                self.preprocessor = ColumnTransformer(
                    transformers=[
                        ('num', numeric_transformer, self.numeric_features),
                        ('cat', categorical_transformer, self.categorical_features)
                    ])
                self.model = model_data
            print("Successfully loaded model from", model_path)
        except Exception as e:
            print(f"Error loading model: {e}")
            raise

    def preprocess_features(self, data):
        """Preprocess features using scikit-learn pipeline"""
        # Convert dosage levels to numeric values for prediction
        if 'medication_type' in data.columns and 'dosage_level' in data.columns:
            # Create a copy to avoid modifying the original data
            data = data.copy()
            
            # Convert dosage levels to numeric values
            def convert_dosage_to_numeric(row):
                if row['medication_type'] == 'steroid':
                    return float(row['dosage_level'])  # Already numeric
                elif row['medication_type'] == 'biologic':
                    # Convert frequency to numeric scale (2=every 2 weeks, 4=every 4 weeks, 8=every 8 weeks)
                    freq_map = {'every_2_weeks': 2, 'every_4_weeks': 4, 'every_8_weeks': 8}
                    return float(freq_map.get(row['dosage_level'], 0))
                elif row['medication_type'] == 'immunosuppressant':
                    # Convert frequency to numeric scale (1=daily, 2=twice daily, 7=weekly)
                    freq_map = {'daily': 1, 'twice_daily': 2, 'weekly': 7}
                    return float(freq_map.get(row['dosage_level'], 0))
                else:
                    return 0.0
            
            data['dosage_level'] = data.apply(convert_dosage_to_numeric, axis=1)
        
        if self.preprocessor is None:
            # Create preprocessing pipeline
            numeric_transformer = Pipeline(steps=[
                ('scaler', StandardScaler())
            ])
            
            categorical_transformer = Pipeline(steps=[
                ('onehot', OneHotEncoder(handle_unknown='ignore'))
            ])
            
            self.preprocessor = ColumnTransformer(
                transformers=[
                    ('num', numeric_transformer, self.numeric_features),
                    ('cat', categorical_transformer, self.categorical_features)
                ])
            
            return self.preprocessor.fit_transform(data)
        else:
            return self.preprocessor.transform(data)

    def create_model(self):
        """Create and return a new model instance"""
        return RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight='balanced'
        )

    def train(self, X, y):
        """Train the model and track metrics"""
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Preprocess features
        X_train_processed = self.preprocess_features(X_train)
        X_test_processed = self.preprocess_features(X_test)
        
        # Create and train model
        self.model = self.create_model()
        self.model.fit(X_train_processed, y_train)
        
        # Calculate metrics
        y_pred = self.model.predict(X_test_processed)
        y_pred_proba = self.model.predict_proba(X_test_processed)[:, 1]
        
        metrics = {
            'auc_roc': roc_auc_score(y_test, y_pred_proba),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1': f1_score(y_test, y_pred)
        }
        
        return metrics

    def predict_with_storage(self, data):
        """Make a prediction and store de-identified data"""
        try:
            # Store de-identified patient data
            patient_data_id, anonymous_id = self.db_handler.insert_patient_data(data)
            
            # Make prediction
            prediction_result = self.predict(pd.DataFrame([data]))
            
            # Store prediction with anonymous ID
            self.db_handler.insert_prediction(
                patient_data_id,
                anonymous_id,
                prediction_result['prediction'],
                prediction_result['probability']
            )
            
            return prediction_result
        except Exception as e:
            raise Exception(f"Prediction and storage error: {str(e)}")

    def predict(self, data):
        """Make a prediction for the given data"""
        try:
            # Preprocess the data
            processed_data = self.preprocess_features(data)
            
            # Make prediction
            prediction = int(self.model.predict(processed_data)[0])
            probability = float(self.model.predict_proba(processed_data)[0][1])
            
            # Format response
            return {
                'prediction': prediction,
                'probability': probability,  # Return raw probability (0-1)
                'interpretation': 'High risk of flare' if prediction == 1 else 'Low risk of flare',
                'confidence': probability  # Return raw probability for frontend to format
            }
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")

    def save_model(self, filepath):
        """Save the model and preprocessor to disk"""
        if self.model is None:
            raise Exception("No model to save")
        joblib.dump((self.model, self.preprocessor), filepath)
        print(f"Model and preprocessor saved to {filepath}")

    def get_feature_importance(self):
        """Get feature importance scores"""
        if self.model is None:
            raise Exception("Model not trained yet")
            
        feature_names = (
            self.numeric_features +
            self.preprocessor.named_transformers_['cat'].named_steps['onehot'].get_feature_names(
                self.categorical_features
            ).tolist()
        )
        
        importance_scores = self.model.feature_importances_
        feature_importance = pd.DataFrame({
            'feature': feature_names,
            'importance': importance_scores
        }).sort_values('importance', ascending=False)
        
        return feature_importance

    def get_model_performance_metrics(self):
        """Get model performance metrics"""
        return self.db_handler.get_model_metrics(self.model_version) 