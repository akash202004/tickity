"use client";

import { useState } from "react";

export default function WebhookTester() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testWebhook = async () => {
    setLoading(true);
    try {
      // Test the webhook endpoint
      const response = await fetch("/api/webhooks/razorpay/test", {
        method: "POST",
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const simulateWebhook = async () => {
    setLoading(true);
    try {
      // Simulate a webhook call
      const mockWebhookData = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_test_123456789",
              amount: 10000, // ₹100 in paise
              currency: "INR",
              status: "captured",
            },
          },
          order: {
            entity: {
              id: "order_test_123456789",
              amount: 10000,
              currency: "INR",
              notes: {
                eventId: "test_event_id",
                userId: "test_user_id",
                waitingListId: "test_waiting_list_id",
              },
            },
          },
        },
      };

      const response = await fetch("/api/webhooks/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "test_signature",
        },
        body: JSON.stringify(mockWebhookData),
      });

      const data = await response.text();
      setResult(`Status: ${response.status}\nResponse: ${data}`);
    } catch (error) {
      setResult("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Webhook Tester
        </h1>

        <div className="space-y-4">
          <button
            onClick={testWebhook}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Webhook Endpoint"}
          </button>

          <button
            onClick={simulateWebhook}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
          >
            {loading ? "Testing..." : "Simulate Webhook Call"}
          </button>
        </div>

        {result && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
