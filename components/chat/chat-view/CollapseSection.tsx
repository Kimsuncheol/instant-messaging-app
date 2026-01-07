"use client";

import React from "react";
import { Box, Typography, Collapse, Button } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  ChevronRight,
} from "@mui/icons-material";

interface CollapseSectionProps {
  title: string;
  count?: number;
  isOpen: boolean;
  onToggle: () => void;
  onMoreClick?: () => void;
  children: React.ReactNode;
  showMoreButton?: boolean;
}

export const CollapseSection: React.FC<CollapseSectionProps> = ({
  title,
  count,
  isOpen,
  onToggle,
  onMoreClick,
  children,
  showMoreButton = true,
}) => {
  return (
    <Box sx={{ borderBottom: "1px solid #2A3942" }}>
      {/* Header */}
      <Box
        onClick={onToggle}
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "#8696A0", fontWeight: 500 }}
          >
            {title}
            {count !== undefined && ` (${count})`}
          </Typography>
        </Box>
        {isOpen ? (
          <KeyboardArrowDown sx={{ color: "#8696A0" }} />
        ) : (
          <KeyboardArrowRight sx={{ color: "#8696A0" }} />
        )}
      </Box>

      {/* Content */}
      <Collapse in={isOpen}>
        {children}

        {/* More Button - Below Content */}
        {showMoreButton && onMoreClick && (
          <Box
            sx={{
              px: 2,
              pb: 2,
              pt: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              size="small"
              onClick={onMoreClick}
              sx={{
                color: "#00A884",
                textTransform: "none",
                fontSize: "0.8125rem",
                px: 2,
                py: 0.75,
                borderRadius: 2,
                "&:hover": { bgcolor: "rgba(0, 168, 132, 0.1)" },
              }}
              endIcon={
                <ChevronRight sx={{ fontSize: "1.125rem !important" }} />
              }
            >
              View All
            </Button>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};
