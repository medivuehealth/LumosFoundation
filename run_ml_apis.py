#!/usr/bin/env python3
"""
Script to run ML APIs for MediVue Health
"""

import sys
import os
import subprocess
import time
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "ml_models"))
sys.path.insert(0, str(project_root / "ml_models" / "flare_predictor"))
sys.path.insert(0, str(project_root / "ml_models" / "nutrition_optimizer"))

def run_flare_predictor():
    """Run the flare predictor API"""
    print("Starting Flare Predictor API...")
    try:
        # Change to the flare_predictor directory
        os.chdir(project_root / "ml_models" / "flare_predictor")
        
        # Run the API
        subprocess.run([
            sys.executable, "api.py"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running flare predictor: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

def run_nutrition_optimizer():
    """Run the nutrition optimizer API"""
    print("Starting Nutrition Optimizer API...")
    try:
        # Change to the nutrition_optimizer directory
        os.chdir(project_root / "ml_models" / "nutrition_optimizer")
        
        # Run the API
        subprocess.run([
            sys.executable, "api.py"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running nutrition optimizer: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    print("MediVue Health - ML APIs Startup")
    print("=" * 40)
    
    # Run both APIs
    run_flare_predictor()
    run_nutrition_optimizer() 