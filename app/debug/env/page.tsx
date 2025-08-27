"use client";

import { useEffect, useState } from "react";

export default function EnvChecker() {
  const [envStatus, setEnvStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Check client-side env vars
    setEnvStatus({
      NEXT_PUBLIC_RAZORPAY_KEY_ID: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      NEXT_PUBLIC_CONVEX_URL: !!process.env.NEXT_PUBLIC_CONVEX_URL,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Environment Variables Check
        </h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Client-side Variables:</h2>
          <div className="space-y-2">
            {Object.entries(envStatus).map(([key, exists]) => (
              <div key={key} className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${exists ? "bg-green-500" : "bg-red-500"}`}
                ></span>
                <span className="font-mono text-sm">{key}</span>
                <span
                  className={`text-sm ${exists ? "text-green-600" : "text-red-600"}`}
                >
                  {exists ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Make sure these environment variables are set in your{" "}
              <code>.env.local</code> file:
            </p>
            <pre className="bg-gray-100 p-4 rounded mt-2">
              {`# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOY_KEY=your_deploy_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
