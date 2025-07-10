import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "https://green-shipping-compass-1.onrender.com"}},
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

@app.after_request
def add_cors_headers(response):
    response.headers.setdefault(
        'Access-Control-Allow-Origin',
        'https://green-shipping-compass-1.onrender.com'
    )
    response.headers.setdefault(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS'
    )
    response.headers.setdefault(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    )
    return response

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Backend service is up and running!"}), 200

CARGO_TYPES = ['normal', 'fragile', 'perishable', 'hazardous']
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'shipping_model.joblib')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'models', 'scaler.joblib')

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
except:
    model = None
    scaler = None

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return '', 200

    if not model or not scaler:
        return jsonify({'error': 'Models are not loaded.'}), 503

    try:
        payload = request.get_json(force=True)
        distance = float(payload['distance'])
        weight = float(payload['weight'])
        container_size = float(payload['containerSize'])
        cargo_type = payload.get('cargoType', 'normal').lower()

        if cargo_type not in CARGO_TYPES:
            return jsonify({'error': f"Invalid cargoType. Allowed: {CARGO_TYPES}"}), 400

        cargo_encoded = CARGO_TYPES.index(cargo_type)
        features = np.array([[distance, weight, container_size, cargo_encoded]])
        scaled = scaler.transform(features)
        base_price = model.predict(scaled)[0]

        method = payload.get('method', 'standard').lower()
        multipliers = {'standard': 1.0, 'express': 1.5, 'premium': 2.2, 'eco': 0.85}
        if method not in multipliers:
            return jsonify({'error': f"Invalid method. Allowed: {list(multipliers.keys())}"}), 400

        final = base_price * multipliers[method]

        costs = {
            'Base Container Cost': round(final * 0.3, 2),
            'Distance Cost': round(final * 0.25, 2),
            'Fuel Surcharge': round(final * 0.15, 2),
            'Handling & Documentation': round(final * 0.1, 2),
            'Method Premium': round(final * 0.1, 2),
            'Insurance': round(final * 0.1, 2)
        }

        return jsonify({'totalCost': round(final, 2), 'costs': costs}), 200

    except Exception as e:
        return jsonify({'error': f"Internal server error: {e}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
