from sklearn.base import BaseEstimator, RegressorMixin
import xgboost as xgb
import lightgbm as lgb
import numpy as np

class NaiveBaseline(BaseEstimator, RegressorMixin):
    """
    Naive Baseline Model: Predicts the last observed value.
    """
    def fit(self, X, y):
        return self

    def predict(self, X):
        # Assuming the last observed value is one of the features.
        # We need to know which feature corresponds to 't' (lag 0 or similar if available, otherwise lag 1)
        # In our feature engineering, we generated lag_1, lag_2, etc.
        # So the most recent known value is lag_1.
        
        # We need to identify the column index or name for lag_1 of the target variable.
        # This implementation assumes X is a DataFrame and has a column ending in '_lag_1' 
        # that matches the target we are predicting.
        
        # This is a simplification. The caller should ensure X contains the reference value.
        # For a generic 'predict' we might need to be passed the specific column name.
        pass

class MLModelWrapper:
    def __init__(self, model_type, params):
        self.model_type = model_type
        self.params = params
        self.model = None

    def fit(self, X, y):
        if self.model_type == 'xgboost':
            self.model = xgb.XGBRegressor(**self.params)
        elif self.model_type == 'lightgbm':
            self.model = lgb.LGBMRegressor(**self.params)
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
            
        self.model.fit(X, y)
        return self

    def predict(self, X):
        return self.model.predict(X)
