# Flask/app/__init__.py

import os
import uuid
import logging
from datetime import datetime

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

from .database import db
from .services import fetch_weather_data, fetch_soil_data

from ml.crop_recommender.predict import predict_top_crops_from_features
from ml.yield_predictor.yield_model_training import predict_yield_for_crops

# -----------------------------
# In-memory history storage
# -----------------------------
history = []


def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app)

    # -----------------------------
    # Logging
    # -----------------------------
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # -----------------------------
    # Database configuration
    # -----------------------------
    database_url = os.environ.get("DATABASE_URL")

    if database_url:
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    else:
        # Local fallback only
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///agrimind.db"

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")

    db.init_app(app)

    # -----------------------------
    # Routes
    # -----------------------------
    @app.route("/")
    def home():
        return jsonify({"message": "AgriMind API is running"}), 200

    @app.route("/predict", methods=["POST"])
    def predict():
        try:
            data = request.get_json() or {}

            N = float(data.get("N"))
            P = float(data.get("P"))
            K = float(data.get("K"))
            pH = float(data.get("pH"))
            temperature = float(data.get("temperature"))
            humidity = float(data.get("humidity"))
            rainfall = float(data.get("rainfall"))

            X = [[N, P, K, temperature, rainfall, pH, humidity]]

            top_crops = predict_top_crops_from_features(X)
            response = [{"crop": crop, "prob": prob} for crop, prob in top_crops]

            history.append({
                "_id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "recommendations": response
            })

            return jsonify(response), 200

        except Exception as e:
            logger.exception("Prediction error")
            return jsonify({"error": str(e)}), 400

    @app.route("/predict_yield", methods=["POST"])
    def predict_yield():
        try:
            data = request.get_json() or {}
            numeric_features = data.get("numeric_features")
            crops = data.get("crops")

            if not numeric_features or not crops:
                return jsonify({"error": "Missing numeric_features or crops"}), 400

            predictions = predict_yield_for_crops(numeric_features, crops)

            history.append({
                "_id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "yield_predictions": predictions
            })

            return jsonify({"yield_predictions": predictions}), 200

        except Exception as e:
            logger.exception("Yield prediction error")
            return jsonify({"error": str(e)}), 400

    @app.route("/history", methods=["GET"])
    def get_history():
        return jsonify(history), 200

    @app.route("/api/weather", methods=["POST"])
    def get_weather():
        data = request.json or {}
        latitude = float(data.get("latitude", 18.5204))
        longitude = float(data.get("longitude", 73.8567))

        return jsonify(fetch_weather_data(latitude, longitude)), 200

    @app.route("/api/soil", methods=["POST"])
    def get_soil():
        data = request.json or {}
        latitude = float(data.get("latitude", 18.5204))
        longitude = float(data.get("longitude", 73.8567))

        return jsonify(fetch_soil_data(latitude, longitude)), 200

    @app.route("/api/ai/ask", methods=["POST"])
    def ai_ask():
        body = request.get_json() or {}
        question = (body.get("question") or "").strip()

        if not question:
            return jsonify({"error": "Missing question"}), 400

        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            return jsonify({"error": "Missing AI API key"}), 500

        import requests

        prompt = f"""
You are AgriMind's agriculture assistant.
Give clear, safe, practical advice.

Question:
{question}
"""

        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}]
        }

        r = requests.post(url, json=payload, timeout=30)
        if r.status_code != 200:
            return jsonify({"error": "AI request failed"}), 502

        text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        return jsonify({"text": text})

    # -----------------------------
    # Blueprints
    # -----------------------------
    from .routes import main
    app.register_blueprint(main)

    # 🚫 IMPORTANT:
    # ❌ NO db.create_all() HERE (Render will crash)
    # Use migrations or manual init later

    return app


# -----------------------------
# Gunicorn entrypoint
# -----------------------------
app = create_app()


# -----------------------------
# Local development only
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
