import pandas as pd
import numpy as np
from ml_pipeline.config import LAGS, ROLLING_WINDOWS, TIME_COL, CITY_COL

class FeatureEngineer:
    def __init__(self):
        pass

    def create_features(self, df: pd.DataFrame, target_cols=["temperature", "humidity"]):
        """
        Generate features for the given dataframe.
        """
        df = df.copy()
        df = df.sort_values(by=[CITY_COL, TIME_COL])
        
        # 1. Temporal Variables
        df['hour'] = df[TIME_COL].dt.hour
        df['day_of_week'] = df[TIME_COL].dt.dayofweek
        
        # Cyclical encoding for hour
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        
        # 2. Lags and Rolling Windows (Per City)
        # We need to ensure the time frequency is consistent (30 min)
        # Resampling might be needed if there are gaps, but for now we assume consistent data
        # or we treat the index as sequential steps.
        
        grouped = df.groupby(CITY_COL)
        
        feature_cols = []
        
        for target in target_cols:
            # Lags
            for lag in LAGS:
                col_name = f"{target}_lag_{lag}"
                df[col_name] = grouped[target].shift(lag)
                feature_cols.append(col_name)
            
            # Rolling Windows
            for window in ROLLING_WINDOWS:
                # Rolling mean
                col_mean = f"{target}_roll_mean_{window}"
                df[col_mean] = grouped[target].transform(lambda x: x.rolling(window=window, min_periods=1).mean())
                feature_cols.append(col_mean)
                
                # Rolling std
                col_std = f"{target}_roll_std_{window}"
                df[col_std] = grouped[target].transform(lambda x: x.rolling(window=window, min_periods=1).std())
                feature_cols.append(col_std)
        
        # 3. Spatial Variables (already present: latitude, longitude)
        # We can ensure they are numeric
        df['latitude'] = pd.to_numeric(df['latitude'])
        df['longitude'] = pd.to_numeric(df['longitude'])
        
        # 4. Preprocessing
        # Drop rows with NaN created by lags (at the beginning of the series)
        # Alternatively, we could fill them, but for training it's better to drop
        df = df.dropna()
        
        return df
