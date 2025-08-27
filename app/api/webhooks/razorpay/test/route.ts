import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Razorpay webhook endpoint is accessible",
    timestamp: new Date().toISOString(),
    status: "ok",
  });
}

export async function POST() {
  return NextResponse.json({
    message: "Razorpay webhook POST endpoint is accessible",
    timestamp: new Date().toISOString(),
    status: "ok",
  });
}
