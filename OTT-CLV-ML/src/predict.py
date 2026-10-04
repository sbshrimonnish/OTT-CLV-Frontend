import joblib
import pandas as pd
from pathlib import Path
import sys

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.config import MODELS_DIR

def load_pipeline(model_filename="clv_random_forest_pipeline.joblib"):
    model_path = MODELS_DIR / model_filename
    if not model_path.exists():
        raise FileNotFoundError(f"Saved model pipeline not found at {model_path}")
    pipeline = joblib.load(model_path)
    return pipeline

def predict_single_customer(customer_data: dict):
    pipeline = load_pipeline()
    df_sample = pd.DataFrame([customer_data])
    predicted_clv = pipeline.predict(df_sample)[0]
    return float(predicted_clv)

if __name__ == "__main__":
    sample_customer = {
        "Age_Group": "35-44",
        "Location": "India",
        "Platform": "Netflix",
        "Plan": "Premium",
        "Monthly_Fee": 699,
        "Billing_Cycle": "Annual",
        "Movies_Watched": 26,
        "Watch_Hours": 48.2,
        "Login_Days": 26,
        "Last_Active_Days": 132,
        "Renewals": 5,
        "Upgrades": 1,
        "Downgrades": 0,
        "Payment_Failures": 0,
        "Discount": 10,
        "Support_Tickets": 0,
        "Churn": 0,
        "Lifetime_Months": 65.0
    }
    
    clv_result = predict_single_customer(sample_customer)
    print("=" * 60)
    print("SAMPLE CUSTOMER INFERENCE TEST")
    print("=" * 60)
    print(f"Customer Platform: {sample_customer['Platform']} ({sample_customer['Plan']})")
    print(f"Watch Hours/Mo:    {sample_customer['Watch_Hours']} hrs")
    print(f"Predicted CLV:     INR {clv_result:,.2f}")
    print("=" * 60)
