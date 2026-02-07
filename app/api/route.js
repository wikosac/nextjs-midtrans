import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message: "Midtrans API endpoints",
      endpoints: {
        create_transaction: "/api/transaction",
        transaction_status: "/api/transaction?order_id=<orderId>",
        notification_webhook: "/api/notification"
      }
    },
    { status: 200 }
  );
}