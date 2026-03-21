import { PaymentRepository } from "./payment.repository.js";
import { ServiceResponse } from "@/shared/types";

export class PaymentService {

  constructor(private paymentRepository: PaymentRepository) {}

  private KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY!;

  async initiatePayment(data: {
    amount: number;
    purchase_order_name: string;
  }): Promise<ServiceResponse> {

    try {

      const response = await this.paymentRepository.initiatePayment(
        {
          return_url: "http://localhost:3000/success",
          website_url: "http://localhost:3000",
          amount: data.amount,
          purchase_order_id: `order_${Date.now()}`,
          purchase_order_name: data.purchase_order_name
        },
        this.KHALTI_SECRET_KEY
      );

      return ServiceResponse.ok(response.data);

    } catch (error: any) {

      return ServiceResponse.internalError(
        error.response?.data || error.message
      );

    }
  }

  async verifyPayment(pidx: string): Promise<ServiceResponse> {
    try {

      const response = await this.paymentRepository.verifyPayment(
        pidx,
        this.KHALTI_SECRET_KEY
      );

      if (response.data.status === "Completed") {
        return ServiceResponse.ok(response.data);
      }

      return ServiceResponse.badRequest("Payment not completed");

    } catch (error: any) {

      return ServiceResponse.internalError(
        error.response?.data || error.message
      );

    }
  }
}