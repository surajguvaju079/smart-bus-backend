import { redis } from '@/shared/redis/redis';
import { db } from '@/shared/database/connection';

const STREAM = `trip:*:locations`;
const GROUP = 'trip-location-group';
const CONSUMER = 'worker-1';

export const startTripLocationWorker = async () => {
  try {
    await redis.xgroup('CREATE', STREAM, GROUP, '0', 'MKSTREAM');
  } catch (_) {}

  console.log('Trip location worker started');

  while (true) {
    const streams = await redis.xreadgroup(
      'GROUP',
      GROUP,
      CONSUMER,
      'BLOCK',
      5000,
      'COUNT',
      100,
      'STREAMS',
      STREAM,
      '>'
    );
    if (!streams) continue;
    for (const [, message] of streams) {
      for (const [id, fields] of messages) {
        const data = JSON.parse(fields[1]);
        await db.query(
          `INSERT INTO trip_locations
                (trip_id,latitude,longitude,speed,recorder_at)
                VALUES ($1,$2,$3,$4,$5)`,
          [data.trip_id, data.latitude, data.longitude, data.speed ?? null, data.recorded_at]
        );
        await redis.xack(STREAM, GROUP, id);
      }
    }
  }
};
