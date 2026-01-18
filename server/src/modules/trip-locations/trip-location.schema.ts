import { z } from 'zod';

export const TripLocationSchema = z.object({
  body: z.object({
    trip_id: z.number().nonnegative(),
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string(),
    speed: z.number().optional(),
    recorded_at: z.string().optional(),
  }),
});

export type TripLocationType = z.infer<typeof TripLocationSchema>['body'];
