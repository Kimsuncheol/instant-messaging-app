"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, Box, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import Fuse from "fuse.js";
import { UserProfile, searchUsers, getUserById } from "@/lib/userService";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  subscribeToFriends,
  subscribeToFriendRequests,
  subscribeToSentRequests,
  Friend,
  FriendRequest,
} from "@/lib/friendService";
import { useAuth } from "@/context/AuthContext";
import { AddFriendSearch } from "./add-friend/AddFriendSearch";
import { AddFriendResults } from "./add-friend/AddFriendResults";
import { FriendRequestList } from "./add-friend/FriendRequestList";

interface AddFriendModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  open,
  onClose,
}) => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [requestUsers, setRequestUsers] = useState<Record<string, UserProfile>>({});

  // Subscribe to friends list
  useEffect(() => {
    if (!currentUser) return;
    return subscribeToFriends(currentUser.uid, setFriends);
  }, [currentUser]);

  // Subscribe to incoming friend requests
  useEffect(() => {
    if (!currentUser) return;
    return subscribeToFriendRequests(currentUser.uid, setFriendRequests);
  }, [currentUser]);

  // Subscribe to sent friend requests
  useEffect(() => {
    if (!currentUser) return;
    return subscribeToSentRequests(currentUser.uid, setSentRequests);
  }, [currentUser]);

  // Load user profiles for friend requests
  useEffect(() => {
    const loadRequestUsers = async () => {
      const userIds = friendRequests.map((r) => r.fromUserId);
      const uniqueIds = [...new Set(userIds)];
      const usersMap: Record<string, UserProfile> = {};

      await Promise.all(
        uniqueIds.map(async (id) => {
          const userData = await getUserById(id);
          if (userData) usersMap[id] = userData;
        })
      );

      setRequestUsers(usersMap);
    };

    if (friendRequests.length > 0) {
      loadRequestUsers();
    }
  }, [friendRequests]);

  // Search users with debounce
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 3) {
      setUsers([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchUsers(searchTerm);
        setUsers(results.filter((u) => u.uid !== currentUser?.uid));
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentUser]);

  const handleSendRequest = async (userId: string) => {
    if (!currentUser) return;
    try {
      await sendFriendRequest(currentUser.uid, userId);
    } catch (error) {
      console.error("Error sending friend request", error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error("Error accepting friend request", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      console.error("Error rejecting friend request", error);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setUsers([]);
    onClose();
  };

  const friendIds = friends.map((f) => f.odUserId);
  const pendingRequestIds = sentRequests.map((r) => r.toUserId);

  // Fuse.js fuzzy search configuration
  const fuse = useMemo(() => {
    return new Fuse(users, {
      keys: ['displayName', 'email'],
      threshold: 0.4, // 0 = exact match, 1 = match anything
      includeScore: true,
      ignoreLocation: true, // Search entire string
      minMatchCharLength: 2,
    });
  }, [users]);

  // Apply fuzzy search filtering
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim() || users.length === 0) {
      return users;
    }
    const results = fuse.search(searchTerm);
    return results.map(result => result.item);
  }, [fuse, searchTerm, users]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#111B21",
          color: "#E9EDEF",
          height: "80vh",
          maxHeight: "600px",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          bgcolor: "#202C33",
          borderBottom: "1px solid #2A3942",
        }}
      >
        <Box sx={{ fontSize: "1.25rem", fontWeight: 500 }}>
          Add Friend
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#AEBAC1" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        <AddFriendSearch value={searchTerm} onChange={setSearchTerm} />
        <FriendRequestList
          requests={friendRequests}
          users={requestUsers}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
        <AddFriendResults
          loading={loading}
          users={filteredUsers}
          searchTerm={searchTerm}
          friendIds={friendIds}
          pendingRequestIds={pendingRequestIds}
          onSendRequest={handleSendRequest}
        />
      </DialogContent>
    </Dialog>
  );
};
