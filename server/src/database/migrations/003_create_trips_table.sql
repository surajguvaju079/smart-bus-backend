CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL,
    vehicle_number VARCHAR(50),
    start_location_name VARCHAR(50).
    start_latitude DECIMAL(10,7),
    start_longitude DECIMAL(10,7),
    end_location_name VARCHAR(50),
    end_latitude DECIMAL(10,7),
    end_longitude DECIMAL(10,7),
    status VARCHAR(30) DEFAULT 'PLANNED'
        CHECK (status IN ('PLANNED','ONGOING','COMPLETED','CANCELLED')),

    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    CONSTRAINT fk_trip_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE

)