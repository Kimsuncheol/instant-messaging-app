import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  increment,
} from "firebase/firestore";
import {
  PlanId,
  SubscriptionPlan,
  UserSubscription,
  UsageRecord,
  Invoice,
  QuotaCheckResult,
  UsageType,
  UserSubscriptionFirestore,
  UsageRecordFirestore,
  InvoiceFirestore,
} from "../types/billing";

// ============================================
// Subscription Plans Configuration
// ============================================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic messaging with limited AI features",
    price: 0,
    interval: "monthly",
    features: {
      aiSummariesLimit: 5,
      aiImagesLimit: 2,
      storageLimit: 100 * 1024 * 1024, // 100MB
      translationEnabled: false,
      prioritySupport: false,
      teamFeatures: false,
      apiAccess: false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Enhanced features for power users",
    price: 9.99,
    yearlyPrice: 99.99,
    interval: "monthly",
    features: {
      aiSummariesLimit: 100,
      aiImagesLimit: 50,
      storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
      translationEnabled: true,
      prioritySupport: true,
      teamFeatures: false,
      apiAccess: false,
    },
  },
  {
    id: "business",
    name: "Business",
    description: "Full features for teams and businesses",
    price: 29.99,
    yearlyPrice: 299.99,
    interval: "monthly",
    features: {
      aiSummariesLimit: -1, // unlimited
      aiImagesLimit: 500,
      storageLimit: 50 * 1024 * 1024 * 1024, // 50GB
      translationEnabled: true,
      prioritySupport: true,
      teamFeatures: true,
      apiAccess: true,
    },
  },
];

// ============================================
// Helper Functions
// ============================================

const getCurrentPeriod = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const timestampToDate = (timestamp: { seconds: number; nanoseconds: number }): Date => {
  return new Date(timestamp.seconds * 1000);
};

const convertSubscriptionFromFirestore = (data: UserSubscriptionFirestore): UserSubscription => ({
  ...data,
  currentPeriodStart: timestampToDate(data.currentPeriodStart),
  currentPeriodEnd: timestampToDate(data.currentPeriodEnd),
  trialEnd: data.trialEnd ? timestampToDate(data.trialEnd) : undefined,
  createdAt: timestampToDate(data.createdAt),
  updatedAt: timestampToDate(data.updatedAt),
});

const convertUsageFromFirestore = (data: UsageRecordFirestore): UsageRecord => ({
  ...data,
  lastUpdated: timestampToDate(data.lastUpdated),
});

const convertInvoiceFromFirestore = (data: InvoiceFirestore): Invoice => ({
  ...data,
  createdAt: timestampToDate(data.createdAt),
  paidAt: data.paidAt ? timestampToDate(data.paidAt) : undefined,
});

// ============================================
// Plan Functions
// ============================================

export const getSubscriptionPlans = (): SubscriptionPlan[] => {
  return SUBSCRIPTION_PLANS;
};

export const getPlanById = (planId: PlanId): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
};

// ============================================
// Subscription Functions
// ============================================

export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  const subscriptionRef = doc(db, "subscriptions", userId);
  const subscriptionDoc = await getDoc(subscriptionRef);

  if (!subscriptionDoc.exists()) {
    return null;
  }

  return convertSubscriptionFromFirestore(subscriptionDoc.data() as UserSubscriptionFirestore);
};

export const createFreeSubscription = async (userId: string): Promise<UserSubscription> => {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const subscription: UserSubscription = {
    id: userId,
    userId,
    planId: "free",
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  };

  const subscriptionRef = doc(db, "subscriptions", userId);
  await setDoc(subscriptionRef, {
    ...subscription,
    currentPeriodStart: Timestamp.fromDate(subscription.currentPeriodStart),
    currentPeriodEnd: Timestamp.fromDate(subscription.currentPeriodEnd),
    createdAt: Timestamp.fromDate(subscription.createdAt),
    updatedAt: Timestamp.fromDate(subscription.updatedAt),
  });

  return subscription;
};

export const getOrCreateSubscription = async (userId: string): Promise<UserSubscription> => {
  const existing = await getUserSubscription(userId);
  if (existing) {
    return existing;
  }
  return createFreeSubscription(userId);
};

export const updateSubscription = async (
  userId: string,
  updates: Partial<Pick<UserSubscription, "planId" | "status" | "cancelAtPeriodEnd" | "stripeSubscriptionId" | "stripeCustomerId">>
): Promise<UserSubscription> => {
  const subscriptionRef = doc(db, "subscriptions", userId);
  
  await updateDoc(subscriptionRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });

  const updated = await getUserSubscription(userId);
  if (!updated) {
    throw new Error("Subscription not found after update");
  }
  return updated;
};

export const cancelSubscription = async (userId: string): Promise<UserSubscription> => {
  return updateSubscription(userId, { cancelAtPeriodEnd: true });
};

