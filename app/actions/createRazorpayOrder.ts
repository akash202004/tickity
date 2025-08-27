"use server";
import { razorpay } from "@/lib/razorpay";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";

export type RazorpayOrderMetaData = {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
};

export async function createRazorpayOrder({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const convex = getConvexClient();

  // Get event details
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  // Get waiting list entry
  const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });

  if (!queuePosition || queuePosition.status !== "offered") {
    throw new Error("No valid ticket offer found");
  }

  const razorpayAccountId = await convex.query(
    api.users.getUsersStripeConnectId, // Reusing the same field
    {
      userId: event.userId,
    }
  );

  if (!razorpayAccountId) {
    throw new Error("Razorpay Route account not found for event owner!");
  }

  if (!queuePosition.offerExpiresAt) {
    throw new Error("Ticket offer has no expiration date");
  }

  const metadata: RazorpayOrderMetaData = {
    eventId,
    userId,
    waitingListId: queuePosition._id,
  };

  // Calculate amounts
  const ticketAmount = Math.round(event.price * 100); // Amount in paise
  // const platformFee = Math.round(event.price * 100 * 0.01); // 1% platform fee - for future use
  // const sellerAmount = ticketAmount - platformFee; // For future use in transfers

  try {
    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: ticketAmount,
      currency: "INR",
      notes: metadata,
    });

    // Note: Transfers will be handled via webhooks after payment capture
    // For now, we create a simple order and handle splits later

    const orderResult = order as { id: string };
    return {
      orderId: orderResult.id,
      amount: ticketAmount,
      currency: "INR",
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new Error("Failed to create payment order");
  }
}
