"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function WebhookChecker() {
  const { user } = useUser();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const checkWebhook = async () => {
    setLoading(true);
    setLogs([]);

    try {
      // Test the webhook endpoint with GET
      const response = await fetch("/api/webhooks/razorpay/test");
      const data = await response.json();
      setLogs((prev) => [
        ...prev,
        `✅ Webhook endpoint is accessible: ${JSON.stringify(data)}`,
      ]);

      // Simulate a real webhook call
      const mockPayload = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_test_12345",
              amount: 10000, // ₹100 in paise
              currency: "INR",
              status: "captured",
            },
          },
          order: {
            entity: {
              id: "order_test_12345",
              amount: 10000,
              currency: "INR",
              notes: {
                eventId: "mock_event_id",
                userId: user?.id || "mock_user_id",
                waitingListId: "mock_waiting_list_id",
              },
            },
          },
        },
      };

      setLogs((prev) => [...prev, "🔄 Testing webhook with mock data..."]);

      const webhookResponse = await fetch("/api/webhooks/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "mock_signature",
        },
        body: JSON.stringify(mockPayload),
      });

      const webhookResult = await webhookResponse.text();
      setLogs((prev) => [
        ...prev,
        `📥 Webhook response (${webhookResponse.status}): ${webhookResult}`,
      ]);
    } catch (error) {
      setLogs((prev) => [...prev, `❌ Error: ${(error as Error).message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Webhook Status Checker
        </h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Test Webhook Processing
          </h2>
          <p className="text-gray-600 mb-4">
            This will test if your webhook endpoint is working correctly.
          </p>

          <button
            onClick={checkWebhook}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Webhook"}
          </button>
        </div>

        {logs.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
            <div className="space-y-2 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Debug Instructions:
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>
              1. Click &quot;Test Webhook&quot; to verify the endpoint is
              working
            </p>
            <p>
              2. Check the Razorpay Dashboard → Settings → Webhooks for logs
            </p>
            <p>
              3. Make sure the webhook URL is:
              https://tickity-delta.vercel.app/api/webhooks/razorpay
            </p>
            <p>4. Ensure &quot;payment.captured&quot; event is enabled</p>
            <p>5. Check Vercel function logs for webhook processing details</p>
          </div>
        </div>
      </div>
    </div>
  );
}
