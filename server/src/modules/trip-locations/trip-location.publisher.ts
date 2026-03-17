// import { redis } from '@/shared/redis/redis';
// import { REDIS_CHANNELS } from '@/shared/constants/constant';

// export class TripLocationPublisher {
//   static async publishTripLocation(data: {
//     trip_id: number;
//     latitude: number;
//     longitude: number;
//     speed?: number;
//   }) {
//     console.log('Publishing trip location:', data);
//     await redis.publish(REDIS_CHANNELS.TRIP_LOCATION, JSON.stringify(data));
//   }
// }
import { redis } from '@/shared/redis/redis';

const STREAM = 'trip-locations';

export class TripLocationPublisher {
  static async publishTripLocation(data: {
    trip_id: number;
    latitude: number;
    longitude: number;
    speed?: number;
  }) {
    console.log('Publishing trip location: before sending to ui', data);
    const payload = {
      ...data,
      recorded_at: new Date().toISOString(),
    };

    console.log('Publishing trip location:', payload);

    await redis.xadd(STREAM, '*', 'data', JSON.stringify(payload));
  }
}
