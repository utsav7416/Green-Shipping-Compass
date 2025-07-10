import os
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

CARGO_TYPES = ['normal', 'fragile', 'perishable', 'hazardous']
CARGO_MULTIPLIERS = {
   'normal': 1.0,
   'fragile': 1.15,
   'perishable': 1.25,
   'hazardous': 1.4
}

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'shipping_model.joblib')
SCALER_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'scaler.joblib')

try:
   model = joblib.load(MODEL_PATH)
   scaler = joblib.load(SCALER_PATH)
   print("Models loaded successfully!")
except Exception as e:
   print(f"ERROR: Could not load models: {e}")

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
       
       if 'model' not in globals() or 'scaler' not in globals():
           return jsonify({'error': 'Server error: Model or scaler not loaded.'}), 500

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
       
       print(f"Prediction error: {e}", exc_info=True)
       return jsonify({'error': f"An internal server error occurred: {str(e)}"}), 500

if __name__ == '__main__':
   port = int(os.environ.get('PORT', 5000))
   app.run(host='0.0.0.0', port=port)