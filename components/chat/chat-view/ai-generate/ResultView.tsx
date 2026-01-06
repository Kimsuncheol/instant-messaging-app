"use client";

import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { GenerationOutput } from "@/lib/ai";

interface ResultViewProps {
  result: GenerationOutput;
}

export const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Generated Message */}
      <Box>
        <Typography
          sx={{
            color: "#FFA726",
            fontWeight: 600,
            mb: 1,
            fontSize: "0.875rem",
          }}
        >
          GENERATED MESSAGE
        </Typography>
        <Box
          sx={{
            bgcolor: "#2A3942",
            borderRadius: 1,
            p: 2,
            border: "1px solid #3B4A54",
          }}
        >
          <Typography
            sx={{
              color: "#E9EDEF",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {result.generatedMessage}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ bgcolor: "#2A3942" }} />

      {/* Reasoning */}
      <Box>
        <Typography
          sx={{
            color: "#FFA726",
            fontWeight: 600,
            mb: 1,
            fontSize: "0.875rem",
          }}
        >
          REASONING
        </Typography>
        <Typography
          sx={{
            color: "#8696A0",
            fontStyle: "italic",
            fontSize: "0.875rem",
          }}
        >
          {result.reasoning}
        </Typography>
      </Box>
    </Box>
  );
};
