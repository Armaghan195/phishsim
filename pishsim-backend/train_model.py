import pandas as pd
import joblib
import re
from urllib.parse import urlparse
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# === Step 1: Load dataset ===
df = pd.read_csv("phishing_dataset.csv")

# === Step 2: Vectorizer ===
vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5))
X_tfidf = vectorizer.fit_transform(df["url"])

# === Step 3: Labels ===
y = df["label"]

# === Step 4: Train/Test Split ===
X_train, X_test, y_train, y_test = train_test_split(X_tfidf, y, test_size=0.2, random_state=42)

# === Step 5: Train Model ===
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# === Step 6: Evaluate ===
y_pred = model.predict(X_test)
print("\n=== Classification Report ===")
print(classification_report(y_test, y_pred))

# === Step 7: Save Model and Vectorizer ===
joblib.dump(model, "phishing_model.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")

print("\n✅ Model and vectorizer saved!")
