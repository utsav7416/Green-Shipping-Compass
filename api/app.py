import os
import joblib
import numpy as np
import requests
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {
        "origins": "https://green-shipping-compass-1.onrender.com"
    }},
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

CARGO_TYPES = ['normal', 'fragile', 'perishable', 'hazardous']

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    '..', 'models', 'shipping_model.joblib'
)
SCALER_PATH = os.path.join(
    os.path.dirname(__file__),
    '..', 'models', 'scaler.joblib'
)

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("Models loaded successfully!")
except Exception as e:
    print(f"ERROR: Could not load models: {e}")

PORT_NAME_MAPPING = {
    'Dubai, UAE': 'Jebel Ali',
    'Singapore': 'Singapore',
    'Rotterdam, Netherlands': 'Rotterdam',
    'Los Angeles, USA': 'Los Angeles',
    'Long Beach, USA': 'Long Beach',
    'Shanghai, China': 'Shanghai',
    'Shenzhen, China': 'Shenzhen',
    'Hong Kong': 'Hong Kong',
    'Hamburg, Germany': 'Hamburg',
    'Antwerp, Belgium': 'Antwerp',
    'Valencia, Spain': 'Valencia',
    'Barcelona, Spain': 'Barcelona',
    'Le Havre, France': 'Le Havre',
    'Felixstowe, UK': 'Felixstowe',
    'New York, USA': 'New York',
    'Savannah, USA': 'Savannah',
    'Norfolk, USA': 'Norfolk',
    'Charleston, USA': 'Charleston',
    'Miami, USA': 'Miami',
    'Baltimore, USA': 'Baltimore',
    'Tokyo, Japan': 'Tokyo',
    'Yokohama, Japan': 'Yokohama',
    'Kobe, Japan': 'Kobe',
    'Busan, South Korea': 'Busan',
    'Kaohsiung, Taiwan': 'Kaohsiung',
    'Qingdao, China': 'Qingdao',
    'Ningbo, China': 'Ningbo',
    'Tianjin, China': 'Tianjin',
    'Dalian, China': 'Dalian',
    'Mumbai, India': 'Mumbai',
    'Chennai, India': 'Chennai',
    'Kolkata, India': 'Kolkata',
    'Jawaharlal Nehru, India': 'JNPT',
    'Santos, Brazil': 'Santos',
    'Buenos Aires, Argentina': 'Buenos Aires',
    'Valparaiso, Chile': 'Valparaiso',
    'Callao, Peru': 'Callao',
    'Durban, South Africa': 'Durban',
    'Cape Town, South Africa': 'Cape Town',
    'Alexandria, Egypt': 'Alexandria',
    'Port Said, Egypt': 'Port Said',
    'Piraeus, Greece': 'Piraeus',
    'Genoa, Italy': 'Genoa',
    'La Spezia, Italy': 'La Spezia',
    'Marseilles, France': 'Marseilles',
    'Algeciras, Spain': 'Algeciras',
    'Tangier, Morocco': 'Tangier',
    'Casablanca, Morocco': 'Casablanca',
    'Lagos, Nigeria': 'Lagos',
    'Tema, Ghana': 'Tema',
    'Abidjan, Ivory Coast': 'Abidjan',
    'Djibouti': 'Djibouti',
    'Sohar, Oman': 'Sohar',
    'Salalah, Oman': 'Salalah',
    'King Abdullah, Saudi Arabia': 'King Abdullah',
    'Jeddah, Saudi Arabia': 'Jeddah',
    'Kuwait': 'Kuwait',
    'Doha, Qatar': 'Doha',
    'Abu Dhabi, UAE': 'Abu Dhabi',
    'Bandar Abbas, Iran': 'Bandar Abbas',
    'Karachi, Pakistan': 'Karachi',
    'Colombo, Sri Lanka': 'Colombo',
    'Chittagong, Bangladesh': 'Chittagong',
    'Yangon, Myanmar': 'Yangon',
    'Bangkok, Thailand': 'Bangkok',
    'Laem Chabang, Thailand': 'Laem Chabang',
    'Ho Chi Minh City, Vietnam': 'Ho Chi Minh City',
    'Haiphong, Vietnam': 'Haiphong',
    'Jakarta, Indonesia': 'Jakarta',
    'Surabaya, Indonesia': 'Surabaya',
    'Manila, Philippines': 'Manila',
    'Cebu, Philippines': 'Cebu',
    'Melbourne, Australia': 'Melbourne',
    'Sydney, Australia': 'Sydney',
    'Brisbane, Australia': 'Brisbane',
    'Fremantle, Australia': 'Fremantle',
    'Auckland, New Zealand': 'Auckland',
    'Wellington, New Zealand': 'Wellington',
    'Vancouver, Canada': 'Vancouver',
    'Montreal, Canada': 'Montreal',
    'Halifax, Canada': 'Halifax',
    'Prince Rupert, Canada': 'Prince Rupert'
}

