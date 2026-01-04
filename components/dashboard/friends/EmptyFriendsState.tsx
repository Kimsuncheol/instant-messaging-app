"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

export const EmptyFriendsState: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        px: 3,
        textAlign: "center",
      }}
    >
      <Typography sx={{ color: "#8696A0", mb: 2 }}>
        No friends yet
      </Typography>
      <Typography sx={{ color: "#667781", fontSize: "0.875rem" }}>
        Add friends to start chatting
      </Typography>
    </Box>
  );
};
