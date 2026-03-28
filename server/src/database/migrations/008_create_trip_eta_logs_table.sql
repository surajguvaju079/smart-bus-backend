CREATE TABLE IF NOT EXISTS trip_eta_logs (
    id SERIAL PRIMARY KEY ,
    trip_id INTEGER,
    next_stop_id INTEGER,
    distance_km FLOAT,
    speed_kmh FLOAT,
    predicted_eta_seconds INTEGER,
    hour INTEGER,
    weekday INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)