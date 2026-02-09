import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import os

# Load dataset
data = pd.read_csv("dataset/weather.csv")

# Input and Output
X = data[['humidity', 'pressure', 'wind_speed']]
y = data['temperature']

# Train model
model = LinearRegression()
model.fit(X, y)

# Create model folder if not exists
os.makedirs("model", exist_ok=True)

# Save model
joblib.dump(model, "model/weather_model.pkl")

print("✅ Model trained and saved successfully!")