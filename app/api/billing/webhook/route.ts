import { NextRequest, NextResponse } from "next/server";
import { updateSubscription, createInvoice, updateInvoiceStatus } from "@/lib/billingService";

// Stripe webhook event types we handle
type StripeEventType = 
  | "checkout.session.completed"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "customer.subscription.updated"
  | "customer.subscription.deleted";

interface StripeEvent {
  id: string;
  type: StripeEventType;
  data: {
    object: Record<string, unknown>;
  };
}

// POST /api/billing/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    // TODO: In production, verify the webhook signature
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature!,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    // For now, parse the body directly (development mode)
    let event: StripeEvent;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    console.log(`Received webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          customer: string;
          subscription: string;
          metadata?: { userId?: string; planId?: string };
        };
        
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        
        if (userId && planId) {
          await updateSubscription(userId, {
            planId: planId as "free" | "pro" | "business",
            status: "active",
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
          });
          console.log(`Subscription activated for user ${userId}`);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as {
          id: string;
          customer: string;
          subscription: string;
          amount_paid: number;
          currency: string;
          hosted_invoice_url?: string;
          invoice_pdf?: string;
          metadata?: { userId?: string };
        };
        
        const userId = invoice.metadata?.userId;
        
        if (userId) {
          await createInvoice({
            userId,
            subscriptionId: invoice.subscription,
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency.toUpperCase(),
            status: "paid",
            description: "Subscription payment",
            paidAt: new Date(),
            invoiceUrl: invoice.hosted_invoice_url,
            invoicePdfUrl: invoice.invoice_pdf,
            stripeInvoiceId: invoice.id,
          });
          console.log(`Invoice recorded for user ${userId}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as {
          subscription: string;
          metadata?: { userId?: string };
        };
        
        const userId = invoice.metadata?.userId;
        
        if (userId) {
          await updateSubscription(userId, {
            status: "past_due",
          });
          console.log(`Subscription marked as past_due for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as {
          id: string;
          status: string;
          cancel_at_period_end: boolean;
          metadata?: { userId?: string };
        };
        
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          await updateSubscription(userId, {
            status: subscription.status as "active" | "canceled" | "past_due" | "trialing",
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
          console.log(`Subscription updated for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as {
          metadata?: { userId?: string };
        };
        
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          // Downgrade to free plan
          await updateSubscription(userId, {
            planId: "free",
            status: "active",
            cancelAtPeriodEnd: false,
          });
          console.log(`Subscription canceled, downgraded to free for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
