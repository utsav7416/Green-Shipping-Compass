Live Deployment on Render
https://green-shipping-compass-1.onrender.com/

Green Shipping Compass  
======================

A Comprehensive Eco-Friendly Shipping Cost Calculator

Overview  

Green Shipping Compass provides accurate, transparent, and eco-conscious shipping cost estimates. It combines traditional cost factors (distance, container, handling) with a machine-learning model trained on synthetic data. Users compare Eco, Standard, Express, and Premium methods and see an interactive line graph of cost components.

Key Features  

1. **Shipping Parameters**  
   - **Ports & Distance**: Select origin and destination seaports; distance may be auto-calculated or entered manually.  
   - **Container Size & Quantity**: Choose 20 ft, 40 ft, or 45 ft; specify number of containers.  
   - **Cargo Type**: Normal (×1.00), Fragile (×1.15), Perishable (×1.25), Hazardous (×1.40).  
   - **Delivery Method**: Eco (×0.85), Standard (×1.00), Express (×1.50), Premium (×2.20).

2. **ML-Based Price Prediction**  
   - **Random Forest Regressor** trained on synthetic data combining distance, weight, container size, and cargo type.  
   - **Feature Scaling**: Inputs standardized using a saved `StandardScaler`.  
   - **Workflow**:  
     1. Receive JSON:
        ```json
        {
          "distance": 5000,
          "weight": 1200,
          "containerSize": 40,
          "cargoType": "fragile",
          "method": "express"
        }
        ```  
     2. Validate and encode `cargoType`; scale features; predict base price; apply `method` multiplier.  
     3. Break down final price into six line items (percentages of total).  
     4. Return:
        ```json
        {
          "totalCost": 2765.43,
          "costs": {
            "Base Container Cost": 829.63,
            "Distance Cost": 691.36,
            "Fuel Surcharge": 414.82,
            "Handling & Documentation": 276.54,
            "Method Premium": 276.54,
            "Insurance": 276.54
          }
        }
        ```

3. **Cost Breakdown & Visualization**  
   - Numerical breakdown:  
     - Base Container Cost (30%), Distance Cost (25%), Fuel Surcharge (15%), Handling & Documentation (10%), Method Premium (10%), Insurance (10%).  
   - Interactive **Line Graph**: Plots each cost component’s value relative to the total.

4. **React Frontend**  
   - Responsive UI with form inputs (ports, distance, weight, container size, cargo type, method).  
   - “Calculate Shipping Cost” button sends POST to the Flask API, then displays total cost, cost breakdown, and line graph.

5. **Flask API Backend**  
   - Single `/predict` endpoint (POST) expecting JSON as above.  
   - Internal steps: validate inputs; encode and scale features; predict with `RandomForestRegressor`; apply method multiplier; compute costs; return JSON.

Machine-Learning Model Details  
------------------------------

- **Synthetic Data Generation**:  
  - Distance (100–20,000 nm), Weight (100–5,000 kg), Container Sizes (20, 40, 45 ft), Cargo Types.  
  - Base price = `0.5×distance + 0.3×weight + 50×containerSize` multiplied by cargo multiplier, plus noise (√(distance×weight)×0.1 + containerSize×log(distance)×0.05). Minimum \$500.  
- **Training**:  
  - 80/20 train-test split; scale features; fit `RandomForestRegressor(n_estimators=100)`.  
  - Save model to `models/shipping_model.joblib` and scaler to `models/scaler.joblib`.

Technologies Used  
-----------------

- **Frontend**: React, Recharts/Chart.js for line graph, Axios or fetch, CSS/SCSS.  
- **Backend**: Python 3.x, Flask, Flask-CORS, NumPy, Pandas, scikit-learn, joblib.

Contact & Acknowledgements  
--------------------------

- **Project Maintainer:**  
  - Utsav Choudhary  
  - GitHub: https://github.com/utsav7416  
  - Phone: +91 8826834155

- **Acknowledgements:**  
  Inspired by the need for greener logistics and transparent cost modeling. Thanks to React, Flask, scikit-learn, and the open-source community.
