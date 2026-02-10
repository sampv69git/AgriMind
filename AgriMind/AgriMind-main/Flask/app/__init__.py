# Flask/app/__init__.py

import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid
import logging

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

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # -----------------------------
    # Database configuration
    # -----------------------------
    database_url = os.environ.get("DATABASE_URL")

    if not database_url:
        logger.warning("DATABASE_URL not set, using local SQLite")
        database_url = "sqlite:///agrimind.db"

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
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
        data = request.get_json() or {}

        try:
            X = [[
                float(data["N"]),
                float(data["P"]),
                float(data["K"]),
                float(data["temperature"]),
                float(data["rainfall"]),
                float(data["pH"]),
                float(data["humidity"]),
            ]]
        except Exception:
            return jsonify({"error": "Invalid input values"}), 400

        crops = predict_top_crops_from_features(X)
        response = [{"crop": c, "prob": float(p)} for c, p in crops]

        history.append({
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "recommendations": response
        })

        return jsonify(response), 200

    @app.route("/predict_yield", methods=["POST"])
    def predict_yield():
        data = request.get_json() or {}

        numeric_features = data.get("numeric_features")
        crops = data.get("crops")

        if not numeric_features or not crops:
            return jsonify({"error": "Missing inputs"}), 400

        predictions = predict_yield_for_crops(numeric_features, crops)
        return jsonify({"yield_predictions": predictions}), 200

    @app.route("/history")
    def get_history():
        return jsonify(history), 200

    @app.route("/api/weather", methods=["POST"])
    def weather():
        d = request.get_json() or {}
        return jsonify(fetch_weather_data(
            float(d.get("latitude", 18.5204)),
            float(d.get("longitude", 73.8567))
        ))

    @app.route("/api/soil", methods=["POST"])
    def soil():
        d = request.get_json() or {}
        return jsonify(fetch_soil_data(
            float(d.get("latitude", 18.5204)),
            float(d.get("longitude", 73.8567))
        ))

    return app


# Gunicorn entry point
app = create_app()
