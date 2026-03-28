import { redis } from '@/shared/redis/redis';
import { db } from '@/shared/database/connection';
import { getIO } from '@/socket';
import calculateDistance from '@/shared/utils/calculate-distance';
import { getNextStop } from '@/shared/utils/get-next-stop';
import { EtaService } from '@/modules/eta/eta.service';
import { isNearStop } from '@/shared/utils/is-near-stop';
const etaService = new EtaService();
const STREAM = 'trip-locations';
const GROUP = 'trip-location-group';
const CONSUMER = 'worker-1';
const latestLocations = new Map<number, any>();
const routeCache = new Map<number, any[]>();
const etaLogThrottle = new Map<number, number>();
const tripCache = new Map<number, any>();
const visitedStops = new Map<number, Set<number>>();
/*
 * This worker listens to the Redis stream for incoming trip location updates.
 * It processes each message, updates the latest location for each trip, and checks if the trip should be marked as completed.
 * If a trip is within 50 meters of its end location and moving slower than 5 km/h, it updates the trip status to COMPLETED in the database.
 * The worker also emits real-time location updates to connected clients via Socket.IO.
 * This ensures that users receive timely updates on their trips and that completed trips are accurately tracked.
 */

export const startTripLocationWorker = async () => {
  try {
    await redis.xgroup('CREATE', STREAM, GROUP, '0', 'MKSTREAM');
  } catch (_) {}

  console.log('Trip location worker started');

  setInterval(() => {
    const io = getIO();
    for (const [tripId, location] of latestLocations.entries()) {
      console.log('eta is', location);
      io.to(`trip:${tripId}`).emit('trip:location', location);
    }

    latestLocations.clear();
  }, 2000);

  while (true) {
    const streams = (await redis.xreadgroup(
      'GROUP',
      GROUP,
      CONSUMER,
      'COUNT',
      100,
      'BLOCK',
      5000,
      'STREAMS',
      STREAM,
      '>'
    )) as unknown as Array<[string, Array<[string, string[]]>]> | null;
    console.log('Read from stream:', streams);
    if (!streams) continue;

    for (const [, messages] of streams as Array<[string, Array<[string, string[]]>]>) {
      const rows: any[] = [];
      const messageIds: string[] = [];

      for (const [id, fields] of messages) {
        const data = JSON.parse(fields[1]);
        let stops = routeCache.get(data.trip_id);
        console.log('stops from cache', stops);
        if (!stops) {
          const routeRes = await db.query(
            `
            SELECT rs.id, rs.latitude, rs.longitude, rs.name
            from trips t
            JOIN routes r on t.route_id = r.id
            JOIN route_stops rs on rs.route_id = r.id
            WHERE t.id = $1
            ORDER BY rs.stop_order ASC 
            
            `,
            [data.trip_id]
          );
          stops = routeRes.rows;
          routeCache.set(data.trip_id, stops);
        }

        const nextStop = getNextStop(stops, data);
        let eta = null;

        if (nextStop) {
          try {
            const lastLogged = etaLogThrottle.get(data.trip_id) || 0;
            const nowTime = Date.now();
            if (nowTime - lastLogged >= 10000) {
              etaLogThrottle.set(data.trip_id, nowTime);
              const etaResult = await etaService.getEta({
                tripId: data.trip_id,
                nextStop,
                location: data,
              });
              eta = etaResult?.estimated_time_of_arrival;

              const now = new Date();
              await db.query(
                `
                INSERT INTO trip_eta_logs (
                        trip_id,
                        next_stop_id,
                        distance_km,
                        speed_kmh,
                        predicted_eta_seconds,
                        hour,
                        weekday
                        )
                VALUES ($1,$2,$3,$4,$5,$6,$7)
              `,
                [
                  data.trip_id,
                  nextStop.id,
                  etaResult?.distance,
                  etaResult?.speed,
                  etaResult?.estimated_time_of_arrival,
                  now.getHours(),
                  now.getDay(),
                ]
              );
            }
          } catch (error) {
            console.error('ETA error:', error);
          }
        }

        const tripVisited = visitedStops.get(data.trip_id) || new Set();
        for (const stop of stops) {
          if (tripVisited.has(stop.id)) continue;
          if (isNearStop(data, stop)) {
            tripVisited.add(stop.id);
            visitedStops.set(data.trip_id, tripVisited);
            console.log(`Trip ${data.trip_id} reached stop ${stop.id}`);

            const etaLog = await db.query(
              `
                SELECT predicted_eta_seconds, created_at
                FROM trip_eta_logs
                WHERE trip_id = $1 AND next_stop_id = $2
                ORDER BY created_at DESC
                LIMIT 1
              `,
              [data.trip_id, stop.id]
            );
            let predicted = null;
            let actual = null;
            let delay = null;

            console.log('etaLoglength', etaLog.rows);

            if (etaLog.rows.length > 0) {
              predicted = etaLog.rows[0].predicted_eta_seconds;
              console.log('predicted:', predicted);

              const predictedTime = new Date(etaLog.rows[0].created_at).getTime();
              console.log('predicted time:', predictedTime);
              const nowTime = Date.now();

              actual = Math.floor((nowTime - predictedTime) / 1000);
              delay = actual - predicted;
            }

            await db.query(
              `
                  INSERT INTO trip_stop_progress (
                    trip_id,
                    stop_id,
                    reached_at,
                    predicted_eta_seconds,
                    actual_eta_seconds,
                    delay_seconds
                  )
                  VALUES ($1,$2,NOW(),$3,$4,$5)
              `,
              [data.trip_id, stop.id, predicted, actual, delay]
            );
            const io = getIO();
            io.to(`trip:${data.trip_id}`).emit('trip:stop-reached', {
              stopId: stop.id,
              delay,
            });
          }
        }

        let trip = await tripCache.get(data.trip_id);
        if (!trip) {
          const tripRows = await db.query(
            'SELECT end_latitude, end_longitude,status FROM trips WHERE id = $1',
            [data.trip_id]
          );
          trip = tripRows;
          tripCache.set(data.trip_id, tripRows);
        }

        if (trip.rows.length > 0) {
          const { end_latitude, end_longitude, status } = trip.rows[0];
          if (status !== 'COMPLETED') {
            const distanceToEnd = calculateDistance(
              data.latitude,
              data.longitude,
              end_latitude,
              end_longitude
            );
            if (distanceToEnd < 50 && data.speed < 5) {
              await db.query('UPDATE trips SET status = $1 WHERE id = $2', [
                'COMPLETED',
                data.trip_id,
              ]);
              console.log(`Trip ${data.trip_id} marked as COMPLETED`);
              const io = getIO();
              io.to(`trip:${data.trip_id}`).emit('trip:completed', { trip_id: data.trip_id });
              routeCache.delete(data.trip_id);
              tripCache.delete(data.trip_id);
              etaLogThrottle.delete(data.trip_id);
              //latestLocations.delete(data.trip_id);
            }
          }
        }

        rows.push([
          data.trip_id,
          data.latitude,
          data.longitude,
          data.speed ?? null,
          data.recorded_at,
        ]);
        console.log('Received trip location message:', data);

        messageIds.push(id);
        latestLocations.set(data.trip_id, {
          ...data,
          eta,
          nextStop,
        });
      }

      if (rows.length > 0) {
        const values = rows
          .map((_, i) => `($${i * 5 + 1},$${i * 5 + 2},$${i * 5 + 3},$${i * 5 + 4},$${i * 5 + 5})`)
          .join(',');

        const flatValues = rows.flat();

        try {
          await db.query(
            `INSERT INTO trip_locations
             (trip_id, latitude, longitude, speed, recorded_at)
             VALUES ${values}`,
            flatValues
          );

          await redis.xack(STREAM, GROUP, ...messageIds);
        } catch (err) {
          console.error('DB insert failed:', err);
        }
      }
    }
  }
};
