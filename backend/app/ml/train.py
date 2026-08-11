"""
Standalone ML Model Trainer Script for RetailMind AI.
Trains XGBoost Demand Forecasting Pipeline on database sales history and persists model artifact.
Run with: python -m app.ml.train
"""
import os
import joblib
import pandas as pd
import numpy as np
import logging
from datetime import datetime
from sqlalchemy import func

from app.database import SessionLocal
from app.models.models import Sale
from app.ml.forecaster import demand_forecaster

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("retailmind.ml.train")

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models_artifacts")
MODEL_PATH = os.path.join(ARTIFACT_DIR, "xgb_demand.joblib")


def train_and_save_model():
    """Fetches sales history from DB, trains XGBoost, and saves joblib artifact."""
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    db = SessionLocal()
    try:
        logger.info("📊 Querying sales transaction history for ML model training...")
        results = (
            db.query(
                func.date(Sale.sale_date).label("ds"),
                func.sum(Sale.total_amount).label("y"),
            )
            .group_by(func.date(Sale.sale_date))
            .order_by("ds")
            .all()
        )

        if not results or len(results) < 14:
            logger.warning("⚠️ Insufficient sales records in DB to train XGBoost. Seed DB first.")
            return False

        historical_data = [{"ds": str(r.ds), "y": float(r.y)} for r in results]
        df = pd.DataFrame(historical_data)
        df_featured = demand_forecaster.engineer_features(df)

        metrics = demand_forecaster._train_xgboost(df_featured)
        
        # Save model and metadata to disk
        artifact = {
            "model": demand_forecaster.model,
            "feature_cols": demand_forecaster._feature_cols,
            "accuracy": demand_forecaster._last_accuracy,
            "rmse": demand_forecaster._last_rmse,
            "mape": demand_forecaster._last_mape,
            "mae": demand_forecaster._last_mae,
            "trained_at": datetime.utcnow().isoformat(),
        }
        
        joblib.dump(artifact, MODEL_PATH)
        logger.info(f"✅ XGBoost Model Artifact saved successfully to: {MODEL_PATH}")
        return True
    except Exception as e:
        logger.error(f"❌ ML Model training failed: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    train_and_save_model()
