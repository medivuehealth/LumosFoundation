import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
from datetime import datetime, timedelta
import json

class NutritionOptimizer:
    def __init__(self):
        self.meal_type_encodings = {
            'breakfast': 0,
            'lunch': 1,
            'dinner': 2,
            'snack': 3
        }
        
        # Nutrition targets (can be personalized per patient)
        self.default_targets = {
            'calories': {
                'breakfast': (300, 500),
                'lunch': (500, 800),
                'dinner': (500, 800),
                'snack': (100, 300)
            },
            'protein': {
                'breakfast': (15, 30),
                'lunch': (25, 40),
                'dinner': (25, 40),
                'snack': (5, 15)
            },
            'carbs': {
                'breakfast': (40, 60),
                'lunch': (60, 90),
                'dinner': (60, 90),
                'snack': (15, 30)
            },
            'fiber': {
                'breakfast': (4, 8),
                'lunch': (6, 10),
                'dinner': (6, 10),
                'snack': (2, 5)
            }
        }
        
        # Initialize models for each nutrient
        self.models = {
            'calories': RandomForestRegressor(n_estimators=100),
            'protein': RandomForestRegressor(n_estimators=100),
            'carbs': RandomForestRegressor(n_estimators=100),
            'fiber': RandomForestRegressor(n_estimators=100)
        }
        
        self.scalers = {
            'calories': StandardScaler(),
            'protein': StandardScaler(),
            'carbs': StandardScaler(),
            'fiber': StandardScaler()
        }

    def _extract_features(self, meal_logs):
        """Extract features from meal logs"""
        features = []
        for log in meal_logs:
            # Basic features
            feature_dict = {
                'meal_type': self.meal_type_encodings[log['meal_type']],
                'day_of_week': pd.Timestamp(log['timestamp']).dayofweek,
                'hour': pd.Timestamp(log['timestamp']).hour,
                'calories': log['nutrition']['calories'],
                'protein': log['nutrition']['protein'],
                'carbs': log['nutrition']['carbs'],
                'fiber': log['nutrition']['fiber']
            }
            
            # Add flare risk if available
            if 'flare_risk' in log:
                feature_dict['flare_risk'] = float(log['flare_risk'])
            else:
                feature_dict['flare_risk'] = 0.0
                
            features.append(feature_dict)
        
        return pd.DataFrame(features)

    def train(self, meal_logs, patient_outcomes):
        """Train the nutrition optimizer model"""
        # Extract features
        df = self._extract_features(meal_logs)
        
        # Add outcome labels
        outcomes = pd.DataFrame(patient_outcomes)
        df = df.merge(outcomes, left_index=True, right_index=True, how='left')
        
        # Train models for each nutrient
        for nutrient in self.models.keys():
            X = df[['meal_type', 'day_of_week', 'hour', 'flare_risk']]
            y = df[nutrient]
            
            # Scale features
            X_scaled = self.scalers[nutrient].fit_transform(X)
            
            # Train model
            self.models[nutrient].fit(X_scaled, y)

    def optimize_meal(self, user_id, meal_type, timestamp=None, flare_risk=0.0):
        """Generate optimized meal recommendations"""
        if timestamp is None:
            timestamp = datetime.now()
        
        # Create feature vector
        features = np.array([[
            self.meal_type_encodings[meal_type],
            timestamp.weekday(),
            timestamp.hour,
            flare_risk
        ]])
        
        # Get predictions for each nutrient
        recommendations = {}
        for nutrient, model in self.models.items():
            X_scaled = self.scalers[nutrient].transform(features)
            predicted_value = model.predict(X_scaled)[0]
            
            # Get target range for this nutrient and meal type
            target_min, target_max = self.default_targets[nutrient][meal_type]
            
            # Adjust recommendation based on prediction and targets
            if predicted_value < target_min:
                adjustment = "increase"
            elif predicted_value > target_max:
                adjustment = "decrease"
            else:
                adjustment = "maintain"
                
            recommendations[nutrient] = {
                'predicted': round(predicted_value, 1),
                'target_min': target_min,
                'target_max': target_max,
                'adjustment': adjustment
            }
        
        return self._generate_meal_suggestions(recommendations, meal_type)

    def _generate_meal_suggestions(self, recommendations, meal_type):
        """Generate specific meal suggestions based on nutritional recommendations"""
        from .food_database import FOOD_DATABASE  # Import your food database
        
        suggestions = {
            'recommendations': recommendations,
            'meal_suggestions': [],
            'food_swaps': []
        }
        
        # Example meal suggestion logic
        if meal_type == 'breakfast':
            if recommendations['protein']['adjustment'] == 'increase':
                suggestions['meal_suggestions'].append({
                    'meal': 'Greek yogurt with berries and nuts',
                    'benefits': 'High in protein and fiber, moderate calories'
                })
            elif recommendations['calories']['adjustment'] == 'decrease':
                suggestions['meal_suggestions'].append({
                    'meal': 'Oatmeal with fruit',
                    'benefits': 'Lower calories, good fiber content'
                })
        
        # Add food swap suggestions
        if recommendations['calories']['adjustment'] == 'decrease':
            suggestions['food_swaps'].append({
                'swap_from': 'White bread',
                'swap_to': 'Whole grain bread',
                'benefit': 'Lower calories, higher fiber'
            })
        
        return suggestions

    def save_model(self, path):
        """Save the trained model"""
        model_data = {
            'models': self.models,
            'scalers': self.scalers,
            'meal_type_encodings': self.meal_type_encodings,
            'default_targets': self.default_targets
        }
        joblib.dump(model_data, path)

    def load_model(self, path):
        """Load a trained model"""
        model_data = joblib.load(path)
        self.models = model_data['models']
        self.scalers = model_data['scalers']
        self.meal_type_encodings = model_data['meal_type_encodings']
        self.default_targets = model_data['default_targets']

    def update_patient_targets(self, user_id, new_targets):
        """Update nutrition targets for a specific patient"""
        # In a real implementation, you would store these in a database
        self.default_targets = new_targets

    def analyze_meal_patterns(self, meal_logs, days_back=30):
        """Analyze meal patterns and their correlation with flare risk"""
        df = pd.DataFrame(meal_logs)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        recent_logs = df[df['timestamp'] >= datetime.now() - timedelta(days=days_back)]
        
        analysis = {
            'meal_timing': {},
            'nutrient_trends': {},
            'risk_correlations': {}
        }
        
        # Analyze meal timing
        for meal_type in self.meal_type_encodings.keys():
            meal_df = recent_logs[recent_logs['meal_type'] == meal_type]
            if not meal_df.empty:
                analysis['meal_timing'][meal_type] = {
                    'average_time': meal_df['timestamp'].dt.hour.mean(),
                    'most_common_time': meal_df['timestamp'].dt.hour.mode()[0]
                }
        
        # Analyze nutrient trends
        for nutrient in ['calories', 'protein', 'carbs', 'fiber']:
            nutrient_data = recent_logs[nutrient].astype(float)
            analysis['nutrient_trends'][nutrient] = {
                'average': nutrient_data.mean(),
                'trend': 'increasing' if nutrient_data.corr(recent_logs.index) > 0 else 'decreasing'
            }
        
        # Analyze correlations with flare risk
        if 'flare_risk' in recent_logs.columns:
            for nutrient in ['calories', 'protein', 'carbs', 'fiber']:
                correlation = recent_logs[nutrient].corr(recent_logs['flare_risk'])
                analysis['risk_correlations'][nutrient] = correlation
        
        return analysis 