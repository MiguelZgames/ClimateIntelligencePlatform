import pandas as pd
import numpy as np
import sys
import os
import json
from datetime import datetime, timezone

# Ensure we can import from the current directory and siblings
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from ml_pipeline.config import TARGET_VARIABLES, CITY_COL, MODEL_PARAMS
from ml_pipeline.data_loader import DataLoader
from ml_pipeline.feature_engineering import FeatureEngineer
from ml_pipeline.models import MLModelWrapper
from etl.cities import CITIES
from supabase import create_client

# Supabase setup
from dotenv import load_dotenv
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def main():
    print("🚀 Starting Inference for All Cities...")

    # 1. Load historical data to train models
    print("📥 Loading historical data...")
    loader = DataLoader()
    df = loader.fetch_data(limit=50000)
    
    if df.empty:
        print("❌ No data found.")
        return

    # 2. Feature Engineering
    print("🛠️ Generating features...")
    fe = FeatureEngineer()
    df_features = fe.create_features(df, target_cols=TARGET_VARIABLES)
    
    # 3. Train Models (XGBoost) on full dataset
    print("🧠 Training XGBoost models...")
    models = {}
    horizons = [1, 2, 4] # 30m, 60m, 120m
    
    for target in TARGET_VARIABLES:
        models[target] = {}
        for h in horizons:
            # Prepare target
            target_col = f"target_{target}_h{h}"
            df_features[target_col] = df_features.groupby(CITY_COL)[target].shift(-h)
            
            # Drop NaNs
            train_data = df_features.dropna(subset=[target_col])
            
            # Features
            metadata_cols = ['id', 'created_at', 'ingestion_time', 'data_source', 'weather_timestamp', 'city'] + [c for c in df_features.columns if c.startswith('target_')]
            feature_cols = [c for c in df_features.columns if c not in metadata_cols]
            
            X = train_data[feature_cols]
            y = train_data[target_col]
            
            model = MLModelWrapper("xgboost", MODEL_PARAMS["xgboost"])
            model.fit(X, y)
            models[target][h] = model
            print(f"   ✅ Trained {target} model for horizon {h}")

    # 4. Generate Predictions for Current State
    print("🔮 Generating predictions for all cities...")
    
    # We need the *latest* feature vector for each city
    # Sort by time and take last row per city
    latest_features = df_features.sort_values('weather_timestamp').groupby('city').tail(1)
    
    predictions_to_save = []
    
    for _, row in latest_features.iterrows():
        city_name = row['city']
        
        # Find city metadata (lat/lon) from CITIES list for accuracy
        city_meta = next((c for c in CITIES if c["name"] == city_name), None)
        if not city_meta: continue

        # Prepare input vector (same features as training)
        # We need to construct a DataFrame with 1 row
        input_features = row[feature_cols].to_frame().T
        # Ensure numeric types
        input_features = input_features.astype(float)
        
        pred_results = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "horizons": {}
        }
        
        for h in horizons:
            horizon_label = "30m" if h == 1 else "60m" if h == 2 else "120m"
            pred_results["horizons"][horizon_label] = {}
            
            for target in TARGET_VARIABLES:
                model = models[target][h]
                pred_val = model.predict(input_features)[0]
                pred_results["horizons"][horizon_label][target] = float(pred_val)
        
        # Construct record for 'predictions' table
        # Table schema: id, user_id, city, model_type, prediction_results (jsonb), accuracy_score, created_at
        
        record = {
            "city": city_name,
            "model_type": "xgboost-ensemble",
            "prediction_results": pred_results,
            "created_at": datetime.now(timezone.utc).isoformat()
            # user_id is optional, can be null for system generated
        }
        predictions_to_save.append(record)

    # 5. Save to Supabase
    if predictions_to_save:
        print(f"💾 Saving {len(predictions_to_save)} predictions to Supabase...")
        try:
            # Insert in batches
            batch_size = 50
            for i in range(0, len(predictions_to_save), batch_size):
                batch = predictions_to_save[i:i+batch_size]
                supabase.table("predictions").insert(batch).execute()
            print("✅ Predictions saved successfully!")
        except Exception as e:
            print(f"❌ Error saving predictions: {e}")
    else:
        print("⚠️ No predictions generated.")

if __name__ == "__main__":
    main()
