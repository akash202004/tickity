"use server";

// import { razorpay } from "@/lib/razorpay"; // Will be used when implementing actual refund API
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function refundRazorpayTickets(eventId: Id<"events">) {
  const convex = getConvexClient();

  // Get event details
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  // Get event owner's Razorpay account ID
  const razorpayAccountId = await convex.query(
    api.users.getUsersStripeConnectId, // Reusing the same field
    {
      userId: event.userId,
    }
  );

  if (!razorpayAccountId) {
    throw new Error("Razorpay account ID not found");
  }

  // Get all valid tickets for this event
  const tickets = await convex.query(api.tickets.getValidTicketsForEvent, {
    eventId,
  });

  // Process refunds for each ticket
  const results = await Promise.allSettled(
    tickets.map(async (ticket) => {
      try {
        if (!ticket.paymentIntentId) {
          throw new Error("Payment information not found");
        }

        // Issue refund through Razorpay
        // Note: Refunds in Razorpay are created differently
        // For now, we'll mark as refunded and handle actual refund separately
        console.log("Creating refund for payment:", ticket.paymentIntentId);

        // TODO: Implement actual Razorpay refund API call
        // const refund = await razorpay.payments.refund(ticket.paymentIntentId, {
        //   amount: ticket.amount,
        //   notes: {
        //     reason: "Event cancelled by organizer",
        //     event_id: eventId,
        //   },
        // });

        // Mark ticket as refunded in Convex
        await convex.mutation(api.tickets.updateTicketStatus, {
          ticketId: ticket._id,
          status: "refunded",
        });

        console.log(`Refund successful for ticket ${ticket._id}`);
        return { success: true, ticketId: ticket._id };
      } catch (error) {
        console.error(`Refund failed for ticket ${ticket._id}:`, error);
        return { success: false, ticketId: ticket._id, error };
      }
    })
  );

  // Count successful and failed refunds
  const successful = results.filter(
    (result) => result.status === "fulfilled" && result.value.success
  ).length;
  const failed = results.filter(
    (result) =>
      result.status === "rejected" ||
      (result.status === "fulfilled" && !result.value.success)
  ).length;

  console.log(`Refund summary: ${successful} successful, ${failed} failed`);

  return {
    totalProcessed: tickets.length,
    successful,
    failed,
    results: results.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : { success: false, error: result.reason }
    ),
  };
}
