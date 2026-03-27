import z from "zod";

export const initiatePaymentSchema = z.object({
  body: z.object({
    amount: z.number(),
    purchase_order_name: z.string()
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    pidx: z.string()
  })
});

export type InitiatePaymentDTO = z.infer<typeof initiatePaymentSchema>["body"];
export type VerifyPaymentDTO = z.infer<typeof verifyPaymentSchema>["body"];