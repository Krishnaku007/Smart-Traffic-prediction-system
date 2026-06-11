import pandas as pd


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop_duplicates().copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.dropna(subset=["timestamp", "road_id", "traffic_volume"])

    q1 = df["traffic_volume"].quantile(0.25)
    q3 = df["traffic_volume"].quantile(0.75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    return df[(df["traffic_volume"] >= lower) & (df["traffic_volume"] <= upper)]


def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    ts = pd.to_datetime(df["timestamp"])
    df["hour"] = ts.dt.hour
    df["day"] = ts.dt.day
    df["month"] = ts.dt.month
    df["year"] = ts.dt.year
    df["weekday"] = ts.dt.weekday
    df["is_weekend"] = (df["weekday"] >= 5).astype(int)
    df["rush_hour"] = ts.dt.hour.isin([7, 8, 9, 17, 18, 19]).astype(int)

    for col, default in [("temperature", 26.0), ("holiday", 0), ("weather", 1)]:
        if col not in df.columns:
            df[col] = default
    return df
