"use client";

import React from "react";
import { 
  Box, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  CircularProgress, 
  Typography, 
  Button 
} from "@mui/material";
import { UserProfile } from "@/lib/userService";

interface NewChatResultsProps {
  loading: boolean;
  users: UserProfile[];
  searchTerm: string;
  onSelectUser: (userId: string) => void;
}

export const NewChatResults: React.FC<NewChatResultsProps> = ({ 
  loading, 
  users, 
  searchTerm, 
  onSelectUser 
}) => {
  return (
    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={24} />
        </Box>
      ) : users.length > 0 ? (
        <List>
          {users.map((user) => (
            <ListItem 
              key={user.uid} 
              component={Button}
              onClick={() => onSelectUser(user.uid)}
              sx={{ 
                borderRadius: '12px', 
                mb: 1, 
                textAlign: 'left',
                textTransform: 'none',
                justifyContent: 'flex-start',
                color: 'text.primary',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
              }}
            >
              <ListItemAvatar>
                <Avatar src={user.photoURL}>{user.displayName[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={user.displayName} 
                secondary={user.email} 
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          ))}
        </List>
      ) : searchTerm.length >= 3 ? (
        <Typography variant="body2" color="text.secondary" align="center" py={4}>
          No users found.
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" py={4}>
          Type at least 3 characters to search.
        </Typography>
      )}
    </Box>
  );
};
