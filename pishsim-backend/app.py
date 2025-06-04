from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

# Load Model & Vectorizer
model = joblib.load("phishing_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

app = Flask(__name__)
CORS(app)

# === Risk Factor Generator ===
def get_risk_factors(url):
    url = url.lower()
    factors = []
    if len(url) > 100:
        factors.append("URL is unusually long")
    if url.count("-") > 3:
        factors.append("Excessive hyphens in URL")
    if any(k in url for k in ["verify", "secure", "update", "account", "login"]):
        factors.append("Suspicious keywords found")
    if url.count(".") > 4:
        factors.append("Too many subdomains")
    return factors[:5]

# === Dummy Top Indicators (static for now) ===
def get_top_indicators():
    return [
        { "feature": "url_length", "importance": 0.35 },
        { "feature": "subdomain_count", "importance": 0.25 },
        { "feature": "tfidf_score_login", "importance": 0.20 }
    ]

@app.route('/')
def home():
    return "✅ Phishing Detection API is Running"

@app.route('/check_url', methods=['POST'])
@app.route('/check_url', methods=['POST'])
def check_url():
    data = request.get_json()
    url = data.get('url', '')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    vector = vectorizer.transform([url])
    prob = float(model.predict_proba(vector)[0][1])   # Ensure native float
    is_phishing = bool(prob >= 0.5)                    # Ensure native bool

    response = {
        "isPhishing": is_phishing,
        "phishingProbability": round(prob, 2),
        "riskFactors": get_risk_factors(str(url)),
        "topIndicators": get_top_indicators()
    }

    return jsonify(response)




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
