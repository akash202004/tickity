"use server";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

if (!process.env.RAZORPAY_KEY_ID) {
  throw new Error("RAZORPAY_KEY_ID is not set");
}

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function createRazorpayRouteAccount() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Check if user already has a Razorpay account ID
  const existingRazorpayAccountId = await convex.query(
    api.users.getUsersStripeConnectId, // We'll reuse this field for now
    {
      userId,
    }
  );

  if (existingRazorpayAccountId) {
    return { account: existingRazorpayAccountId };
  }

  try {
    // Note: Razorpay Route accounts cannot be created programmatically
    // They require manual setup through Razorpay Dashboard
    // For now, we'll create a mock account ID for development

    const mockAccountId = `acc_mock_${Date.now()}_${userId.slice(-8)}`;

    console.log("Creating mock Razorpay Route account:", mockAccountId);

    // In production, you would:
    // 1. Direct user to Razorpay Dashboard to create Route account
    // 2. User provides their Route account ID
    // 3. You store that ID in the database

    // Update user with mock Razorpay account id
    await convex.mutation(api.users.updateOrCreateUserStripeConnectId, {
      userId,
      stripeConnectId: mockAccountId,
    });

    return { account: mockAccountId };
  } catch (error) {
    console.error("Error creating Razorpay Route account:", error);
    throw new Error("Failed to create Razorpay Route account");
  }
}
