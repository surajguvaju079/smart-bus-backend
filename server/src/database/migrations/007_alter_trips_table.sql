ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS route_id INTEGER,
ADD CONSTRAINT fk_trip_route
    FOREIGN KEY (route_id)
    REFERENCES routes(id)
    ON DELETE SET NULL;




    
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id
ON route_stops(route_id);

CREATE INDEX IF NOT EXISTS idx_route_stops_order
ON route_stops(route_id, stop_order);

CREATE INDEX IF NOT EXISTS idx_trips_route_id
ON trips(route_id);