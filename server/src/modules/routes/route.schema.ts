import { z } from 'zod';
export const createRouteSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Route name must be at least 2 characters'),
  }),
});

export type CreateRouteDTO = z.infer<typeof createRouteSchema>['body'];
