"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import { SubscriptionPlan, PlanId, BillingInterval } from "@/types/billing";
import {
  formatPrice,
  formatStorageSize,
  formatUsageLimit,
} from "@/lib/billingService";
import { useBillingStore } from "@/store/billingStore";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  currentPlanId: PlanId;
  onConfirm: (planId: PlanId, interval: BillingInterval) => Promise<void>;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onClose,
  plans,
  currentPlanId,
  onConfirm,
}) => {
  const theme = useTheme();
  const {
    selectedPlanId,
    selectedInterval,
    setSelectedPlan,
    setSelectedInterval,
    isCheckoutLoading,
    checkoutError,
  } = useBillingStore();

  const [localLoading, setLocalLoading] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const currentPlan = plans.find((p) => p.id === currentPlanId);

  const getPrice = (plan: SubscriptionPlan): number => {
    if (selectedInterval === "yearly" && plan.yearlyPrice) {
      return plan.yearlyPrice;
    }
    return plan.price * (selectedInterval === "yearly" ? 12 : 1);
  };

  const getMonthlyEquivalent = (plan: SubscriptionPlan): number => {
    if (selectedInterval === "yearly" && plan.yearlyPrice) {
      return plan.yearlyPrice / 12;
    }
    return plan.price;
  };

  const handleConfirm = async () => {
    if (!selectedPlanId) return;
    setLocalLoading(true);
    try {
      await onConfirm(selectedPlanId, selectedInterval);
    } finally {
      setLocalLoading(false);
    }
  };

  const isUpgrade = (planId: PlanId): boolean => {
    const order: PlanId[] = ["free", "pro", "business"];
    return order.indexOf(planId) > order.indexOf(currentPlanId);
  };

  const loading = isCheckoutLoading || localLoading;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={600}>
          {selectedPlan && isUpgrade(selectedPlan.id)
            ? "Upgrade Your Plan"
            : "Change Your Plan"}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Billing Interval Toggle */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <ToggleButtonGroup
              value={selectedInterval}
              exclusive
              onChange={(_, value) => value && setSelectedInterval(value)}
              size="small"
            >
              <ToggleButton value="monthly" sx={{ px: 3 }}>
                Monthly
              </ToggleButton>
              <ToggleButton value="yearly" sx={{ px: 3 }}>
                Yearly
                <Typography
                  component="span"
                  variant="caption"
                  color="success.main"
                  sx={{ ml: 1 }}
                >
                  Save 17%
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Plan Selection */}
          <Stack spacing={2}>
            {plans
              .filter((p) => p.id !== "free")
              .map((plan) => (
                <Box
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `2px solid ${
                      selectedPlanId === plan.id
                        ? theme.palette.primary.main
                        : theme.palette.divider
                    }`,
                    bgcolor:
                      selectedPlanId === plan.id
                        ? alpha(theme.palette.primary.main, 0.05)
                        : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.description}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="h6" fontWeight={700}>
                        {formatPrice(getMonthlyEquivalent(plan))}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          /mo
                        </Typography>
                      </Typography>
                      {selectedInterval === "yearly" && (
                        <Typography variant="caption" color="text.secondary">
                          {formatPrice(getPrice(plan))}/year
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
          </Stack>

          {/* Plan Comparison */}
          {selectedPlan && currentPlan && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  What you&apos;ll get:
                </Typography>
                <Stack spacing={1}>
                  <CompareItem
                    label="AI Summaries"
                    current={formatUsageLimit(
                      currentPlan.features.aiSummariesLimit
                    )}
                    new={formatUsageLimit(
                      selectedPlan.features.aiSummariesLimit
                    )}
                  />
                  <CompareItem
                    label="AI Images"
                    current={formatUsageLimit(
                      currentPlan.features.aiImagesLimit
                    )}
                    new={formatUsageLimit(selectedPlan.features.aiImagesLimit)}
                  />
                  <CompareItem
                    label="Storage"
                    current={formatStorageSize(
                      currentPlan.features.storageLimit
                    )}
                    new={formatStorageSize(selectedPlan.features.storageLimit)}
                  />
                  {selectedPlan.features.translationEnabled &&
                    !currentPlan.features.translationEnabled && (
                      <FeatureItem label="Translation" />
                    )}
                  {selectedPlan.features.prioritySupport &&
                    !currentPlan.features.prioritySupport && (
                      <FeatureItem label="Priority Support" />
                    )}
                  {selectedPlan.features.teamFeatures &&
                    !currentPlan.features.teamFeatures && (
                      <FeatureItem label="Team Features" />
                    )}
                  {selectedPlan.features.apiAccess &&
                    !currentPlan.features.apiAccess && (
                      <FeatureItem label="API Access" />
                    )}
                </Stack>
              </Box>
            </>
          )}

          {checkoutError && <Alert severity="error">{checkoutError}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={
            !selectedPlanId || selectedPlanId === currentPlanId || loading
          }
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading
            ? "Processing..."
            : `Confirm ${selectedPlan ? selectedPlan.name : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface CompareItemProps {
  label: string;
  current: string;
  new: string;
}

const CompareItem: React.FC<CompareItemProps> = ({
  label,
  current,
  new: newValue,
}) => {
  const isUpgrade = current !== newValue;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <CheckIcon fontSize="small" color="success" />
      <Typography variant="body2">
        {label}:{" "}
        {isUpgrade ? (
          <>
            <Typography
              component="span"
              variant="body2"
              sx={{ textDecoration: "line-through", color: "text.disabled" }}
            >
              {current}
            </Typography>
            {" → "}
            <Typography
              component="span"
              variant="body2"
              fontWeight={600}
              color="success.main"
            >
              {newValue}
            </Typography>
          </>
        ) : (
          <Typography component="span" variant="body2" fontWeight={500}>
            {newValue}
          </Typography>
        )}
      </Typography>
    </Box>
  );
};

const FeatureItem: React.FC<{ label: string }> = ({ label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <CheckIcon fontSize="small" color="success" />
    <Typography variant="body2">
      <Typography
        component="span"
        variant="body2"
        fontWeight={600}
        color="success.main"
      >
        + {label}
      </Typography>
    </Typography>
  </Box>
);

export default UpgradeModal;
