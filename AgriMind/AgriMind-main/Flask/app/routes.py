from flask import Blueprint, request, jsonify, render_template, Response
from .storage import dummy_crop_recommendation
from .models import db, User
import logging
import os
import json
import requests

main = Blueprint("main", __name__)
logger = logging.getLogger(__name__)

# =====================================================
# GROQ CONFIG
# =====================================================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

# =====================================================
# BASIC ROUTES
# =====================================================
@main.route("/")
def home():
    return render_template("index.html")


@main.route("/dashboard")
def dashboard():
    return "Welcome to the dashboard!"


# =====================================================
# CROP RECOMMENDATION
# =====================================================
@main.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json() or {}
    soil_type = data.get("soil_type", "loamy")
    weather = data.get("weather", "moderate")
    top = dummy_crop_recommendation(soil_type, weather)
    return jsonify({"recommended_crop": str(top)})


# =====================================================
# AUTH ROUTES
# =====================================================
@main.route("/farmer/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not all([name, email, password]):
            return jsonify({"error": "Missing required fields"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered"}), 400

        user = User(name=name, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "Registration successful"}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(e)
        return jsonify({"error": "Registration failed"}), 500


@main.route("/farmer/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            return jsonify({"message": "Login successful"}), 200

        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        logger.error(e)
        return jsonify({"error": "Login failed"}), 500


@main.route("/farmer/check-auth", methods=["GET"])
def check_auth():
    return jsonify({"status": "ok"}), 200


@main.route("/farmer/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logged out"}), 200


# =====================================================
# 🤖 AGRIBOT (GROQ AI)
# =====================================================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"  # ✅ FIXED

@main.route("/api/agribot", methods=["POST"])
def agribot():
    try:
        data = request.get_json() or {}
        question = data.get("question", "").strip()
        reply_mode = data.get("replyMode", "same")
        user_lang = data.get("userLang", "en")

        if not question:
            return jsonify({"error": "Question required"}), 400

        if not GROQ_API_KEY:
            return jsonify({"error": "Groq API key not configured"}), 500

        system_prompt = (
            "You are AgriBot, an expert agricultural assistant for Indian farmers. "
            "Give simple, practical advice."
        )

        if reply_mode == "english":
            system_prompt += " Respond ONLY in English."
        else:
            system_prompt += f" Respond in the same language as the question ({user_lang})."

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
            "temperature": 0.4,
        }

        r = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )

        if r.status_code != 200:
            # 🔥 show REAL Groq error
            return Response(
                json.dumps({"error": r.text}, ensure_ascii=False),
                mimetype="application/json; charset=utf-8",
                status=500,
            )

        answer = r.json()["choices"][0]["message"]["content"]

        return Response(
            json.dumps({"answer": answer}, ensure_ascii=False),
            mimetype="application/json; charset=utf-8",
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