// ============================================
// Usage Tracking Functions
// ============================================

export const getUsage = async (userId: string): Promise<UsageRecord | null> => {
  const period = getCurrentPeriod();
  const usageRef = doc(db, "usage", `${userId}_${period}`);
  const usageDoc = await getDoc(usageRef);

  if (!usageDoc.exists()) {
    return null;
  }

  return convertUsageFromFirestore(usageDoc.data() as UsageRecordFirestore);
};

export const getOrCreateUsage = async (userId: string): Promise<UsageRecord> => {
  const period = getCurrentPeriod();
  const usageId = `${userId}_${period}`;
  const usageRef = doc(db, "usage", usageId);
  const usageDoc = await getDoc(usageRef);

  if (usageDoc.exists()) {
    return convertUsageFromFirestore(usageDoc.data() as UsageRecordFirestore);
  }

  const newUsage: UsageRecord = {
    id: usageId,
    userId,
    period,
    aiSummaries: 0,
    aiImages: 0,
    translations: 0,
    storageUsed: 0,
    lastUpdated: new Date(),
  };

  await setDoc(usageRef, {
    ...newUsage,
    lastUpdated: Timestamp.now(),
  });

  return newUsage;
};

export const incrementUsage = async (userId: string, type: UsageType): Promise<UsageRecord> => {
  const period = getCurrentPeriod();
  const usageId = `${userId}_${period}`;
  const usageRef = doc(db, "usage", usageId);
  
  // Ensure usage record exists
  await getOrCreateUsage(userId);

  const fieldMap: Record<UsageType, string> = {
    aiSummary: "aiSummaries",
    aiImage: "aiImages",
    translation: "translations",
  };

  await updateDoc(usageRef, {
    [fieldMap[type]]: increment(1),
    lastUpdated: Timestamp.now(),
  });

  const updated = await getUsage(userId);
  if (!updated) {
    throw new Error("Usage record not found after increment");
  }
  return updated;
};

export const checkQuota = async (userId: string, type: UsageType): Promise<QuotaCheckResult> => {
  const subscription = await getOrCreateSubscription(userId);
  const usage = await getOrCreateUsage(userId);
  const plan = getPlanById(subscription.planId);

  if (!plan) {
    throw new Error(`Unknown plan: ${subscription.planId}`);
  }

  let usageCount: number;
  let limitCount: number;

  switch (type) {
    case "aiSummary":
      usageCount = usage.aiSummaries;
      limitCount = plan.features.aiSummariesLimit;
      break;
    case "aiImage":
      usageCount = usage.aiImages;
      limitCount = plan.features.aiImagesLimit;
      break;
    case "translation":
      usageCount = usage.translations;
      limitCount = plan.features.translationEnabled ? -1 : 0;
      break;
    default:
      throw new Error(`Unknown usage type: ${type}`);
  }

  // -1 means unlimited
  const allowed = limitCount === -1 || usageCount < limitCount;
  const remaining = limitCount === -1 ? -1 : Math.max(0, limitCount - usageCount);

  return {
    allowed,
    remaining,
    limit: limitCount,
    resetDate: subscription.currentPeriodEnd,
  };
};

// ============================================
// Invoice Functions
// ============================================

export const getInvoices = async (userId: string, maxResults: number = 10): Promise<Invoice[]> => {
  const invoicesRef = collection(db, "invoices");
  const q = query(
    invoicesRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => convertInvoiceFromFirestore(doc.data() as InvoiceFirestore));
};

export const createInvoice = async (
  invoice: Omit<Invoice, "id" | "createdAt">
): Promise<Invoice> => {
  const invoicesRef = collection(db, "invoices");
  const newInvoiceRef = doc(invoicesRef);
  
  const newInvoice: Invoice = {
    ...invoice,
    id: newInvoiceRef.id,
    createdAt: new Date(),
  };

  await setDoc(newInvoiceRef, {
    ...newInvoice,
    createdAt: Timestamp.now(),
    paidAt: newInvoice.paidAt ? Timestamp.fromDate(newInvoice.paidAt) : null,
  });

  return newInvoice;
};

export const updateInvoiceStatus = async (
  invoiceId: string,
  status: Invoice["status"],
  paidAt?: Date
): Promise<void> => {
  const invoiceRef = doc(db, "invoices", invoiceId);
  
  await updateDoc(invoiceRef, {
    status,
    ...(paidAt && { paidAt: Timestamp.fromDate(paidAt) }),
  });
};

// ============================================
// Utility Functions
// ============================================

export const formatPrice = (price: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
};

export const formatStorageSize = (bytes: number): string => {
  if (bytes === -1) return "Unlimited";
  
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unitIndex]}`;
};

export const formatUsageLimit = (limit: number): string => {
  if (limit === -1) return "Unlimited";
  return limit.toString();
};
