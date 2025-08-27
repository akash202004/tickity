"use client";
import { createRazorpayRouteAccount } from "@/app/actions/createRazorpayRouteAccount";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useState, useEffect, useCallback } from "react";
import { getRazorpayAccountStatus } from "@/app/actions/getRazorpayAccountStatus";
import type { RazorpayAccountStatus } from "@/app/actions/getRazorpayAccountStatus";
import { CalendarDays, Cog, Plus } from "lucide-react";
import Link from "next/link";
import Spinner from "./Spinner";

export default function SellerDashboard() {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [error, setError] = useState(false);
  const [accountStatus, setAccountStatus] =
    useState<RazorpayAccountStatus | null>(null);
  const { user } = useUser();
  const razorpayAccountId = useQuery(api.users.getUsersStripeConnectId, {
    userId: user?.id || "",
  });

  const isReadyToAcceptPayments =
    accountStatus?.isActive && accountStatus?.paymentsEnabled;

  const fetchAccountStatus = useCallback(async () => {
    if (razorpayAccountId) {
      try {
        console.log("Fetching status for account:", razorpayAccountId);
        const status = await getRazorpayAccountStatus(razorpayAccountId);
        console.log("Account status received:", status);
        setAccountStatus(status);
        setError(false); // Clear any previous errors
      } catch (error) {
        console.error("Error fetching account status:", error);
        setError(true);
        // Set a default status to prevent UI issues
        setAccountStatus({
          isActive: false,
          requiresInformation: true,
          requirements: {
            fields_needed: ["account_setup"],
            pending_verification: [],
          },
          paymentsEnabled: false,
          settlementsEnabled: false,
        });
      }
    }
  }, [razorpayAccountId]);

  const handleManageAccount = async () => {
    try {
      if (razorpayAccountId && accountStatus?.isActive) {
        // For Razorpay, we'll redirect to their dashboard
        // This would need to be implemented with Razorpay's dashboard access
        console.log("Redirecting to Razorpay dashboard...");
        alert("Razorpay dashboard integration would be implemented here");
      }
    } catch (error) {
      console.error("Error accessing Razorpay dashboard:", error);
      setError(true);
    }
  };

  useEffect(() => {
    if (razorpayAccountId) {
      fetchAccountStatus();
    }
  }, [razorpayAccountId, fetchAccountStatus]);

  if (razorpayAccountId === undefined) {
    return <Spinner />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold">Seller Dashboard</h2>
          <p className="text-blue-100 mt-2">
            Manage your seller profile and payment settings
          </p>
        </div>

        {/* Main Content */}
        {isReadyToAcceptPayments && (
          <>
            <div className="bg-white p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Sell tickets for your events
              </h2>
              <p className="text-gray-600 mb-8">
                List your tickets for sale and manage your listings
              </p>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-center gap-4">
                  <Link
                    href="/seller/new-event"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Event
                  </Link>
                  <Link
                    href="/seller/events"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <CalendarDays className="w-5 h-5" />
                    View My Events
                  </Link>
                </div>
              </div>
            </div>

            <hr className="my-8" />
          </>
        )}

        <div className="p-6">
          {/* Account Creation Section */}
          {!razorpayAccountId && !accountCreatePending && (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-4">
                Start Accepting Payments
              </h3>
              <p className="text-gray-600 mb-4">
                Create your seller account to start receiving payments securely
                through Razorpay Route
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-blue-900 mb-2">
                  Important Note:
                </h4>
                <p className="text-sm text-blue-800">
                  This creates a development account for testing. In production,
                  you&apos;ll need to:
                </p>
                <ol className="text-sm text-blue-800 mt-2 ml-4 list-decimal">
                  <li>Apply for Razorpay Route through their dashboard</li>
                  <li>Complete KYC verification</li>
                  <li>Get your Route account approved</li>
                </ol>
              </div>
              <button
                onClick={async () => {
                  setAccountCreatePending(true);
                  setError(false);
                  try {
                    await createRazorpayRouteAccount();
                    setAccountCreatePending(false);
                  } catch (error) {
                    console.error(
                      "Error creating Razorpay Route account:",
                      error
                    );
                    setError(true);
                    setAccountCreatePending(false);
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Development Account
              </button>
            </div>
          )}

          {/* Account Status Section */}
          {razorpayAccountId && accountStatus && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Status Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Account Status
                  </h3>
                  <div className="mt-2 flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        accountStatus.isActive
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-lg font-semibold">
                      {accountStatus.isActive ? "Active" : "Pending Setup"}
                    </span>
                  </div>
                </div>

                {/* Payments Status Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Payment Capability
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center">
                      <svg
                        className={`w-5 h-5 ${
                          accountStatus.paymentsEnabled
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2">
                        {accountStatus.paymentsEnabled
                          ? "Can accept payments"
                          : "Cannot accept payments yet"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className={`w-5 h-5 ${
                          accountStatus.settlementsEnabled
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2">
                        {accountStatus.settlementsEnabled
                          ? "Can receive payouts"
                          : "Cannot receive payouts yet"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements Section */}
              {accountStatus.requiresInformation && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-3">
                    Required Information
                  </h3>
                  {accountStatus.requirements.fields_needed.length > 0 && (
                    <div className="mb-3">
                      <p className="text-yellow-800 font-medium mb-2">
                        Action Required:
                      </p>
                      <ul className="list-disc pl-5 text-yellow-700 text-sm">
                        {accountStatus.requirements.fields_needed.map(
                          (req: string) => (
                            <li key={req}>{req.replace(/_/g, " ")}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {accountStatus.requirements.pending_verification.length >
                    0 && (
                    <div>
                      <p className="text-yellow-800 font-medium mb-2">
                        Pending Verification:
                      </p>
                      <ul className="list-disc pl-5 text-yellow-700 text-sm">
                        {accountStatus.requirements.pending_verification.map(
                          (req: string) => (
                            <li key={req}>{req.replace(/_/g, " ")}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {/* Note: Razorpay doesn't have onboarding links like Stripe */}
                  {accountStatus.requiresInformation && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        Please contact Razorpay support to complete your account
                        verification. Check your Razorpay dashboard for more
                        details.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                {accountStatus.isActive && (
                  <button
                    onClick={handleManageAccount}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Cog className="w-4 h-4 mr-2" />
                    Seller Dashboard
                  </button>
                )}
                <button
                  onClick={fetchAccountStatus}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Refresh Status
                </button>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg">
                  Unable to access Stripe dashboard. Please complete all
                  requirements first.
                </div>
              )}
            </div>
          )}

          {/* Loading States */}
          {accountCreatePending && (
            <div className="text-center py-4 text-gray-600">
              Creating your seller account...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
