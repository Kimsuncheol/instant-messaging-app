import { create } from "zustand";
import { PlanId, BillingInterval } from "../types/billing";

interface BillingUiState {
  // Payment modal state
  isUpgradeModalOpen: boolean;
  selectedPlanId: PlanId | null;
  selectedInterval: BillingInterval;
  
  // Checkout flow state
  isCheckoutLoading: boolean;
  checkoutError: string | null;
  
  // Usage alert state
  showQuotaWarning: boolean;
  quotaWarningType: "aiSummary" | "aiImage" | "translation" | null;
  
  // Actions
  openUpgradeModal: (planId?: PlanId) => void;
  closeUpgradeModal: () => void;
  setSelectedPlan: (planId: PlanId) => void;
  setSelectedInterval: (interval: BillingInterval) => void;
  setCheckoutLoading: (loading: boolean) => void;
  setCheckoutError: (error: string | null) => void;
  showQuotaExceeded: (type: "aiSummary" | "aiImage" | "translation") => void;
  hideQuotaWarning: () => void;
  reset: () => void;
}

const initialState = {
  isUpgradeModalOpen: false,
  selectedPlanId: null,
  selectedInterval: "monthly" as BillingInterval,
  isCheckoutLoading: false,
  checkoutError: null,
  showQuotaWarning: false,
  quotaWarningType: null,
};

export const useBillingStore = create<BillingUiState>((set) => ({
  ...initialState,

  openUpgradeModal: (planId) =>
    set({
      isUpgradeModalOpen: true,
      selectedPlanId: planId || null,
      checkoutError: null,
    }),

  closeUpgradeModal: () =>
    set({
      isUpgradeModalOpen: false,
      selectedPlanId: null,
      checkoutError: null,
      isCheckoutLoading: false,
    }),

  setSelectedPlan: (planId) =>
    set({ selectedPlanId: planId }),

  setSelectedInterval: (interval) =>
    set({ selectedInterval: interval }),

  setCheckoutLoading: (loading) =>
    set({ isCheckoutLoading: loading }),

  setCheckoutError: (error) =>
    set({ checkoutError: error }),

  showQuotaExceeded: (type) =>
    set({
      showQuotaWarning: true,
      quotaWarningType: type,
    }),

  hideQuotaWarning: () =>
    set({
      showQuotaWarning: false,
      quotaWarningType: null,
    }),

  reset: () => set(initialState),
}));
