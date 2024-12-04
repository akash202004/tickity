"use server";

import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";

const convexApiKey = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexApiKey) {
  throw new Error("No NEXT_PUBLIC_CONVEX_URL found");
}

const convex = new ConvexHttpClient(convexApiKey);

export async function createStripeConnectCustomer() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const existingStripeConnectId = await convex.query(
    api.users.getUserStripeConnectId,
    { userId }
  );

  if (existingStripeConnectId) {
    return { account: existingStripeConnectId };
  }

  const account = await stripe.accounts.create({
    type: "express",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  await convex.mutation(api.users.updateOrCreateUserStripeConnectId, {
    userId,
    stripeConnectId: account.id,
  });

  return { account: account.id };
}
