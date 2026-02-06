import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

let snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.SECRET,
  clientKey: process.env.NEXT_PUBLIC_CLIENT,
})

export async function POST(request) {
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON format in request body" },
        { status: 400 }
      );
    }

    const { id, productName, price, quantity } = requestBody;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }
    if (!productName) {
      return NextResponse.json(
        { error: "Missing required field: productName" },
        { status: 400 }
      );
    }
    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: "Missing required field: price" },
        { status: 400 }
      );
    }
    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: "Missing required field: quantity" },
        { status: 400 }
      );
    }

    // Validate field types and values
    if (typeof productName !== "string" || productName.trim() === "") {
      return NextResponse.json(
        { error: "productName must be a non-empty string" },
        { status: 400 }
      );
    }
    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "price must be a positive number" },
        { status: 400 }
      );
    }
    if (typeof quantity !== "number" || quantity <= 0 || !Number.isInteger(quantity)) {
      return NextResponse.json(
        { error: "quantity must be a positive integer" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.SECRET || !process.env.NEXT_PUBLIC_CLIENT) {
      console.error("Missing Midtrans configuration environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    let parameter = {
      item_details: {
        name: productName.trim(),
        price: price,
        quantity: quantity
      },
      transaction_details: {
        order_id: id.toString(),
        gross_amount: price * quantity
      }
    };

    // Get token to midtrans via snap
    const token = await snap.createTransactionToken(parameter);

    if (!token) {
      throw new Error("No token received from Midtrans");
    }

    console.log("Transaction token created successfully:", token);

    // Return token
    return NextResponse.json({ token }, { status: 200 });

  } catch (error) {
    console.error("Error creating transaction token:", error);

    // Handle specific Midtrans errors
    if (error.message && error.message.includes("Midtrans")) {
      return NextResponse.json(
        { error: "Midtrans service error. Please try again later." },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: "Failed to create transaction token" },
      { status: 500 }
    );
  }
}