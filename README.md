# Smart Bus Backend

**Real-Time Scalable Vehicle Tracking System**

---

## Overview

This project is a **scalable real-time vehicle tracking backend** built with:

- Node.js
- Express
- Socket.IO
- Redis (Streams + Pub/Sub)
- PostgreSQL
- Docker

It demonstrates production-style architecture for tracking vehicles in real time with high scalability and performance considerations.

---

## Architecture Overview

```
Driver App
   -> WebSocket (driver:location)
   -> Socket.IO Server
   -> Redis Stream (trip-locations)
   -> Worker (Consumer Group)
       -> Batch insert into PostgreSQL
       -> Throttled broadcast to passengers
   -> Passenger Clients (Live Map Updates)
```

---

## Features Implemented

### REST API

- User management
- Authentication
- Driver management
- Trip management
- Swagger documentation
- Health check endpoint

### Real-Time Tracking

- WebSocket connection via Socket.IO
- Room-based trip tracking
- Driver sends location events
- Passengers receive live updates

### Redis Streams

- All GPS pings stored in a Redis stream
- Consumer group processes messages
- No direct DB writes from socket layer

### Batch Database Writes

- Bulk insert of trip locations
- Reduces database load significantly
- Designed for high-frequency GPS updates

### Throttled Broadcasting

- Emits latest location every 2 seconds
- Prevents socket flooding
- Keeps frontend smooth

### Docker Support

- PostgreSQL
- Redis
- pgAdmin

---

## Project Structure

```
src/
  app.ts
  server.ts
  socket/
  workers/
    trip-location.worker.ts
  shared/
    redis/
    database/
  modules/
    users/
    auth/
    drivers/
    trips/
```

---

## Environment Variables

Create a `.env` file:

```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=smart_bus

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Run With Docker

Start services:

```bash
docker-compose up --build
```

This starts:

- PostgreSQL
- Redis
- pgAdmin

---

## Run Backend

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

To access database in the docker

````bash
docker exec -it local-postgres psql -U postgres
---

## Health Check

```http
GET http://localhost:3000/health
````

---

## Swagger API Documentation

```
http://localhost:3000/api-docs
```

---

## Real-Time Usage Guide

### Passenger Example

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  socket.emit("join-trip", 1);
});

socket.on("trip:location", (data) => {
  console.log("Live location:", data);
});
```

### Driver Example

```javascript
socket.emit("driver:location", {
  trip_id: 1,
  latitude: 27.7172,
  longitude: 85.324,
  speed: 40,
});
```

> Drivers can send updates every 2–5 seconds.

---

## Database Schema (Trip Locations)

```sql
CREATE TABLE trip_locations (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    speed DECIMAL(5,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);
```

---

## Scalability Design

- Horizontal backend scaling
- Multiple Socket.IO instances
- High-frequency GPS ingestion
- Redis-based buffering
- Consumer group workers
- Batch database writes
- Throttled real-time emissions

---

## Future Improvements

- JWT authentication for socket connections
- Role-based socket authorization
- Map integration (Google Maps / Leaflet)
- Geo-fencing
- Monitoring and metrics
- Horizontal worker scaling
- Location smoothing algorithms

---

## Author

Smart Bus Backend – Real-Time Scalable Tracking System
