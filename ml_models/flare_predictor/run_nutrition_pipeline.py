import os
import logging
from dotenv import load_dotenv
import argparse
from nutrition_data_loader import NutritionDataLoader
from seed_nutrition_data import NutritionDataSeeder
import time
from config import DB_CONFIG

# Configure logging
logging.basicConfig(
    filename='logs/nutrition_pipeline.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_pipeline(usda_api_key: str):
    """Run the complete nutrition data loading pipeline."""
    try:
        # Initialize loader and seeder
        loader = NutritionDataLoader(DB_CONFIG)
        seeder = NutritionDataSeeder(DB_CONFIG)
        
        logger.info("Starting nutrition data pipeline")
        
        # Step 1: Seed initial diet categories and plans
        logger.info("Seeding diet categories and plans...")
        categories_df = seeder.seed_diet_categories()
        if categories_df is not None:
            seeder.seed_diet_plans(categories_df)
        
        # Step 2: Load common IBD-friendly foods
        logger.info("Loading nutrition data for IBD-friendly foods...")
        ibd_friendly_foods = [
            # Proteins
            "salmon", "chicken breast", "turkey breast", "eggs", "tofu",
            # Grains
            "quinoa", "rice", "oats", "sourdough bread",
            # Vegetables
            "spinach", "carrots", "sweet potato", "butternut squash", "zucchini",
            # Fruits
            "banana", "blueberries", "cantaloupe", "honeydew melon",
            # Fermented foods
            "yogurt", "kefir", "miso",
            # Anti-inflammatory
            "turmeric", "ginger", "bone broth"
        ]
        
        nutrition_data = loader.fetch_usda_nutrition_data(usda_api_key, ibd_friendly_foods)
        loader.load_nutrition_data(nutrition_data)
        
        # Step 3: Load IBD nutrition research
        logger.info("Loading IBD nutrition research data...")
        research_data = loader.fetch_ibd_research_data(num_articles=100)
        loader.load_research_data(research_data)
        
        logger.info("Nutrition data pipeline completed successfully")
        
    except Exception as e:
        logger.error(f"Error in nutrition pipeline: {str(e)}")
        raise

def main():
    """Main function to run the pipeline with retry logic."""
    parser = argparse.ArgumentParser(description='Run the nutrition data pipeline')
    parser.add_argument('--usda-api-key', type=str, required=True,
                      help='USDA API key')
    parser.add_argument('--max-retries', type=int, default=3,
                      help='Maximum number of retry attempts')
    parser.add_argument('--retry-delay', type=int, default=5,
                      help='Delay between retries in seconds')
    
    args = parser.parse_args()
    
    for attempt in range(args.max_retries):
        try:
            run_pipeline(args.usda_api_key)
            break
        except Exception as e:
            if attempt < args.max_retries - 1:
                logger.warning(f"Attempt {attempt + 1} failed. Retrying in {args.retry_delay} seconds...")
                time.sleep(args.retry_delay)
            else:
                logger.error("All attempts failed. Pipeline execution unsuccessful.")
                raise

if __name__ == "__main__":
    main() 