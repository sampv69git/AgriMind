import sys
sys.stdout.reconfigure(encoding="utf-8")

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import logging

from app.models import db
from app.routes import main

# -------------------------------------------------
# APP CONFIG
# -------------------------------------------------
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

# -------------------------------------------------
# SECRET KEY
# -------------------------------------------------
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

# -------------------------------------------------
# DATABASE CONFIG
# -------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres"):
    try:
        import psycopg2  # noqa
        app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    except ImportError:
        logging.warning("PostgreSQL requested but psycopg2 not installed. Using SQLite instead.")
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///agrimind.db"
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///agrimind.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# -------------------------------------------------
# INIT EXTENSIONS
# -------------------------------------------------
db.init_app(app)

# -------------------------------------------------
# REGISTER BLUEPRINTS
# -------------------------------------------------
app.register_blueprint(main)

# -------------------------------------------------
# CREATE DB TABLES
# -------------------------------------------------
with app.app_context():
    db.create_all()
    logging.info("Database tables created successfully")

# -------------------------------------------------
# RUN
# -------------------------------------------------
if __name__ == "__main__":
    logging.info("Starting AgriMind Flask Backend")
    app.run(host="0.0.0.0", port=5000, debug=True)
