"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  UserSubscription,
  UsageRecord,
  QuotaCheckResult,
  UsageType,
  SubscriptionPlan,
} from "../types/billing";
import {
  getOrCreateSubscription,
  getOrCreateUsage,
  checkQuota as checkQuotaService,
  getSubscriptionPlans,
  getPlanById,
  refreshSubscription as refreshSubscriptionService,
} from "../lib/billingService";

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  usage: UsageRecord | null;
  currentPlan: SubscriptionPlan | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  checkQuota: (type: UsageType) => Promise<QuotaCheckResult>;
  refreshSubscription: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  usage: null,
  currentPlan: null,
  plans: [],
  loading: true,
  error: null,
  checkQuota: async () => ({
    allowed: false,
    remaining: 0,
    limit: 0,
    resetDate: new Date(),
  }),
  refreshSubscription: async () => {},
  refreshUsage: async () => {},
});

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [usage, setUsage] = useState<UsageRecord | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [plans] = useState<SubscriptionPlan[]>(getSubscriptionPlans());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setCurrentPlan(null);
      return;
    }

    try {
      const sub = await getOrCreateSubscription(user.uid);
      setSubscription(sub);

      const plan = getPlanById(sub.planId);
      setCurrentPlan(plan || null);
    } catch (err) {
      console.error("Failed to refresh subscription:", err);
      setError("Failed to load subscription");
    }
  }, [user]);

  const refreshUsage = useCallback(async () => {
    if (!user) {
      setUsage(null);
      return;
    }

    try {
      const usageRecord = await getOrCreateUsage(user.uid);
      setUsage(usageRecord);
    } catch (err) {
      console.error("Failed to refresh usage:", err);
      setError("Failed to load usage data");
    }
  }, [user]);

  const checkQuota = useCallback(
    async (type: UsageType): Promise<QuotaCheckResult> => {
      if (!user) {
        return {
          allowed: false,
          remaining: 0,
          limit: 0,
          resetDate: new Date(),
        };
      }

      try {
        return await checkQuotaService(user.uid, type);
      } catch (err) {
        console.error("Failed to check quota:", err);
        return {
          allowed: false,
          remaining: 0,
          limit: 0,
          resetDate: new Date(),
        };
      }
    },
    [user]
  );

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setSubscription(null);
        setUsage(null);
        setCurrentPlan(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await Promise.all([refreshSubscription(), refreshUsage()]);
      } catch (err) {
        console.error("Failed to load billing data:", err);
        setError("Failed to load billing data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, refreshSubscription, refreshUsage]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        usage,
        currentPlan,
        plans,
        loading,
        error,
        checkQuota,
        refreshSubscription,
        refreshUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
