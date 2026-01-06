import { NextRequest, NextResponse } from "next/server";
import { getInvoices } from "@/lib/billingService";

// GET /api/billing/invoices - Get user's invoice history
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const invoices = await getInvoices(userId, limit);

    return NextResponse.json({
      invoices,
    });
  } catch (error) {
    console.error("Failed to get invoices:", error);
    return NextResponse.json(
      { error: "Failed to get invoices" },
      { status: 500 }
    );
  }
}
