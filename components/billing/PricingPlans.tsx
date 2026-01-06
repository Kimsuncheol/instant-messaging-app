"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Check as CheckIcon,
  Star as StarIcon,
  Rocket as RocketIcon,
} from "@mui/icons-material";
import { SubscriptionPlan, PlanId } from "@/types/billing";
import {
  formatPrice,
  formatStorageSize,
  formatUsageLimit,
} from "@/lib/billingService";

interface PricingPlansProps {
  plans: SubscriptionPlan[];
  currentPlanId?: PlanId;
  onSelectPlan: (planId: PlanId) => void;
  loading?: boolean;
}

const PricingPlans: React.FC<PricingPlansProps> = ({
  plans,
  currentPlanId,
  onSelectPlan,
  loading = false,
}) => {
  const theme = useTheme();

  const getPlanIcon = (planId: PlanId) => {
    switch (planId) {
      case "pro":
        return <StarIcon />;
      case "business":
        return <RocketIcon />;
      default:
        return null;
    }
  };

  const getPlanColor = (planId: PlanId) => {
    switch (planId) {
      case "pro":
        return theme.palette.primary.main;
      case "business":
        return theme.palette.secondary.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const isCurrentPlan = (planId: PlanId) => planId === currentPlanId;
  const isUpgrade = (planId: PlanId) => {
    const planOrder: PlanId[] = ["free", "pro", "business"];
    const currentIndex = planOrder.indexOf(currentPlanId || "free");
    const targetIndex = planOrder.indexOf(planId);
    return targetIndex > currentIndex;
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(3, 1fr)",
        },
        gap: 3,
      }}
    >
      {plans.map((plan) => {
        const isCurrent = isCurrentPlan(plan.id);
        const isPopular = plan.id === "pro";
        const planColor = getPlanColor(plan.id);

        return (
          <Card
            key={plan.id}
            sx={{
              position: "relative",
              border: isPopular
                ? `2px solid ${planColor}`
                : `1px solid ${theme.palette.divider}`,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows[8],
              },
            }}
          >
            {isPopular && (
              <Chip
                label="Most Popular"
                color="primary"
                size="small"
                sx={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontWeight: 600,
                }}
              />
            )}

            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2} alignItems="center">
                {/* Plan Header */}
                <Box sx={{ textAlign: "center" }}>
                  {getPlanIcon(plan.id) && (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 1,
                        bgcolor: alpha(planColor, 0.1),
                        color: planColor,
                      }}
                    >
                      {getPlanIcon(plan.id)}
                    </Box>
                  )}
                  <Typography variant="h5" fontWeight={600}>
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {plan.description}
                  </Typography>
                </Box>

                {/* Price */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    sx={{ color: planColor }}
                  >
                    {plan.price === 0 ? "Free" : formatPrice(plan.price)}
                  </Typography>
                  {plan.price > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      per month
                    </Typography>
                  )}
                  {plan.yearlyPrice && (
                    <Typography variant="caption" color="success.main">
                      {formatPrice(plan.yearlyPrice)}/year (save 17%)
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ width: "100%" }} />

                {/* Features */}
                <Stack spacing={1.5} sx={{ width: "100%" }}>
                  <FeatureItem
                    label="AI Summaries"
                    value={`${formatUsageLimit(
                      plan.features.aiSummariesLimit
                    )}/month`}
                  />
                  <FeatureItem
                    label="AI Images"
                    value={`${formatUsageLimit(
                      plan.features.aiImagesLimit
                    )}/month`}
                  />
                  <FeatureItem
                    label="Storage"
                    value={formatStorageSize(plan.features.storageLimit)}
                  />
                  <FeatureItem
                    label="Translation"
                    enabled={plan.features.translationEnabled}
                  />
                  <FeatureItem
                    label="Priority Support"
                    enabled={plan.features.prioritySupport}
                  />
                  {plan.features.teamFeatures && (
                    <FeatureItem label="Team Features" enabled />
                  )}
                  {plan.features.apiAccess && (
                    <FeatureItem label="API Access" enabled />
                  )}
                </Stack>

                {/* CTA Button */}
                <Button
                  variant={isCurrent ? "outlined" : "contained"}
                  fullWidth
                  disabled={isCurrent || loading}
                  onClick={() => onSelectPlan(plan.id)}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    bgcolor: isCurrent ? "transparent" : planColor,
                    borderColor: planColor,
                    "&:hover": {
                      bgcolor: isCurrent
                        ? alpha(planColor, 0.1)
                        : alpha(planColor, 0.9),
                    },
                  }}
                >
                  {isCurrent
                    ? "Current Plan"
                    : isUpgrade(plan.id)
                    ? `Upgrade to ${plan.name}`
                    : `Switch to ${plan.name}`}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

interface FeatureItemProps {
  label: string;
  value?: string;
  enabled?: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ label, value, enabled }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <CheckIcon
        sx={{
          fontSize: 18,
          color: enabled !== false ? "success.main" : "text.disabled",
        }}
      />
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          color: enabled !== false ? "text.primary" : "text.disabled",
        }}
      >
        {label}
      </Typography>
      {value && (
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {value}
        </Typography>
      )}
    </Box>
  );
};

export default PricingPlans;
