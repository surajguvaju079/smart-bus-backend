import { z } from 'zod';

export const createRouteStopSchema = z.object({
  body: z.object({
    routeId: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    stopOrder: z.number(),
  }),
});

export type CreateRouteStopDTO = z.infer<typeof createRouteStopSchema>['body'];
