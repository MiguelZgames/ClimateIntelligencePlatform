import pandas as pd
import sys
import os

# Ensure we can import from the current directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from ml_pipeline.config import TARGET_VARIABLES, CITY_COL
from ml_pipeline.data_loader import DataLoader
from ml_pipeline.feature_engineering import FeatureEngineer
from ml_pipeline.evaluation import Evaluator

def main():
    print("🚀 Starting Climate Intelligence ML Pipeline...")

    # 1. Load Data
    print("📥 Loading data from Supabase...")
    loader = DataLoader()
    df = loader.fetch_data()
    
    if df.empty:
        print("❌ No data found. Exiting.")
        return

    print(f"✅ Loaded {len(df)} records.")

    # 2. Feature Engineering
    print("🛠️ Generating features...")
    fe = FeatureEngineer()
    df_features = fe.create_features(df, target_cols=TARGET_VARIABLES)
    
    print(f"✅ Features generated. Shape: {df_features.shape}")
    print(f"   Columns: {df_features.columns.tolist()}")

    # 3. Prepare Targets for Direct Strategy
    # Horizons: 1 step (30m), 2 steps (60m), 4 steps (120m)
    horizons = [1, 2, 4]
    
    print("🎯 Preparing targets for horizons: 30m, 60m, 120m...")
    for target in TARGET_VARIABLES:
        for h in horizons:
            col_name = f"target_{target}_h{h}"
            # Shift per city
            df_features[col_name] = df_features.groupby(CITY_COL)[target].shift(-h)
    
    # Drop rows where targets are NaN (end of series)
    # We only drop if ALL targets are NaN? No, we need valid rows for training.
    # But for evaluation, we might want to keep as much as possible.
    # The evaluator drops NaNs per horizon, so we can keep the DF as is, 
    # just maybe drop the initial NaNs from lags (already done in FE).
    
    # Identify feature columns (exclude targets and metadata)
    metadata_cols = ['id', 'created_at', 'ingestion_time', 'data_source', 'weather_timestamp', 'city']
    target_cols = [c for c in df_features.columns if c.startswith('target_')]
    feature_cols = [c for c in df_features.columns if c not in metadata_cols + target_cols]
    
    print(f"   Feature columns used: {feature_cols}")

    # 4. Evaluation
    print("⚖️ Starting Walk-Forward Evaluation...")
    evaluator = Evaluator()
    
    all_results = []
    
    for target in TARGET_VARIABLES:
        print(f"\n--- Evaluating for Target: {target} ---")
        results_df = evaluator.evaluate_walk_forward(
            df_features, 
            feature_cols, 
            target, 
            horizons=horizons,
            n_splits=5
        )
        all_results.append(results_df)

    if not all_results:
        print("⚠️ No results generated.")
        return

    final_results = pd.concat(all_results)
    
    # 5. Summary Report
    print("\n" + "="*50)
    print("📊 VALIDATION RESULTS SUMMARY")
    print("="*50)
    
    summary = final_results.groupby(['target', 'horizon', 'model'])[['mae', 'rmse']].mean().reset_index()
    
    # Pivot for better readability
    summary_pivot = summary.pivot(index=['target', 'horizon'], columns='model', values=['mae', 'rmse'])
    print(summary_pivot)
    
    # Check criteria
    print("\n✅ Validation Criteria Check:")
    for target in TARGET_VARIABLES:
        for h in horizons:
            subset = summary[(summary['target'] == target) & (summary['horizon'] == h)]
            if subset.empty: continue
            
            baseline_mae = subset[subset['model'] == 'Baseline']['mae'].values[0]
            best_model_row = subset[subset['model'] != 'Baseline'].sort_values('mae').iloc[0]
            best_model_name = best_model_row['model']
            best_model_mae = best_model_row['mae']
            
            improvement = (baseline_mae - best_model_mae) / baseline_mae * 100
            
            status = "PASS" if best_model_mae < baseline_mae else "FAIL"
            print(f"   - {target} (h={h}): {status} | Best: {best_model_name} (MAE: {best_model_mae:.4f}) vs Baseline ({baseline_mae:.4f}) -> Improvement: {improvement:.1f}%")

    # Save results
    final_results.to_csv("ml_pipeline/validation_results.csv", index=False)
    print("\n💾 Detailed results saved to ml_pipeline/validation_results.csv")

if __name__ == "__main__":
    main()
