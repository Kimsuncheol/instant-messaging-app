"use client";

import React, { useEffect, useState } from "react";
import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  CircularProgress, 
  Typography 
} from "@mui/material";
import { UserProfile } from "@/lib/userService";
import { ActiveStatusBadge } from "@/components/shared/ActiveStatusBadge";
import { subscribeToMultiplePresences, UserPresence } from "@/lib/presenceService";

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
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});

  useEffect(() => {
    if (users.length === 0) {
      setPresences({});
      return;
    }

    const userIds = users.map(u => u.uid);
    return subscribeToMultiplePresences(userIds, (newPresences) => {
      setPresences(newPresences);
    });
  }, [users]);

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#111B21' }}>
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={28} sx={{ color: '#00A884' }} />
        </Box>
      ) : users.length > 0 ? (
        <List sx={{ py: 0 }}>
          {users.map((user) => (
            <ListItemButton
              key={user.uid}
              onClick={() => onSelectUser(user.uid)}
              sx={{ 
                px: 3,
                py: 1.5,
                '&:hover': { 
                  bgcolor: '#202C33',
                },
              }}
            >
              <ListItemAvatar>
                <ActiveStatusBadge presence={presences[user.uid]}>
                  <Avatar 
                    src={user.photoURL}
                    sx={{ 
                      width: 50, 
                      height: 50,
                      bgcolor: '#6B7C85',
                    }}
                  >
                    {user.displayName[0]}
                  </Avatar>
                </ActiveStatusBadge>
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Typography 
                    sx={{ 
                      color: '#E9EDEF',
                      fontWeight: 400,
                      fontSize: '1rem',
                    }}
                  >
                    {user.displayName}
                  </Typography>
                }
                secondary={
                  <Typography 
                    sx={{ 
                      color: '#8696A0',
                      fontSize: '0.8125rem',
                    }}
                  >
                    {user.email}
                  </Typography>
                }
                sx={{ ml: 1 }}
              />
            </ListItemButton>
          ))}
        </List>
      ) : searchTerm.length >= 3 ? (
        <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
          <Typography sx={{ color: '#8696A0', fontSize: '0.9375rem' }}>
            No contacts found
          </Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
          <Typography sx={{ color: '#8696A0', fontSize: '0.9375rem' }}>
            Type at least 3 characters to search
          </Typography>
        </Box>
      )}
    </Box>
  );
};
