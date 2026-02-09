from flask import Blueprint, render_template, request, jsonify, render_template
from .storage import dummy_crop_recommendation
from .models import db, User
import logging

main = Blueprint('main', __name__)
logger = logging.getLogger(__name__)

@main.route("/")
def home():
    return render_template("index.html")

@main.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json() or {}
    # Simple recommendation based on soil and weather only
    soil_type = data.get("soil_type", "loamy")
    weather = data.get("weather", "moderate")
    top = dummy_crop_recommendation(soil_type, weather)
    return jsonify({"recommended_crop": str(top)})
@main.route('/farmer/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        logger.debug(f"Registration attempt: {email}")
        
        if not all([name, email, password]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        new_user = User(name=name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': 'Registration successful!', 'status': 'success'}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {e}")
        return jsonify({'error': str(e)}), 500

@main.route('/farmer/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            return jsonify({'message': 'Login successful!', 'status': 'success'}), 200
        return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': str(e)}), 500

@main.route('/dashboard')
def dashboard():
    return "Welcome to the dashboard!"

@main.route('/farmer/check-auth', methods=['GET'])
def check_auth():
    return jsonify({'status': 'ok'}), 200

@main.route('/farmer/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200
