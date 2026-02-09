# File: Flask/app/__init__.py
# 
# FIX 1: Add 'os' import for environment variables
import os 
from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid
from .services import fetch_weather_data , fetch_soil_data 

import logging

from .database import db
# NOTE: The imports below assume the path starts from the directory containing 'Flask'
from ml.crop_recommender.predict import predict_top_crops_from_features
from ml.yield_predictor.yield_model_training import predict_yield_for_crops

# -----------------------------
# In-memory history storage
# -----------------------------
history = []

def create_app():
    # Load variables from .env if present
    load_dotenv()
    app = Flask(__name__)
    CORS(app)

    # Configure logging
    logging.basicConfig(level=logging.DEBUG)
    logger = logging.getLogger(__name__)

    # Database configuration (Render uses the DATABASE_URL environment variable)
    # Use env var if present; otherwise fall back to local SQLite
    # CRITICAL FIX: Use 'DATABASE_URL' as the environment key.
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///agrimind.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # SECRET_KEY must be a string; prefer env var with a safe default
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
    db.init_app(app)

    # -----------------------------
    # Routes Definition
    # -----------------------------
    
    @app.route("/")
    def home():
        return jsonify({"message": "AgriMind API is running"}), 200

    @app.route("/predict", methods=["POST"])
    def predict():
        data = request.get_json() or {}
        try:
            # Type casting inputs
            N = float(data.get("N"))
            P = float(data.get("P"))
            K = float(data.get("K"))
            pH = float(data.get("pH"))
            temperature = float(data.get("temperature"))
            humidity = float(data.get("humidity"))
            rainfall = float(data.get("rainfall"))

            # Create feature array for ML model
            X = [[N, P, K, temperature, rainfall, pH, humidity]] # Adjust order if needed

            try:
                from ml.crop_recommender.predict import predict_top_crops_from_features  # type: ignore
                top_crops = predict_top_crops_from_features(X)
                response = [{"crop": crop, "prob": prob} for crop, prob in top_crops]
            except Exception:
                # Fallback to internal simple recommender
                from .storage import predict_crop
                fallback_recs = predict_crop({
                    "N": N,
                    "P": P,
                    "K": K,
                    "temperature": temperature,
                    "humidity": humidity,
                    "pH": pH,
                    "rainfall": rainfall,
                })
                # Ensure shape is [{crop, prob}]
                if isinstance(fallback_recs, list) and fallback_recs and isinstance(fallback_recs[0], dict):
                    response = fallback_recs
                else:
                    response = [{"crop": str(fallback_recs), "prob": 0.5}]

            history_entry = {
                "_id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "recommendations": response
            }
            history.append(history_entry)
            return jsonify(response), 200
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return jsonify({"error": str(e)}), 400

    @app.route("/predict_yield", methods=["POST"])
    def predict_yield():
        data = request.get_json()
        try:
            numeric_features = data.get("numeric_features")
            crops = data.get("crops")

            if not numeric_features or not crops:
                return jsonify({"error": "Missing 'numeric_features' or 'crops'"}), 400

            if len(numeric_features) != 10:
                return jsonify({"error": f"'numeric_features' must have 10 values, got {len(numeric_features)}"}), 400

            predictions = predict_yield_for_crops(numeric_features, crops)

            history_entry = {
                "_id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "yield_predictions": predictions
            }
            history.append(history_entry)
            return jsonify({"yield_predictions": predictions}), 200

        except Exception as e:
            logger.error(f"Yield prediction error: {e}")
            return jsonify({"error": str(e)}), 400

    @app.route("/history", methods=["GET"])
    def get_history():
        return jsonify(history), 200

    @app.route('/api/weather', methods=['POST'])
    def get_weather():
        data = request.json or {}

        # Accept coordinates; default to Pune, IN if not provided
        latitude = float(data.get('latitude', 18.5204))
        longitude = float(data.get('longitude', 73.8567))

        weather_data = fetch_weather_data(latitude, longitude)

        # Always return whatever we have (real or mock) with 200
        return jsonify(weather_data), 200

    @app.route('/api/soil', methods=['POST'])
    def get_soil():
        data = request.json or {}
        # Accept coordinates; default to Pune, IN if not provided
        latitude = float(data.get('latitude', 18.5204))
        longitude = float(data.get('longitude', 73.8567))
        soil_data = fetch_soil_data(latitude, longitude)
        # Always return whatever we have (real or mock) with 200
        return jsonify(soil_data), 200

    @app.route('/api/ai/ask', methods=['POST'])
    def ai_ask():
        try:
            body = request.get_json() or {}
            question = (body.get('question') or '').strip()
            reply = body.get('reply') or 'same'
            user_lang = body.get('userLang') or ''
            if not question:
                return jsonify({"error": "Missing 'question'"}), 400

            # Read server-side API key
            api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
            if not api_key:
                return jsonify({"error": "Server is missing GEMINI_API_KEY/GOOGLE_API_KEY"}), 500

            env_model = (os.environ.get('GEMINI_MODEL') or '').strip()
            candidates = [
                *( [env_model] if env_model else [] ),
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-1.5-flash-8b',
                'gemini-1.5-flash-002',
                'gemini-1.5-pro-002',
                'gemini-1.0-pro',
                'gemini-pro',
            ]

            language_directive = (
                'Respond in English.' if reply == 'english' else (
                    f"Respond in the user's language: {user_lang}." if user_lang else 'Detect the input language and respond in that same language.'
                )
            )

            prompt = f"""You are AgriMind's voice assistant for farmers.
- Provide clear, practical, and safe agriculture guidance.
- If giving recommendations (e.g., fertilizers, pesticides), include safety, dosage ranges, and advise consulting local experts when needed.
- Be concise: prefer short paragraphs and bullet points.
- If the question is unrelated to agriculture, politely redirect.
- {language_directive}

User question:
{question}
"""

            import requests
            last_err = None
            for model in candidates:
                # Prefer v1 endpoint for better model coverage
                url = f'https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={api_key}'
                payload = {
                    'contents': [
                        {
                            'role': 'user',
                            'parts': [ {'text': prompt} ]
                        }
                    ]
                }
                try:
                    resp = requests.post(url, json=payload, timeout=30)
                    if resp.status_code == 200:
                        data = resp.json()
                        # Extract plain text safely
                        text = ''
                        try:
                            cands = data.get('candidates') or []
                            if cands:
                                parts = (cands[0].get('content') or {}).get('parts') or []
                                if parts:
                                    text = parts[0].get('text', '')
                        except Exception:
                            pass
                        return jsonify({ 'text': text or "Sorry, I couldn't generate an answer right now." })
                    else:
                        msg = resp.text
                        if '404' in str(resp.status_code) or 'not found' in msg.lower():
                            last_err = msg
                            continue
                        # Other errors are returned immediately
                        return jsonify({ 'error': f'Gemini error ({resp.status_code}): {msg}' }), 502
                except Exception as e:
                    last_err = str(e)
                    continue

            return jsonify({ 'error': f'No compatible Gemini model from server. Last: {last_err}' }), 502
        except Exception as e:
            return jsonify({ 'error': str(e) }), 500
    
    # Register blueprints (Note: ensure 'main' is defined in .routes)
    from .routes import main
    app.register_blueprint(main)
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}")
            raise

    return app

# CRITICAL FIX: Instantiate the app so Gunicorn can find the 'app' attribute
# This line MUST be outside of the 'if __name__ == "__main__":' block.
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000) # Changed host to 0.0.0.0 for compatibility
