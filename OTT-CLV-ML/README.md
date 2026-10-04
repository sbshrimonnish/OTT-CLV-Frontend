# Customer Lifetime Value (CLV) Machine Learning Training Pipeline

This directory contains the machine learning training pipeline, preprocessing, model evaluations, feature importance analysis, and saved model artifacts for predicting Customer Lifetime Value (CLV) in a Multi-Platform OTT Streaming SaaS ecosystem.

## Directory Structure
```
OTT-CLV-ML/
│
├── data/
│   ├── raw/                  # Raw dataset (OTT_MultiStreaming_Train_12000.csv)
│   └── processed/            # Processed features cache
│
├── models/                   # Saved model pipelines and evaluation metrics
│   ├── clv_random_forest_pipeline.joblib
│   ├── clv_future6m_pipeline.joblib
│   ├── clv_future12m_pipeline.joblib
│   ├── model_metadata.json
│   ├── feature_importance.csv
│   ├── training_metrics.csv
│   └── cross_validation_metrics.csv
│
├── reports/                  # Markdown evaluation reports & figures
│   ├── clv_training_report.md
│   └── figures/              # Matplotlib visual evaluation plots
│
├── src/                      # Reproducible Python source modules
│   ├── __init__.py
│   ├── config.py             # Target definitions, feature lists, hyperparameters
│   ├── data_loader.py        # CSV data loader
│   ├── validation.py         # Schema, health & leakage checks
│   ├── preprocessing.py      # Sklearn ColumnTransformer & Pipeline
│   ├── evaluate.py           # Regression metrics (MAE, RMSE, R²) & 5-Fold CV
│   ├── feature_importance.py # Mapped feature importance extractor
│   ├── train.py              # Master training script
│   └── predict.py            # Sample inference test script
│
├── requirements.txt
└── README.md
```

## How to Run Training
```bash
python src/train.py
```

## How to Test Model Inference
```bash
python src/predict.py
```
