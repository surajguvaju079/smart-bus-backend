-- Add column (this part is OK)
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS route_id INTEGER;

-- Add foreign key (needs workaround)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_trip_route'
    ) THEN
        ALTER TABLE trips
        ADD CONSTRAINT fk_trip_route
        FOREIGN KEY (route_id)
        REFERENCES routes(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Indexes (these are fine)
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id
ON route_stops(route_id);

CREATE INDEX IF NOT EXISTS idx_route_stops_order
ON route_stops(route_id, stop_order);

CREATE INDEX IF NOT EXISTS idx_trips_route_id
ON trips(route_id);