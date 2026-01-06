"use client";

import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  AutoAwesome as AiIcon,
  Image as ImageIcon,
  Translate as TranslateIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { UsageRecord, PlanFeatures } from "@/types/billing";
import { formatStorageSize, formatUsageLimit } from "@/lib/billingService";

interface UsageMeterProps {
  usage: UsageRecord;
  features: PlanFeatures;
}

const UsageMeter: React.FC<UsageMeterProps> = ({ usage, features }) => {
  const theme = useTheme();

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (
    percentage: number
  ): "success" | "warning" | "error" => {
    if (percentage >= 90) return "error";
    if (percentage >= 70) return "warning";
    return "success";
  };

  const meters = [
    {
      icon: <AiIcon />,
      label: "AI Summaries",
      used: usage.aiSummaries,
      limit: features.aiSummariesLimit,
      color: theme.palette.primary.main,
    },
    {
      icon: <ImageIcon />,
      label: "AI Images",
      used: usage.aiImages,
      limit: features.aiImagesLimit,
      color: theme.palette.secondary.main,
    },
    {
      icon: <TranslateIcon />,
      label: "Translations",
      used: usage.translations,
      limit: features.translationEnabled ? -1 : 0,
      color: theme.palette.info.main,
    },
    {
      icon: <StorageIcon />,
      label: "Storage",
      used: usage.storageUsed,
      limit: features.storageLimit,
      color: theme.palette.warning.main,
      formatUsed: formatStorageSize,
      formatLimit: formatStorageSize,
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={600}>
        Usage This Month
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 3,
        }}
      >
        {meters.map((meter) => {
          const percentage = getUsagePercentage(meter.used, meter.limit);
          const isUnlimited = meter.limit === -1;
          const isDisabled = meter.limit === 0;
          const progressColor = getProgressColor(percentage);

          const formatUsed = meter.formatUsed || ((v: number) => v.toString());
          const formatLimit = meter.formatLimit || formatUsageLimit;

          return (
            <Box
              key={meter.label}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(meter.color, 0.05),
                border: `1px solid ${alpha(meter.color, 0.1)}`,
              }}
            >
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(meter.color, 0.1),
                      color: meter.color,
                    }}
                  >
                    {meter.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={500}>
                    {meter.label}
                  </Typography>
                </Box>

                {isDisabled ? (
                  <Typography variant="body2" color="text.disabled">
                    Not available on your plan
                  </Typography>
                ) : isUnlimited ? (
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      color={meter.color}
                    >
                      {formatUsed(meter.used)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Unlimited
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="h5" fontWeight={600}>
                        {formatUsed(meter.used)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        / {formatLimit(meter.limit)}
                      </Typography>
                    </Box>
                    <Tooltip
                      title={`${percentage.toFixed(0)}% used`}
                      arrow
                      placement="top"
                    >
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        color={progressColor}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(meter.color, 0.1),
                        }}
                      />
                    </Tooltip>
                    {percentage >= 90 && (
                      <Typography variant="caption" color="error.main">
                        {percentage >= 100
                          ? "Limit reached! Upgrade for more."
                          : "Almost at limit!"}
                      </Typography>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

export default UsageMeter;
