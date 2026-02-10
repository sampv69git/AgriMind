# File: Flask/app/__init__.py

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

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # =========================================================
    # DATABASE CONFIG (RENDER + LOCAL SAFE)
    # =========================================================
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        # Fix deprecated postgres://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace(
                "postgres://", "postgresql://", 1
            )

        # FORCE SSL for Render Postgres
        if "sslmode" not in database_url:
            database_url += "?sslmode=require"

        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
        logger.info("Using PostgreSQL database with SSL")

    else:
        # Local fallback
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///agrimind.db"
        logger.warning("DATABASE_URL not set, using SQLite")

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

    db.init_app(app)

    # =========================================================
    # ROUTES
    # =========================================================

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

            top_crops = predict_top_crops_from_features(X)
            response = [{"crop": c, "prob": p} for c, p in top_crops]

            history.append({
                "_id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "recommendations": response,
            })

            return jsonify(response), 200

        except Exception as e:
            logger.exception("Prediction failed")
            return jsonify({"error": str(e)}), 400

    @app.route("/predict_yield", methods=["POST"])
    def predict_yield():
        data = request.get_json() or {}

        try:
            predictions = predict_yield_for_crops(
                data["numeric_features"],
                data["crops"]
            )
            return jsonify({"yield_predictions": predictions}), 200

        except Exception as e:
            logger.exception("Yield prediction failed")
            return jsonify({"error": str(e)}), 400

    @app.route("/history", methods=["GET"])
    def get_history():
        return jsonify(history), 200

    @app.route("/api/weather", methods=["POST"])
    def weather():
        d = request.json or {}
        return jsonify(
            fetch_weather_data(
                float(d.get("latitude", 18.5204)),
                float(d.get("longitude", 73.8567)),
            )
        ), 200

    @app.route("/api/soil", methods=["POST"])
    def soil():
        d = request.json or {}
        return jsonify(
            fetch_soil_data(
                float(d.get("latitude", 18.5204)),
                float(d.get("longitude", 73.8567)),
            )
        ), 200

    # =========================================================
    # BLUEPRINTS
    # =========================================================
    from .routes import main
    app.register_blueprint(main)

    # =========================================================
    # DB INIT (SAFE)
    # =========================================================
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception:
            logger.exception("Database init failed")
            raise

    return app


# REQUIRED FOR RENDER / GUNICORN
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
