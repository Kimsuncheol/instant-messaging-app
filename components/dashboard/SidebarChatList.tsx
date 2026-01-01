"use client";

import React from "react";
import { Box, Typography, List, ListItem } from "@mui/material";

export const SidebarChatList: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2 }}>
      <Box sx={{ px: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={600}>
          Direct Messages
        </Typography>
      </Box>
      <List>
        <ListItem sx={{ px: 3 }}>
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            No active conversations yet.
          </Typography>
        </ListItem>
      </List>
    </Box>
  );
};
