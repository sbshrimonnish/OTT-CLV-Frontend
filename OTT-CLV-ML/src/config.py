from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DATA_PATH = BASE_DIR / "data" / "raw" / "OTT_MultiStreaming_Train_12000.csv"
PROCESSED_DATA_DIR = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"
FIGURES_DIR = REPORTS_DIR / "figures"

# Ensure output directories exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
FIGURES_DIR.mkdir(parents=True, exist_ok=True)

# Random Seed
RANDOM_STATE = 42

# Target Variable
PRIMARY_TARGET = "CLV"
FUTURE_TARGET_6M = "Future_6M_CLV"
FUTURE_TARGET_12M = "Future_12M_CLV"

# Feature Categorization
EXCLUDED_FEATURES = [
    "Customer_ID",
    "CLV",
    "Future_6M_CLV",
    "Future_12M_CLV",
    "Signup_Date",
    "Last_Active_Date",
    "Prediction_Date"
]

EXCLUSION_REASONS = {
    "Customer_ID": "Unique row identifier; contains no predictive signal and causes data leakage/overfitting.",
    "CLV": "Target variable; using it as an input feature is direct target leakage.",
    "Future_6M_CLV": "Future target variable; using future values to predict current CLV is temporal data leakage.",
    "Future_12M_CLV": "Future target variable; using future values to predict current CLV is temporal data leakage.",
    "Signup_Date": "Raw date string; feature engineer Lifetime_Months captures full subscription duration.",
    "Last_Active_Date": "Raw date string; feature engineer Last_Active_Days captures recency without date string leak.",
    "Prediction_Date": "Constant reference metadata date (2025-01-02) across all rows."
}

CATEGORICAL_FEATURES = [
    "Age_Group",
    "Location",
    "Platform",
    "Plan",
    "Billing_Cycle"
]

NUMERICAL_FEATURES = [
    "Monthly_Fee",
    "Movies_Watched",
    "Watch_Hours",
    "Login_Days",
    "Last_Active_Days",
    "Renewals",
    "Upgrades",
    "Downgrades",
    "Payment_Failures",
    "Discount",
    "Support_Tickets",
    "Churn",
    "Lifetime_Months"
]
