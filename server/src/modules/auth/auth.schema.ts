import z from 'zod';

export const userLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const loginUserSchema = z.object({
  body: userLoginSchema,
});

export type UserLoginDTO = z.infer<typeof userLoginSchema>;
