"""Test script for the flare prediction API endpoints using mocked responses"""

import unittest
from unittest.mock import patch, MagicMock
import json
import logging
import sys
from datetime import datetime
import pandas as pd
from app import app  # Import the Flask app

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class TestFlareAPI(unittest.TestCase):
    """Test cases for the Flare Prediction API"""

    def setUp(self):
        """Set up test client and test data"""
        self.app = app.test_client()
        self.test_cases = [
            {
                "name": "Healthy day",
                "data": {
                    "calories": 2000,
                    "protein": 80,
                    "carbs": 250,
                    "fiber": 25,
                    "has_allergens": False,
                    "meals_per_day": 3,
                    "hydration_level": 8,
                    "bowel_frequency": 2,
                    "bristol_scale": 4,
                    "urgency_level": 2,
                    "blood_present": False,
                    "pain_location": "none",
                    "pain_severity": 1,
                    "pain_time": "none",
                    "medication_taken": True,
                    "medication_type": "maintenance",
                    "dosage_level": "standard",
                    "sleep_hours": 8,
                    "stress_level": 3,
                    "menstruation": False,
                    "fatigue_level": 2
                }
            },
            {
                "name": "High risk day",
                "data": {
                    "calories": 1200,
                    "protein": 40,
                    "carbs": 150,
                    "fiber": 10,
                    "has_allergens": True,
                    "meals_per_day": 2,
                    "hydration_level": 4,
                    "bowel_frequency": 6,
                    "bristol_scale": 6,
                    "urgency_level": 8,
                    "blood_present": True,
                    "pain_location": "abdomen",
                    "pain_severity": 7,
                    "pain_time": "morning",
                    "medication_taken": True,
                    "medication_type": "emergency",
                    "dosage_level": "increased",
                    "sleep_hours": 5,
                    "stress_level": 8,
                    "menstruation": True,
                    "fatigue_level": 8
                }
            }
        ]

    def test_health_endpoint(self):
        """Test the health check endpoint"""
        try:
            response = self.app.get('/health')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(data["status"], "healthy")
            logger.info("✓ Health check endpoint test passed")
        except Exception as e:
            logger.error(f"✗ Health check endpoint test failed: {str(e)}")
            raise

    @patch('app.model')
    def test_prediction_endpoint(self, mock_model):
        """Test the prediction endpoint with various test cases"""
        # Mock model predictions
        mock_model.predict.return_value = {
            'prediction': 1,
            'probability': 0.85,
            'interpretation': 'High risk of flare',
            'confidence': '85.0%'
        }

        for test_case in self.test_cases:
            try:
                logger.info(f"\nTesting prediction with {test_case['name']} scenario...")
                
                response = self.app.post(
                    '/predict',
                    json=test_case["data"],
                    content_type='application/json'
                )
                
                self.assertEqual(response.status_code, 200)
                prediction = json.loads(response.data)
                
                # Validate response structure
                self.assertIn("prediction", prediction)
                self.assertIn("probability", prediction)
                self.assertIn("interpretation", prediction)
                self.assertIn("confidence", prediction)
                
                # Log prediction details
                logger.info(f"Prediction result for {test_case['name']}:")
                logger.info(f"- Flare prediction: {prediction['prediction']}")
                logger.info(f"- Confidence: {prediction['confidence']}")
                logger.info(f"- Interpretation: {prediction['interpretation']}")
                
                logger.info(f"✓ {test_case['name']} test passed")
                
            except Exception as e:
                logger.error(f"✗ {test_case['name']} test failed: {str(e)}")
                raise

    @patch('app.model')
    def test_analyze_endpoint(self, mock_model):
        """Test the analyze endpoint"""
        try:
            # Mock database response
            mock_predictions = pd.DataFrame({
                'probability': [0.2, 0.4, 0.6, 0.8],
                'timestamp': pd.date_range(start='2024-01-01', periods=4),
                'pain_severity': [2, 4, 6, 8],
                'bowel_frequency': [2, 3, 4, 5]
            })
            mock_model.db_handler.get_predictions.return_value = mock_predictions

            test_data = {
                "user_id": "test_user_123"
            }
            
            response = self.app.post(
                '/analyze',
                json=test_data,
                content_type='application/json'
            )
            
            self.assertEqual(response.status_code, 200)
            analysis = json.loads(response.data)
            
            # Validate response structure
            self.assertIn("flare_risk_trend", analysis)
            self.assertIn("avg_flare_risk", analysis)
            self.assertIn("highest_risk_day", analysis)
            self.assertIn("risk_increasing", analysis)
            self.assertIn("recommendations", analysis)
            
            logger.info("\nAnalysis results:")
            logger.info(f"- Average flare risk: {analysis.get('avg_flare_risk', 0):.2f}")
            logger.info(f"- Risk increasing: {analysis.get('risk_increasing', False)}")
            logger.info(f"- Total records analyzed: {analysis.get('total_records', 0)}")
            
            logger.info("✓ Analysis endpoint test passed")
            
        except Exception as e:
            logger.error(f"✗ Analysis endpoint test failed: {str(e)}")
            raise

    def test_invalid_inputs(self):
        """Test API handling of invalid inputs"""
        invalid_test_cases = [
            {
                "name": "Missing required fields",
                "data": {
                    "calories": 2000,
                    "protein": 80
                }
            },
            {
                "name": "Invalid numeric ranges",
                "data": {
                    "calories": 2000,
                    "protein": 80,
                    "carbs": 250,
                    "fiber": 25,
                    "has_allergens": False,
                    "meals_per_day": 3,
                    "hydration_level": 15,  # Invalid: should be 0-10
                    "bowel_frequency": 2,
                    "bristol_scale": 9,  # Invalid: should be 1-7
                    "urgency_level": 2,
                    "blood_present": False,
                    "pain_location": "none",
                    "pain_severity": 12,  # Invalid: should be 0-10
                    "pain_time": "none",
                    "medication_taken": True,
                    "medication_type": "maintenance",
                    "dosage_level": "standard",
                    "sleep_hours": 8,
                    "stress_level": 3,
                    "menstruation": False,
                    "fatigue_level": 2
                }
            }
        ]

        for test_case in invalid_test_cases:
            try:
                logger.info(f"\nTesting invalid input: {test_case['name']}")
                
                response = self.app.post(
                    '/predict',
                    json=test_case["data"],
                    content_type='application/json'
                )
                
                # Should return 400 Bad Request
                self.assertEqual(response.status_code, 400)
                error_response = json.loads(response.data)
                
                self.assertIn("error", error_response)
                
                logger.info(f"✓ {test_case['name']} test passed")
                logger.info(f"Error message: {error_response.get('error', '')}")
                
            except Exception as e:
                logger.error(f"✗ {test_case['name']} test failed: {str(e)}")
                raise

if __name__ == '__main__':
    unittest.main() 