import os
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor

from app.config import settings


class ModelRegistry:
    def __init__(self):
        self._model = None

    def _fallback_model(self):
        model = RandomForestRegressor(n_estimators=50, random_state=42)
        x = np.random.rand(120, 10)
        y = np.random.randint(20, 360, size=120)
        model.fit(x, y)
        return model

    def get_model(self):
        if self._model is not None:
            return self._model

        path = Path(settings.model_path)
        if path.exists():
            self._model = joblib.load(path)
        else:
            os.makedirs(path.parent, exist_ok=True)
            self._model = self._fallback_model()
            joblib.dump(self._model, path)
        return self._model


model_registry = ModelRegistry()
