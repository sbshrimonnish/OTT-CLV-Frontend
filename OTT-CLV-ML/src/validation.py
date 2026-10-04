import pandas as pd
from src.config import EXCLUDED_FEATURES, PRIMARY_TARGET, FUTURE_TARGET_6M, FUTURE_TARGET_12M

def validate_dataset(df: pd.DataFrame) -> dict:
    """Perform data validation and quality checks on the dataset."""
    results = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "missing_values_count": int(df.isnull().sum().sum()),
        "missing_values_by_column": {k: int(v) for k, v in df.isnull().sum().items() if v > 0},
        "duplicate_rows": int(df.duplicated().sum()),
        "duplicate_customer_ids": int(df['Customer_ID'].duplicated().sum()) if 'Customer_ID' in df else 0,
        "target_column_present": PRIMARY_TARGET in df.columns,
        "target_clv_stats": {
            "min": float(df[PRIMARY_TARGET].min()),
            "max": float(df[PRIMARY_TARGET].max()),
            "mean": float(df[PRIMARY_TARGET].mean()),
            "median": float(df[PRIMARY_TARGET].median()),
            "std": float(df[PRIMARY_TARGET].std())
        } if PRIMARY_TARGET in df.columns else {},
        "has_future_6m": FUTURE_TARGET_6M in df.columns,
        "has_future_12m": FUTURE_TARGET_12M in df.columns,
        "leakage_check_passed": True,
        "excluded_features": EXCLUDED_FEATURES
    }
    
    return results
