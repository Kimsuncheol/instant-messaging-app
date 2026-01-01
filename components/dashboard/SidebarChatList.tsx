"use client";

import React from "react";
import { Box, Typography, TextField, InputAdornment, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

export const SidebarChatList: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#111B21' }}>
      {/* Search Bar */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <TextField
          fullWidth
          placeholder="Search or start new chat"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#8696A0', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#202C33',
              borderRadius: '8px',
              '& fieldset': { border: 'none' },
              '& input': {
                color: '#E9EDEF',
                fontSize: '0.875rem',
                py: 1,
                '&::placeholder': {
                  color: '#8696A0',
                  opacity: 1,
                },
              },
            },
          }}
        />
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ px: 2, py: 1, display: 'flex', gap: 1 }}>
        <Box
          sx={{
            px: 2,
            py: 0.5,
            bgcolor: '#00A884',
            color: '#111B21',
            borderRadius: '16px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          All
        </Box>
        <Box
          sx={{
            px: 2,
            py: 0.5,
            bgcolor: '#202C33',
            color: '#8696A0',
            borderRadius: '16px',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { bgcolor: '#2A3942' },
          }}
        >
          Unread
        </Box>
        <Box
          sx={{
            px: 2,
            py: 0.5,
            bgcolor: '#202C33',
            color: '#8696A0',
            borderRadius: '16px',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { bgcolor: '#2A3942' },
          }}
        >
          Groups
        </Box>
      </Box>

      {/* Chat List */}
      <List sx={{ py: 0 }}>
        {/* Empty State */}
        <ListItem sx={{ px: 3, py: 4 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#8696A0', 
              textAlign: 'center', 
              width: '100%' 
            }}
          >
            No conversations yet.
            <br />
            Start a new chat to begin messaging.
          </Typography>
        </ListItem>
      </List>
    </Box>
  );
};
