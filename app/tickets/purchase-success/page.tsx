"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Ticket from "@/components/Ticket";
import { useRouter } from "next/navigation";

export default function TicketSuccess() {
  const { user } = useUser();
  const router = useRouter();
  const [timeWaited, setTimeWaited] = useState(0);

  const tickets = useQuery(api.events.getUserTickets, {
    userId: user?.id ?? "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      router.push("/");
    }
  }, [user, router]);

  // Track time waited
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeWaited((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // If no user data yet, show loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // If tickets data is still loading
  if (tickets === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Processing Your Payment...
          </h1>
          <p className="mt-2 text-gray-600">
            Loading your ticket information...
          </p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Wait a bit for webhook processing if no tickets found
  if (tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Processing Your Payment...
          </h1>
          <p className="mt-2 text-gray-600">
            Please wait while we confirm your ticket purchase
          </p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Waited: {timeWaited} seconds
          </p>
          <p className="mt-2 text-sm text-gray-500">
            If this takes more than 30 seconds, please check your tickets page
            or contact support
          </p>
          <div className="mt-6 space-x-4">
            <Link
              href="/tickets"
              className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
            >
              Go to My Tickets
            </Link>
            <Link
              href="/debug"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Debug Info
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestTicket = tickets[tickets.length - 1];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Ticket Purchase Successful!
          </h1>
          <p className="mt-2 text-gray-600">
            Your ticket has been confirmed and is ready to use
          </p>
        </div>

        <Ticket ticketId={latestTicket._id} />
      </div>
    </div>
  );
}
