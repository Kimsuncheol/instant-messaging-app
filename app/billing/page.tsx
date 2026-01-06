"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Stack,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  useTheme,
} from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  PricingPlans,
  SubscriptionCard,
  UsageMeter,
  InvoiceHistory,
  UpgradeModal,
} from "@/components/billing";
import { useBillingStore } from "@/store/billingStore";
import { getInvoices } from "@/lib/billingService";
import { Invoice, PlanId, BillingInterval } from "@/types/billing";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
      {value === index && children}
    </Box>
  );
}

export default function BillingPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    subscription,
    usage,
    currentPlan,
    plans,
    loading: subscriptionLoading,
    error,
    refreshSubscription,
  } = useSubscription();

  const {
    isUpgradeModalOpen,
    openUpgradeModal,
    closeUpgradeModal,
    setSelectedPlan,
    setCheckoutLoading,
    setCheckoutError,
  } = useBillingStore();

  const [activeTab, setActiveTab] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadInvoices = async () => {
      if (!user) return;
      setInvoicesLoading(true);
      try {
        const data = await getInvoices(user.uid);
        setInvoices(data);
      } catch (err) {
        console.error("Failed to load invoices:", err);
      } finally {
        setInvoicesLoading(false);
      }
    };
    loadInvoices();
  }, [user]);

  const handleSelectPlan = (planId: PlanId) => {
    setSelectedPlan(planId);
    openUpgradeModal(planId);
  };

  const handleUpgradeConfirm = async (
    planId: PlanId,
    interval: BillingInterval
  ) => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      // TODO: Integrate with Stripe checkout
      // For now, simulate the upgrade process
      const response = await fetch("/api/billing/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.uid || "",
        },
        body: JSON.stringify({ planId, interval }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      if (data.checkoutSession?.url) {
        // In production, redirect to Stripe checkout
        // window.location.href = data.checkoutSession.url;

        // For demo, just refresh the subscription
        await refreshSubscription();
        closeUpgradeModal();
      }
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Failed to process upgrade"
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const loading = authLoading || subscriptionLoading;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <IconButton onClick={() => router.back()}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Billing & Subscription
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your subscription and view usage
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Current Subscription */}
        {subscription && currentPlan && (
          <Box sx={{ mb: 4 }}>
            <SubscriptionCard
              subscription={subscription}
              plan={currentPlan}
              onManage={() => {}}
              onUpgrade={() => openUpgradeModal()}
            />
          </Box>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
          >
            <Tab label="Usage" />
            <Tab label="Plans" />
            <Tab label="Invoices" />
          </Tabs>
        </Box>

        {/* Usage Tab */}
        <TabPanel value={activeTab} index={0}>
          {usage && currentPlan && (
            <UsageMeter usage={usage} features={currentPlan.features} />
          )}
        </TabPanel>

        {/* Plans Tab */}
        <TabPanel value={activeTab} index={1}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Available Plans
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose the plan that best fits your needs
              </Typography>
            </Box>
            <PricingPlans
              plans={plans}
              currentPlanId={subscription?.planId}
              onSelectPlan={handleSelectPlan}
            />
          </Stack>
        </TabPanel>

        {/* Invoices Tab */}
        <TabPanel value={activeTab} index={2}>
          <InvoiceHistory invoices={invoices} loading={invoicesLoading} />
        </TabPanel>
      </Container>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        plans={plans}
        currentPlanId={subscription?.planId || "free"}
        onConfirm={handleUpgradeConfirm}
      />
    </Box>
  );
}
