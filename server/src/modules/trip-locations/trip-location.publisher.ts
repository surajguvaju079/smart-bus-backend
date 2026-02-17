import { redis } from '@/shared/redis/redis';
import { REDIS_CHANNELS } from '@/shared/constants/constant';

export class TripLocationPublisher {
  static async publishTripLocation(data: {
    trip_id: number;
    latitude: number;
    longitude: number;
    speed?: number;
  }) {
    await redis.publish(REDIS_CHANNELS.TRIP_LOCATION, JSON.stringify(data));
  }
}
