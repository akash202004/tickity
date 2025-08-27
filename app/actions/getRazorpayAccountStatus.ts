"use server";
// import { razorpay } from "@/lib/razorpay"; // Not needed for mock implementation

export type RazorpayAccountStatus = {
  isActive: boolean;
  requiresInformation: boolean;
  requirements: {
    fields_needed: string[];
    pending_verification: string[];
  };
  paymentsEnabled: boolean;
  settlementsEnabled: boolean;
};

export async function getRazorpayAccountStatus(
  razorpayAccountId: string
): Promise<RazorpayAccountStatus> {
  if (!razorpayAccountId) {
    throw new Error("No Razorpay account ID provided");
  }

  try {
    console.log("Fetching account status for:", razorpayAccountId);

    // Since we're using mock account IDs that start with "acc_mock_"
    // we'll return mock status data for development
    if (razorpayAccountId.startsWith("acc_mock_")) {
      return {
        isActive: true,
        requiresInformation: false,
        requirements: {
          fields_needed: [],
          pending_verification: [],
        },
        paymentsEnabled: true,
        settlementsEnabled: true,
      };
    }

    // For real Razorpay Route account IDs, you would implement actual API calls
    // Note: Razorpay Route account status checking requires different API endpoints
    // than standard Razorpay accounts

    // TODO: Implement real Razorpay Route account status checking
    // const account = await razorpay.route.accounts.fetch(razorpayAccountId);

    return {
      isActive: false,
      requiresInformation: true,
      requirements: {
        fields_needed: ["business_verification"],
        pending_verification: ["bank_account"],
      },
      paymentsEnabled: false,
      settlementsEnabled: false,
    };
  } catch (error) {
    console.error("Error fetching Razorpay account status:", error);
    throw new Error("Failed to fetch Razorpay account status");
  }
}
