from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

# Load Model & Vectorizer
model = joblib.load("phishing_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

app = Flask(__name__)
CORS(app)

# Generate Risk Factors
def get_risk_factors(url):
    factors = []
    url = url.lower()
    if len(url) > 100:
        factors.append("URL is unusually long")
    if url.count("-") > 3:
        factors.append("Excessive hyphens in URL")
    if any(k in url for k in ["verify", "secure", "update", "account", "login"]):
        factors.append("Suspicious keywords found")
    if url.count(".") > 4:
        factors.append("Too many subdomains")
    return factors[:5]

# Generate Dummy Top Indicators
def get_top_indicators():
    return [
        {"feature": "tfidf_score_login", "importance": float(0.35)},
        {"feature": "subdomain_count", "importance": float(0.25)},
        {"feature": "url_length", "importance": float(0.20)}
    ]

@app.route('/')
def home():
    return "✅ Phishing Detection API is Running"

@app.route('/check_url', methods=['POST'])
def check_url():
    data = request.get_json()
    url = data.get('url', '')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    vector = vectorizer.transform([url])
    prob = model.predict_proba(vector)[0][1]

    response = {
        "is_phishing": bool(prob >= 0.5),
        "phishing_probability": float(round(prob, 2)),
        "risk_factors": get_risk_factors(url),
        "top_indicators": get_top_indicators()
    }

    return jsonify(response)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
