"""Flask API for IBD flare predictions"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import logging
import os
from datetime import datetime, timedelta
from db_handler import DatabaseHandler
from config import DB_CONFIG
import sqlite3
import json
from .model import FlarePredictor
from .model_validation import ModelValidator
from .db_handler import get_db_connection

# Set up logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load model and scaler
model = FlarePredictor()
validator = ModelValidator()
db = DatabaseHandler(DB_CONFIG)

def validate_input(data):
    """Validate input data"""
    required_fields = [
        'calories', 'protein', 'carbs', 'fiber', 'has_allergens',
        'meals_per_day', 'hydration_level', 'bowel_frequency',
        'bristol_scale', 'urgency_level', 'blood_present',
        'pain_location', 'pain_severity', 'pain_time',
        'medication_taken', 'medication_type', 'dosage_level',
        'sleep_hours', 'stress_level', 'menstruation', 'fatigue_level'
    ]
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    # Validate numeric ranges
    try:
        if not (0 <= data['pain_severity'] <= 10):
            return False, "Pain severity must be between 0 and 10"
        if not (0 <= data['urgency_level'] <= 10):
            return False, "Urgency level must be between 0 and 10"
        if not (1 <= data['bristol_scale'] <= 7):
            return False, "Bristol scale must be between 1 and 7"
        if not (0 <= data['stress_level'] <= 10):
            return False, "Stress level must be between 0 and 10"
        if not (0 <= data['fatigue_level'] <= 10):
            return False, "Fatigue level must be between 0 and 10"
    except (TypeError, ValueError):
        return False, "Invalid numeric values provided"
    
    return True, None

def generate_recommendations(data, prediction, probability):
    recommendations = []
    
    # High-risk recommendations
    if prediction:
        if data.get('stress_level', 0) > 7:
            recommendations.append("Your stress levels are high. Consider stress-reduction techniques like meditation or yoga.")
        if data.get('hydration_level', 0) < 5:
            recommendations.append("Your hydration level is low. Try to increase your water intake.")
        if data.get('sleep_hours', 0) < 6:
            recommendations.append("You might not be getting enough sleep. Aim for 7-9 hours of sleep per night.")
        if data.get('pain_level', 0) > 7:
            recommendations.append("Your pain level is high. Please consult your healthcare provider.")
        if data.get('bowel_movements', 0) > 5:
            recommendations.append("You're experiencing frequent bowel movements. Consider keeping a detailed food diary.")
    
    # General recommendations
    if not recommendations:
        recommendations.append("Continue monitoring your symptoms and maintaining your current routine.")
        if probability > 0.3:
            recommendations.append("While risk is currently low, stay mindful of any changes in symptoms.")
    
    return recommendations

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Make a prediction based on input data"""
    try:
        data = request.json
        
        # Make prediction
        prediction_result = model.predict(data)
        probability = model.predict_proba(data)
        
        # Generate recommendations
        recommendations = generate_recommendations(data, prediction_result, probability)
        
        # Store prediction in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO predictions (
                user_id,
                prediction_value,
                probability,
                features_used,
                recommendations
            ) VALUES (?, ?, ?, ?, ?)
        """, (
            data['user_id'],
            prediction_result,
            probability,
            json.dumps(data),
            json.dumps(recommendations)
        ))
        
        prediction_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'id': prediction_id,
            'prediction': prediction_result,
            'probability': probability,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/predictions/<int:user_id>', methods=['GET'])
def get_user_predictions(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, prediction_value, probability, features_used, 
                   recommendations, created_at
            FROM predictions
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        """, (user_id,))
        
        predictions = cursor.fetchall()
        conn.close()
        
        return jsonify([{
            'id': p[0],
            'prediction': p[1],
            'probability': p[2],
            'features_used': json.loads(p[3]),
            'recommendations': json.loads(p[4]),
            'timestamp': p[5]
        } for p in predictions]), 200
        
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/meal_logs', methods=['POST'])
def save_meal_log():
    try:
        data = request.json
        required_fields = ['user_id', 'meal_type', 'meal_content', 'nutrition', 'corrected_words']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert meal log
        cursor.execute("""
            INSERT INTO meal_logs (
                user_id, meal_type, meal_content, 
                calories, protein_g, carbs_g, fiber_g,
                corrected_words
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['user_id'],
            data['meal_type'],
            data['meal_content'],
            data['nutrition']['calories'],
            data['nutrition']['protein'],
            data['nutrition']['carbs'],
            data['nutrition']['fiber'],
            json.dumps(data['corrected_words'])
        ))
        
        meal_log_id = cursor.lastrowid
        
        # Update flare prediction features with new meal data
        nutrition_features = {
            f"{data['meal_type']}_calories": data['nutrition']['calories'],
            f"{data['meal_type']}_protein": data['nutrition']['protein'],
            f"{data['meal_type']}_carbs": data['nutrition']['carbs'],
            f"{data['meal_type']}_fiber": data['nutrition']['fiber']
        }
        
        # Get user's recent meal logs for prediction
        cursor.execute("""
            SELECT meal_type, calories, protein_g, carbs_g, fiber_g 
            FROM meal_logs 
            WHERE user_id = ? 
            AND timestamp >= datetime('now', '-7 days')
        """, (data['user_id'],))
        
        recent_meals = cursor.fetchall()
        
        # Calculate meal pattern features
        meal_features = model.calculate_meal_features(recent_meals)
        
        # Combine all features and make prediction
        features = {**nutrition_features, **meal_features}
        prediction = model.predict(features)
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'meal_log_id': meal_log_id,
            'flare_risk': prediction
        }), 201
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/analyze', methods=['POST'])
def analyze_health_data():
    """Analyze health data trends"""
    try:
        # Get user ID from request
        user_id = request.json.get('user_id')
        if not user_id:
            return jsonify({
                'error': 'Missing user_id'
            }), 400
            
        # Get recent predictions for the user
        recent_data = db.get_recent_predictions(user_id, limit=30)
        
        if recent_data.empty:
            return jsonify({
                'message': 'No recent health data available'
            }), 404
            
        # Calculate trends and statistics
        analysis = {
            'flare_risk_trend': recent_data['probability'].tolist(),
            'avg_flare_risk': float(recent_data['probability'].mean()),
            'highest_risk_day': recent_data.loc[recent_data['probability'].idxmax(), 'timestamp'],
            'risk_increasing': bool(recent_data['probability'].is_monotonic_increasing),
            'total_records': len(recent_data),
            'recommendations': []
        }
        
        # Add trend-based recommendations
        if analysis['risk_increasing']:
            analysis['recommendations'].append(
                "Your flare risk has been increasing. Consider consulting your healthcare provider."
            )
        if analysis['avg_flare_risk'] > 0.7:
            analysis['recommendations'].append(
                "Your average flare risk is high. Please review your treatment plan with your doctor."
            )
            
        return jsonify(analysis)
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/flare_outcomes', methods=['POST'])
def report_flare_outcome():
    """Report actual flare outcome for a prediction"""
    try:
        data = request.json
        required_fields = ['prediction_id', 'actual_flare']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO flare_outcomes (
                prediction_id,
                actual_flare,
                symptoms,
                severity,
                duration_days,
                notes
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data['prediction_id'],
            data['actual_flare'],
            json.dumps(data.get('symptoms', [])),
            data.get('severity'),
            data.get('duration_days'),
            data.get('notes')
        ))
        
        outcome_id = cursor.lastrowid
        conn.commit()
        
        # Run validation after new outcome is reported
        validation_result = validator.validate_model(days_back=30)
        
        # Check for model drift
        drift_analysis = validator.detect_model_drift()
        
        conn.close()
        
        return jsonify({
            'outcome_id': outcome_id,
            'validation_result': validation_result,
            'model_drift': drift_analysis
        }), 201
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/model/validation', methods=['GET'])
def get_model_validation():
    """Get model validation metrics"""
    try:
        days = request.args.get('days', default=30, type=int)
        validation_result = validator.validate_model(days_back=days)
        return jsonify(validation_result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/model/drift', methods=['GET'])
def check_model_drift():
    """Check for model performance drift"""
    try:
        threshold = request.args.get('threshold', default=0.1, type=float)
        drift_result = validator.detect_model_drift(threshold=threshold)
        return jsonify(drift_result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/model/feature_importance', methods=['GET'])
def get_feature_importance():
    """Get feature importance analysis"""
    try:
        days = request.args.get('days', default=30, type=int)
        predictions = validator.get_predictions_data(
            start_date=datetime.now() - timedelta(days=days)
        )
        importance = validator.analyze_feature_importance(predictions)
        return jsonify({
            'feature_importance': importance,
            'analysis_period_days': days,
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 