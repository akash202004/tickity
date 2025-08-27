import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Ticket from "@/components/Ticket";

async function TicketSuccess() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const convex = getConvexClient();
  const tickets = await convex.query(api.events.getUserTickets, { userId });

  console.log("User tickets found:", tickets.length);

  // Wait a bit for webhook processing if no tickets found
  if (tickets.length === 0) {
    console.log(
      "No tickets found, this might be normal if webhook is still processing"
    );
    // Show a loading state instead of redirecting immediately
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
            If this takes more than a few seconds, please check your tickets
            page or contact support
          </p>
          <Link
            href="/tickets"
            className="mt-4 inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
          >
            Go to My Tickets
          </Link>
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

export default TicketSuccess;
