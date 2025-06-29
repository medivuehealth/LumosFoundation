import unittest
import pandas as pd
import os
from dotenv import load_dotenv
from nutrition_data_loader import NutritionDataLoader
from sqlalchemy import create_engine, text

class TestNutritionDataLoader(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up test environment."""
        load_dotenv()
        
        # Get database connection from environment variables
        cls.db_connection = os.getenv('DATABASE_URL', 'postgresql://username:password@localhost:5432/ibd_flarepredictor')
        cls.usda_api_key = os.getenv('USDA_API_KEY', '')
        
        # Initialize loader
        cls.loader = NutritionDataLoader(cls.db_connection)
        
        # Create test engine
        cls.engine = create_engine(cls.db_connection)
        
    def setUp(self):
        """Set up test data."""
        self.test_foods = ["salmon", "spinach", "quinoa"]
        
    def test_fetch_usda_nutrition_data(self):
        """Test USDA nutrition data fetching."""
        if not self.usda_api_key:
            self.skipTest("USDA API key not available")
            
        nutrition_data = self.loader.fetch_usda_nutrition_data(self.usda_api_key, self.test_foods)
        
        # Check if data was fetched
        self.assertIsInstance(nutrition_data, pd.DataFrame)
        self.assertGreater(len(nutrition_data), 0)
        
        # Check required columns
        required_columns = ['name', 'category', 'calories', 'protein_g', 'carbs_g', 'fiber_g', 'fat_g']
        for column in required_columns:
            self.assertIn(column, nutrition_data.columns)
            
    def test_fetch_ibd_research_data(self):
        """Test IBD research data fetching."""
        research_data = self.loader.fetch_ibd_research_data(num_articles=5)
        
        # Check if data was fetched
        self.assertIsInstance(research_data, list)
        self.assertGreater(len(research_data), 0)
        
        # Check required keys in research data
        required_keys = ['title', 'source', 'publication_date', 'evidence_level', 'recommendations']
        for article in research_data:
            for key in required_keys:
                self.assertIn(key, article)
                
    def test_load_nutrition_data(self):
        """Test loading nutrition data into database."""
        # Create test data
        test_data = pd.DataFrame({
            'name': ['Test Food 1', 'Test Food 2'],
            'category': ['Test Category 1', 'Test Category 2'],
            'calories': [100, 200],
            'protein_g': [10, 20],
            'carbs_g': [15, 25],
            'fiber_g': [5, 8],
            'fat_g': [8, 12]
        })
        
        # Load test data
        self.loader.load_nutrition_data(test_data)
        
        # Verify data was loaded
        with self.engine.connect() as conn:
            result = conn.execute(text(
                "SELECT COUNT(*) FROM nutrition.food_items WHERE name LIKE 'Test Food%'"
            )).scalar()
            
        self.assertEqual(result, 2)
        
    def test_load_research_data(self):
        """Test loading research data into database."""
        # Create test data
        test_data = [
            {
                'title': 'Test Research 1',
                'source': 'Test Source',
                'publication_date': '2023-01-01',
                'evidence_level': 'strong',
                'recommendations': ['Test recommendation 1'],
                'study_links': ['http://test.com/1']
            }
        ]
        
        # Load test data
        self.loader.load_research_data(test_data)
        
        # Verify data was loaded
        with self.engine.connect() as conn:
            result = conn.execute(text(
                "SELECT COUNT(*) FROM nutrition.research_guidelines WHERE title = 'Test Research 1'"
            )).scalar()
            
        self.assertEqual(result, 1)
        
    def tearDown(self):
        """Clean up test data."""
        with self.engine.connect() as conn:
            conn.execute(text("DELETE FROM nutrition.food_items WHERE name LIKE 'Test Food%'"))
            conn.execute(text("DELETE FROM nutrition.research_guidelines WHERE title = 'Test Research 1'"))
            conn.commit()

if __name__ == '__main__':
    unittest.main() 