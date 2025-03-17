import { StripeCheckoutMetaData } from "@/actions/createStripeCheckoutSession";
import Stripe from "stripe";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST(req: Request) {
  console.log("🔔 Webhook received");

  let body: string;
  try {
    body = await req.text();
  } catch (error) {
    console.error("❌ Failed to read request body:", error);
    return new Response("Failed to read request body", { status: 400 });
  }

  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("❌ Stripe signature missing");
    return new Response("Stripe signature missing", { status: 400 });
  }
  console.log(process.env.STRIPE_WEBHOOK_SECRET);

  let event: Stripe.Event;
  try {
    console.log("🔹 Constructing webhook event");
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log(`✅ Webhook event (${event.type}) constructed successfully`);
  } catch (error) {
    console.error("❌ Webhook event construction failed:", error);
    return new Response("Webhook event construction failed", { status: 400 });
  }

  const convex = getConvexClient();

  if (event.type === "checkout.session.completed") {
    console.log("🛒 Processing checkout session completed event");

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata as StripeCheckoutMetaData;

    if (!metadata?.eventId || !metadata?.userId || !metadata?.waitingListId) {
      console.error("❌ Metadata is missing required fields:", metadata);
      return new Response("Invalid metadata", { status: 400 });
    }

    console.log("🎟️ Checkout session completed:", session.id);
    console.log("🔍 Metadata:", metadata);

    try {
      const result = await convex.mutation(api.events.purchaseTicket, {
        eventId: metadata.eventId,
        userId: metadata.userId,
        waitingListId: metadata.waitingListId,
        paymentInfo: {
          paymentIntentId: session.payment_intent as string,
          amount: session.amount_total ?? 0,
        },
      });
      console.log("✅ Purchase ticket mutation completed:", result);
    } catch (error) {
      console.error("❌ Purchase ticket mutation failed:", error);
      return new Response("Purchase ticket mutation failed", { status: 500 });
    }
  }

  return new Response("✅ Webhook received", { status: 200 });
}
