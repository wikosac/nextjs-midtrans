import { NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatus } from "../../lib/firestore";

const serverKey =
    process.env.MIDTRANS_SERVER_KEY || process.env.SECRET || process.env.MIDTRANS_SERVER;

export async function POST(request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const signature = body.signature_key || body.signatureKey || null;
        const order_id = body.order_id || body.orderId || "";
        const status_code = body.status_code || body.statusCode || "";
        const gross_amount = body.gross_amount || body.grossAmount || "";

        if (signature && serverKey) {
            const expected = crypto
                .createHash("sha512")
                .update(order_id + status_code + gross_amount + serverKey)
                .digest("hex");

            if (expected !== signature) {
                console.warn("Invalid signature on Midtrans notification", { body });
                return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
            }
        }

        // Handle notification - update order status in Firestore
        console.log("Midtrans notification received:", body);

        if (order_id && status_code) {
            try {
                await updateOrderStatus(order_id, status_code, body);
                console.log(`Successfully updated order ${order_id} with status ${status_code}`);
            } catch (firestoreError) {
                console.error("Error updating order status in Firestore:", firestoreError);
                // Don't fail the notification - Midtrans expects 200 response
                // Log the error for manual intervention if needed
            }
        } else {
            console.warn("Missing order_id or status_code in notification", { body });
        }

        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (error) {
        console.error("/api/notification error:", error);
        return NextResponse.json({ error: "Notification handling failed" }, { status: 500 });
    }
}
