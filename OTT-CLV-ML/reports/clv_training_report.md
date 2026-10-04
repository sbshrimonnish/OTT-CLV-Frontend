# Customer Lifetime Value (CLV) Machine Learning Training Report

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
  - **Min**: ₹111.75
  - **Max**: ₹83,670.30
  - **Mean**: ₹15,929.15
  - **Median**: ₹12,438.40

---

## 3. Data Leakage & Feature Selection Analysis
To prevent target leakage and overfitting, features were audited and classified before pipeline fitting:

### Included Predictive Features (18):
- **Numerical Features (13)**: `Monthly_Fee`, `Movies_Watched`, `Watch_Hours`, `Login_Days`, `Last_Active_Days`, `Renewals`, `Upgrades`, `Downgrades`, `Payment_Failures`, `Discount`, `Support_Tickets`, `Churn`, `Lifetime_Months`
- **Categorical Features (5)**: `Age_Group`, `Location`, `Platform`, `Plan`, `Billing_Cycle`

### Excluded Features (7) & Rationale:
- **`Customer_ID`**: Unique row identifier; contains no predictive signal and causes data leakage/overfitting.
- **`CLV`**: Target variable; using it as an input feature is direct target leakage.
- **`Future_6M_CLV`**: Future target variable; using future values to predict current CLV is temporal data leakage.
- **`Future_12M_CLV`**: Future target variable; using future values to predict current CLV is temporal data leakage.
- **`Signup_Date`**: Raw date string; feature engineer Lifetime_Months captures full subscription duration.
- **`Last_Active_Date`**: Raw date string; feature engineer Last_Active_Days captures recency without date string leak.
- **`Prediction_Date`**: Constant reference metadata date (2025-01-02) across all rows.

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
| **Linear Regression** | ₹3,439.90 ± 55.68 | ₹4,819.70 ± 75.26 | **0.8692 ± 0.0046** |
| **Ridge Regression** | ₹3,439.57 ± 55.73 | ₹4,819.69 ± 75.32 | **0.8692 ± 0.0046** |
| **Decision Tree** | ₹272.21 ± 6.75 | ₹529.77 ± 28.94 | **0.9984 ± 0.0001** |
| **Random Forest** | ₹108.57 ± 5.61 | ₹305.26 ± 39.33 | **0.9995 ± 0.0001** |
| **Gradient Boosting** | ₹146.33 ± 4.35 | ₹222.66 ± 6.53 | **0.9997 ± 0.0000** |

### Held-Out Validation Split Metrics (80/20 Split)
| Model | MAE (INR) | RMSE (INR) | R² Score |
|---|---|---|---|
| **Linear Regression** | ₹3,432.92 | ₹4,768.80 | **0.8764** |
| **Ridge Regression** | ₹3,432.72 | ₹4,768.87 | **0.8764** |
| **Decision Tree** | ₹274.76 | ₹582.21 | **0.9982** |
| **Random Forest** | ₹111.54 | ₹325.80 | **0.9994** |
| **Gradient Boosting** | ₹147.80 | ₹223.36 | **0.9997** |

---

## 6. Primary Model & Feature Importance
The **Random Forest Regressor** achieved top performance with **R² = 0.9994** and **MAE = ₹111.54**.

### Feature Importance Summary (Relative Score 0–100)
| Feature Name | Absolute Importance | Relative Score |
|---|---|---|
| `Lifetime_Months` | 0.5094 | **100.00** |
| `Monthly_Fee` | 0.4457 | **87.50** |
| `Plan` | 0.0288 | **5.66** |
| `Discount` | 0.0125 | **2.45** |
| `Platform` | 0.0031 | **0.60** |
| `Renewals` | 0.0001 | **0.03** |
| `Last_Active_Days` | 0.0001 | **0.01** |
| `Watch_Hours` | 0.0001 | **0.01** |
| `Location` | 0.0000 | **0.01** |
| `Login_Days` | 0.0000 | **0.01** |
| `Movies_Watched` | 0.0000 | **0.01** |
| `Support_Tickets` | 0.0000 | **0.01** |
| `Age_Group` | 0.0000 | **0.01** |
| `Payment_Failures` | 0.0000 | **0.00** |
| `Billing_Cycle` | 0.0000 | **0.00** |
| `Upgrades` | 0.0000 | **0.00** |
| `Downgrades` | 0.0000 | **0.00** |
| `Churn` | 0.0000 | **0.00** |

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
