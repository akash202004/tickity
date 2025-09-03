"use server";

import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface DirectPurchaseData {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
  paymentId: string;
  amount: number;
}

export async function purchaseTicketDirect(data: DirectPurchaseData) {
  try {
    console.log("Direct ticket purchase initiated:", data);

    const convex = getConvexClient();

    // Directly create the ticket without waiting for webhook
    const result = await convex.mutation(api.events.purchaseTicket, {
      eventId: data.eventId,
      userId: data.userId,
      waitingListId: data.waitingListId,
      paymentInfo: {
        paymentIntentId: data.paymentId,
        amount: data.amount / 100, // Convert paise to rupees for storage
      },
    });

    console.log("Direct ticket purchase completed:", result);
    return { success: true, ticketCreated: true };
  } catch (error) {
    console.error("Direct ticket purchase failed:", error);
    throw new Error(`Failed to create ticket: ${(error as Error).message}`);
  }
}
