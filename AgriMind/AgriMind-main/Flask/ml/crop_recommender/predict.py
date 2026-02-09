import os
import joblib

# Load trained model and label encoder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "crop_model.pkl")
LE_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")

model = joblib.load(MODEL_PATH)
le = joblib.load(LE_PATH)

def predict_top_crops_from_features(X):
    """
    X: 2D list of feature values
    Returns: list of tuples [(crop_name, probability), ...]
    """
    probs = model.predict_proba(X)[0]  # assuming sklearn classifier with predict_proba
    classes = le.inverse_transform(range(len(probs)))
    top3 = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)[:3]
    return top3

# Optional test
if __name__ == "__main__":
    sample_input = [[90, 40, 30, 28, 1200, 6.5, 85]]  # example
    top3 = predict_top_crops_from_features(sample_input)
    print("Top 3 crop suggestions:")
    for crop, prob in top3:
        print(f"{crop}: {prob*100:.2f}%")
