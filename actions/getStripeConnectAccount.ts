"use server";

import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

const convexApiKey = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexApiKey) throw new Error("No Convex API key found");

const convex = new ConvexHttpClient(convexApiKey);

export async function getStripeConnectAccount() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stripeConnectId = await convex.query(api.users.getUserStripeConnectId, {
    userId,
  });

  return
}
