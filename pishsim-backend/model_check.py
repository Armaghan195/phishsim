import joblib
import json

# Load the phishing detection model
model = joblib.load("phishing_model.pkl")

# Extract basic info
info = {
    "model_type": str(type(model)),
    "classes": model.classes_.tolist(),
    "params": model.get_params()
}

# Save it to JSON file
with open("model_info.json", "w") as f:
    json.dump(info, f, indent=2)

print("✅ model_info.json has been generated!")
