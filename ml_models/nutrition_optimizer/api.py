from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime, timedelta
from .model import NutritionOptimizer
from .db_handler import get_db_connection

app = Flask(__name__)
CORS(app)

# Initialize nutrition optimizer
optimizer = NutritionOptimizer()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/optimize', methods=['POST'])
def optimize_meal():
    """Get meal optimization recommendations"""
    try:
        data = request.json
        required_fields = ['user_id', 'meal_type']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Get current flare risk if available
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT prediction_value, probability
            FROM predictions
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (data['user_id'],))
        
        prediction = cursor.fetchone()
        flare_risk = prediction[1] if prediction else 0.0
        
        # Get meal recommendations
        recommendations = optimizer.optimize_meal(
            user_id=data['user_id'],
            meal_type=data['meal_type'],
            timestamp=datetime.now(),
            flare_risk=flare_risk
        )
        
        return jsonify(recommendations), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/analyze_patterns', methods=['GET'])
def analyze_patterns():
    """Analyze meal patterns for a user"""
    try:
        user_id = request.args.get('user_id', type=int)
        days = request.args.get('days', default=30, type=int)
        
        if not user_id:
            return jsonify({'error': 'Missing user_id parameter'}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get meal logs
        cursor.execute("""
            SELECT meal_type, meal_content, nutrition, timestamp,
                   p.prediction_value as flare_risk
            FROM meal_logs m
            LEFT JOIN predictions p ON m.user_id = p.user_id
                AND DATE(m.timestamp) = DATE(p.created_at)
            WHERE m.user_id = ?
            AND m.timestamp >= datetime('now', ?)
            ORDER BY m.timestamp DESC
        """, (user_id, f'-{days} days'))
        
        meal_logs = cursor.fetchall()
        
        # Convert to list of dictionaries
        logs = [{
            'meal_type': log[0],
            'meal_content': log[1],
            'nutrition': json.loads(log[2]),
            'timestamp': log[3],
            'flare_risk': log[4]
        } for log in meal_logs]
        
        # Analyze patterns
        analysis = optimizer.analyze_meal_patterns(logs, days_back=days)
        
        return jsonify(analysis), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/update_targets', methods=['POST'])
def update_targets():
    """Update nutrition targets for a user"""
    try:
        data = request.json
        required_fields = ['user_id', 'targets']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        optimizer.update_patient_targets(
            user_id=data['user_id'],
            new_targets=data['targets']
        )
        
        return jsonify({'message': 'Targets updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/train', methods=['POST'])
def train_model():
    """Train the nutrition optimizer model"""
    try:
        data = request.json
        required_fields = ['user_id']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get meal logs and outcomes
        cursor.execute("""
            SELECT m.*, p.prediction_value as flare_risk,
                   f.actual_flare, f.severity
            FROM meal_logs m
            LEFT JOIN predictions p ON m.user_id = p.user_id
                AND DATE(m.timestamp) = DATE(p.created_at)
            LEFT JOIN flare_outcomes f ON p.id = f.prediction_id
            WHERE m.user_id = ?
            ORDER BY m.timestamp DESC
        """, (data['user_id'],))
        
        training_data = cursor.fetchall()
        
        # Convert to appropriate format
        meal_logs = [{
            'meal_type': row[2],
            'meal_content': row[3],
            'nutrition': json.loads(row[4]),
            'timestamp': row[8],
            'flare_risk': row[9]
        } for row in training_data]
        
        outcomes = [{
            'actual_flare': row[10],
            'severity': row[11]
        } for row in training_data if row[10] is not None]
        
        # Train model
        optimizer.train(meal_logs, outcomes)
        
        # Save model
        optimizer.save_model(f'models/nutrition_optimizer_{data["user_id"]}.joblib')
        
        return jsonify({'message': 'Model trained successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5002) 