CREATE TABLE IF NOT EXISTS route_stops (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL,
    name VARCHAR(100),
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    stop_order INTEGER NOT NULL,

    is_major BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_route
        FOREIGN KEY (route_id)
        REFERENCES routes(id)
        ON DELETE CASCADE
);



