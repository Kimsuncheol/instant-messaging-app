"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import { Chat, subscribeToChats, forwardMessage } from "@/lib/chatService";
import { getUserById, UserProfile } from "@/lib/userService";
import { useAuth } from "@/context/AuthContext";

interface ForwardMessageModalProps {
  open: boolean;
  onClose: () => void;
  messageId: string;
  chatId: string;
  messageText: string;
}

export const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
  open,
  onClose,
  messageId,
  chatId,
  messageText,
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatUsers, setChatUsers] = useState<Record<string, UserProfile>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [forwarding, setForwarding] = useState(false);

  // Subscribe to chats
  useEffect(() => {
    if (!user || !open) return;

    const unsubscribe = subscribeToChats(user.uid, (chatList) => {
      // Exclude current chat
      setChats(chatList.filter((c) => c.id !== chatId));
    });

    return () => unsubscribe();
  }, [user, open, chatId]);

  // Load user profiles
  useEffect(() => {
    if (!user || chats.length === 0) return;

    const loadUsers = async () => {
      const userIds = chats
        .filter((c) => c.type === "private")
        .flatMap((chat) => chat.participants)
        .filter((id) => id !== user.uid);

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

  const getChatDisplayName = (chat: Chat): string => {
    if (chat.type === "group") {
      return chat.groupName || "Unnamed Group";
    }
    const otherUserId = chat.participants.find((p) => p !== user?.uid);
    return otherUserId ? chatUsers[otherUserId]?.displayName || "Unknown" : "Unknown";
  };

  const getChatPhoto = (chat: Chat): string | undefined => {
    if (chat.type === "group") {
      return chat.groupPhotoURL;
    }
    const otherUserId = chat.participants.find((p) => p !== user?.uid);
    return otherUserId ? chatUsers[otherUserId]?.photoURL : undefined;
  };

  const filteredChats = chats.filter((chat) =>
    getChatDisplayName(chat).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleForward = async (destinationChatId: string) => {
    if (!user) return;
    setForwarding(true);
    try {
      await forwardMessage(chatId, messageId, destinationChatId, user.uid);
      onClose();
    } catch (error) {
      console.error("Error forwarding message:", error);
    } finally {
      setForwarding(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#111B21",
          color: "#E9EDEF",
          height: "70vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#202C33",
        }}
      >
        <Typography sx={{ fontWeight: 500 }}>Forward message</Typography>
        <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ p: 2, bgcolor: "#202C33" }}>
        {/* Preview */}
        <Box
          sx={{
            bgcolor: "#005C4B",
            borderRadius: 1,
            p: 1.5,
            mb: 2,
          }}
        >
          <Typography sx={{ color: "#E9EDEF", fontSize: "0.875rem" }}>
            {messageText.length > 100 ? `${messageText.slice(0, 100)}...` : messageText}
          </Typography>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search chats"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#8696A0" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#2A3942",
              borderRadius: "8px",
              "& fieldset": { border: "none" },
              "& input": { color: "#E9EDEF" },
            },
          }}
        />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {forwarding ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#00A884" }} />
          </Box>
        ) : (
          <List>
            {filteredChats.map((chat) => (
              <ListItemButton
                key={chat.id}
                onClick={() => handleForward(chat.id)}
                sx={{
                  py: 1.5,
                  "&:hover": { bgcolor: "#202C33" },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={getChatPhoto(chat)}
                    sx={{
                      bgcolor: chat.type === "group" ? "#00A884" : "#6B7C85",
                    }}
                  >
                    {getChatDisplayName(chat)[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={getChatDisplayName(chat)}
                  primaryTypographyProps={{ color: "#E9EDEF" }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};
