import { NextResponse } from "next/server";
import crypto from "crypto";

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

        // TODO: handle notification (update order status in DB, etc.)
        console.log("Midtrans notification received:", body);

        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (error) {
        console.error("/api/notification error:", error);
        return NextResponse.json({ error: "Notification handling failed" }, { status: 500 });
    }
}
