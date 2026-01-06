"use client";

import React from "react";
import { Box, Typography, Divider, Chip } from "@mui/material";
import { SummaryOutput } from "@/lib/ai";

interface SummaryResultViewProps {
  summary: SummaryOutput;
}

export const SummaryResultView: React.FC<SummaryResultViewProps> = ({
  summary,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Summary */}
      <Box>
        <Typography
          sx={{
            color: "#00A884",
            fontWeight: 600,
            mb: 1,
            fontSize: "0.875rem",
          }}
        >
          SUMMARY
        </Typography>
        <Typography sx={{ color: "#E9EDEF", lineHeight: 1.6 }}>
          {summary.summary}
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: "#2A3942" }} />

      {/* Key Points */}
      <Box>
        <Typography
          sx={{
            color: "#00A884",
            fontWeight: 600,
            mb: 1.5,
            fontSize: "0.875rem",
          }}
        >
          KEY POINTS
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {summary.keyPoints.map((point, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#00A884",
                  mt: 0.8,
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ color: "#D1D7DB", fontSize: "0.9375rem" }}>
                {point}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ bgcolor: "#2A3942" }} />

      {/* Tone */}
      <Box>
        <Typography
          sx={{
            color: "#00A884",
            fontWeight: 600,
            mb: 1,
            fontSize: "0.875rem",
          }}
        >
          TONE
        </Typography>
        <Chip
          label={summary.tone}
          sx={{
            bgcolor: "#2A3942",
            color: "#E9EDEF",
            fontWeight: 500,
          }}
        />
      </Box>
    </Box>
  );
};
