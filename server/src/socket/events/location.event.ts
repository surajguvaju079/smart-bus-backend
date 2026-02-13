import { redis } from '@/shared/redis/redis';

export const registerLocationEvents = (socket: any) => {
  socket.on(
    'driver:location',
    async (payload: { trip_id: number; latitude: number; longitude: number; speed?: number }) => {
      if (!payload.trip_id) {
        console.error('trip_id is required in location payload');
        return;
      }
      const data = {
        ...payload,
        recorded_at: new Date().toISOString(),
      };

      // Push into Redis Stream (FAST, scalable)
      await redis.xadd(`trip:${payload.trip_id}:locations`, '*', 'data', JSON.stringify(data));
    }
  );
};
