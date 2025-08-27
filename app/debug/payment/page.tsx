"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function PaymentDebug() {
  const { user } = useUser();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    // Override console.log to capture logs
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      addLog("LOG: " + args.join(" "));
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      addLog("ERROR: " + args.join(" "));
      originalError.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const testPaymentFlow = async () => {
    addLog("Starting payment flow test...");

    try {
      // Test webhook endpoint
      addLog("Testing webhook endpoint...");
      const webhookTest = await fetch("/api/webhooks/razorpay/test");
      const webhookResult = await webhookTest.json();
      addLog(`Webhook test result: ${JSON.stringify(webhookResult)}`);

      // Test environment variables
      addLog("Checking environment variables...");
      addLog(
        `Razorpay Key ID: ${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? "Set" : "Missing"}`
      );
    } catch (error) {
      addLog(`Test failed: ${(error as Error).message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Payment Debug Console
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Controls</h2>
              <div className="space-y-3">
                <button
                  onClick={testPaymentFlow}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Test Payment Flow
                </button>

                <button
                  onClick={clearLogs}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {user && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">User Info</h2>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>ID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {user.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Debug Console */}
          <div className="bg-black text-green-400 p-6 rounded-lg font-mono text-sm h-96 overflow-auto">
            <div className="mb-2 text-white">Debug Console:</div>
            {logs.length === 0 ? (
              <div className="text-gray-500">
                No logs yet. Click &quot;Test Payment Flow&quot; to start.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
