"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Avatar,
  Typography,
  IconButton,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Chat as ChatIcon,
  Block as BlockIcon,
  PersonRemove as RemoveIcon,
  PersonAdd as AddIcon,
} from "@mui/icons-material";
import { UserProfile, getUserById } from "@/lib/userService";
import {
  blockUser,
  unblockUser,
  isBlocked,
  removeFriend,
  getFriendshipByUsers,
  areFriends,
} from "@/lib/friendService";
import { createPrivateChat } from "@/lib/chatService";
import { useAuth } from "@/context/AuthContext";
import { useChatStore } from "@/store/chatStore";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  open,
  onClose,
  userId,
}) => {
  const { user } = useAuth();
  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId || !user) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const [userData, blockedStatus, friendStatus, friendship] = await Promise.all([
          getUserById(userId),
          isBlocked(user.uid, userId),
          areFriends(user.uid, userId),
          getFriendshipByUsers(user.uid, userId),
        ]);
        setProfile(userData);
        setBlocked(blockedStatus);
        setIsFriend(friendStatus);
        setFriendshipId(friendship?.id || null);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [open, userId, user]);

  const handleStartChat = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const chatId = await createPrivateChat(user.uid, userId);
      setSelectedChatId(chatId);
      onClose();
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (blocked) {
        await unblockUser(user.uid, userId);
        setBlocked(false);
      } else {
        await blockUser(user.uid, userId);
        setBlocked(true);
      }
    } catch (error) {
      console.error("Error toggling block:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendshipId) return;
    setActionLoading(true);
    try {
      await removeFriend(friendshipId);
      setIsFriend(false);
      setFriendshipId(null);
    } catch (error) {
      console.error("Error removing friend:", error);
    } finally {
      setActionLoading(false);
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
          borderRadius: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 1,
        }}
      >
        <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#00A884" }} />
          </Box>
        ) : (
          <Box sx={{ textAlign: "center" }}>
            <Avatar
              src={profile?.photoURL}
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                mb: 2,
                bgcolor: "#00A884",
                fontSize: "3rem",
              }}
            >
              {profile?.displayName?.[0]}
            </Avatar>

            <Typography variant="h5" sx={{ color: "#E9EDEF", fontWeight: 500 }}>
              {profile?.displayName || "Unknown User"}
            </Typography>

            <Typography sx={{ color: "#8696A0", fontSize: "0.875rem", mt: 0.5 }}>
              {profile?.email}
            </Typography>

            <Divider sx={{ my: 3, bgcolor: "#2A3942" }} />

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              {!blocked && (
                <Button
                  variant="contained"
                  startIcon={<ChatIcon />}
                  onClick={handleStartChat}
                  disabled={actionLoading}
                  sx={{
                    bgcolor: "#00A884",
                    "&:hover": { bgcolor: "#008f70" },
                  }}
                >
                  Message
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={blocked ? <AddIcon /> : <BlockIcon />}
                onClick={handleBlock}
                disabled={actionLoading}
                sx={{
                  color: blocked ? "#00A884" : "#F15C6D",
                  borderColor: blocked ? "#00A884" : "#F15C6D",
                  "&:hover": {
                    borderColor: blocked ? "#008f70" : "#d14a5a",
                    bgcolor: "transparent",
                  },
                }}
              >
                {blocked ? "Unblock" : "Block"}
              </Button>

              {isFriend && (
                <Button
                  variant="outlined"
                  startIcon={<RemoveIcon />}
                  onClick={handleRemoveFriend}
                  disabled={actionLoading}
                  sx={{
                    color: "#F15C6D",
                    borderColor: "#F15C6D",
                    "&:hover": {
                      borderColor: "#d14a5a",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  Remove
                </Button>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
