import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const eventId = url.searchParams.get("eventId");
    const userId = url.searchParams.get("userId");
    const waitingListId = url.searchParams.get("waitingListId");

    if (!eventId || !userId || !waitingListId) {
      return NextResponse.json(
        {
          error: "Missing required parameters: eventId, userId, waitingListId",
        },
        { status: 400 }
      );
    }

    // Simulate a webhook call to our Razorpay endpoint
    const mockWebhookPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_test_${Date.now()}`,
            amount: 2000, // ₹20 in paise
            currency: "INR",
            status: "captured",
          },
        },
        order: {
          entity: {
            id: `order_test_${Date.now()}`,
            amount: 2000,
            currency: "INR",
            notes: {
              eventId,
              userId,
              waitingListId,
            },
          },
        },
      },
    };

    console.log("Simulating webhook with payload:", mockWebhookPayload);

    // Call our webhook endpoint
    const response = await fetch(
      `${req.nextUrl.origin}/api/webhooks/razorpay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "test_signature_123",
        },
        body: JSON.stringify(mockWebhookPayload),
      }
    );

    const responseText = await response.text();

    return NextResponse.json({
      success: true,
      webhookStatus: response.status,
      webhookResponse: responseText,
      simulatedPayload: mockWebhookPayload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
