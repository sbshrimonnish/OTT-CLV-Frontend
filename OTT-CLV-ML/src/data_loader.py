import pandas as pd
from pathlib import Path
from src.config import RAW_DATA_PATH, PRIMARY_TARGET, EXCLUDED_FEATURES

def load_raw_data(data_path: Path = RAW_DATA_PATH) -> pd.DataFrame:
    """Load the raw CSV training dataset."""
    if not Path(data_path).exists():
        raise FileNotFoundError(f"Dataset not found at {data_path}")
    df = pd.read_csv(data_path)
    return df

def prepare_features_and_target(df: pd.DataFrame, target_col: str = PRIMARY_TARGET):
    """Separate input features X from target y, enforcing feature exclusions."""
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not present in dataset.")
    
    y = df[target_col].copy()
    feature_cols = [c for c in df.columns if c not in EXCLUDED_FEATURES]
    X = df[feature_cols].copy()
    
    return X, y
