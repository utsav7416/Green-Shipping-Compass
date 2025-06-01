Live Deployment:
https://green-shipping-compass-1.onrender.com/

Green Shipping Compass
A Comprehensive Eco-Friendly Shipping Cost Calculator

Overview
Green Shipping Compass is a web-based application designed to provide users with accurate, transparent, and environmentally conscious shipping cost estimates. By combining traditional cost components (distance, container, handling, etc.) with a machine‐learning model trained on synthetic shipping data, users can obtain both real‐time quotes and predictive insights.

Key Features
Customizable Shipping Parameters

Source Port & Destination Port: Select any valid seaport for origin and destination.

Container Type & Quantity: Choose standard sizes (e.g., 20 ft, 40 ft, 45 ft) and specify the number of containers.

Cargo Type: Options include normal, fragile, perishable, and hazardous—each with its own cost multiplier.

Delivery Method: Four tiers of service:

Eco (discounted rate for lower‐emission routes)

Standard (baseline service)

Express (faster transit, higher rate)

Premium (priority handling, highest rate)

Machine‐Learning Price Prediction

A Random Forest regression model trained on synthetic data to learn relationships between distance, weight, container size, cargo class, and base cost.

Input features are standardized (via StandardScaler) before feeding into the model.

The ML endpoint returns a base price, which is then adjusted by the selected delivery method multiplier (e.g., 0.85× for Eco, 1.5× for Express, 2.2× for Premium).

Transparent Cost Breakdown

Numerical Breakdown:

Base Container Cost (30 % of final price)

Distance Cost (25 %)

Fuel Surcharge (15 %)

Handling & Documentation (10 %)

Method Premium (10 %)

Insurance (10 %)

Progress Bar Graph: A visual bar chart illustrating each cost component’s percentage share of the total.

Total Cost: Displayed prominently, updated in real‐time as parameters change.

React Frontend

Responsive UI built with React.

Input fields for each shipping parameter; real‐time form validation.

Progress graph rendered (e.g., using a chart library) to visualize cost components.

User selects ports (via dropdowns or autocomplete), container size, cargo type, and delivery method.

“Calculate” button triggers a POST request to the Flask backend, then displays results immediately.

Flask API Backend

Single /predict endpoint (POST) that expects JSON:

json
Copy
Edit
{
  "distance": 5000,
  "weight": 1200,
  "containerSize": 40,
  "cargoType": "fragile",
  "method": "express"
}
Internally:

Validates cargoType against allowed list: ['normal', 'fragile', 'perishable', 'hazardous']

Encodes cargo type as an integer index for the ML model

Standardizes features using a pre‐fitted StandardScaler

Feeds scaled features into a RandomForestRegressor to generate a base price

Applies a multiplier based on delivery method:

standard: 1.0

express: 1.5

premium: 2.2

eco: 0.85

Computes each cost component (e.g., 30 % for Base Container Cost) and returns JSON:

json
Copy
Edit
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
Usage & Workflow
Access the Application
Visit the live deployment at:

arduino
Copy
Edit
https://green-shipping-compass-1.onrender.com/
The landing page displays an input form and a “Calculate Shipping Cost” button.

Enter Shipping Details

Source Port & Destination Port: Type or select the seaport names.

Distance & Weight: (Automatically inferred or input manually if needed.)

Container Size & Quantity: Choose from 20 ft, 40 ft, or 45 ft, and specify how many containers.

Cargo Type: Select from Normal, Fragile, Perishable, or Hazardous.

Delivery Method: Choose Eco, Standard, Express, or Premium.

Calculate & Visualize

Click Calculate Shipping Cost.

The frontend sends a POST request to /predict.

JSON response returns totalCost and costs breakdown.

Results are rendered on the page:

Total Cost (e.g., $2,765.43) at the top

Progress Bar Graph showing each cost component’s proportion

Numeric List showing each cost line item in USD

Interpreting Results

Total Cost: The final price including all fees and selected delivery multiplier.

Cost Breakdown: Understand where expenses are going (e.g., fuel, handling, insurance).

Eco Mode: Notice “Eco” multiplier (0.85×) reduces overall cost for a greener route.

Premium/Express: Expect higher methodology premiums but faster transit.

Machine‐Learning Model Details
Training Data Generation (synthetic):

Distance: Uniformly random between 100 nm and 20,000 nm

Weight: Uniformly random between 100 kg and 5,000 kg

Container Sizes: Randomly chosen from {20, 40, 45} ft

Cargo Types: Random choice among {normal, fragile, perishable, hazardous}

Base Price Calculation:

base_prices = distance * 0.5 + weight * 0.3 + container_size * 50

Multiply by cargo multiplier:

normal = 1.0

fragile = 1.15

perishable = 1.25

hazardous = 1.4

Add noise:

matlab
Copy
Edit
prices = base_prices 
         + sqrt(distance * weight) * 0.1 
         + container_size * log(distance) * 0.05 
         + Gaussian noise (σ=5 % of base)
Minimum price threshold of $500 enforced.

Model:

Algorithm: RandomForestRegressor(n_estimators=100)

Preprocessing: Features standardized via StandardScaler

Serialization:

Model saved as models/shipping_model.joblib

Scaler saved as models/scaler.joblib

Prediction Endpoint (/predict):

Reads JSON payload

Validates inputs; encodes cargo type

Standardizes features → Predict base price

Applies delivery method multiplier → Final price

Breaks down final price into six line items and returns JSON

Technologies Used
Frontend

React

Chart library (e.g., recharts or chart.js) for progress bar graph

Axios or fetch for HTTP requests to the Flask API

CSS/SCSS for styling (simple, responsive layout)

Backend

Python 3.x

Flask for API routing

Flask-CORS to allow cross-origin requests

NumPy & Pandas for data generation and manipulation

scikit-learn for RandomForestRegressor and StandardScaler

joblib for model serialization

Contact & Acknowledgements
Project Maintainer:

Utsav Choudhary

GitHub: https://github.com/utsav7416

Phone: +91 8826834155

Acknowledgements:

Inspired by the need for greener logistics solutions and transparent cost modeling.

Thanks to the open‐source community for React, Flask, scikit‐learn, and other libraries that made this project possible.
