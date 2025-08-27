// Razorpay client configuration
import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID) {
  console.warn("RAZORPAY_KEY_ID is missing in environment variables");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.warn("RAZORPAY_KEY_SECRET is missing in environment variables");
}

// Create Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
