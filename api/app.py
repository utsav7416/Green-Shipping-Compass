import os
import joblib
import numpy as np
import time
import re
import logging
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

ALLOWED_ORIGINS = [
    "https://green-shipping-compass-1.onrender.com",
    "http://localhost:5173"
]

CORS(
    app,
    resources={r"/*": {"origins": ALLOWED_ORIGINS}},
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=True
)

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers.add("Access-Control-Allow-Origin", origin)
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not Found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal Server Error"}), 500

@app.errorhandler(400)
def bad_request(e):
    return jsonify({"error": "Bad Request"}), 400

CARGO_TYPES = ["normal", "fragile", "perishable", "hazardous"]
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "shipping_model.joblib")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "scaler.joblib")

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
except:
    model = None
    scaler = None

PORT_NAME_MAPPING = {
    "Dubai, UAE": "Jebel Ali",
    "Singapore": "Singapore",
    "Rotterdam, Netherlands": "Rotterdam",
    "Los Angeles, USA": "Los Angeles",
    "Long Beach, USA": "Long Beach",
    "Shanghai, China": "Shanghai",
    "Shenzhen, China": "Shenzhen",
    "Hong Kong": "Hong Kong",
    "Hamburg, Germany": "Hamburg",
    "Antwerp, Belgium": "Antwerp",
    "Valencia, Spain": "Valencia",
    "Barcelona, Spain": "Barcelona",
    "Le Havre, France": "Le Havre",
    "Felixstowe, UK": "Felixstowe",
    "New York, USA": "New York",
    "Savannah, USA": "Savannah",
    "Norfolk, USA": "Norfolk",
    "Charleston, USA": "Charleston",
    "Miami, USA": "Miami",
    "Baltimore, USA": "Baltimore",
    "Tokyo, Japan": "Tokyo",
    "Yokohama, Japan": "Yokohama",
    "Kobe, Japan": "Kobe",
    "Busan, South Korea": "Busan",
    "Kaohsiung, Taiwan": "Kaohsiung",
    "Qingdao, China": "Qingdao",
    "Ningbo, China": "Ningbo",
    "Tianjin, China": "Tianjin",
    "Dalian, China": "Dalian",
    "Mumbai, India": "Mumbai",
    "Chennai, India": "Chennai",
    "Kolkata, India": "Kolkata",
    "Jawaharlal Nehru, India": "JNPT",
    "Santos, Brazil": "Santos",
    "Buenos Aires, Argentina": "Buenos Aires",
    "Valparaiso, Chile": "Valparaiso",
    "Callao, Peru": "Callao",
    "Durban, South Africa": "Durban",
    "Cape Town, South Africa": "Cape Town",
    "Alexandria, Egypt": "Alexandria",
    "Port Said, Egypt": "Port Said",
    "Piraeus, Greece": "Piraeus",
    "Genoa, Italy": "Genoa",
    "La Spezia, Italy": "La Spezia",
    "Marseilles, France": "Marseilles",
    "Algeciras, Spain": "Algeciras",
    "Tangier, Morocco": "Tangier",
    "Casablanca, Morocco": "Casablanca",
    "Lagos, Nigeria": "Lagos",
    "Tema, Ghana": "Tema",
    "Abidjan, Ivory Coast": "Abidjan",
    "Djibouti": "Djibouti",
    "Sohar, Oman": "Sohar",
    "Salalah, Oman": "Salalah",
    "King Abdullah, Saudi Arabia": "King Abdullah",
    "Jeddah, Saudi Arabia": "Jeddah",
    "Kuwait": "Kuwait",
    "Doha, Qatar": "Doha",
    "Abu Dhabi, UAE": "Abu Dhabi",
    "Bandar Abbas, Iran": "Bandar Abbas",
    "Karachi, Pakistan": "Karachi",
    "Colombo, Sri Lanka": "Colombo",
    "Chittagong, Bangladesh": "Chittagong",
    "Yangon, Myanmar": "Yangon",
    "Bangkok, Thailand": "Bangkok",
    "Laem Chabang, Thailand": "Laem Chabang",
    "Ho Chi Minh City, Vietnam": "Ho Chi Minh City",
    "Haiphong, Vietnam": "Haiphong",
    "Jakarta, Indonesia": "Jakarta",
    "Surabaya, Indonesia": "Surabaya",
    "Manila, Philippines": "Manila",
    "Cebu, Philippines": "Cebu",
    "Melbourne, Australia": "Melbourne",
    "Sydney, Australia": "Sydney",
    "Brisbane, Australia": "Brisbane",
    "Fremantle, Australia": "Fremantle",
    "Auckland, New Zealand": "Auckland",
    "Wellington, New Zealand": "Wellington",
    "Vancouver, Canada": "Vancouver",
    "Montreal, Canada": "Montreal",
    "Halifax, Canada": "Halifax",
    "Prince Rupert, Canada": "Prince Rupert"
}

