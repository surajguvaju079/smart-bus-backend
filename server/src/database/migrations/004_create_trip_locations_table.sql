CREATE TABLE IF NOT EXISTS trip_locations (
    id SERIAL PRIMARY KEY,
    trip_id NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    speed DECIMAL(5,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,



    CONSTRAINT fk_trip_location
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE
);