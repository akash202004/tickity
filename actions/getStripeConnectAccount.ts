"use server";

import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { auth } from "@clerk/nextjs/server";

const convex = getConvexClient();

export async function getStripeConnectAccount() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stripeConnectId = await convex.query(api.users.getUserStripeConnectId, {
    userId,
  });

  return {
    stripeConnectId: stripeConnectId || null,
  };
}
