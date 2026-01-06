import { NextRequest, NextResponse } from "next/server";
import {
  getUserSubscription,
  getOrCreateSubscription,
  updateSubscription,
  cancelSubscription,
  getPlanById,
} from "@/lib/billingService";
import { PlanId } from "@/types/billing";

// GET /api/billing/subscription - Get user's subscription
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await getOrCreateSubscription(userId);
    const plan = getPlanById(subscription.planId);

    return NextResponse.json({
      subscription,
      plan,
    });
  } catch (error) {
    console.error("Failed to get subscription:", error);
    return NextResponse.json(
      { error: "Failed to get subscription" },
      { status: 500 }
    );
  }
}

// POST /api/billing/subscription - Create checkout session for upgrade
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
    const { planId, interval } = body as { planId: PlanId; interval?: "monthly" | "yearly" };

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // For free plan, just update directly
    if (planId === "free") {
      const subscription = await updateSubscription(userId, { planId: "free" });
      return NextResponse.json({ subscription });
    }

    // TODO: Integrate with Stripe Checkout
    // For now, return a mock checkout session
    // In production, you would:
    // 1. Create or get Stripe customer
    // 2. Create Stripe checkout session
    // 3. Return the session URL

    const mockCheckoutSession = {
      sessionId: `cs_test_${Date.now()}`,
      url: `/billing/checkout?plan=${planId}&interval=${interval || "monthly"}`,
    };

    return NextResponse.json({
      checkoutSession: mockCheckoutSession,
      message: "Checkout session created (mock mode)",
    });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// PATCH /api/billing/subscription - Update subscription (change plan)
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId, cancelAtPeriodEnd } = body as { 
      planId?: PlanId; 
      cancelAtPeriodEnd?: boolean;
    };

    const updates: Parameters<typeof updateSubscription>[1] = {};
    
    if (planId !== undefined) {
      const plan = getPlanById(planId);
      if (!plan) {
        return NextResponse.json(
          { error: "Invalid plan" },
          { status: 400 }
        );
      }
      updates.planId = planId;
    }

    if (cancelAtPeriodEnd !== undefined) {
      updates.cancelAtPeriodEnd = cancelAtPeriodEnd;
    }

    const subscription = await updateSubscription(userId, updates);
    const plan = getPlanById(subscription.planId);

    return NextResponse.json({
      subscription,
      plan,
    });
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/billing/subscription - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await cancelSubscription(userId);

    return NextResponse.json({
      subscription,
      message: "Subscription will be canceled at the end of the billing period",
    });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
