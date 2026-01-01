"use client";

import React, { useEffect, useState } from "react";
import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography,
  TextField,
  InputAdornment
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { Chat, subscribeToChats } from "@/lib/chatService";
import { Timestamp } from "firebase/firestore";
import { getUserById, UserProfile } from "@/lib/userService";

import { useAuth } from "@/context/AuthContext";
import { ActiveStatusBadge } from "@/components/shared/ActiveStatusBadge";
import { subscribeToMultiplePresences, UserPresence } from "@/lib/presenceService";

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatUsers, setChatUsers] = useState<Record<string, UserProfile>>({});
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Subscribe to chats
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToChats(user.uid, (chatList) => {
      setChats(chatList);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Load user profiles for each chat
  useEffect(() => {
    if (!user || chats.length === 0) return;

    const loadUsers = async () => {
      const userIds = chats
        .flatMap(chat => chat.participants)
        .filter(id => id !== user.uid);
      
      const uniqueIds = [...new Set(userIds)];
      const users: Record<string, UserProfile> = {};
      
      await Promise.all(
        uniqueIds.map(async (id) => {
          const userData = await getUserById(id);
          if (userData) users[id] = userData;
        })
      );
      
      setChatUsers(users);
    };
    
    loadUsers();
  }, [chats, user]);

  // Subscribe to presences
  useEffect(() => {
    const userIds = Object.keys(chatUsers);
    if (userIds.length === 0) return;

    return subscribeToMultiplePresences(userIds, setPresences);
  }, [chatUsers]);

  const getOtherUser = (chat: Chat): UserProfile | undefined => {
    if (!user) return undefined;
    const otherUserId = chat.participants.find(p => p !== user.uid);
    return otherUserId ? chatUsers[otherUserId] : undefined;
  };

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };


  const filteredChats = chats.filter(chat => {
    if (!searchTerm.trim()) return true;
    const otherUser = getOtherUser(chat);
    return otherUser?.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           otherUser?.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#111B21" }}>
      {/* Search Bar */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <TextField
          fullWidth
          placeholder="Search or start new chat"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#8696A0", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#202C33",
              borderRadius: "8px",
              "& fieldset": { border: "none" },
              "& input": {
                color: "#E9EDEF",
                fontSize: "0.875rem",
                py: 1,
                "&::placeholder": {
                  color: "#8696A0",
                  opacity: 1,
                },
              },
            },
          }}
        />
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ px: 2, py: 1, display: "flex", gap: 1 }}>
        <Box
          sx={{
            px: 2,
            py: 0.5,
            bgcolor: "#00A884",
            color: "#111B21",
            borderRadius: "16px",
            fontSize: "0.8125rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          All
        </Box>
        <Box
          sx={{
            px: 2,
            py: 0.5,
            bgcolor: "#202C33",
            color: "#8696A0",
            borderRadius: "16px",
            fontSize: "0.8125rem",
            cursor: "pointer",
            "&:hover": { bgcolor: "#2A3942" },
          }}
        >
          Unread
        </Box>
        <Box
          sx={{
            px: 2,
            py: 0.5,
            bgcolor: "#202C33",
            color: "#8696A0",
            borderRadius: "16px",
            fontSize: "0.8125rem",
            cursor: "pointer",
            "&:hover": { bgcolor: "#2A3942" },
          }}
        >
          Groups
        </Box>
      </Box>

      {/* Chat List */}
      <List sx={{ flexGrow: 1, overflowY: "auto", py: 0 }}>
        {filteredChats.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, px: 3 }}>
            <Typography sx={{ color: "#8696A0", fontSize: "0.9375rem" }}>
              No conversations yet.
              <br />
              Start a new chat to begin messaging.
            </Typography>
          </Box>
        ) : (
          filteredChats.map((chat) => {
            const otherUser = getOtherUser(chat);
            const otherUserId = chat.participants.find(p => p !== user?.uid);
            
            return (
              <ListItemButton
                key={chat.id}
                selected={selectedChatId === chat.id}
                onClick={() => onSelectChat(chat.id)}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid #222D34",
                  "&:hover": { bgcolor: "#202C33" },
                  "&.Mui-selected": { 
                    bgcolor: "#2A3942",
                    "&:hover": { bgcolor: "#2A3942" },
                  },
                }}
              >
                <ListItemAvatar>
                  <ActiveStatusBadge presence={otherUserId ? presences[otherUserId] : undefined}>
                    <Avatar
                      src={otherUser?.photoURL}
                      sx={{ width: 50, height: 50, bgcolor: "#6B7C85" }}
                    >
                      {otherUser?.displayName?.[0]}
                    </Avatar>
                  </ActiveStatusBadge>
                </ListItemAvatar>
                <ListItemText
                  sx={{ ml: 1 }}
                  primary={
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ color: "#E9EDEF", fontWeight: 400, fontSize: "1rem" }}>
                        {otherUser?.displayName || "Unknown User"}
                      </Typography>
                      <Typography sx={{ color: "#8696A0", fontSize: "0.75rem" }}>
                        {formatTime(chat.lastMessageAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      sx={{
                        color: "#8696A0",
                        fontSize: "0.875rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chat.lastMessage || "No messages yet"}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })
        )}
      </List>
    </Box>
  );
};
