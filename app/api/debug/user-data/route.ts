import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId parameter required" },
      { status: 400 }
    );
  }

  try {
    const convex = getConvexClient();

    // Get user tickets
    const tickets = await convex.query(api.events.getUserTickets, { userId });

    // Get user waiting list entries
    const waitingList = await convex.query(api.events.getUserWaitingList, {
      userId,
    });

    // Get recent tickets (last 10)
    const recentTickets = tickets.slice(-10);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        ticketCount: tickets.length,
        waitingListCount: waitingList.length,
        recentTickets: recentTickets.map((ticket) => ({
          id: ticket._id,
          eventName: ticket.event?.name || "Unknown",
          status: ticket.status,
          amount: ticket.amount,
          paymentId: ticket.paymentIntentId,
          purchasedAt: new Date(ticket.purchasedAt).toISOString(),
        })),
        waitingListEntries: waitingList.map((entry) => ({
          id: entry._id,
          eventName: entry.event?.name || "Unknown",
          status: entry.status,
          offerExpiresAt: entry.offerExpiresAt
            ? new Date(entry.offerExpiresAt).toISOString()
            : null,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
