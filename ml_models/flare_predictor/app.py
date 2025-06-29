from flask import Flask, request, jsonify
from flask_cors import CORS
from model import FlarePredictorModel
import os
import pandas as pd
import logging
import joblib

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# PostgreSQL configuration
db_config = {
    'dbname': 'ibd_flarepredictor',  # Using the existing database
    'user': 'postgres',
    'password': 'postgres',  # Change this in production
    'host': 'localhost',
    'port': 5432
}

# Initialize model
model = None
try:
    model = FlarePredictorModel(db_config)
    model_path = os.path.join(os.path.dirname(__file__), 'trained_models', 'flare_predictor.joblib')
    
    # Load the model and preprocessor
    loaded_data = joblib.load(model_path)
    if isinstance(loaded_data, tuple) and len(loaded_data) == 2:
        model.model, model.preprocessor = loaded_data
        logger.info('Successfully loaded model and preprocessor')
    else:
        logger.error('Invalid model file format - missing preprocessor')
        raise ValueError('Invalid model file format - missing preprocessor')
        
    logger.info('Successfully loaded flare predictor model')
except Exception as e:
    logger.error(f'Error loading flare predictor model: {str(e)}')
    raise  # Re-raise the exception to prevent the server from starting with an invalid model

# Define valid categorical values
VALID_CATEGORIES = {
    'has_allergens': ['yes', 'no'],
    'blood_present': ['yes', 'no'],
    'pain_location': ['None', 'full_abdomen', 'lower_abdomen', 'upper_abdomen'],
    'pain_time': ['None', 'afternoon', 'evening', 'morning', 'night', 'variable'],
    'medication_taken': ['yes', 'no'],
    'medication_type': ['None', 'biologic', 'immunosuppressant', 'steroid'],
    'menstruation': ['yes', 'no', 'not_applicable']
}

# Define required fields
REQUIRED_FIELDS = [
    'calories', 'protein', 'carbs', 'fiber', 'has_allergens', 'meals_per_day',
    'hydration_level', 'bowel_frequency', 'bristol_scale', 'urgency_level',
    'blood_present', 'pain_location', 'pain_severity', 'pain_time',
    'medication_taken', 'medication_type', 'sleep_hours', 'stress_level',
    'fatigue_level'
]

def validate_input(data):
    """Validate input data"""
    # Check required fields
    missing_fields = [field for field in REQUIRED_FIELDS if field not in data]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    # Validate numeric ranges
    if not (0 <= data.get('hydration_level', 0) <= 10):
        return False, "Hydration level must be between 0 and 10"
    if not (1 <= data.get('bristol_scale', 1) <= 7):
        return False, "Bristol scale must be between 1 and 7"
    if not (0 <= data.get('pain_severity', 0) <= 10):
        return False, "Pain severity must be between 0 and 10"
    
    return True, None

def normalize_categorical_values(data):
    """Normalize categorical values to match training data"""
    for feature, valid_values in VALID_CATEGORIES.items():
        if feature in data:
            # Handle boolean values
            if isinstance(data[feature], bool):
                data[feature] = 'yes' if data[feature] else 'no'
                continue
                
            # Create case-insensitive mapping
            value_map = {v.lower(): v for v in valid_values}
            # Normalize the value
            value = str(data[feature]).lower()
            if value == 'none':
                data[feature] = 'None'
            elif value in ['true', 'yes']:
                data[feature] = 'yes'
            elif value in ['false', 'no']:
                data[feature] = 'no'
            else:
                data[feature] = value_map.get(value, data[feature])
    return data

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

@app.route('/predict', methods=['POST'])
@app.route('/api/predict-flare', methods=['POST'])
def predict():
    try:
        # Get data from request
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate input
        is_valid, error_msg = validate_input(data)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
        
        # Normalize categorical values
        data = normalize_categorical_values(data)
        
        # Convert to DataFrame
        df = pd.DataFrame([data])
        
        # Print data before prediction
        logger.info("\nNormalized data:")
        logger.info(df[list(VALID_CATEGORIES.keys())])
        
        # Check if model is loaded
        if model is None:
            return jsonify({"error": "Model not initialized"}), 500
        
        # Make prediction
        prediction = model.predict(df)
        
        return jsonify(prediction)
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze user's health trends"""
    try:
        data = request.get_json()
        if not data or 'user_id' not in data:
            return jsonify({"error": "user_id is required"}), 400
            
        # Check if model is loaded
        if model is None:
            return jsonify({"error": "Model not initialized"}), 500
            
        # Get user's recent predictions
        predictions = model.db_handler.get_predictions(limit=30, user_id=data['user_id'])
        
        if predictions is None or len(predictions) == 0:
            return jsonify({
                "error": "No data available for analysis",
                "flare_risk_trend": [],
                "avg_flare_risk": 0.0,
                "highest_risk_day": None,
                "risk_increasing": False,
                "recommendations": ["Start logging your daily health data to receive personalized insights."],
                "total_records": 0
            })
        
        # Calculate trends and statistics
        risk_scores = predictions['probability'].tolist()
        avg_risk = sum(risk_scores) / len(risk_scores)
        risk_increasing = risk_scores[-1] > avg_risk if risk_scores else False
        
        highest_risk_idx = risk_scores.index(max(risk_scores))
        highest_risk_day = predictions.iloc[highest_risk_idx].to_dict()
        
        # Generate recommendations based on trends
        recommendations = []
        if risk_increasing:
            recommendations.append("Your flare risk has been increasing. Consider consulting your healthcare provider.")
        if avg_risk > 0.7:
            recommendations.append("Your average flare risk is high. Review your medication adherence and lifestyle factors.")
        if len(predictions) < 7:
            recommendations.append("Keep logging your daily health data for more accurate predictions.")
            
        return jsonify({
            "flare_risk_trend": risk_scores,
            "avg_flare_risk": avg_risk,
            "highest_risk_day": highest_risk_day,
            "risk_increasing": risk_increasing,
            "recommendations": recommendations,
            "total_records": len(predictions)
        })
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/statistics', methods=['GET'])
def statistics():
    try:
        if model is None:
            return jsonify({"error": "Model not initialized"}), 500
            
        days = request.args.get('days', default=30, type=int)
        stats = model.db_handler.get_flare_statistics(days)
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Statistics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/recent-predictions', methods=['GET'])
def recent_predictions():
    try:
        if model is None:
            return jsonify({"error": "Model not initialized"}), 500
            
        limit = request.args.get('limit', default=100, type=int)
        predictions = model.db_handler.get_predictions(limit)
        return jsonify(predictions.to_dict('records') if predictions is not None else [])
    except Exception as e:
        logger.error(f"Recent predictions error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 