def setup_selenium_driver():
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    try:
        return webdriver.Chrome(options=opts)
    except Exception as e:
        logging.error(f"Failed to setup selenium driver: {e}")
        return None

def scrape_seadex_port_congestion(port_name):
    driver = setup_selenium_driver()
    if not driver:
        return None
    
    try:
        driver.get("https://seadex.ai/en/free-tools/port-congestion-tool")
        wait = WebDriverWait(driver, 25)
        
        inp = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[placeholder*='Enter a port']")))
        inp.clear()
        inp.send_keys(port_name)
        time.sleep(1)
        
        btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        btn.click()
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Total vessel count')]")))
        
        soup = BeautifulSoup(driver.page_source, "html.parser")
        data = {}

        total_vessel_text = soup.find(string=re.compile("Total vessel count", re.I))
        if total_vessel_text:
            parent_container = total_vessel_text.find_parent()
            if parent_container:
                main_value_tag = parent_container.find(string=re.compile(r"\d+\s*%"))
                if main_value_tag:
                    data["congestion"] = float(main_value_tag.strip().replace("%", ""))

        if "congestion" not in data:
            logging.error(f"Could not extract main congestion percentage for {port_name}")
            return None

        gap_text_element = soup.find(string=re.compile(r"below average|above average", re.I))
        if gap_text_element:
            match = re.search(r"(-?[\d\.]+%?)", gap_text_element)
            if match:
                try:
                    data["gapWithMean"] = float(match.group(1).replace('%', ''))
                except (ValueError, IndexError):
                    pass
        
        data["vesselType"] = "cargo"
        return data

    except (TimeoutException, NoSuchElementException) as e:
        logging.error(f"Selenium timeout or element not found for port '{port_name}': {e}")
        return None
    except Exception as e:
        logging.error(f"An unexpected error occurred scraping '{port_name}': {e}")
        return None
    finally:
        if driver:
            driver.quit()

def get_port_congestion(port_name):
    mapped = PORT_NAME_MAPPING.get(port_name, port_name)
    return scrape_seadex_port_congestion(mapped)

def calculate_congestion_surcharge(cd, port_type="origin"):
    if not cd or "congestion" not in cd:
        return 0.0
    c = cd["congestion"]
    s = 0.0
    if c >= 80:
        s = 0.20
    elif c >= 65:
        s = 0.15
    elif c >= 50:
        s = 0.10
    elif c >= 35:
        s = 0.05
    return s * (0.6 if port_type == "origin" else 0.4)

@app.route("/available-ports", methods=["GET", "OPTIONS"])
def available_ports():
    if request.method == "OPTIONS":
        return jsonify({})
    return jsonify({"ports": list(PORT_NAME_MAPPING.keys()), "total_count": len(PORT_NAME_MAPPING)})

@app.route("/port-congestion/<port_name>", methods=["GET", "OPTIONS"])
def port_congestion(port_name):
    if request.method == "OPTIONS":
        return jsonify({})
    
    cd = get_port_congestion(port_name)
    
    if cd:
        return jsonify({"status": "success", "data": cd})
    else:
        return jsonify({
            "status": "error",
            "message": f"Congestion data could not be scraped for port: {port_name}.",
            "port": port_name
        })

@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return jsonify({})
    if not model or not scaler:
        return jsonify({"error": "Models not loaded"}), 503
    try:
        d = request.get_json(force=True)
        dist = float(d["distance"])
        wt = float(d["weight"])
        cs = float(d["containerSize"])
        idx = CARGO_TYPES.index(d.get("cargoType", "normal").lower())
        feats = np.array([[dist, wt, cs, idx]])
        bp = model.predict(scaler.transform(feats))[0]
        mm = {"standard": 1.0, "express": 1.5, "premium": 2.2, "eco": 0.85}
        m = d.get("method", "standard").lower()
        fp = bp * mm.get(m, 1.0)
        
        origin_congestion_data = get_port_congestion(d.get("originPort", "")) if d.get("originPort") else None
        destination_congestion_data = get_port_congestion(d.get("destinationPort", "")) if d.get("destinationPort") else None

        op = calculate_congestion_surcharge(origin_congestion_data, "origin")
        dp = calculate_congestion_surcharge(destination_congestion_data, "destination")
        
        cc = fp * (op + dp)
        fp += cc
        costs = {
            "Base Cost": round(fp * 0.40, 2),
            "Fuel & Distance Surcharge": round(fp * 0.30, 2),
            "Handling & Documentation": round(fp * 0.15, 2),
            "Service Method Premium": round(fp * 0.15, 2),
        }
        if cc > 0:
            costs["Port Congestion Surcharge"] = round(cc, 2)
        
        response_data = {"totalCost": round(fp, 2), "costs": costs}
        return jsonify(response_data)
    except Exception as e:
        logging.error(f"Error in /predict endpoint: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)