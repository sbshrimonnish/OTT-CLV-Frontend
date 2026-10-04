import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_validate
from src.config import RANDOM_STATE

def compute_metrics(y_true, y_pred):
    """Compute MAE, RMSE, and R2 regression metrics."""
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    return {
        "MAE": mae,
        "RMSE": rmse,
        "R2": r2
    }

def evaluate_cross_validation(pipeline, X, y, n_splits=5):
    """
    Perform K-Fold Cross Validation and calculate mean & std for MAE, RMSE, R2.
    """
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=RANDOM_STATE)
    
    scoring = {
        'mae': 'neg_mean_absolute_error',
        'rmse': 'neg_root_mean_squared_error',
        'r2': 'r2'
    }
    
    cv_results = cross_validate(
        pipeline, X, y, cv=kf, scoring=scoring, n_jobs=-1, return_train_score=False
    )
    
    mae_scores = -cv_results['test_mae']
    rmse_scores = -cv_results['test_rmse']
    r2_scores = cv_results['test_r2']
    
    summary = {
        "CV_MAE_Mean": float(np.mean(mae_scores)),
        "CV_MAE_Std": float(np.std(mae_scores)),
        "CV_RMSE_Mean": float(np.mean(rmse_scores)),
        "CV_RMSE_Std": float(np.std(rmse_scores)),
        "CV_R2_Mean": float(np.mean(r2_scores)),
        "CV_R2_Std": float(np.std(r2_scores))
    }
    
    return summary
