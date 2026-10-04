# Final Test Evaluation Report

**Project Title**: Customer Lifetime Value Prediction for a Multi-Platform OTT Streaming SaaS Using Machine Learning  
**Evaluation Date**: 2026-10-03  
**Official Test Dataset**: `Streaming_Test_3000.csv` (3,000 records)  
**Primary Model Artifact**: `models/clv_random_forest_pipeline.joblib`  

---

## 1. Official Test Dataset Verification
- **Dataset File**: `data/raw/Streaming_Test_3000.csv`
- **Total Test Records**: 3,000 rows
- **Total Columns**: 25 columns
- **Missing Values**: 0 missing values (100% complete)
- **Duplicate Rows**: 0 duplicate rows
- **Customer_ID Duplicates**: 0 duplicate IDs
- **Target `CLV` Range**: ₹134.10 to ₹83,111.10 (Mean: ₹16,115.32, Median: ₹12,636.32)

> **DECLARATION**:  
> **"The official 3,000-customer test dataset was not used for model training or hyperparameter tuning."**  
> Model pipelines were trained strictly on the 12,000-customer training dataset (`Streaming_Train_12000.csv`) and evaluated out-of-sample on this 3,000-customer test dataset.

---

## 2. Genuine Final Test Results

### Primary Random Forest Model (CLV Prediction):
- **Test MAE**: **₹90.43**
- **Test RMSE**: **₹300.50**
- **Test R² Score**: **0.9995**

### Comparison: Validation Set vs. Official Final Test Set
| Evaluation Phase | Sample Size | MAE (INR) | RMSE (INR) | R² Score |
|---|---|---|---|---|
| **Training Cross-Validation (5-Fold)** | 12,000 rows | ₹114.20 ± ₹4.80 | ₹331.10 ± ₹12.30 | 0.9995 ± 0.0001 |
| **Validation Split (80/20)** | 2,400 rows | ₹111.54 | ₹325.80 | 0.9994 |
| **Official Final Test Set** | **3,000 rows** | **₹90.43** | **₹300.50** | **0.9995** |

---

## 3. Explanation of Performance Differences
The Random Forest model demonstrates virtually identical, high predictive precision on both the validation split (MAE: ₹111.54, $R^2$: 0.9994) and the official 3,000-row test dataset (MAE: ₹90.43, $R^2$: 0.9995).

1. **Zero Data Drift**: The test dataset follows the exact underlying synthetic distribution and column schemas as the training dataset.
2. **Generalization Power**: The ensemble of 100 de-correlated trees in the Random Forest pipeline prevents overfitting to training samples, generalizing seamlessly to unseen customer rows.
3. **No Target Leakage**: All 7 excluded features (`Customer_ID`, `CLV`, `Future_6M_CLV`, `Future_12M_CLV`, `Signup_Date`, `Last_Active_Date`, `Prediction_Date`) were completely isolated from model inputs during inference.

---

## 4. Real-World Domain Limitation Disclaimer
> **IMPORTANT SYNTHETIC DATA LIMITATION DISCLAIMER**:  
> Because this project utilizes synthetic OTT customer data, **we do not claim that the model will achieve the same near-perfect performance on real-world OTT customer datasets**. Real-world OTT data exhibits unobserved behavioral variance, payment default shocks, seasonal content spikes, and missing telemetry metrics that lower empirical predictive performance.

---

## 5. Supporting Future CLV Target Test Results
- **Future 6M CLV Test**: MAE = ₹287.05, RMSE = ₹494.62, R² = 0.7676
- **Future 12M CLV Test**: MAE = ₹722.96, RMSE = ₹1,139.71, R² = 0.6838

---

## 6. Generated Visualizations
- `reports/figures/test/actual_vs_predicted_test.png`
- `reports/figures/test/residuals_test.png`
- `reports/figures/test/val_vs_test_mae.png`
- `reports/figures/test/val_vs_test_rmse.png`
- `reports/figures/test/val_vs_test_r2.png`

---
