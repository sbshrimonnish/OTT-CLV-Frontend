import pandas as pd
import numpy as np
from src.config import NUMERICAL_FEATURES, CATEGORICAL_FEATURES

def extract_feature_importance(pipeline, X_sample):
    """
    Extract feature importances from fitted pipeline containing ColumnTransformer & tree-based regressor.
    Maps one-hot encoded columns back to original feature names.
    """
    preprocessor = pipeline.named_steps['preprocessor']
    regressor = pipeline.named_steps['regressor']
    
    # Extract feature names after ColumnTransformer transformations
    # 1. Numerical feature names
    num_feature_names = list(NUMERICAL_FEATURES)
    
    # 2. Categorical feature names after OneHotEncoder
    cat_transformer = preprocessor.named_transformers_['cat']
    onehot_encoder = cat_transformer.named_steps['onehot']
    cat_feature_names = list(onehot_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
    
    all_feature_names = num_feature_names + cat_feature_names
    
    # Extract raw importances from model
    if hasattr(regressor, 'feature_importances_'):
        importances = regressor.feature_importances_
    elif hasattr(regressor, 'coef_'):
        importances = np.abs(regressor.coef_)
    else:
        raise AttributeError("Regressor has neither feature_importances_ nor coef_ attribute.")
    
    df_importance = pd.DataFrame({
        'Transformed_Feature': all_feature_names,
        'Importance': importances
    }).sort_values(by='Importance', ascending=False).reset_index(drop=True)
    
    # Group one-hot encoded categories back to original features for high-level ranking
    def map_to_original(feature_name):
        for orig in CATEGORICAL_FEATURES:
            if feature_name.startswith(orig + "_"):
                return orig
        return feature_name
    
    df_importance['Original_Feature'] = df_importance['Transformed_Feature'].apply(map_to_original)
    
    grouped_importance = df_importance.groupby('Original_Feature')['Importance'].sum().reset_index()
    grouped_importance = grouped_importance.sort_values(by='Importance', ascending=False).reset_index(drop=True)
    
    # Relative Score (0 to 100)
    max_imp = grouped_importance['Importance'].max()
    grouped_importance['Relative_Score'] = (grouped_importance['Importance'] / max_imp * 100).round(2)
    
    return df_importance, grouped_importance
