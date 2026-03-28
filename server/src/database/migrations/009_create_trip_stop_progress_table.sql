CREATE TABLE IF NOT EXISTS trip_stop_progress (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER,
    stop_id INTEGER,

    reached_at TIMESTAMP,

    predicted_eta_seconds INTEGER,
    actual_eta_seconds INTEGER,
    delay_seconds INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);