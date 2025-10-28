import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Load dataset
df = pd.read_csv("constructive_dataset.csv")  # columns: text, score ∈ [-1, 1]

# Split data
X_train, X_test, y_train, y_test = train_test_split(df['text'], df['score'], test_size=0.2, random_state=42)

# TF-IDF vectorization
vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Ridge Regressor
model = Ridge(alpha=1.0)
model.fit(X_train_vec, y_train)

# Evaluate
y_pred = model.predict(X_test_vec)
print("MSE:", mean_squared_error(y_test, y_pred))
print("R2:", r2_score(y_test, y_pred))

# Save separately
joblib.dump(model, "constructiveness_regressor.pkl")
joblib.dump(vectorizer, "constructive_vectorizer.pkl")

print("✅ Saved constructiveness model and vectorizer separately.")
