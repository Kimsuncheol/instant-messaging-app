// Subscription plan identifiers
export type PlanId = 'free' | 'pro' | 'business';

// Subscription intervals
export type BillingInterval = 'monthly' | 'yearly';

// Subscription status
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

// Invoice status
export type InvoiceStatus = 'paid' | 'pending' | 'failed';

// Usage types for tracking
export type UsageType = 'aiSummary' | 'aiImage' | 'translation';

// Feature limits for each plan
export interface PlanFeatures {
  aiSummariesLimit: number;    // -1 for unlimited
  aiImagesLimit: number;       // -1 for unlimited
  storageLimit: number;        // in bytes, -1 for unlimited
  translationEnabled: boolean;
  prioritySupport: boolean;
  teamFeatures: boolean;
  apiAccess: boolean;
}

// Subscription plan definition
export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  description: string;
  price: number;
  yearlyPrice?: number;
  interval: BillingInterval;
  features: PlanFeatures;
  stripePriceId?: string;
  stripeYearlyPriceId?: string;
}

// User's active subscription
export interface UserSubscription {
  id: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Monthly usage record
export interface UsageRecord {
  id: string;
  userId: string;
  period: string;  // YYYY-MM format
  aiSummaries: number;
  aiImages: number;
  translations: number;
  storageUsed: number;
  lastUpdated: Date;
}

// Invoice record
export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
  createdAt: Date;
  paidAt?: Date;
  invoiceUrl?: string;
  invoicePdfUrl?: string;
  stripeInvoiceId?: string;
}

// Payment method info (limited for security)
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand?: string;      // visa, mastercard, etc.
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// Checkout session for upgrades
export interface CheckoutSession {
  sessionId: string;
  url: string;
}

// API response types
export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetDate: Date;
}

export interface SubscriptionUpdateResult {
  success: boolean;
  subscription?: UserSubscription;
  error?: string;
}

// Firestore document converters (for date handling)
export interface UserSubscriptionFirestore {
  id: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  currentPeriodStart: { seconds: number; nanoseconds: number };
  currentPeriodEnd: { seconds: number; nanoseconds: number };
  cancelAtPeriodEnd: boolean;
  trialEnd?: { seconds: number; nanoseconds: number };
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
}

export interface UsageRecordFirestore {
  id: string;
  userId: string;
  period: string;
  aiSummaries: number;
  aiImages: number;
  translations: number;
  storageUsed: number;
  lastUpdated: { seconds: number; nanoseconds: number };
}

export interface InvoiceFirestore {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
  createdAt: { seconds: number; nanoseconds: number };
  paidAt?: { seconds: number; nanoseconds: number };
  invoiceUrl?: string;
  invoicePdfUrl?: string;
  stripeInvoiceId?: string;
}
