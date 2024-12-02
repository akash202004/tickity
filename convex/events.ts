import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { DURATION, TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";
import { internal } from "./_generated/api";

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

    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (ticket) =>
          ticket.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

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
    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

    return {
      isSoldOut: totalReserved >= event.totalTickets,
      available: availableSpots > 0,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
      remainingTickets: Math.max(0, event.totalTickets - totalReserved),
    };
  },
});

// // helper function to check ticket availability for an event
// export const checkTicketAvailability = query({
//   args: { eventId: v.id("events") },
//   handler: async (ctx, { eventId }) => {
//     const event = await ctx.db.get(eventId);
//     if (!event) {
//       throw new Error("Event not found");
//     }

//     // Count total purchased tickets
//     const purchasedCount = await ctx.db
//       .query("tickets")
//       .withIndex("by_event", (q) => q.eq("eventId", eventId))
//       .collect()
//       .then(
//         (ticket) =>
//           ticket.filter(
//             (t) =>
//               t.status === TICKET_STATUS.WALID ||
//               t.status === TICKET_STATUS.USED
//           ).length
//       );

//     // Count current valid tickets
//     const now = Date.now();
//     const activeOffers = await ctx.db
//       .query("waitingList")
//       .withIndex("by_event_status", (q) =>
//         q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
//       )
//       .collect()
//       .then(
//         (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
//       );

//     const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

//     return {
//       available: availableSpots > 0,
//       availableSpots,
//       totalTickets: event.totalTickets,
//       purchasedCount,
//       activeOffers,
//     };
//   },
// });

// join the waiting list for an event
export const joinWaitingList = mutation({
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {
    // check rate limit
    // const status = await rateLimiter.limit(ctx, "queueJoin", { key: userId });
    // if (!status.ok) {
    //   throw new ConvexError(
    //     `You've joined the waiting list too many times. Please wait ${Math.ceil(status.retryAfter / (60 * 1000))} seconds before trying again.`
    //   );
    // }

    const existingEntry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq("status", WAITING_LIST_STATUS.EXPIRED))
      .first();

    if (existingEntry) {
      throw new Error("You're already on the waiting list for this event");
    }

    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const { available } = await getEventAvailability(ctx, { eventId });
    const now = Date.now();

    if (available) {
      const waitingListId = await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING,
        offerExpiresAt: now + DURATION.TICKET_OFFER,
      });

      await ctx.scheduler.runAfter(
        DURATION.TICKET_OFFER,
        internal.waitingList.expireOffer,
        { waitingListId, eventId }
      );
    } else {
      await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING,
      });
    }

    return {
      success: true,
      status: available
        ? WAITING_LIST_STATUS.OFFERED
        : WAITING_LIST_STATUS.WAITING,
      message: available
        ? `Ticket offered - you have ${DURATION.TICKET_OFFER / (60 * 1000)} minutes to purchase`
        : "Added to waiting list - you will be notified when a ticket is available",
    };
  },
});
