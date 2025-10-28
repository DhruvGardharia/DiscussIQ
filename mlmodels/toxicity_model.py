import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Load dataset
df = pd.read_csv("toxicity_dataset.csv")  # columns: text, score ∈ [-1, 1]

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
joblib.dump(model, "toxicity_regressor.pkl")
joblib.dump(vectorizer, "toxicity_vectorizer.pkl")

print("✅ Saved toxicity model and vectorizer separately.")


'''

#using xgboost

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# Load data
df = pd.read_csv("toxicity_dataset.csv")

# Split
X_train, X_test, y_train, y_test = train_test_split(
    df['text'], df['score'], test_size=0.2, random_state=42
)

# TF-IDF
vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1,1), stop_words='english')
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Model with early stopping configured in constructor
model = XGBRegressor(
    n_estimators=500,
    learning_rate=0.05,
    max_depth=6,
    min_child_weight=2,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,

    # new style: set early stopping & eval metric here
    early_stopping_rounds=20,
    eval_metric='mae'
)

# Train (just pass eval_set only)
model.fit(
    X_train_vec, y_train,
    eval_set=[(X_test_vec, y_test)],
    verbose=False
)

# Evaluate
y_pred = model.predict(X_test_vec)
print("MAE:", mean_absolute_error(y_test, y_pred))
print("R²:", r2_score(y_test, y_pred))

# Save separately
joblib.dump(model, "toxicity_regressor.pkl")
joblib.dump(vectorizer, "toxicity_vectorizer.pkl")'''