def setup_selenium_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return driver
    except Exception as e:
        print(f"Error setting up Chrome driver: {e}")
        return None

def scrape_seadex_port_congestion(port_name):
    driver = setup_selenium_driver()
    if not driver:
        return None
    
    try:
        print(f"Scraping congestion data for: {port_name}")
        
        driver.get("https://seadex.ai/en/free-tools/port-congestion-tool")
        
        wait = WebDriverWait(driver, 15)
        
        port_input = None
        selectors_to_try = [
            "input[placeholder*='port']",
            "input[placeholder*='Port']",
            "input[type='text']",
            "#port-input",
            ".port-search",
            "input[name*='port']"
        ]
        
        for selector in selectors_to_try:
            try:
                port_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                break
            except TimeoutException:
                continue
        
        if not port_input:
            inputs = driver.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                if inp.is_displayed() and inp.is_enabled():
                    port_input = inp
                    break
        
        if not port_input:
            print("Could not find port input field")
            return None
        
        port_input.clear()
        port_input.send_keys(port_name)
        
        search_button = None
        button_selectors = [
            "button[type='submit']",
            "button:contains('Search')",
            "input[type='submit']",
            ".search-btn",
            ".submit-btn"
        ]
        
        for selector in button_selectors:
            try:
                search_button = driver.find_element(By.CSS_SELECTOR, selector)
                if search_button.is_displayed():
                    break
            except NoSuchElementException:
                continue
        
        if search_button:
            search_button.click()
        else:
            from selenium.webdriver.common.keys import Keys
            port_input.send_keys(Keys.RETURN)
        
        time.sleep(3)
        
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        
        congestion_data = {}
        
        congestion_elements = soup.find_all(text=lambda text: text and '%' in text)
        for element in congestion_elements:
            if any(word in element.lower() for word in ['congestion', 'congested', 'level']):
                try:
                    percentage = float(element.replace('%', '').strip())
                    congestion_data['congestion'] = percentage
                    break
                except ValueError:
                    continue
        
        average_elements = soup.find_all(text=lambda text: text and ('below average' in text.lower() or 'above average' in text.lower()))
        for element in average_elements:
            try:
                if 'below average' in element.lower():
                    gap_value = float(element.split('%')[0].replace('-', '').strip())
                    congestion_data['gapWithMean'] = -gap_value
                elif 'above average' in element.lower():
                    gap_value = float(element.split('%')[0].replace('+', '').strip())
                    congestion_data['gapWithMean'] = gap_value
                break
            except (ValueError, IndexError):
                continue
        
        if 'cargo' in page_source.lower():
            congestion_data['vesselType'] = 'cargo'
        else:
            congestion_data['vesselType'] = 'general'
        
        if 'congestion' in congestion_data:
            if 'gapWithMean' not in congestion_data:
                congestion_data['gapWithMean'] = 0.0
            print(f"Successfully scraped congestion data: {congestion_data}")
            return congestion_data
        else:
            print("No congestion data found in scraped content")
            return None
        
    except Exception as e:
        print(f"Error scraping port congestion for {port_name}: {e}")
        return None
    finally:
        driver.quit()

