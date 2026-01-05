import os
import time
import requests
import pandas as pd
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client
from cities import CITIES

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role for ETL to bypass RLS if needed, or ANON if policy allows

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment.")
    # For local development/testing without env vars, we might want to fail gracefully or mock.
    # But for production code, we should exit.
    # exit(1) 

# Initialize Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Could not initialize Supabase client: {e}")
    supabase = None

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

def fetch_weather_data_batch(cities_batch):
    """
    Fetch weather data for a batch of cities using Open-Meteo API.
    """
    lats = [str(city["latitude"]) for city in cities_batch]
    longs = [str(city["longitude"]) for city in cities_batch]
    
    params = {
        "latitude": ",".join(lats),
        "longitude": ",".join(longs),
        "current": "temperature_2m,relative_humidity_2m",
        "timezone": "UTC"
    }
    
    try:
        response = requests.get(OPEN_METEO_URL, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data batch: {e}")
        return None

def process_and_store_data(data_list, cities_batch):
    """
    Process API response and store in Supabase.
    """
    if not data_list:
        return

    # Open-Meteo returns a list of results if multiple locations are requested, 
    # or a single object if only one.
    if not isinstance(data_list, list):
        data_list = [data_list]
        
    records_to_insert = []
    current_time = datetime.now(timezone.utc).isoformat()
    
    for i, data in enumerate(data_list):
        city_info = cities_batch[i]
        
        # Check for error in individual result
        if "error" in data:
            print(f"Error for city {city_info['name']}: {data.get('reason')}")
            continue
            
        current_weather = data.get("current", {})
        
        record = {
            "city": city_info["name"],
            "latitude": city_info["latitude"],
            "longitude": city_info["longitude"],
            "temperature": current_weather.get("temperature_2m"),
            "humidity": current_weather.get("relative_humidity_2m"),
            "weather_timestamp": current_weather.get("time") + "Z", # Open-Meteo returns ISO without Z for UTC usually if timezone=UTC is set, but let's ensure
            "ingestion_time": current_time,
            "data_source": "open-meteo"
        }
        
        records_to_insert.append(record)
        
    if records_to_insert and supabase:
        try:
            # Upsert data based on city and weather_timestamp (unique constraint)
            # We use `upsert` to avoid duplicates if the script runs multiple times for the same timestamp
            response = supabase.table("weather_data").upsert(records_to_insert, on_conflict="city,weather_timestamp").execute()
            print(f"Successfully inserted/updated {len(records_to_insert)} records.")
        except Exception as e:
            print(f"Error inserting into Supabase: {e}")
    else:
        print(f"Processed {len(records_to_insert)} records (Supabase not connected or empty batch).")
        # For debugging/logging if Supabase is not active
        # print(records_to_insert)

def main():
    print(f"Starting ETL pipeline for {len(CITIES)} cities...")
    
    BATCH_SIZE = 50 # Open-Meteo generally handles this well
    
    for i in range(0, len(CITIES), BATCH_SIZE):
        batch = CITIES[i:i + BATCH_SIZE]
        print(f"Processing batch {i//BATCH_SIZE + 1} ({len(batch)} cities)...")
        
        data = fetch_weather_data_batch(batch)
        if data:
            process_and_store_data(data, batch)
        
        # Respect rate limits (though batching helps, adding a small sleep is good practice)
        time.sleep(1) 
        
    print("ETL pipeline completed.")

if __name__ == "__main__":
    main()
