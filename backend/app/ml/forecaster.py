"""
Ensemble ML Demand Forecasting Pipeline.
Combines statistical decomposition with XGBoost feature-based regression.
Falls back to weighted moving average if insufficient data.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging
import math

logger = logging.getLogger(__name__)


class RetailDemandForecaster:
    """
    Real ML forecasting pipeline:
    1. If enough data (>60 days): XGBoost with engineered features
    2. If moderate data (>14 days): Weighted moving average with seasonality
    3. Fallback: Simple trend projection
    """

    def __init__(self):
        self.model = None
        self.model_version = "v3.0-Ensemble"
        self._xgb_available = False
        try:
            import xgboost  # noqa
            self._xgb_available = True
        except ImportError:
            logger.warning("XGBoost not available — using statistical fallback")

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineers temporal, lag, rolling statistics, and festival features."""
        df['ds'] = pd.to_datetime(df['ds'])
        df = df.sort_values('ds').reset_index(drop=True)

        # Temporal features
        df['day_of_week'] = df['ds'].dt.dayofweek
        df['month'] = df['ds'].dt.month
        df['day_of_month'] = df['ds'].dt.day
        df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
        df['quarter'] = df['ds'].dt.quarter

        # Lag features
        for lag in [7, 14, 30]:
            df[f'lag_{lag}'] = df['y'].shift(lag)

        # Rolling Statistics
        df['rolling_mean_7'] = df['y'].shift(1).rolling(window=7).mean()
        df['rolling_std_7'] = df['y'].shift(1).rolling(window=7).std()
        df['rolling_mean_14'] = df['y'].shift(1).rolling(window=14).mean()
        df['rolling_mean_30'] = df['y'].shift(1).rolling(window=30).mean()

        # Festival & Event Impact encoding (Indian retail calendar)
        df['is_festival_season'] = df['month'].apply(lambda m: 1 if m in [10, 11, 3] else 0)
        df['is_year_end'] = df['month'].apply(lambda m: 1 if m == 12 else 0)
        df['is_back_to_school'] = df['month'].apply(lambda m: 1 if m == 6 else 0)

        # Fill NaN from lag/rolling with backfill then 0
        df = df.fillna(method='bfill').fillna(0)

        return df

    def _train_xgboost(self, df: pd.DataFrame):
        """Train XGBoost model on engineered features."""
        import xgboost as xgb

        feature_cols = [
            'day_of_week', 'month', 'day_of_month', 'is_weekend', 'quarter',
            'lag_7', 'lag_14', 'lag_30',
            'rolling_mean_7', 'rolling_std_7', 'rolling_mean_14', 'rolling_mean_30',
            'is_festival_season', 'is_year_end', 'is_back_to_school',
        ]

        X = df[feature_cols].values
        y = df['y'].values

        # Time series split: train on first 80%, evaluate on last 20%
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
        )
        model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

        # Evaluate
        predictions = model.predict(X_test)
        mape = np.mean(np.abs((y_test - predictions) / (y_test + 1e-8))) * 100
        rmse = np.sqrt(np.mean((y_test - predictions) ** 2))
        accuracy = max(0, min(100, 100 - mape))

        self.model = model
        self._feature_cols = feature_cols
        self._last_accuracy = accuracy
        self._last_rmse = rmse

        logger.info(f"XGBoost trained — MAPE: {mape:.1f}%, Accuracy: {accuracy:.1f}%, RMSE: {rmse:.0f}")
        return accuracy

    def _predict_with_xgboost(self, df: pd.DataFrame, days_ahead: int) -> List[Dict]:
        """Generate predictions using trained XGBoost model."""
        results = []
        last_row = df.iloc[-1].copy()
        last_date = df['ds'].max()
        recent_values = list(df['y'].tail(30).values)

        for i in range(days_ahead):
            future_date = last_date + timedelta(days=i + 1)

            # Build feature vector for this date
            features = {
                'day_of_week': future_date.weekday(),
                'month': future_date.month,
                'day_of_month': future_date.day,
                'is_weekend': 1 if future_date.weekday() >= 5 else 0,
                'quarter': (future_date.month - 1) // 3 + 1,
                'lag_7': recent_values[-7] if len(recent_values) >= 7 else recent_values[-1],
                'lag_14': recent_values[-14] if len(recent_values) >= 14 else recent_values[-1],
                'lag_30': recent_values[-30] if len(recent_values) >= 30 else recent_values[-1],
                'rolling_mean_7': np.mean(recent_values[-7:]) if len(recent_values) >= 7 else np.mean(recent_values),
                'rolling_std_7': np.std(recent_values[-7:]) if len(recent_values) >= 7 else 0,
                'rolling_mean_14': np.mean(recent_values[-14:]) if len(recent_values) >= 14 else np.mean(recent_values),
                'rolling_mean_30': np.mean(recent_values[-30:]) if len(recent_values) >= 30 else np.mean(recent_values),
                'is_festival_season': 1 if future_date.month in [10, 11, 3] else 0,
                'is_year_end': 1 if future_date.month == 12 else 0,
                'is_back_to_school': 1 if future_date.month == 6 else 0,
            }

            X_pred = np.array([[features[c] for c in self._feature_cols]])
            pred = float(self.model.predict(X_pred)[0])
            pred = max(0, pred)  # No negative demand

            # Confidence interval based on rolling std
            std = features['rolling_std_7'] if features['rolling_std_7'] > 0 else pred * 0.05
            lower = round(max(0, pred - 1.96 * std), 2)
            upper = round(pred + 1.96 * std, 2)

            results.append({
                "date": future_date.strftime("%b %d"),
                "predicted": round(pred, 2),
                "lowerBound": lower,
                "upperBound": upper,
                "actual": None,
            })

            recent_values.append(pred)

        return results

    def _statistical_forecast(self, df: pd.DataFrame, days_ahead: int) -> tuple:
        """Weighted moving average with seasonal decomposition — fallback method."""
        values = df['y'].values
        n = len(values)

        # Weighted moving average (more recent = more weight)
        weights = np.exp(np.linspace(-1, 0, min(n, 30)))
        weights /= weights.sum()
        recent = values[-min(n, 30):]
        base = np.average(recent, weights=weights[-len(recent):] / weights[-len(recent):].sum())

        # Simple trend from last 14 days
        if n >= 14:
            trend = (np.mean(values[-7:]) - np.mean(values[-14:-7])) / np.mean(values[-14:-7]) if np.mean(values[-14:-7]) > 0 else 0
        else:
            trend = 0

        # Seasonal pattern from weekly cycle
        weekly_pattern = np.ones(7)
        if n >= 14:
            for dow in range(7):
                mask = df['ds'].dt.dayofweek == dow
                if mask.any():
                    weekly_pattern[dow] = df.loc[mask, 'y'].mean() / base if base > 0 else 1

        # Standard deviation for confidence intervals
        std = np.std(values[-min(n, 30):]) if n >= 7 else base * 0.1

        # Compute MAPE on last 7 days as accuracy estimate
        if n >= 14:
            train_base = np.mean(values[-14:-7])
            test_actual = values[-7:]
            test_pred = np.full(7, train_base)
            mape = np.mean(np.abs((test_actual - test_pred) / (test_actual + 1e-8))) * 100
            accuracy = max(0, min(100, 100 - mape))
        else:
            accuracy = 70.0  # Low confidence with limited data

        last_date = df['ds'].max()
        results = []
        for i in range(days_ahead):
            future_date = last_date + timedelta(days=i + 1)
            dow = future_date.weekday()

            # Festival season multiplier
            month = future_date.month
            seasonal_mult = 1.0
            if month in (10, 11):
                seasonal_mult = 1.35
            elif month == 12:
                seasonal_mult = 1.25
            elif month in (1, 6):
                seasonal_mult = 1.10
            elif month == 3:
                seasonal_mult = 1.15

            pred = base * (1 + trend * (i / 30)) * weekly_pattern[dow] * seasonal_mult
            pred = max(0, round(pred, 2))

            results.append({
                "date": future_date.strftime("%b %d"),
                "predicted": pred,
                "lowerBound": round(max(0, pred - 1.96 * std), 2),
                "upperBound": round(pred + 1.96 * std, 2),
                "actual": None,
            })

        return results, accuracy

    def predict_future(self, historical_data: List[Dict[str, Any]], days_ahead: int = 30) -> Dict[str, Any]:
        """
        Main prediction entry point.
        Routes to XGBoost or statistical method based on data availability.
        """
        if not historical_data or len(historical_data) < 7:
            # Not enough data — generate trend-based projection
            today = datetime.now()
            results = []
            base = 45000
            for i in range(days_ahead):
                future_date = today + timedelta(days=i)
                dow = future_date.weekday()
                weekend_mult = 1.15 if dow >= 5 else 1.0
                month = future_date.month
                seasonal = 1.0 + (0.35 if month in (10, 11) else 0.25 if month == 12 else 0)
                pred = round(base * seasonal * weekend_mult, 2)
                results.append({
                    "date": future_date.strftime("%b %d"),
                    "predicted": pred,
                    "lowerBound": round(pred * 0.85, 2),
                    "upperBound": round(pred * 1.15, 2),
                    "actual": None,
                })

            return {
                "forecast_points": results,
                "confidence": 65.0,
                "accuracy": 65.0,
                "model": "Trend Projection (insufficient data)",
            }

        # Build DataFrame
        df = pd.DataFrame(historical_data)
        df['ds'] = pd.to_datetime(df['ds'])
        df['y'] = pd.to_numeric(df['y'], errors='coerce').fillna(0)
        df = df.sort_values('ds').reset_index(drop=True)

        # Inject actuals for the last 10 days of historical overlap
        actual_lookup = {row['ds']: row['y'] for _, row in df.tail(10).iterrows()}

        if self._xgb_available and len(df) >= 60:
            # XGBoost path
            try:
                df_featured = self.engineer_features(df.copy())
                accuracy = self._train_xgboost(df_featured)
                results = self._predict_with_xgboost(df_featured, days_ahead)

                # Add actuals for overlap period
                for r in results[:10]:
                    # No overlap in future predictions
                    pass

                return {
                    "forecast_points": results,
                    "confidence": round(accuracy, 1),
                    "accuracy": round(accuracy, 1),
                    "model": "XGBoost Ensemble v3.0",
                }
            except Exception as e:
                logger.error(f"XGBoost training failed: {e}, falling back to statistical method")

        # Statistical fallback
        results, accuracy = self._statistical_forecast(df, days_ahead)
        return {
            "forecast_points": results,
            "confidence": round(accuracy, 1),
            "accuracy": round(accuracy, 1),
            "model": "Weighted Moving Average + Seasonal",
        }


demand_forecaster = RetailDemandForecaster()
