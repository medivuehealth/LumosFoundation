import pandas as pd
import psycopg2
from psycopg2.extras import DictCursor
import logging
from typing import Dict, List

# Configure logging
logging.basicConfig(
    filename='logs/nutrition_seeder.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class NutritionDataSeeder:
    def __init__(self, db_config: Dict):
        """Initialize the nutrition data seeder with database connection."""
        self.db_config = db_config
        
    def get_connection(self):
        """Create and return a database connection."""
        try:
            return psycopg2.connect(**self.db_config)
        except psycopg2.Error as e:
            logger.error(f"Error connecting to PostgreSQL: {e}")
            raise
        
    def seed_diet_categories(self):
        """Seed initial diet categories for IBD management."""
        categories = [
            {
                'name': 'Low-FODMAP Diet',
                'description': 'A diet low in fermentable oligosaccharides, disaccharides, monosaccharides, and polyols.',
                'evidence_level': 'strong'
            },
            {
                'name': 'Mediterranean Diet',
                'description': 'Plant-based diet rich in omega-3s, fiber, and anti-inflammatory foods.',
                'evidence_level': 'moderate'
            },
            {
                'name': 'Specific Carbohydrate Diet (SCD)',
                'description': 'Eliminates complex carbohydrates and processed foods.',
                'evidence_level': 'moderate'
            },
            {
                'name': 'IBD-AID (Anti-Inflammatory Diet)',
                'description': 'Modified version of SCD with emphasis on prebiotic and probiotic foods.',
                'evidence_level': 'moderate'
            },
            {
                'name': 'Elimination Diet',
                'description': 'Systematic approach to identify food triggers and sensitivities.',
                'evidence_level': 'moderate'
            }
        ]
        
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Insert categories
                    for category in categories:
                        cursor.execute("""
                            INSERT INTO nutrition.diet_categories 
                            (name, description, evidence_level)
                            VALUES (%s, %s, %s)
                            RETURNING id
                        """, (
                            category['name'],
                            category['description'],
                            category['evidence_level']
                        ))
                    conn.commit()
                    
                    # Fetch all categories for return
                    cursor.execute("SELECT * FROM nutrition.diet_categories")
                    results = cursor.fetchall()
                    columns = [desc[0] for desc in cursor.description]
                    df = pd.DataFrame(results, columns=columns)
                    
                    logger.info(f"Successfully seeded {len(categories)} diet categories")
                    return df
                    
        except psycopg2.Error as e:
            logger.error(f"Error seeding diet categories: {str(e)}")
            return None

    def seed_diet_plans(self, categories_df: pd.DataFrame):
        """Seed initial diet plans for each category."""
        # Get category IDs
        category_ids = {}
        for _, row in categories_df.iterrows():
            category_ids[row['name']] = row['id']
        
        diet_plans = [
            {
                'name': 'Low-FODMAP Introduction Phase',
                'category_id': category_ids['Low-FODMAP Diet'],
                'description': 'Initial 2-6 week elimination phase of the Low-FODMAP diet',
                'guidelines': 'Eliminate all high-FODMAP foods initially',
                'restrictions': ['Wheat', 'Dairy', 'Certain fruits', 'Certain vegetables', 'Legumes'],
                'recommendations': ['Rice', 'Quinoa', 'Lean meats', 'Low-FODMAP vegetables', 'Low-FODMAP fruits']
            },
            {
                'name': 'Mediterranean IBD Plan',
                'category_id': category_ids['Mediterranean Diet'],
                'description': 'Modified Mediterranean diet suitable for IBD patients',
                'guidelines': 'Focus on anti-inflammatory foods and healthy fats',
                'restrictions': ['Processed foods', 'Red meat', 'Added sugars'],
                'recommendations': ['Olive oil', 'Fish', 'Whole grains', 'Vegetables', 'Fruits']
            },
            {
                'name': 'SCD Introductory Diet',
                'category_id': category_ids['Specific Carbohydrate Diet (SCD)'],
                'description': 'Initial phase of SCD with limited foods',
                'guidelines': 'Begin with easily digestible foods',
                'restrictions': ['Grains', 'Processed sugars', 'Starchy vegetables'],
                'recommendations': ['Homemade bone broth', 'Cooked carrots', 'Chicken', 'Fish']
            },
            {
                'name': 'IBD-AID Phase 1',
                'category_id': category_ids['IBD-AID (Anti-Inflammatory Diet)'],
                'description': 'First phase of IBD-AID focusing on gut healing',
                'guidelines': 'Focus on well-cooked, pureed foods and probiotics',
                'restrictions': ['Raw vegetables', 'Whole grains', 'Dairy'],
                'recommendations': ['Bone broth', 'Kefir', 'Well-cooked vegetables', 'Lean proteins']
            },
            {
                'name': 'Basic Elimination Protocol',
                'category_id': category_ids['Elimination Diet'],
                'description': 'Standard elimination diet protocol for IBD',
                'guidelines': 'Systematic elimination and reintroduction of food groups',
                'restrictions': ['Common allergens', 'Processed foods', 'Alcohol'],
                'recommendations': ['Rice', 'Turkey', 'Sweet potatoes', 'Cooked vegetables']
            }
        ]
        
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    for plan in diet_plans:
                        cursor.execute("""
                            INSERT INTO nutrition.diet_plans 
                            (name, category_id, description, guidelines, restrictions, recommendations)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (
                            plan['name'],
                            plan['category_id'],
                            plan['description'],
                            plan['guidelines'],
                            plan['restrictions'],
                            plan['recommendations']
                        ))
                    conn.commit()
                    logger.info(f"Successfully seeded {len(diet_plans)} diet plans")
                    
        except psycopg2.Error as e:
            logger.error(f"Error seeding diet plans: {str(e)}")
            raise

def main():
    # Database connection
    db_config = {
        'host': 'localhost',
        'port': '5432',
        'database': 'ibd_flarepredictor',
        'user': 'username',
        'password': 'password'
    }
    seeder = NutritionDataSeeder(db_config)
    
    # Seed categories and get the resulting DataFrame
    categories_df = seeder.seed_diet_categories()
    
    if categories_df is not None:
        # Seed diet plans using the category IDs
        seeder.seed_diet_plans(categories_df)
    else:
        logger.error("Failed to seed diet categories, skipping diet plans")

if __name__ == "__main__":
    main() 