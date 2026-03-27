import { Router } from "express";
import { PaymentService } from "./payment.service.js";
import { PaymentRepository } from "./payment.repository.js";
import { AsyncHandler, Controller } from "@/shared/types";
import { validate } from "@/shared/middleware/validation.middleware";
import {
  initiatePaymentSchema,
  verifyPaymentSchema
} from "./payment.schema.js";

export class PaymentController implements Controller {

  public path = "/payment";
  public router = Router();
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService(
      new PaymentRepository()
    );
    this.initializeRoutes();
  }

  private initializeRoutes() {

    this.router.post(
      "/",
      validate(initiatePaymentSchema),
      this.initiatePayment
    );

    this.router.post(
      "/verify",
      validate(verifyPaymentSchema),
      this.verifyPayment
    );
  }

  private initiatePayment: AsyncHandler = async (req, res) => {

    const { amount, purchase_order_name } = req.body;

    const response = await this.paymentService.initiatePayment({
      amount,
      purchase_order_name
    });

    res.status(response.statusCode).json(response.toJSON());
  };

  private verifyPayment: AsyncHandler = async (req, res) => {

    const { pidx } = req.body;

    const response = await this.paymentService.verifyPayment(pidx);

    res.status(response.statusCode).json(response.toJSON());
  };
}