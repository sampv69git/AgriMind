import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib  # for saving/loading model

# Load datasets
original_df = pd.read_csv("Flask\ml\Crop_recommendation.csv")
synthetic_df = pd.read_csv("Flask\ml\synthetic_missing_crops.csv")

# Combine datasets
data = pd.concat([original_df, synthetic_df], ignore_index=True)

# Features and target
X = data[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = data['label']

# Encode target
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# Train model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Save model and label encoder
joblib.dump(model, "crop_model.pkl")
joblib.dump(le, "label_encoder.pkl")




# Prediction function
def predict_top_crops(model, le, feature_list, k=3):
    """
    Predict top K crops for a given input feature list.
    
    Args:
        model : trained classifier
        le : LabelEncoder
        feature_list : list of features [N, P, K, temperature, humidity, ph, rainfall]
        k : number of top crops to return (default 3)
        
    Returns:
        List of tuples: [(crop_name, probability), ...]
    """
    # Ensure 2D array
    input_array = [feature_list] if isinstance(feature_list[0], (int, float)) else feature_list
    
    # Predict probabilities
    probs = model.predict_proba(input_array)[0]
    
    # Sort by probability descending
    sorted_indices = np.argsort(probs)[::-1]
    
    # Return top K crops
    top_crops = [(le.classes_[idx], round(probs[idx], 3)) for idx in sorted_indices[:k]]
    
    return top_crops