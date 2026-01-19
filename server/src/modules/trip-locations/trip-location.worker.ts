import { REDIS_CHANNELS } from '@/shared/constants/constant';
import { redis } from '@/shared/redis/redis';
import { TripLocationRepository } from './trip-location.repository';

const repository = new TripLocationRepository();

const buffer: any[] = [];

redis.subscribe(REDIS_CHANNELS.TRIP_LOCATION);
redis.on('message', async (__, message) => {
  console.log('Received trip location message:', message);
  buffer.push(JSON.parse(message));
});

setInterval(async () => {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0, buffer.length);
  for (const location of batch) {
    console.log('Processing trip location:', location);
    await repository.create(location);
  }
  console.log(`Processed ${batch.length} trip locations`);
}, 5000);
