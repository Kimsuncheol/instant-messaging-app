import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateUsage,
  incrementUsage,
  checkQuota,
} from "@/lib/billingService";
import { UsageType } from "@/types/billing";

// GET /api/billing/usage - Get user's usage for current period
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const usage = await getOrCreateUsage(userId);

    // Also get quota information for each type
    const [aiSummaryQuota, aiImageQuota, translationQuota] = await Promise.all([
      checkQuota(userId, "aiSummary"),
      checkQuota(userId, "aiImage"),
      checkQuota(userId, "translation"),
    ]);

    return NextResponse.json({
      usage,
      quotas: {
        aiSummary: aiSummaryQuota,
        aiImage: aiImageQuota,
        translation: translationQuota,
      },
    });
  } catch (error) {
    console.error("Failed to get usage:", error);
    return NextResponse.json(
      { error: "Failed to get usage" },
      { status: 500 }
    );
  }
}

// POST /api/billing/usage - Increment usage counter
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type } = body as { type: UsageType };

    if (!type || !["aiSummary", "aiImage", "translation"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid usage type" },
        { status: 400 }
      );
    }

    // Check quota before incrementing
    const quotaCheck = await checkQuota(userId, type);
    
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { 
          error: "Quota exceeded",
          quota: quotaCheck,
        },
        { status: 402 } // Payment Required
      );
    }

    const usage = await incrementUsage(userId, type);
    const updatedQuota = await checkQuota(userId, type);

    return NextResponse.json({
      usage,
      quota: updatedQuota,
    });
  } catch (error) {
    console.error("Failed to increment usage:", error);
    return NextResponse.json(
      { error: "Failed to increment usage" },
      { status: 500 }
    );
  }
}
