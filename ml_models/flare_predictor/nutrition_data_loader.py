import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import DictCursor
import requests
from bs4 import BeautifulSoup
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime
from config import DB_CONFIG

# Configure logging
logging.basicConfig(
    filename='logs/nutrition_data_loader.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class NutritionDataLoader:
    def __init__(self, db_config: Dict):
        """Initialize the nutrition data loader with database connection."""
        self.db_config = db_config
        self.sources = {
            'usda': 'https://api.nal.usda.gov/fdc/v1',
            'pubmed': 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
        }
        
        # Create schema if it doesn't exist
        self._create_schema()
        
    def get_connection(self):
        """Create and return a database connection."""
        try:
            return psycopg2.connect(**self.db_config)
        except psycopg2.Error as e:
            logger.error(f"Error connecting to PostgreSQL: {e}")
            raise
        
    def _create_schema(self):
        """Create the database schema if it doesn't exist."""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Create nutrition schema
                    cursor.execute("CREATE SCHEMA IF NOT EXISTS nutrition;")
                    
                    # Create food items table
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS nutrition.food_items (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(200) NOT NULL,
                            category VARCHAR(100),
                            calories FLOAT,
                            protein_g FLOAT,
                            carbs_g FLOAT,
                            fiber_g FLOAT,
                            fat_g FLOAT,
                            ibd_friendly BOOLEAN,
                            fodmap_level VARCHAR(50),
                            preparation_methods TEXT[],
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """)
                    
                    # Create research guidelines table
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS nutrition.research_guidelines (
                            id SERIAL PRIMARY KEY,
                            title VARCHAR(200) NOT NULL,
                            source VARCHAR(200),
                            publication_date DATE,
                            evidence_level VARCHAR(50),
                            recommendations TEXT[],
                            contraindications TEXT[],
                            study_links TEXT[],
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """)
                    
                    conn.commit()
                    logger.info("Database schema created successfully")
                    
        except psycopg2.Error as e:
            logger.error(f"Error creating database schema: {e}")
            raise
        
    def fetch_usda_nutrition_data(self, api_key: str, food_list: List[str]) -> pd.DataFrame:
        """Fetch nutrition data from USDA database."""
        nutrition_data = []
        
        for food in food_list:
            try:
                # Search for food in USDA database
                search_url = f"{self.sources['usda']}/foods/search?api_key={api_key}&query={food}"
                response = requests.get(search_url)
                data = response.json()
                
                if 'foods' in data and data['foods']:
                    food_item = data['foods'][0]  # Take the first match
                    nutrients = {
                        'name': food_item.get('description', ''),
                        'category': food_item.get('foodCategory', ''),
                        'calories': self._extract_nutrient(food_item, 'Energy'),
                        'protein_g': self._extract_nutrient(food_item, 'Protein'),
                        'carbs_g': self._extract_nutrient(food_item, 'Carbohydrate'),
                        'fiber_g': self._extract_nutrient(food_item, 'Fiber'),
                        'fat_g': self._extract_nutrient(food_item, 'Total lipid (fat)'),
                        'ibd_friendly': True,  # Default to True for our curated list
                        'fodmap_level': 'unknown'  # Would need additional data source
                    }
                    nutrition_data.append(nutrients)
                    logger.info(f"Successfully fetched nutrition data for {food}")
                    
            except Exception as e:
                logger.error(f"Error fetching USDA data for {food}: {str(e)}")
                
        return pd.DataFrame(nutrition_data)
    
    def fetch_ibd_research_data(self, num_articles: int = 100) -> List[Dict]:
        """Fetch IBD nutrition research data from PubMed."""
        research_data = []
        
        try:
            # Search for IBD nutrition articles
            search_query = "inflammatory bowel disease nutrition diet therapy"
            search_url = f"{self.sources['pubmed']}/esearch.fcgi?db=pubmed&term={search_query}&retmax={num_articles}&format=json"
            response = requests.get(search_url)
            data = response.json()
            
            if 'esearchresult' in data and 'idlist' in data['esearchresult']:
                for pmid in data['esearchresult']['idlist']:
                    # Fetch article details
                    details_url = f"{self.sources['pubmed']}/esummary.fcgi?db=pubmed&id={pmid}&format=json"
                    details_response = requests.get(details_url)
                    article_data = details_response.json()
                    
                    if 'result' in article_data and pmid in article_data['result']:
                        article = article_data['result'][pmid]
                        # Convert date to PostgreSQL format (YYYY-MM-DD)
                        pub_date = article.get('pubdate', '')
                        try:
                            # Parse the date string into a datetime object
                            if pub_date:
                                # Handle various date formats
                                date_formats = [
                                    "%Y %b %d",    # 2024 Mar 15
                                    "%Y %B %d",    # 2024 March 15
                                    "%Y %b",       # 2024 Mar
                                    "%Y %B",       # 2024 March
                                    "%b %Y",       # Mar 2024
                                    "%B %Y",       # March 2024
                                    "%Y-%m-%d",    # 2024-03-15
                                    "%Y/%m/%d",    # 2024/03/15
                                    "%d %b %Y",    # 15 Mar 2024
                                    "%d %B %Y",    # 15 March 2024
                                    "%Y"           # 2024
                                ]
                                parsed_date = None
                                
                                # Try to parse with each format
                                for fmt in date_formats:
                                    try:
                                        parsed_date = datetime.strptime(pub_date.strip(), fmt)
                                        break
                                    except ValueError:
                                        continue
                                
                                if parsed_date:
                                    # Format date as YYYY-MM-DD
                                    if fmt == "%Y":
                                        # If only year was provided, use January 1st
                                        pub_date = f"{parsed_date.year}-01-01"
                                    else:
                                        pub_date = parsed_date.strftime("%Y-%m-%d")
                                else:
                                    # Default to first day of current year if date parsing fails
                                    pub_date = datetime.now().strftime("%Y-01-01")
                                    logger.warning(f"Could not parse date '{pub_date}', using default")
                        except Exception as e:
                            logger.warning(f"Error parsing date '{pub_date}': {str(e)}")
                            pub_date = datetime.now().strftime("%Y-01-01")
                        
                        research_data.append({
                            'title': article.get('title', ''),
                            'source': 'PubMed',
                            'publication_date': pub_date,
                            'evidence_level': self._determine_evidence_level(article),
                            'recommendations': self._extract_recommendations(article),
                            'study_links': [f"https://pubmed.ncbi.nlm.nih.gov/{pmid}"]
                        })
                        logger.info(f"Successfully fetched research data for article {pmid}")
                        
        except Exception as e:
            logger.error(f"Error fetching IBD research data: {str(e)}")
            
        return research_data
    
    def load_nutrition_data(self, nutrition_df: pd.DataFrame):
        """Load nutrition data into the database."""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    for _, row in nutrition_df.iterrows():
                        cursor.execute("""
                            INSERT INTO nutrition.food_items 
                            (name, category, calories, protein_g, carbs_g, fiber_g, fat_g, ibd_friendly, fodmap_level)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            row['name'],
                            row['category'],
                            row['calories'],
                            row['protein_g'],
                            row['carbs_g'],
                            row['fiber_g'],
                            row['fat_g'],
                            row['ibd_friendly'],
                            row['fodmap_level']
                        ))
                    conn.commit()
                    logger.info(f"Successfully loaded {len(nutrition_df)} food items")
            
        except psycopg2.Error as e:
            logger.error(f"Error loading nutrition data: {str(e)}")
            raise
            
    def load_research_data(self, research_data: List[Dict]):
        """Load research guidelines into the database."""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    for article in research_data:
                        cursor.execute("""
                            INSERT INTO nutrition.research_guidelines
                            (title, source, publication_date, evidence_level, recommendations, study_links)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (
                            article['title'],
                            article['source'],
                            article['publication_date'],
                            article['evidence_level'],
                            article['recommendations'],
                            article['study_links']
                        ))
                    conn.commit()
                    logger.info(f"Successfully loaded {len(research_data)} research guidelines")
            
        except psycopg2.Error as e:
            logger.error(f"Error loading research data: {str(e)}")
            raise
    
    def _extract_nutrient(self, food_item: Dict, nutrient_name: str) -> float:
        """Extract nutrient value from food item data."""
        if 'nutrients' in food_item:
            for nutrient in food_item['nutrients']:
                if nutrient.get('nutrientName', '') == nutrient_name:
                    return nutrient.get('value', 0.0)
        return 0.0
    
    def _determine_evidence_level(self, article: Dict) -> str:
        """Determine evidence level based on article metadata."""
        # Simple heuristic based on publication type
        pub_types = article.get('publicationtypes', [])
        if 'Randomized Controlled Trial' in pub_types:
            return 'strong'
        elif 'Clinical Trial' in pub_types or 'Meta-Analysis' in pub_types:
            return 'moderate'
        return 'limited'
    
    def _extract_recommendations(self, article: Dict) -> List[str]:
        """Extract dietary recommendations from article abstract."""
        # This is a simplified version - in practice, you'd want to use NLP
        abstract = article.get('abstract', '')
        recommendations = []
        
        # Simple keyword-based extraction
        keywords = ['recommend', 'suggest', 'advise', 'indicate']
        sentences = abstract.split('.')
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in keywords):
                recommendations.append(sentence.strip())
                
        return recommendations

if __name__ == "__main__":
    # Example usage
    db_config = {
        'dbname': 'your_database_name',
        'user': 'your_username',
        'password': 'your_password',
        'host': 'localhost',
        'port': '5432'
    }
    loader = NutritionDataLoader(db_config)
    
    # Example food list
    foods = [
        "salmon", "spinach", "quinoa", "yogurt", "blueberries",
        "sweet potato", "chicken breast", "avocado", "brown rice",
        "kefir", "bone broth", "turmeric", "ginger"
    ]
    
    # Fetch and load nutrition data
    nutrition_data = loader.fetch_usda_nutrition_data("YOUR_USDA_API_KEY", foods)
    loader.load_nutrition_data(nutrition_data)
    
    # Fetch and load research data
    research_data = loader.fetch_ibd_research_data(100)
    loader.load_research_data(research_data) 