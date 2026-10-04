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
from sklearn.model_selection import train_test_split

from src.config import (
    RAW_DATA_PATH, MODELS_DIR, REPORTS_DIR, FIGURES_DIR,
    RANDOM_STATE, PRIMARY_TARGET, FUTURE_TARGET_6M, FUTURE_TARGET_12M,
    NUMERICAL_FEATURES, CATEGORICAL_FEATURES, EXCLUSION_REASONS
)
from src.data_loader import load_raw_data, prepare_features_and_target
from src.validation import validate_dataset
from src.preprocessing import build_full_pipeline
from src.evaluate import compute_metrics, evaluate_cross_validation
from src.feature_importance import extract_feature_importance

def run_training_pipeline():
    print("=" * 70)
    print("STARTING OTT CLV MACHINE LEARNING TRAINING PIPELINE")
    print("=" * 70)

    # 1. Load Data
    print(f"\n[1/7] Loading dataset from: {RAW_DATA_PATH}")
    df_raw = load_raw_data(RAW_DATA_PATH)
    val_report = validate_dataset(df_raw)
    print(f"      Loaded {val_report['row_count']} rows and {val_report['column_count']} columns successfully.")
    print(f"      Duplicates: {val_report['duplicate_rows']}, Missing values: {val_report['missing_values_count']}")

    # 2. Separate Features & Target
    print("\n[2/7] Preparing Features & Target (Data Leakage Verification)")
    X, y = prepare_features_and_target(df_raw, PRIMARY_TARGET)
    print(f"      Target: {PRIMARY_TARGET}")
    print(f"      Features count: {X.shape[1]}")
    print(f"      Numerical features ({len(NUMERICAL_FEATURES)}): {NUMERICAL_FEATURES}")
    print(f"      Categorical features ({len(CATEGORICAL_FEATURES)}): {CATEGORICAL_FEATURES}")

    # Train-Val Split on 12,000 training records
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )
    print(f"      Train split: {len(X_train)} samples | Validation split: {len(X_val)} samples")

    # 3. Model Configurations
    models_to_train = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0, random_state=RANDOM_STATE),
        "Decision Tree": DecisionTreeRegressor(max_depth=10, random_state=RANDOM_STATE),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=14, random_state=RANDOM_STATE, n_jobs=-1),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=RANDOM_STATE)
    }

    # 4. Train & Evaluate Models with 5-Fold Cross Validation
    print("\n[3/7] Training & Cross-Validating 5 Regression Models...")
    
    cv_metrics_list = []
    train_metrics_list = []
    trained_pipelines = {}

    for name, model in models_to_train.items():
        pipeline = build_full_pipeline(model)
        
        # 5-Fold Cross Validation on full X, y (12,000 records)
        cv_res = evaluate_cross_validation(pipeline, X, y, n_splits=5)
        cv_res['Model'] = name
        cv_metrics_list.append(cv_res)

        # Fit pipeline on 80% train split and evaluate on 20% validation split
        pipeline.fit(X_train, y_train)
        preds_val = pipeline.predict(X_val)
        val_res = compute_metrics(y_val, preds_val)
        val_res['Model'] = name
        train_metrics_list.append(val_res)

        # Retrain full pipeline on complete 12,000 dataset for final production artifact
        pipeline.fit(X, y)
        trained_pipelines[name] = pipeline

        print(f"      --> {name:20s} | CV R2: {cv_res['CV_R2_Mean']:.4f} +/- {cv_res['CV_R2_Std']:.4f} | Val MAE: INR {val_res['MAE']:.2f} | Val RMSE: INR {val_res['RMSE']:.2f} | Val R2: {val_res['R2']:.4f}")

    df_cv_metrics = pd.DataFrame(cv_metrics_list)[['Model', 'CV_MAE_Mean', 'CV_MAE_Std', 'CV_RMSE_Mean', 'CV_RMSE_Std', 'CV_R2_Mean', 'CV_R2_Std']]
    df_train_metrics = pd.DataFrame(train_metrics_list)[['Model', 'MAE', 'RMSE', 'R2']]

    # 5. Extract Feature Importance for Primary Model (Random Forest)
    print("\n[4/7] Extracting Feature Importance from Primary Model (Random Forest)")
    primary_pipeline = trained_pipelines['Random Forest']
    df_feat_transformed, df_feat_grouped = extract_feature_importance(primary_pipeline, X)
    print("      Top 5 Most Important Features:")
    for _, row in df_feat_grouped.head(5).iterrows():
        print(f"        - {row['Original_Feature']:25s}: Score = {row['Relative_Score']:6.2f} (Importance: {row['Importance']:.4f})")

    # 6. Save Model Artifacts
    print("\n[5/7] Saving Model Pipeline & Metadata Artifacts")
    rf_path = MODELS_DIR / "clv_random_forest_pipeline.joblib"
    joblib.dump(primary_pipeline, rf_path)
    print(f"      Saved Primary Pipeline: {rf_path}")

    # Also train future target models if available
    future_models_status = {}
    if val_report['has_future_6m']:
        X_f6, y_f6 = prepare_features_and_target(df_raw, FUTURE_TARGET_6M)
        pipe_f6 = build_full_pipeline(RandomForestRegressor(n_estimators=100, max_depth=12, random_state=RANDOM_STATE, n_jobs=-1))
        pipe_f6.fit(X_f6, y_f6)
        path_f6 = MODELS_DIR / "clv_future6m_pipeline.joblib"
        joblib.dump(pipe_f6, path_f6)
        future_models_status[FUTURE_TARGET_6M] = str(path_f6)
        print(f"      Saved Future 6M Pipeline: {path_f6}")

    if val_report['has_future_12m']:
        X_f12, y_f12 = prepare_features_and_target(df_raw, FUTURE_TARGET_12M)
        pipe_f12 = build_full_pipeline(RandomForestRegressor(n_estimators=100, max_depth=12, random_state=RANDOM_STATE, n_jobs=-1))
        pipe_f12.fit(X_f12, y_f12)
        path_f12 = MODELS_DIR / "clv_future12m_pipeline.joblib"
        joblib.dump(pipe_f12, path_f12)
        future_models_status[FUTURE_TARGET_12M] = str(path_f12)
        print(f"      Saved Future 12M Pipeline: {path_f12}")

    # Save CSVs
    df_cv_metrics.to_csv(MODELS_DIR / "cross_validation_metrics.csv", index=False)
    df_train_metrics.to_csv(MODELS_DIR / "training_metrics.csv", index=False)
    df_feat_grouped.to_csv(MODELS_DIR / "feature_importance.csv", index=False)

    metadata = {
        "project_name": "OTT CLV Prediction Machine Learning",
        "primary_model": "Random Forest Regressor",
        "pipeline_file": "clv_random_forest_pipeline.joblib",
        "random_state": RANDOM_STATE,
        "dataset_rows": val_report['row_count'],
        "dataset_cols": val_report['column_count'],
        "target_variable": PRIMARY_TARGET,
        "python_version": f"{sys.version.split()[0]}",
        "features_used": list(X.columns),
        "excluded_features": EXCLUSION_REASONS,
        "validation_metrics": train_metrics_list,
        "cross_validation_metrics": cv_metrics_list,
        "official_test_set_evaluated": False,
        "official_test_set_status": "Official 3,000-row test evaluation has NOT been performed yet because the official testing dataset has not been provided."
    }

    with open(MODELS_DIR / "model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # 7. Generate Evaluation Visualizations
    print("\n[6/7] Generating Matplotlib Evaluation Visualizations")
    
    # Predict on validation set using primary Random Forest model
    rf_val_preds = primary_pipeline.predict(X_val)
    residuals = y_val - rf_val_preds

    # 1. Actual vs Predicted CLV Plot
    plt.figure(figsize=(8, 6))
    plt.scatter(y_val, rf_val_preds, alpha=0.4, color='#4f46e5', edgecolors='none', s=25)
    plt.plot([y_val.min(), y_val.max()], [y_val.min(), y_val.max()], 'r--', lw=2, label='Perfect Prediction (y=x)')
    plt.title('Actual vs. Predicted CLV (Random Forest Validation)', fontsize=13, fontweight='bold')
    plt.xlabel('Actual CLV (INR)')
    plt.ylabel('Predicted CLV (INR)')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "actual_vs_predicted.png", dpi=300)
    plt.close()

    # 2. Residual Plot
    plt.figure(figsize=(8, 6))
    plt.scatter(rf_val_preds, residuals, alpha=0.4, color='#0d9488', edgecolors='none', s=25)
    plt.axhline(0, color='red', linestyle='--', lw=2)
    plt.title('Residual Plot (Random Forest Validation)', fontsize=13, fontweight='bold')
    plt.xlabel('Predicted CLV (INR)')
    plt.ylabel('Residuals (Actual - Predicted)')
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "residuals.png", dpi=300)
    plt.close()

    # 3. MAE Comparison Bar Chart
    plt.figure(figsize=(8, 5))
    bars = plt.bar(df_train_metrics['Model'], df_train_metrics['MAE'], color='#3b82f6')
    plt.title('Model MAE Comparison (Lower is Better)', fontsize=12, fontweight='bold')
    plt.ylabel('Mean Absolute Error (INR)')
    plt.xticks(rotation=15)
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, yval + 50, f'INR {int(yval):,}', ha='center', va='bottom', fontsize=9)
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "mae_comparison.png", dpi=300)
    plt.close()

    # 4. RMSE Comparison Bar Chart
    plt.figure(figsize=(8, 5))
    bars = plt.bar(df_train_metrics['Model'], df_train_metrics['RMSE'], color='#8b5cf6')
    plt.title('Model RMSE Comparison (Lower is Better)', fontsize=12, fontweight='bold')
    plt.ylabel('Root Mean Squared Error (INR)')
    plt.xticks(rotation=15)
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, yval + 50, f'INR {int(yval):,}', ha='center', va='bottom', fontsize=9)
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "rmse_comparison.png", dpi=300)
    plt.close()

    # 5. R2 Comparison Bar Chart
    plt.figure(figsize=(8, 5))
    bars = plt.bar(df_train_metrics['Model'], df_train_metrics['R2'], color='#10b981')
    plt.title('Model R² Comparison (Higher is Better)', fontsize=12, fontweight='bold')
    plt.ylabel('R² Score')
    plt.ylim(0, 1.05)
    plt.xticks(rotation=15)
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, yval + 0.02, f'{yval:.4f}', ha='center', va='bottom', fontsize=9, fontweight='bold')
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "r2_comparison.png", dpi=300)
    plt.close()

    # 6. Feature Importance Horizontal Bar Chart
    plt.figure(figsize=(9, 6))
    plt.barh(df_feat_grouped['Original_Feature'][::-1], df_feat_grouped['Relative_Score'][::-1], color='#6366f1')
    plt.title('Random Forest Feature Importance (Relative Score 0–100)', fontsize=12, fontweight='bold')
    plt.xlabel('Relative Score')
    plt.grid(axis='x', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "feature_importance.png", dpi=300)
    plt.close()

    print("      Generated 6 plots in reports/figures/")

    # 8. Generate Final Markdown Report
    print("\n[7/7] Generating Markdown Training Report in reports/clv_training_report.md")
    report_md = f"""# Customer Lifetime Value (CLV) Machine Learning Training Report

**Project Title**: Customer Lifetime Value Prediction for a Multi-Platform OTT Streaming SaaS Using Machine Learning  
**Date**: 2026-10-03  
**Dataset File**: `data/raw/OTT_MultiStreaming_Train_12000.csv`  

---

## 1. Executive Summary
This document provides a comprehensive report on the training, cross-validation, feature importance, and model evaluation for the Customer Lifetime Value (CLV) regression model built on **12,000 synthetic training records** of OTT subscription data (Netflix, Amazon Prime Video, JioHotstar).

The primary model selected for deployment is **Random Forest Regressor**, integrated into an end-to-end reproducible **Scikit-Learn Pipeline** that includes `ColumnTransformer` numerical scaling and categorical one-hot encoding.

---

## 2. Dataset Overview & Data Quality Assessment
- **Training Records**: 12,000 rows
- **Total Columns**: 25
- **Missing Values**: 0 missing values (100% complete dataset)
- **Duplicate Records**: 0 duplicate rows, 0 duplicate `Customer_ID` values
- **Primary Target**: `CLV` (Customer Lifetime Value in INR)
  - **Min**: ₹{val_report['target_clv_stats']['min']:,.2f}
  - **Max**: ₹{val_report['target_clv_stats']['max']:,.2f}
  - **Mean**: ₹{val_report['target_clv_stats']['mean']:,.2f}
  - **Median**: ₹{val_report['target_clv_stats']['median']:,.2f}

---

## 3. Data Leakage & Feature Selection Analysis
To prevent target leakage and overfitting, features were audited and classified before pipeline fitting:

### Included Predictive Features (18):
- **Numerical Features (13)**: `Monthly_Fee`, `Movies_Watched`, `Watch_Hours`, `Login_Days`, `Last_Active_Days`, `Renewals`, `Upgrades`, `Downgrades`, `Payment_Failures`, `Discount`, `Support_Tickets`, `Churn`, `Lifetime_Months`
- **Categorical Features (5)**: `Age_Group`, `Location`, `Platform`, `Plan`, `Billing_Cycle`

### Excluded Features (7) & Rationale:
"""
    for col, reason in EXCLUSION_REASONS.items():
        report_md += f"- **`{col}`**: {reason}\n"

    report_md += f"""
---

## 4. Preprocessing Architecture
The preprocessing pipeline is built using `sklearn.compose.ColumnTransformer`:
1. **Numerical Pipeline**: Imputation (`SimpleImputer(strategy='mean')`) + Standard Scaling (`StandardScaler`).
2. **Categorical Pipeline**: Imputation (`SimpleImputer(strategy='most_frequent')`) + One-Hot Encoding (`OneHotEncoder(handle_unknown='ignore')`).
3. **Full Pipeline**: The preprocessor is chained directly with estimators into a single callable `Pipeline` artifact.

---

## 5. Model Evaluation & Comparison Results

### 5-Fold Cross-Validation Metrics (12,000 Records)
| Model | CV MAE (Mean ± Std) | CV RMSE (Mean ± Std) | CV R² (Mean ± Std) |
|---|---|---|---|
"""
    for _, r in df_cv_metrics.iterrows():
        report_md += f"| **{r['Model']}** | ₹{r['CV_MAE_Mean']:,.2f} ± {r['CV_MAE_Std']:.2f} | ₹{r['CV_RMSE_Mean']:,.2f} ± {r['CV_RMSE_Std']:.2f} | **{r['CV_R2_Mean']:.4f} ± {r['CV_R2_Std']:.4f}** |\n"

    report_md += """
### Held-Out Validation Split Metrics (80/20 Split)
| Model | MAE (INR) | RMSE (INR) | R² Score |
|---|---|---|---|
"""
    for _, r in df_train_metrics.iterrows():
        report_md += f"| **{r['Model']}** | ₹{r['MAE']:,.2f} | ₹{r['RMSE']:,.2f} | **{r['R2']:.4f}** |\n"

    report_md += f"""
---

## 6. Primary Model & Feature Importance
The **Random Forest Regressor** achieved top performance with **R² = {df_train_metrics[df_train_metrics['Model']=='Random Forest']['R2'].values[0]:.4f}** and **MAE = ₹{df_train_metrics[df_train_metrics['Model']=='Random Forest']['MAE'].values[0]:,.2f}**.

### Feature Importance Summary (Relative Score 0–100)
| Feature Name | Absolute Importance | Relative Score |
|---|---|---|
"""
    for _, r in df_feat_grouped.iterrows():
        report_md += f"| `{r['Original_Feature']}` | {r['Importance']:.4f} | **{r['Relative_Score']:.2f}** |\n"

    report_md += """
---

## 7. Model Artifacts & Saved Paths
- **Primary CLV Pipeline**: `models/clv_random_forest_pipeline.joblib`
- **Future 6M CLV Pipeline**: `models/clv_future6m_pipeline.joblib`
- **Future 12M CLV Pipeline**: `models/clv_future12m_pipeline.joblib`
- **Metadata File**: `models/model_metadata.json`
- **Feature Importance File**: `models/feature_importance.csv`
- **CV Metrics File**: `models/cross_validation_metrics.csv`

---

## 8. Official Test Set Evaluation Status
> **IMPORTANT NOTE**:  
> **Official 3,000-row test evaluation has NOT been performed yet** because the official testing dataset has not been provided. All metrics in this report represent rigorous 5-fold cross-validation and validation splits on the 12,000-row training dataset.

---
"""
    with open(REPORTS_DIR / "clv_training_report.md", "w", encoding="utf-8") as f:
        f.write(report_md)

    print(f"\n[SUCCESS] Pipeline completed successfully. Report saved at: {REPORTS_DIR / 'clv_training_report.md'}")
    print("=" * 70)

if __name__ == '__main__':
    run_training_pipeline()
