CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY ,
    user_id INTEGER NOT NULL UNIQUE,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    vehicle_number VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT FALSE,
    current_latitude DECIMAL(10,7),
    current_logitude DECIMAL(10,7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_driver_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
)


CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_vehicle_number ON drivers(vehicle_number)

DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at
BEFORE UPDATE ON drivers
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();