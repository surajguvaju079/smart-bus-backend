//test code
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import cors from "cors";
import https from "https";

const app = express();

app.use(cors());
app.use(express.json());

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const USE_MOCK = process.env.USE_KHALTI_MOCK === "true";

const KHALTI_INITIATE_URL =
  "https://dev.khalti.com/api/v2/epayment/initiate/";
const KHALTI_VERIFY_URL =
  "https://dev.khalti.com/api/v2/epayment/lookup/";

const agent = new https.Agent({
  keepAlive: true,
});

//Retry function
const retryRequest = async (fn: any, retries = 3) => {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      console.log("Retrying...");
      return retryRequest(fn, retries - 1);
    }
    throw err;
  }
};


//INITIATE PAYMENT
app.post("/payment", async (req, res) => {
  try {

    //MOCK MODE
    if (USE_MOCK) {
      console.log("Using MOCK Khalti response");

      return res.json({
        pidx: "mock_pidx_123",
        payment_url: "https://pay.khalti.com/?pidx=mock123"
      });
    }

    const response = await retryRequest(() =>
      axios.post(
        KHALTI_INITIATE_URL,
        {
          return_url: "http://localhost:3000/success",
          website_url: "http://localhost:3000",
          amount: 1000,
          purchase_order_id: `order_${Date.now()}`,
          purchase_order_name: "Bus Ticket"
        },
        {
          headers: {
            Authorization: `Key ${KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 10000,
          httpsAgent: agent
        }
      )
    );

    console.log("REAL RESPONSE:", response.data);

    res.json(response.data);

  } catch (error: any) {

    console.log("ERROR CODE:", error.code);
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);

    res.status(error.response?.status || 500).json({
      message: "Payment initiation failed",
      error: error.response?.data || error.message
    });

  }
});


app.post("/payment/verify", async (req, res) => {
  const { pidx } = req.body || {};
  if (!pidx && !USE_MOCK) {
    return res.status(400).json({ error: "Missing 'pidx' in request body" });
  }

  try {
    //MOCK MODE
    if (USE_MOCK) {
      console.log("Using MOCK verify response");
      return res.json({
        status: "Completed",
        total_amount: 1000,
        transaction_id: "mock_txn_123",
      });
    }

    const response = await axios.post(
      KHALTI_VERIFY_URL,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
        httpsAgent: agent,
      }
    );

    res.json(response.data);

  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
  console.log("Mock mode:", USE_MOCK);
});