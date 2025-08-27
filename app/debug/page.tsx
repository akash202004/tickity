"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DebugPage() {
  const { user } = useUser();
  const tickets = useQuery(api.events.getUserTickets, {
    userId: user?.id ?? "",
  });

  const waitingList = useQuery(api.events.getUserWaitingList, {
    userId: user?.id ?? "",
  });

  if (!user) {
    return <div>Please log in to view debug information</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Debug Information
        </h1>

        <div className="space-y-8">
          {/* User Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>User ID:</strong> {user.id}
              </p>
              <p>
                <strong>Email:</strong> {user.emailAddresses?.[0]?.emailAddress}
              </p>
              <p>
                <strong>Name:</strong> {user.fullName || user.firstName}
              </p>
            </div>
          </div>

          {/* Tickets */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              My Tickets ({tickets?.length || 0})
            </h2>
            {tickets?.length === 0 ? (
              <p className="text-gray-500">No tickets found</p>
            ) : (
              <div className="space-y-4">
                {tickets?.map((ticket) => (
                  <div key={ticket._id} className="border p-4 rounded">
                    <p>
                      <strong>Ticket ID:</strong> {ticket._id}
                    </p>
                    <p>
                      <strong>Event:</strong> {ticket.event?.name || "Unknown"}
                    </p>
                    <p>
                      <strong>Status:</strong> {ticket.status}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹{ticket.amount}
                    </p>
                    <p>
                      <strong>Payment ID:</strong> {ticket.paymentIntentId}
                    </p>
                    <p>
                      <strong>Purchased:</strong>{" "}
                      {new Date(ticket.purchasedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Waiting List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Waiting List Entries ({waitingList?.length || 0})
            </h2>
            {waitingList?.length === 0 ? (
              <p className="text-gray-500">No waiting list entries found</p>
            ) : (
              <div className="space-y-4">
                {waitingList?.map((entry) => (
                  <div key={entry._id} className="border p-4 rounded">
                    <p>
                      <strong>Entry ID:</strong> {entry._id}
                    </p>
                    <p>
                      <strong>Event:</strong> {entry.event?.name || "Unknown"}
                    </p>
                    <p>
                      <strong>Status:</strong> {entry.status}
                    </p>
                    {entry.offerExpiresAt && (
                      <p>
                        <strong>Offer Expires:</strong>{" "}
                        {new Date(entry.offerExpiresAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
