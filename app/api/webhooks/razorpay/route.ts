import { headers } from "next/headers";
// import { razorpay } from "@/lib/razorpay"; // Will be used for signature validation
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { RazorpayOrderMetaData } from "@/app/actions/createRazorpayOrder";

export async function POST(req: Request) {
  console.log("=== RAZORPAY WEBHOOK RECEIVED ===");

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("x-razorpay-signature") as string;

  console.log("Webhook body length:", body.length);
  console.log("Webhook signature:", signature ? "Present" : "Missing");

  // Validate webhook signature
  try {
    // Note: Razorpay webhook validation works differently
    // For now, we'll implement a basic validation
    if (!signature) {
      console.error("Missing webhook signature");
      return new Response("Missing signature", { status: 400 });
    }

    // TODO: Implement proper Razorpay webhook signature validation
    // const isValid = razorpay.utils.validateWebhookSignature(
    //   body,
    //   signature,
    //   process.env.RAZORPAY_WEBHOOK_SECRET!
    // );

    console.log("Webhook signature validated (mock)");
  } catch (error) {
    console.error("Webhook signature validation failed:", error);
    return new Response("Signature validation failed", { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
    console.log("=== FULL WEBHOOK EVENT ===");
    console.log("Event type:", event.event);
    console.log("Full event structure:", JSON.stringify(event, null, 2));
  } catch (err) {
    console.error("Webhook parsing failed:", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  const convex = getConvexClient();

  if (event.event === "payment.captured") {
    console.log("=== PROCESSING PAYMENT.CAPTURED ===");

    try {
      // Check if the event structure matches our expectations
      const payment = event.payload?.payment?.entity;
      const order = event.payload?.order?.entity;

      if (!payment || !order) {
        console.error("Missing payment or order in webhook payload");
        console.log("Payment:", payment);
        console.log("Order:", order);
        return new Response("Invalid webhook payload structure", {
          status: 400,
        });
      }

      const metadata = order.notes as RazorpayOrderMetaData;

      console.log("Payment ID:", payment.id);
      console.log("Payment amount:", payment.amount);
      console.log("Order ID:", order.id);
      console.log("Payment metadata:", metadata);

      // Validate metadata
      if (!metadata?.eventId || !metadata?.userId || !metadata?.waitingListId) {
        console.error("Missing required metadata in order notes");
        console.log("Required: eventId, userId, waitingListId");
        console.log("Received metadata:", metadata);
        return new Response("Missing required metadata", { status: 400 });
      }

      console.log("Calling purchaseTicket mutation...");
      const result = await convex.mutation(api.events.purchaseTicket, {
        eventId: metadata.eventId,
        userId: metadata.userId,
        waitingListId: metadata.waitingListId,
        paymentInfo: {
          paymentIntentId: payment.id,
          amount: payment.amount,
        },
      });

      console.log("Purchase ticket result:", result);
      console.log("Purchase ticket mutation completed:", result);
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  } else {
    console.log("=== UNHANDLED WEBHOOK EVENT ===");
    console.log("Event type:", event.event);
    console.log(
      "Available events to handle: payment.captured, order.paid, etc."
    );
  }

  return new Response(null, { status: 200 });
}
