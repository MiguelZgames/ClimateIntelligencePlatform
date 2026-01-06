import pandas as pd
from supabase import create_client, Client
from ml_pipeline.config import SUPABASE_URL, SUPABASE_KEY, TIME_COL

class DataLoader:
    def __init__(self):
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("Supabase credentials not found in environment variables.")
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    def fetch_data(self, limit=50000):
        """
        Fetch weather data from Supabase with pagination.
        """
        try:
            all_data = []
            offset = 0
            batch_size = 1000
            
            print(f"Fetching up to {limit} records...")
            
            while len(all_data) < limit:
                # Fetch batch
                response = self.supabase.table("weather_data") \
                    .select("*") \
                    .order(TIME_COL, desc=False) \
                    .range(offset, offset + batch_size - 1) \
                    .execute()
                
                batch = response.data
                if not batch:
                    break
                    
                all_data.extend(batch)
                offset += len(batch)
                
                if len(batch) < batch_size:
                    break
                    
            print(f"Total records fetched: {len(all_data)}")
            
            if not all_data:
                print("No data found in Supabase.")
                return pd.DataFrame()

            df = pd.DataFrame(all_data)
            
            # Convert timestamp to datetime
            df[TIME_COL] = pd.to_datetime(df[TIME_COL])
            
            # Ensure unique index per city and time
            df = df.drop_duplicates(subset=["city", TIME_COL])
            
            return df
            
        except Exception as e:
            print(f"Error fetching data: {e}")
            return pd.DataFrame()
