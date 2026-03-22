import { z } from 'zod';

export const createRouteStopSchema = z.object({
  params: z.object({
    routeId: z.coerce.number().nonnegative(),
  }),
  body: z.object({
    latitude: z.number().nonoptional(),
    longitude: z.number().nonoptional(),
    stopOrder: z.number().nonoptional(),
    name: z.string().nonoptional(),
  }),
});

export type CreateRouteStopDTO = z.infer<typeof createRouteStopSchema>['body'];
