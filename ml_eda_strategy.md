# ML & EDA Strategy

## Phase 1: Exploratory Data Analysis (EDA) & Preprocessing

### 1. Data Cleaning
- **Missing Values**: Impute missing temperature/humidity using linear interpolation or KNN imputation based on neighboring timestamps.
- **Outliers**: Detect using Z-score (>3 std dev) or IQR method. Flag but do not remove unless clearly erroneous (e.g., +200°C).
- **Consistency**: Ensure all timestamps are UTC. Normalize city names.

### 2. Feature Engineering
- **Time Features**: Extract hour, day_of_week, month, season.
- **Lag Features**: Create lag variables (t-1h, t-24h) for temperature and humidity.
- **Rolling Stats**: 24h rolling mean/std.
- **Cyclical Encoding**: Encode hour/month using sin/cos to preserve cyclical nature.

### 3. Dashboard Outputs (EDA)
- **Time Series Plots**: Temperature trends over time per city.
- **Correlation Heatmaps**: Temp vs Humidity vs Hour.
- **Distribution Plots**: Histograms of temperature ranges.

## Phase 2: Modeling

### 1. Problem Definition
- **Primary Goal**: Short-term temperature forecasting (Next 24-72 hours).
- **Secondary Goal**: Anomaly detection (Heatwaves/Cold snaps).

### 2. Model Selection
- **Baseline**: Persistence Model (Tomorrow = Today) or ARIMA.
- **ML Models**:
  - **XGBoost/LightGBM**: Handle non-linear relationships and interactions well. Fast training.
  - **Random Forest**: robust to overfitting, good interpretability.
- **DL Models** (Advanced Phase):
  - **LSTM/GRU**: Recurrent networks for capturing long-term temporal dependencies.
  - **Prophet**: Facebook's model for time series with strong seasonality.

### 3. Metrics
- **Regression**: RMSE (Root Mean Square Error), MAE (Mean Absolute Error), MAPE (Mean Absolute Percentage Error).
- **Classification (Anomalies)**: Precision, Recall, F1-Score.

### 4. Validation
- **Time-based Split**: Train on past (e.g., Jan-Oct), Test on future (Nov-Dec). Avoid random shuffle to prevent leakage.
- **Rolling Cross-Validation**: Walk-forward validation.

### 5. Interpretability (XAI)
- **SHAP (SHapley Additive exPlanations)**: Explain global feature importance (e.g., "Hour of day has highest impact") and local predictions (e.g., "This specific high temp is due to recent trend + seasonal factor").
- **LIME**: Local surrogate models for specific instances.

## Monitoring & MLOps
- **Drift Detection**: Monitor distribution of incoming data vs training data.
- **Model Performance**: Track RMSE over time in Admin Dashboard.
- **Retraining**: Automated trigger via GitHub Actions if performance drops below threshold.

## Roadmap
1. **MVP**: EDA Dashboard + ARIMA/Linear Regression Baseline.
2. **V1**: XGBoost Model + SHAP Explanations + User Predictions Page.
3. **V2**: LSTM Model + Anomaly Alerts + Real-time Ingestion.
