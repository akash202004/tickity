import { headers } from "next/headers";
// import { razorpay } from "@/lib/razorpay"; // Will be used for signature validation
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { RazorpayOrderMetaData } from "@/app/actions/createRazorpayOrder";

// Handle GET requests for webhook verification
export async function GET() {
  console.log("=== RAZORPAY WEBHOOK GET REQUEST ===");
  return new Response("Razorpay webhook endpoint is active", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(req: Request) {
  try {
    console.log("=== RAZORPAY WEBHOOK RECEIVED ===");

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-razorpay-signature") as string;

    console.log("Webhook body length:", body.length);
    console.log("Webhook signature:", signature ? "Present" : "Missing");

    // For development, we'll skip signature validation
    // In production, you should uncomment and implement proper validation
    try {
      // TODO: Implement proper Razorpay webhook signature validation
      // if (!signature) {
      //   console.error("Missing webhook signature");
      //   return new Response("Missing signature", { status: 400 });
      // }

      // const isValid = razorpay.utils.validateWebhookSignature(
      //   body,
      //   signature,
      //   process.env.RAZORPAY_WEBHOOK_SECRET!
      // );

      console.log("Webhook signature validation skipped for development");
    } catch (error) {
      console.error("Webhook signature validation failed:", error);
      // Don't fail on signature validation for now
      console.log("Continuing without signature validation for development");
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
        if (
          !metadata?.eventId ||
          !metadata?.userId ||
          !metadata?.waitingListId
        ) {
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
            amount: payment.amount / 100, // Convert paise to rupees for storage
          },
        });

        console.log("Purchase ticket result:", result);
        console.log("Purchase ticket mutation completed successfully!");

        // Return success response immediately
        return new Response(
          JSON.stringify({
            success: true,
            ticketCreated: true,
            paymentId: payment.id,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("=== ERROR PROCESSING WEBHOOK ===");
        console.error("Error details:", error);
        console.error("Error message:", (error as Error).message);
        console.error("Error stack:", (error as Error).stack);

        // Return error details for debugging
        return new Response(
          JSON.stringify({
            error: "Error processing webhook",
            details: (error as Error).message,
            success: false,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      console.log("=== UNHANDLED WEBHOOK EVENT ===");
      console.log("Event type:", event.event);
      console.log(
        "Available events to handle: payment.captured, order.paid, etc."
      );
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("=== WEBHOOK PROCESSING ERROR ===");
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        details: (error as Error).message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
