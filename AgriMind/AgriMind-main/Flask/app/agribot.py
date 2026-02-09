import os
import requests
from flask import Blueprint, request, jsonify

agribot_bp = Blueprint("agribot", __name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-1.5-flash"
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1/models/"
    f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
)

@agribot_bp.route("/api/agribot", methods=["POST"])
def agribot():
    data = request.get_json()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "Question is required"}), 400

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": question}]
            }
        ]
    }

    try:
        response = requests.post(
            GEMINI_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=20
        )

        if response.status_code != 200:
            return jsonify({
                "error": "Gemini API error",
                "details": response.text
            }), 500

        result = response.json()
        answer = (
            result["candidates"][0]
            ["content"]["parts"][0]["text"]
        )

        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
