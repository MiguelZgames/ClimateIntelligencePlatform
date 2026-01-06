import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error
from ml_pipeline.models import MLModelWrapper, NaiveBaseline
from ml_pipeline.config import MODEL_PARAMS, CITY_COL, TIME_COL

class Evaluator:
    def __init__(self):
        pass

    def evaluate_walk_forward(self, df, feature_cols, target_col, horizons=[1, 2, 4], n_splits=5):
        """
        Perform Walk-Forward Validation.
        
        horizons: list of steps to predict (e.g., [1, 2, 4] for 30m, 60m, 120m)
        """
        # Ensure data is sorted
        df = df.sort_values(by=TIME_COL)
        
        # Get unique timestamps to define splits
        unique_times = df[TIME_COL].unique()
        unique_times = np.sort(unique_times)
        
        # Define split points (simple approach: divide time range into n_splits + 1 chunks)
        # We start training with at least some data.
        n_samples = len(unique_times)
        fold_size = n_samples // (n_splits + 1)
        
        results = []
        
        print(f"Starting Walk-Forward Validation with {n_splits} splits...")
        
        for i in range(1, n_splits + 1):
            split_idx = i * fold_size
            split_time = unique_times[split_idx]
            
            print(f"Fold {i}/{n_splits}: Training until {split_time}")
            
            # Train/Test Split
            train_mask = df[TIME_COL] <= split_time
            # Test set: next 'fold_size' samples (or less for the last fold)
            # Actually, walk-forward usually tests on the immediate next window.
            # Let's define test window as the next fold_size time steps.
            next_split_idx = min((i + 1) * fold_size, n_samples - 1)
            next_split_time = unique_times[next_split_idx]
            
            test_mask = (df[TIME_COL] > split_time) & (df[TIME_COL] <= next_split_time)
            
            train_df = df[train_mask]
            test_df = df[test_mask]
            
            if len(test_df) == 0:
                break

            for h in horizons:
                # Prepare Targets for Horizon h
                # We need to shift the target variable per city!
                # But creating columns for every fold is inefficient.
                # Better: The passed 'df' should already have the targets or we compute them on the fly.
                # To be safe and correct with per-city shift:
                
                # We assume features are already prepared in 'df'.
                # Now we need the target for horizon 'h'.
                # Let's create a temporary target column for this horizon.
                
                # NOTE: This shifting should ideally be done before splitting to ensure consistency,
                # but we must be careful not to leak data. 
                # Actually, shifting -h means row T contains value at T+h.
                # So if we split at T, row T is in Train. It contains y_{T+h}.
                # This is "Direct Strategy". We train to predict T+h using info at T.
                # So we can just use the shifted column.
                
                target_h_col = f"target_{target_col}_h{h}"
                
                # Check if target column exists, if not create it (inefficient to do in loop, but clear)
                # Ideally, this should be done outside. I'll assume it's done outside or do it here carefully.
                # Let's do it outside in the main script to avoid overhead.
                # Assuming 'df' has 'target_{target_col}_h{h}'
                
                if target_h_col not in df.columns:
                     # Fallback if not pre-calculated (for safety)
                     # Group by city and shift
                     df[target_h_col] = df.groupby(CITY_COL)[target_col].shift(-h)
                     train_df = df[train_mask] # Re-slice
                     test_df = df[test_mask]   # Re-slice
                
                # Drop NaNs in target (mostly at the end of the series)
                train_data = train_df.dropna(subset=[target_h_col] + feature_cols)
                test_data = test_df.dropna(subset=[target_h_col] + feature_cols)
                
                if len(train_data) == 0 or len(test_data) == 0:
                    continue

                X_train = train_data[feature_cols]
                y_train = train_data[target_h_col]
                X_test = test_data[feature_cols]
                y_test = test_data[target_h_col]
                
                # --- Baseline ---
                # Naive: Predict value at T (which is lag_0 or current value). 
                # Since we are predicting T+h using data at T, the "most recent observation" is at T.
                # The feature set should contain the current value.
                # Let's assume the target_col itself (at T) is in features or available.
                # Actually, in feature_engineering we usually keep the original columns.
                # So X_test[target_col] is the value at T.
                
                # If target_col is in feature_cols, great. If not, we fetch it from test_data.
                baseline_pred = test_data[target_col] # Persistence: pred(T+h) = val(T)
                
                mae_base = mean_absolute_error(y_test, baseline_pred)
                rmse_base = np.sqrt(mean_squared_error(y_test, baseline_pred))
                
                results.append({
                    "fold": i,
                    "horizon": h,
                    "model": "Baseline",
                    "target": target_col,
                    "mae": mae_base,
                    "rmse": rmse_base
                })
                
                # --- XGBoost ---
                xgb_model = MLModelWrapper("xgboost", MODEL_PARAMS["xgboost"])
                xgb_model.fit(X_train, y_train)
                xgb_pred = xgb_model.predict(X_test)
                
                mae_xgb = mean_absolute_error(y_test, xgb_pred)
                rmse_xgb = np.sqrt(mean_squared_error(y_test, xgb_pred))
                
                results.append({
                    "fold": i,
                    "horizon": h,
                    "model": "XGBoost",
                    "target": target_col,
                    "mae": mae_xgb,
                    "rmse": rmse_xgb
                })
                
                # --- LightGBM ---
                lgb_model = MLModelWrapper("lightgbm", MODEL_PARAMS["lightgbm"])
                lgb_model.fit(X_train, y_train)
                lgb_pred = lgb_model.predict(X_test)
                
                mae_lgb = mean_absolute_error(y_test, lgb_pred)
                rmse_lgb = np.sqrt(mean_squared_error(y_test, lgb_pred))
                
                results.append({
                    "fold": i,
                    "horizon": h,
                    "model": "LightGBM",
                    "target": target_col,
                    "mae": mae_lgb,
                    "rmse": rmse_lgb
                })
        
        return pd.DataFrame(results)
