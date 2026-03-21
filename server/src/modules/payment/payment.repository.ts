import axios from "axios";
import https from "https";

const KHALTI_INITIATE_URL =
  "https://dev.khalti.com/api/v2/epayment/initiate/";
const KHALTI_VERIFY_URL =
  "https://dev.khalti.com/api/v2/epayment/lookup/";

const agent = new https.Agent({ keepAlive: true });

export class PaymentRepository {

  async initiatePayment(data: any, secretKey: string) {
    return axios.post(KHALTI_INITIATE_URL, data, {
      headers: {
        Authorization: `Key ${secretKey}`,
        "Content-Type": "application/json"
      },
      timeout: 10000,
      httpsAgent: agent
    });
  }

  async verifyPayment(pidx: string, secretKey: string) {
    return axios.post(
      KHALTI_VERIFY_URL,
      { pidx },
      {
        headers: {
          Authorization: `Key ${secretKey}`,
          "Content-Type": "application/json"
        },
        timeout: 10000,
        httpsAgent: agent
      }
    );
  }
}