import { redis } from '@/shared/redis/redis';
import { db } from '@/shared/database/connection';
import { getIO } from '@/socket';
const STREAM = 'trip-locations';
const GROUP = 'trip-location-group';
const CONSUMER = 'worker-1';
const latestLocations = new Map<number, any>();

/* * This worker listens to the Redis stream for incoming trip location updates.
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
      console.log(`Emitting latest location for trip ${tripId}:`, location);
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
    // console.log('Read from stream:', streams);
    if (!streams) continue;

    for (const [, messages] of streams as Array<[string, Array<[string, string[]]>]>) {
      const rows: any[] = [];
      const messageIds: string[] = [];

      for (const [id, fields] of messages) {
        const data = JSON.parse(fields[1]);
        const trip = await db.query(
          'SELECT end_latitude, end_longitude,status FROM trips WHERE id = $1',
          [data.trip_id]
        );
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
        latestLocations.set(data.trip_id, data);
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
