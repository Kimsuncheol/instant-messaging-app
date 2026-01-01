"use client";

import React from "react";
import { Box, CircularProgress } from "@mui/material";

export const LoadingScreen: React.FC = () => {
  return (
    <Box 
      display="flex" 
      minHeight="100vh" 
      alignItems="center" 
      justifyContent="center" 
      bgcolor="background.default"
    >
      <CircularProgress color="primary" />
    </Box>
  );
};
