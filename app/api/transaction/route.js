import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

const serverKey = process.env.SECRET;
const clientKey = process.env.NEXT_PUBLIC_CLIENT;
const isProduction = false;

const snap = new Midtrans.Snap({ isProduction, serverKey, clientKey });

export async function POST(request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        // Accept a Midtrans-style parameter object directly in the POST body.
        // Either send the full Midtrans `parameter` shape, or include it at `body.parameter`.
        let parameter = body.parameter || body;

        // Backwards compatibility: if client object provided, convert it to Midtrans parameter
        if (!parameter || typeof parameter !== "object") {
            const { client } = body || {};
            if (client && typeof client === "object") {
                const { id, productName, price, quantity } = client;
                parameter = {
                    transaction_details: { order_id: id?.toString(), gross_amount: price * quantity },
                    item_details: [
                        {
                            id: id?.toString(),
                            price: price,
                            quantity: quantity,
                            name: productName?.trim(),
                        },
                    ],
                };
            }
        }

        // Basic validation for Midtrans parameter
        if (!parameter || typeof parameter !== "object")
            return NextResponse.json({ error: "Missing Midtrans parameter object" }, { status: 400 });

        const tdet = parameter.transaction_details;
        const items = parameter.item_details || parameter.item_details;

        if (!tdet || !tdet.order_id || !tdet.gross_amount)
            return NextResponse.json({ error: "Invalid transaction_details (order_id, gross_amount required)" }, { status: 400 });

        if (!items || !(Array.isArray(items) ? items.length > 0 : typeof items === "object"))
            return NextResponse.json({ error: "Invalid item_details (non-empty array required)" }, { status: 400 });

        if (!serverKey || !clientKey) {
            console.error("Missing Midtrans keys in environment");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }
        const token = await snap.createTransactionToken(parameter);
        if (!token) throw new Error("No token returned from Midtrans");

        return NextResponse.json({ token }, { status: 200 });
    } catch (error) {
        console.error("/api/transaction POST error:", error);
        return NextResponse.json({ error: error.ApiResponse.error_messages[0] || error.message || "Error creating transaction token" }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const orderId = url.searchParams.get("order_id") || url.searchParams.get("orderId");
        if (!orderId) return NextResponse.json({ error: "Missing order_id" }, { status: 400 });

        if (!serverKey) {
            console.error("Missing Midtrans server key");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const base = isProduction ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2";
        const auth = "Basic " + Buffer.from(serverKey + ":").toString("base64");
        const resp = await fetch(`${base}/${encodeURIComponent(orderId)}/status`, {
            method: "GET",
            headers: { Authorization: auth, Accept: "application/json" },
        });

        const data = await resp.json();
        return NextResponse.json(data, { status: resp.status });
    } catch (error) {
        console.error("/api/transaction GET error:", error);
        return NextResponse.json({ error: "Failed to fetch transaction status" }, { status: 500 });
    }
}
