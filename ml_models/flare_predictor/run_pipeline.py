"""Script to run the IBD Flare Predictor data pipeline"""

import asyncio
import logging
import json
from datetime import datetime
from pathlib import Path
from pipeline import DataPipeline
from config.settings import DATA_DIR

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(DATA_DIR / 'pipeline.log')
    ]
)

logger = logging.getLogger(__name__)

async def main():
    """Run the data pipeline"""
    try:
        # Initialize pipeline
        pipeline = DataPipeline()
        
        # Run pipeline
        results = await pipeline.run(synthetic_count=100)
        
        # Save results
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        results_file = DATA_DIR / f'pipeline_results_{timestamp}.json'
        
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        if results['status'] == 'success':
            logger.info(f"Pipeline completed successfully in {results['duration']:.2f} seconds")
            logger.info(f"Results saved to {results_file}")
            
            # Log statistics
            stats = results['statistics']
            logger.info("\nPipeline Statistics:")
            
            logger.info("\nRaw Data:")
            for key, values in stats['raw_data'].items():
                logger.info(f"  {key}:")
                for metric, value in values.items():
                    logger.info(f"    {metric}: {value}")
            
            logger.info("\nProcessed Data:")
            for key, values in stats['processed_data'].items():
                logger.info(f"  {key}:")
                for metric, value in values.items():
                    logger.info(f"    {metric}: {value}")
            
            logger.info("\nValidation Summary:")
            for key, values in stats['validated_data'].items():
                logger.info(f"  {key}:")
                if isinstance(values, dict):
                    for metric, value in values.items():
                        logger.info(f"    {metric}: {value}")
                else:
                    logger.info(f"    {values}")
            
            logger.info("\nAnonymized Data:")
            for key, values in stats['anonymized_data'].items():
                logger.info(f"  {key}:")
                for metric, value in values.items():
                    logger.info(f"    {metric}: {value}")
        else:
            logger.error(f"Pipeline failed: {results['error']}")
    
    except Exception as e:
        logger.error(f"Error running pipeline: {str(e)}", exc_info=True)

if __name__ == '__main__':
    asyncio.run(main()) 