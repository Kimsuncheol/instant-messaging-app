"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
  useTheme,
  alpha,
} from "@mui/material";
import {
  CreditCard as CreditCardIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { UserSubscription, SubscriptionPlan } from "@/types/billing";
import { formatPrice } from "@/lib/billingService";

interface SubscriptionCardProps {
  subscription: UserSubscription;
  plan: SubscriptionPlan;
  onManage: () => void;
  onUpgrade: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  plan,
  onManage,
  onUpgrade,
}) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (subscription.status) {
      case "active":
        return theme.palette.success.main;
      case "trialing":
        return theme.palette.info.main;
      case "past_due":
        return theme.palette.warning.main;
      case "canceled":
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getStatusLabel = () => {
    switch (subscription.status) {
      case "active":
        return "Active";
      case "trialing":
        return "Trial";
      case "past_due":
        return "Past Due";
      case "canceled":
        return "Canceled";
      default:
        return subscription.status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isPaidPlan = plan.id !== "free";
  const showUpgrade = plan.id !== "business";

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                Current Plan
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {plan.name}
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel()}
              size="small"
              sx={{
                bgcolor: alpha(getStatusColor(), 0.1),
                color: getStatusColor(),
                fontWeight: 600,
              }}
            />
          </Box>

          {/* Plan Details */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <DetailItem
              icon={<CreditCardIcon />}
              label="Price"
              value={
                plan.price === 0 ? "Free" : `${formatPrice(plan.price)}/month`
              }
            />
            <DetailItem
              icon={<ScheduleIcon />}
              label="Billing Period"
              value={`${formatDate(
                subscription.currentPeriodStart
              )} - ${formatDate(subscription.currentPeriodEnd)}`}
            />
          </Box>

          {/* Warnings */}
          {subscription.cancelAtPeriodEnd && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <WarningIcon color="warning" fontSize="small" />
              <Typography variant="body2" color="warning.dark">
                Your subscription will be canceled on{" "}
                {formatDate(subscription.currentPeriodEnd)}
              </Typography>
            </Box>
          )}

          {subscription.status === "past_due" && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <WarningIcon color="error" fontSize="small" />
              <Typography variant="body2" color="error.dark">
                Payment failed. Please update your payment method.
              </Typography>
            </Box>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={2}>
            {isPaidPlan && (
              <Button variant="outlined" onClick={onManage}>
                Manage Subscription
              </Button>
            )}
            {showUpgrade && (
              <Button variant="contained" onClick={onUpgrade}>
                Upgrade Plan
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

export default SubscriptionCard;
