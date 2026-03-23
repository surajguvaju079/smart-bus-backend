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

export const addRouteStopsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    stops: z
      .array(
        z.object({
          name: z.string().min(1),
          latitude: z.number(),
          longitude: z.number(),
          order: z.number().int().positive(),
        })
      )
      .min(1),
  }),
});

export type CreateRouteStopDTO = z.infer<typeof createRouteStopSchema>['body'];
