import numpy as np
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score, 
    roc_auc_score,
    confusion_matrix
)
import json
from datetime import datetime, timedelta
from .db_handler import get_db_connection

class ModelValidator:
    def __init__(self):
        self.metrics = {}
        self.validation_history = []

    def calculate_metrics(self, y_true, y_pred, y_prob):
        """Calculate all relevant model performance metrics"""
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred),
            'recall': recall_score(y_true, y_pred),
            'f1': f1_score(y_true, y_pred),
            'auc_roc': roc_auc_score(y_true, y_prob),
            'confusion_matrix': confusion_matrix(y_true, y_pred).tolist()
        }
        return metrics

    def get_predictions_data(self, start_date=None, end_date=None):
        """Fetch prediction data from database within date range"""
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT 
                p.prediction_value,
                p.probability,
                p.features_used,
                p.created_at,
                COALESCE(f.actual_flare, NULL) as actual_outcome
            FROM predictions p
            LEFT JOIN flare_outcomes f ON p.id = f.prediction_id
            WHERE 1=1
        """
        params = []

        if start_date:
            query += " AND p.created_at >= ?"
            params.append(start_date)
        if end_date:
            query += " AND p.created_at <= ?"
            params.append(end_date)

        cursor.execute(query, params)
        results = cursor.fetchall()
        conn.close()

        return results

    def analyze_feature_importance(self, predictions_data):
        """Analyze which features are most predictive of flares"""
        feature_correlations = {}
        
        for pred in predictions_data:
            features = json.loads(pred[2])  # features_used column
            actual_outcome = pred[4]
            
            if actual_outcome is not None:  # only analyze verified predictions
                for feature, value in features.items():
                    if isinstance(value, (int, float)):
                        if feature not in feature_correlations:
                            feature_correlations[feature] = {'values': [], 'outcomes': []}
                        feature_correlations[feature]['values'].append(value)
                        feature_correlations[feature]['outcomes'].append(actual_outcome)

        # Calculate correlation coefficients
        correlations = {}
        for feature, data in feature_correlations.items():
            if len(data['values']) > 0:
                correlation = np.corrcoef(data['values'], data['outcomes'])[0, 1]
                correlations[feature] = correlation

        return correlations

    def validate_model(self, days_back=30):
        """Validate model performance using recent predictions"""
        start_date = datetime.now() - timedelta(days=days_back)
        predictions = self.get_predictions_data(start_date=start_date)

        # Separate predictions with known outcomes
        verified_predictions = [(p[0], p[1], p[4]) for p in predictions if p[4] is not None]
        
        if not verified_predictions:
            return {
                'error': 'No verified predictions found in the specified date range',
                'timestamp': datetime.now().isoformat()
            }

        y_true = [p[2] for p in verified_predictions]  # actual outcomes
        y_pred = [p[0] for p in verified_predictions]  # predicted values
        y_prob = [p[1] for p in verified_predictions]  # prediction probabilities

        # Calculate metrics
        metrics = self.calculate_metrics(y_true, y_pred, y_prob)
        
        # Analyze feature importance
        feature_importance = self.analyze_feature_importance(predictions)

        # Calculate prediction bias
        predictions_by_group = {}
        for pred in predictions:
            features = json.loads(pred[2])
            for key, value in features.items():
                if isinstance(value, (int, float)):
                    group = f"{key}_{int(value)}"
                    if group not in predictions_by_group:
                        predictions_by_group[group] = {'total': 0, 'positive': 0}
                    predictions_by_group[group]['total'] += 1
                    if pred[0]:  # if prediction is positive
                        predictions_by_group[group]['positive'] += 1

        # Calculate prediction rates by group
        prediction_rates = {
            group: {
                'positive_rate': data['positive'] / data['total'],
                'count': data['total']
            }
            for group, data in predictions_by_group.items()
            if data['total'] >= 10  # Only include groups with sufficient data
        }

        validation_result = {
            'metrics': metrics,
            'feature_importance': feature_importance,
            'prediction_rates': prediction_rates,
            'total_predictions': len(predictions),
            'verified_predictions': len(verified_predictions),
            'timestamp': datetime.now().isoformat(),
            'validation_period_days': days_back
        }

        # Store validation result
        self.validation_history.append(validation_result)
        
        return validation_result

    def get_validation_history(self):
        """Get historical validation results"""
        return self.validation_history

    def detect_model_drift(self, threshold=0.1):
        """Detect if model performance has degraded"""
        if len(self.validation_history) < 2:
            return {
                'drift_detected': False,
                'message': 'Insufficient validation history for drift detection'
            }

        current = self.validation_history[-1]['metrics']
        previous = self.validation_history[-2]['metrics']

        drift_metrics = {}
        for metric in ['accuracy', 'precision', 'recall', 'f1', 'auc_roc']:
            change = abs(current[metric] - previous[metric])
            drift_metrics[metric] = {
                'current': current[metric],
                'previous': previous[metric],
                'change': change,
                'significant_drift': change > threshold
            }

        significant_drift = any(m['significant_drift'] for m in drift_metrics.values())

        return {
            'drift_detected': significant_drift,
            'metrics_drift': drift_metrics,
            'threshold': threshold,
            'timestamp': datetime.now().isoformat()
        } 