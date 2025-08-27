"use client";

import { useState } from "react";

export default function WebhookSimulator() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const simulateWebhook = async () => {
    setLoading(true);
    try {
      // Using your actual user ID and one of your waiting list IDs from debug data
      const params = new URLSearchParams({
        eventId: "j57d36xfngc7em2jk2pjfy90zh7pa36b", // From your payment data
        userId: "user_31p5OVWMZhv2lTXTwukkpN1FzKR", // Your user ID
        waitingListId: "jd78x8yts0y0b12jz5zj27kr8d7pfwv1", // From your payment data
      });

      const response = await fetch(`/api/debug/simulate-webhook?${params}`, {
        method: "POST",
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Webhook Simulator
        </h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Simulate Payment Webhook
          </h2>
          <p className="text-gray-600 mb-4">
            This will simulate a successful payment webhook using your actual
            user data.
          </p>

          <button
            onClick={simulateWebhook}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Simulating..." : "Simulate Successful Payment"}
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Simulation Result:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">What this does:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              1. Creates a mock Razorpay webhook payload with your real data
            </p>
            <p>2. Sends it to your webhook endpoint</p>
            <p>3. Shows you exactly what happens in the webhook processing</p>
            <p>4. If successful, a ticket should appear in your debug page</p>
          </div>
        </div>
      </div>
    </div>
  );
}
