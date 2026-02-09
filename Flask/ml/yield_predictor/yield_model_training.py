import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# -----------------------------
# Step 0: Paths relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'synthetic_crop_yield_dataset_full.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'crop_yield_model.pkl')
FEATURE_PATH = os.path.join(BASE_DIR, 'feature_columns.pkl')

# -----------------------------
# Step 1: Load your dataset
df = pd.read_csv(CSV_PATH)

# Ensure all crop labels are lowercased
df['label'] = df['label'].str.lower()

# -----------------------------
# Step 2: One-hot encode crops
CROP_COLUMNS = [f'label_{crop}' for crop in df['label'].unique()]
df_encoded = pd.get_dummies(df, columns=['label'], dtype=int)

# -----------------------------
# Step 3: Split features and target
X = df_encoded.drop(columns=['yield'])
y = df_encoded['yield']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Save the feature order for future predictions
FEATURE_COLUMNS = X_train.columns

# -----------------------------
# Step 4: Train Random Forest Regressor
rf_model = RandomForestRegressor(n_estimators=200, random_state=42)
rf_model.fit(X_train, y_train)

# -----------------------------
# Step 5: Save model and feature order
joblib.dump(rf_model, MODEL_PATH)
joblib.dump(FEATURE_COLUMNS, FEATURE_PATH)
print(f"Model saved at {MODEL_PATH}")
print(f"Feature columns saved at {FEATURE_PATH}")

# -----------------------------
# Step 6: Prediction function for multiple crops
NUMERIC_FEATURES = ['N','P','K','temperature','humidity','ph','rainfall','soil_moisture','sunlight_hours','farm_size']

def predict_yield_for_crops(numeric_input, crops):
    """
    numeric_input: list of 10 numeric features
    crops: list of crop names
    Returns a dict {crop_name: predicted_yield}
    """
    if len(numeric_input) != len(NUMERIC_FEATURES):
        raise ValueError(f"Numeric input must have {len(NUMERIC_FEATURES)} elements")
    
    # Load model and feature order
    model = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURE_PATH)
    
    results = {}
    
    for crop_name in crops:
        crop_name = crop_name.lower()
        user_input = {feat: val for feat, val in zip(NUMERIC_FEATURES, numeric_input)}

        # Initialize all one-hot crop columns to 0
        for col in CROP_COLUMNS:
            user_input[col] = 0

        # Set the selected crop to 1
        crop_col_name = f'label_{crop_name}'
        if crop_col_name not in CROP_COLUMNS:
            raise ValueError(f"Crop '{crop_name}' not recognized.")
        user_input[crop_col_name] = 1

        # Convert to DataFrame and reorder columns
        import pandas as pd
        df_input = pd.DataFrame([user_input])
        df_input = df_input[feature_columns]

        # Predict
        predicted_yield = model.predict(df_input)[0]
        results[crop_name] = round(predicted_yield, 3)

    return results
