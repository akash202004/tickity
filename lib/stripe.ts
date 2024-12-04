import Stripe from "stripe";

const stripeApiKey = process.env.STRIPE_SECRET_KEY;
if (!stripeApiKey) {
  throw new Error("No STRIPE_SECRET_KEY found");
}

export const stripe = new Stripe(stripeApiKey, {
  apiVersion: "2024-11-20.acacia",
});
