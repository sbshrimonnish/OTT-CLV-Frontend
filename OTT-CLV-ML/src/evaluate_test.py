import json
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sklearn.linear_model import LinearRegression, Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

from src.config import (
    RAW_DATA_PATH, MODELS_DIR, REPORTS_DIR,
    RANDOM_STATE, PRIMARY_TARGET, FUTURE_TARGET_6M, FUTURE_TARGET_12M
)
from src.data_loader import load_raw_data, prepare_features_and_target
from src.preprocessing import build_full_pipeline
from src.evaluate import compute_metrics

TEST_DATA_PATH = RAW_DATA_PATH.parent / "Streaming_Test_3000.csv"
TRAIN_DATA_PATH = RAW_DATA_PATH

def evaluate_all_models_on_test():
    print("=" * 70)
    print("DETAILED 5-MODEL TEST SET EVALUATION (3,000 RECORDS)")
    print("=" * 70)

    # 1. Load Datasets
    df_train = load_raw_data(TRAIN_DATA_PATH)
    df_test = load_raw_data(TEST_DATA_PATH)

    X_train, y_train = prepare_features_and_target(df_train, PRIMARY_TARGET)
    X_test, y_test = prepare_features_and_target(df_test, PRIMARY_TARGET)

    models_dict = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0, random_state=RANDOM_STATE),
        "Decision Tree": DecisionTreeRegressor(max_depth=10, random_state=RANDOM_STATE),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=14, random_state=RANDOM_STATE, n_jobs=-1),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=RANDOM_STATE)
    }

    test_results = []

    for name, model in models_dict.items():
        pipeline = build_full_pipeline(model)
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        metrics = compute_metrics(y_test, preds)
        metrics['Model'] = name
        test_results.append(metrics)
        print(f"      --> {name:20s} | Test MAE: INR {metrics['MAE']:10.2f} | Test RMSE: INR {metrics['RMSE']:10.2f} | Test R2: {metrics['R2']:.4f}")

    df_test_results = pd.DataFrame(test_results)[['Model', 'MAE', 'RMSE', 'R2']]
    df_test_results.to_csv(MODELS_DIR / "final_test_metrics.csv", index=False)
    
    print("=" * 70)
    print(df_test_results.to_string(index=False))
    print("=" * 70)

if __name__ == '__main__':
    evaluate_all_models_on_test()
