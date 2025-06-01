from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import os

app = Flask(__name__)
CORS(app)

CARGO_TYPES = ['normal', 'fragile', 'perishable', 'hazardous']

CARGO_MULTIPLIERS = {
    'normal': 1.0,
    'fragile': 1.15,
    'perishable': 1.25,
    'hazardous': 1.4
}

def generate_training_data(n_samples=1000):
    np.random.seed(42)
    distances = np.random.uniform(100, 20000, n_samples)
    weights = np.random.uniform(100, 5000, n_samples)
    container_sizes = np.random.choice([20, 40, 45], n_samples)
    cargo_types = np.random.choice(CARGO_TYPES, n_samples)
    cargo_type_encoded = np.array([CARGO_TYPES.index(ct) for ct in cargo_types])
    base_prices = distances * 0.5 + weights * 0.3 + container_sizes * 50
    cargo_multiplier = np.array([CARGO_MULTIPLIERS[ct] for ct in cargo_types])
    base_prices *= cargo_multiplier
    prices = (
        base_prices +
        np.sqrt(distances * weights) * 0.1 +
        container_sizes * np.log(distances) * 0.05 +
        np.random.normal(0, base_prices * 0.05, n_samples)
    )
    prices = np.maximum(prices, 500)
    X = np.column_stack([distances, weights, container_sizes, cargo_type_encoded])
    return X, prices

def train_model():
    X, y = generate_training_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    if not os.path.exists('models'):
        os.makedirs('models')
    joblib.dump(model, 'models/shipping_model.joblib')
    joblib.dump(scaler, 'models/scaler.joblib')


train_model()
model = joblib.load('models/shipping_model.joblib')
scaler = joblib.load('models/scaler.joblib')

@app.route('/predict', methods=['POST'])

def predict():
    try:
        data = request.get_json()
        distance = float(data['distance'])
        weight = float(data['weight'])
        container_size = float(data['containerSize'])
        cargo_type = data.get('cargoType', 'normal').lower()
        if cargo_type not in CARGO_TYPES:
            return jsonify({'error': f"Invalid cargoType. Allowed types: {CARGO_TYPES}"}), 400
        cargo_type_encoded = CARGO_TYPES.index(cargo_type)
        features = np.array([[distance, weight, container_size, cargo_type_encoded]])
        features_scaled = scaler.transform(features)
        base_price = model.predict(features_scaled)[0]
        method_multipliers = {
            'standard': 1.0,
            'express': 1.5,
            'premium': 2.2,
            'eco': 0.85
        }

        method = data.get('method', 'standard').lower()

        if method not in method_multipliers:
            return jsonify({'error': f"Invalid method. Allowed methods: {list(method_multipliers.keys())}"}), 400
        
        final_price = base_price * method_multipliers[method]
        
        costs = {
            'Base Container Cost': round(final_price * 0.3, 2),
            'Distance Cost': round(final_price * 0.25, 2),
            'Fuel Surcharge': round(final_price * 0.15, 2),
            'Handling & Documentation': round(final_price * 0.1, 2),
            'Method Premium': round(final_price * 0.1, 2),
            'Insurance': round(final_price * 0.1, 2)
        }
        return jsonify({
            'totalCost': round(final_price, 2),
            'costs': costs
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000)