def get_port_congestion(port_name):
    mapped_port = PORT_NAME_MAPPING.get(port_name, port_name)
    return scrape_seadex_port_congestion(mapped_port)

def calculate_congestion_surcharge(congestion_data, port_type='origin'):
    if not congestion_data:
        return 0.0
    
    congestion_level = congestion_data.get('congestion', 0)
    
    if congestion_level >= 80:
        base_surcharge = 0.20
    elif congestion_level >= 65:
        base_surcharge = 0.15
    elif congestion_level >= 50:
        base_surcharge = 0.10
    elif congestion_level >= 35:
        base_surcharge = 0.05
    else:
        base_surcharge = 0.0
    
    if port_type == 'origin':
        return base_surcharge * 0.6
    else:
        return base_surcharge * 0.4

@app.route('/port-congestion/<port_name>', methods=['GET'])
def get_port_congestion_endpoint(port_name):
    try:
        vessel_type = request.args.get('vesselType', 'cargo')
        congestion_data = get_port_congestion(port_name)
        
        if congestion_data:
            return jsonify(congestion_data)
        else:
            return jsonify({'error': 'Could not fetch congestion data'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/available-ports', methods=['GET'])
def get_available_ports():
    return jsonify({
        'ports': list(PORT_NAME_MAPPING.keys()),
        'total_count': len(PORT_NAME_MAPPING)
    })

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json(force=True)
        distance = float(data['distance'])
        weight = float(data['weight'])
        container_size = float(data['containerSize'])
        cargo_type = data.get('cargoType', 'normal').lower()
        origin_port = data.get('originPort', '')
        destination_port = data.get('destinationPort', '')

        if cargo_type not in CARGO_TYPES:
            return jsonify({
                'error': f"Invalid cargoType. Allowed types: {CARGO_TYPES}"
            }), 400
        
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
            return jsonify({
                'error': f"Invalid method. Allowed methods: {list(method_multipliers.keys())}"
            }), 400

        final_price = base_price * method_multipliers[method]
        
        origin_congestion_surcharge = 0.0
        destination_congestion_surcharge = 0.0
        
        if origin_port:
            origin_congestion = get_port_congestion(origin_port)
            origin_congestion_surcharge = calculate_congestion_surcharge(origin_congestion, 'origin')
        
        if destination_port:
            destination_congestion = get_port_congestion(destination_port)
            destination_congestion_surcharge = calculate_congestion_surcharge(destination_congestion, 'destination')
        
        total_congestion_surcharge = origin_congestion_surcharge + destination_congestion_surcharge
        congestion_cost = final_price * total_congestion_surcharge
        final_price += congestion_cost

        costs = {
            'Base Container Cost': round(final_price * 0.25, 2),
            'Distance Cost': round(final_price * 0.22, 2),
            'Fuel Surcharge': round(final_price * 0.15, 2),
            'Port Operations': round(final_price * 0.12, 2),
            'Handling & Documentation': round(final_price * 0.10, 2),
            'Method Premium': round(final_price * 0.08, 2),
            'Insurance': round(final_price * 0.05, 2),
            'Administrative Fees': round(final_price * 0.03, 2)
        }
        
        if congestion_cost > 0:
            costs['Port Congestion Surcharge'] = round(congestion_cost, 2)

        return jsonify({
            'totalCost': round(final_price, 2),
            'costs': costs,
            'congestionSurcharge': round(congestion_cost, 2),
            'congestionDetails': {
                'originSurcharge': round(origin_congestion_surcharge * 100, 1),
                'destinationSurcharge': round(destination_congestion_surcharge * 100, 1)
            }
        })

    except Exception as e:
        print(f"Prediction error: {e}", exc_info=True)
        return jsonify({
            'error': f"An internal server error occurred: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)