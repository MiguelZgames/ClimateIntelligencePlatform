import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Data Configuration
TARGET_VARIABLES = ["temperature", "humidity"]
TIME_COL = "weather_timestamp"
CITY_COL = "city"

# Feature Engineering Configuration
LAGS = [1, 2, 3]  # 30, 60, 90 minutes (assuming 30min freq)
ROLLING_WINDOWS = [4, 12]  # 2 hours (4 * 30min), 6 hours (12 * 30min)

# Model Configuration
MODEL_PARAMS = {
    "xgboost": {
        "n_estimators": 100,
        "max_depth": 5,
        "learning_rate": 0.05,
        "objective": "reg:squarederror",
        "n_jobs": -1
    },
    "lightgbm": {
        "n_estimators": 100,
        "max_depth": 5,
        "learning_rate": 0.05,
        "objective": "regression",
        "n_jobs": -1,
        "verbose": -1
    }
}

# Evaluation Configuration
WALK_FORWARD_STEPS = 3  # Predict t+1, t+2, t+3
TEST_SIZE_HOURS = 24  # Size of each fold in hours (example)
