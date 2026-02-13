import { redis } from '@/shared/redis/redis';
import { db } from '@/shared/database/connection';
import { getIO } from '@/socket';
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
      'COUNT',
      5000,
      'BLOCK',
      100,
      'STREAMS',
      STREAM,
      '>'
    );
    if (!streams) continue;
    for (const [, messages] of streams as Array<[string, Array<[string, string[]]>]>) {
      const rows: any[] = [];
      const messageIds: string[] = [];

      for (const [id, fields] of messages) {
        const data = JSON.parse(fields[1]);
        rows.push([
          data.trip_id,
          data.latitude,
          data.longitude,
          data.speed ?? null,
          data.recorded_at,
        ]);
        messageIds.push(id);

        const io = getIO();
        io.to(`trip:${data.trip_id}`).emit('trip:location', data);
      }
      if (rows.length > 0) {
        const values = rows
          .map((_, i) => `($${i * 5 + 1},$${i * 5 + 2},$${i * 5 + 3},$${i * 5 + 4},$${i * 5 + 5})`)
          .join(',');

        const flatValues = rows.flat();

        await db.query(
          `INSERT INTO trip_locations
       (trip_id, latitude, longitude, speed, recorded_at)
       VALUES ${values}`,
          flatValues
        );

        // ACK all messages at once
        await redis.xack(STREAM, GROUP, ...messageIds);
      }
    }
  }
};
