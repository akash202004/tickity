"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";

function JoinQueue({
  eventId,
  userId,
}: {
  eventId: Id<"events">;
  userId: Id<"users">;
}) {
  const { toast } = useToast();
  const joinWaitingList = useMutation(api.events.joinWaitingList);
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId,
  });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const event = useQuery(api.events.getById, { eventId });
  const isEventOwner = userId === event?.userId;

  const handleJoinQueue = async () => {
    try {
      const result = await joinWaitingList({ eventId, userId });
      if (result.success) {
        console.log("Successfully joined wating list");
      }
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.message.includes("joined the waiting list too mant times")
      ) {
        toast({
          variant: "destructive",
          title: "Slow down there!",
          description: error.data,
          duration: 5000,
        });
      } else {
        console.log("Error joining waiting list", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong",
          description: "Failed to join waiting list. Please try again later.",
        });
      }
    }
  };

  return <div>JoinQueue</div>;
}

export default JoinQueue;
