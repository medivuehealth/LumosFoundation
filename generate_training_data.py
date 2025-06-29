import os
from data_collector import IBDDataCollector
import json
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    try:
        # Initialize data collector
        collector = IBDDataCollector()
        
        # Generate synthetic dataset
        print("Generating synthetic dataset...")
        collector.generate_and_store_dataset(num_samples=5000)
        
        # Get and display statistics
        print("\nCalculating dataset statistics...")
        stats = collector.get_dataset_statistics()
        
        print("\nDataset Statistics:")
        print("-" * 50)
        print(f"Total records: {stats.get('total_predictions', 0)}")
        print(f"Total flares: {stats.get('total_flares', 0)}")
        print(f"Average flare probability: {stats.get('avg_flare_probability', 0):.2%}")
        print(f"Unique patients: {stats.get('unique_patients', 0)}")
        print("\nClinical Metrics:")
        print(f"Average pain severity: {stats.get('avg_pain_severity', 0):.2f}/10")
        print(f"Average daily bowel movements: {stats.get('avg_bowel_frequency', 0):.1f}")
        print(f"Medication adherence rate: {stats.get('medication_usage', 0):.2%}")
        
        print("\nCommon Pain Locations:")
        for location, count in stats.get('common_pain_locations', {}).items():
            print(f"- {location}: {count}")
        
        # Save statistics to file
        stats_file = Path(__file__).parent / 'data' / 'dataset_statistics.json'
        os.makedirs(os.path.dirname(stats_file), exist_ok=True)
        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2)
        print(f"\nStatistics saved to {stats_file}")
        
    except Exception as e:
        logger.error(f"Error generating training data: {str(e)}")
        raise

if __name__ == "__main__":
    main() 