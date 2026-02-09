import os
import sys

# Add ML folder to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ML_PATH = os.path.join(BASE_DIR, "ml")
sys.path.append(ML_PATH)

try:
    from ml.crop_recommender.predict import predict_top_crops_from_features
except Exception as e:
    print(f"Failed to import crop recommender: {e}")
    predict_top_crops_from_features = None

def dummy_crop_recommendation(soil_type: str, weather: str) -> str:
    soil = (soil_type or '').lower()
    w = (weather or '').lower()
    if 'loam' in soil and 'moderate' in w:
        return 'Wheat'
    if 'clay' in soil and 'rain' in w:
        return 'Rice'
    if 'sandy' in soil:
        return 'Millet'
    return 'Maize'
