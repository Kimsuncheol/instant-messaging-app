"use client";

import React, { useEffect, useRef } from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useUiStore } from "@/store/uiStore";

interface SidebarUserInfoProps {
  user: User;
}

export const SidebarUserInfo: React.FC<SidebarUserInfoProps> = ({ user }) => {
  const router = useRouter();
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === "dark";
  const footerHeightB = useUiStore((state) => state.footerHeightB);
  const ref = useRef<HTMLDivElement>(null);
  const setFooterHeightB = useUiStore((state) => state.setFooterHeightB);

  useEffect(() => {
    if (ref.current) {
      const height = ref.current.offsetHeight;
      setFooterHeightB(height);
    }
  }, [setFooterHeightB]);

  return (
    <Box
      ref={ref}
      sx={{
        p: 2,
        display: "flex",
        minHeight: footerHeightB,
        alignItems: "center",
        gap: 2,
        bgcolor: isDark ? "#202C33" : "#F0F2F5",
        borderTop: `1px solid ${isDark ? "#2A3942" : "#E9EDEF"}`,
      }}
    >
      <Avatar
        src={user.photoURL || undefined}
        sx={{
          width: 44,
          height: 44,
          bgcolor: isDark ? "#6B7C85" : "#DFE5E7",
          cursor: "pointer",
        }}
        onClick={() => router.push("/profile")}
      >
        {user.displayName?.[0]}
      </Avatar>
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: isDark ? "#E9EDEF" : "#111B21",
          }}
          noWrap
        >
          {user.displayName || "User"}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isDark ? "#8696A0" : "#667781",
            display: "block",
          }}
          noWrap
        >
          {user.email}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={() => router.push("/settings")}
        sx={{
          color: isDark ? "#8696A0" : "#54656F",
          "&:hover": {
            bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          },
        }}
      >
        <SettingsIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
