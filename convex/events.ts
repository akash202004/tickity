import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";

// get all events
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();
  },
});

// get events by their id
export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

// check for ticket availability like it soldout, total tickets, purchased tickets, active offers, remaining tickets
export const getEventAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (ticket) =>
          ticket.filter(
            (t) =>
              t.status === TICKET_STATUS.valid ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    // Count current valid tickets
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const totalReserved = purchasedCount + activeOffers;

    return {
      isSoldOut: totalReserved >= event.totalTickets,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
      remainingTickets: Math.max(0, event.totalTickets - totalReserved),
    };
  },
});

// join the waiting list for an event
export const joinWaitingList = mutation({
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {},
});
