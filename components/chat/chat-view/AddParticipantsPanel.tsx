"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Button,
  CircularProgress,
  InputBase,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { getFriends, Friend } from "@/lib/friendService";
import { getUserById } from "@/lib/userService";
import { useAuth } from "@/context/AuthContext";

interface FriendProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
}

interface AddParticipantsPanelProps {
  currentParticipantIds: string[];
  onAdd: (userIds: string[]) => Promise<void>;
  onClose: () => void;
}

export const AddParticipantsPanel: React.FC<AddParticipantsPanelProps> = ({
  currentParticipantIds,
  onAdd,
  onClose,
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<FriendProfile[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadFriends = async () => {
      setLoading(true);
      try {
        const friendsList = await getFriends(user.uid);
        // Filter out friends who are already participants
        const availableFriends = friendsList.filter(
          (friend) => !currentParticipantIds.includes(friend.odUserId)
        );
        setFriends(availableFriends);

        // Load friend profiles
        const profiles = await Promise.all(
          availableFriends.map(async (friend) => {
            const profile = await getUserById(friend.odUserId);
            return {
              uid: friend.odUserId,
              displayName: profile?.displayName,
              photoURL: profile?.photoURL,
            };
          })
        );
        setFriendProfiles(profiles);
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [user, currentParticipantIds]);

  const handleToggle = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAdd = async () => {
    if (selectedUserIds.length === 0) return;

    setAdding(true);
    try {
      await onAdd(selectedUserIds);
      onClose();
    } catch (error) {
      console.error("Error adding participants:", error);
      alert(
        error instanceof Error ? error.message : "Failed to add participants"
      );
    } finally {
      setAdding(false);
    }
  };

  const filteredFriends = friendProfiles.filter((profile) =>
    profile.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#111B21",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          bgcolor: "#202C33",
          borderBottom: "1px solid #2A3942",
        }}
      >
        <IconButton onClick={onClose} sx={{ color: "#AEBAC1", mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            color: "#E9EDEF",
            fontWeight: 500,
            fontSize: "1.125rem",
            flex: 1,
          }}
        >
          Add Participants
        </Typography>
        {selectedUserIds.length > 0 && (
          <Typography sx={{ color: "#00A884", fontSize: "0.875rem" }}>
            {selectedUserIds.length} selected
          </Typography>
        )}
      </Box>

      {/* Search Bar */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Box
          sx={{
            bgcolor: "#202C33",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            px: 2,
            height: 35,
          }}
        >
          <SearchIcon sx={{ color: "#AEBAC1", fontSize: 20, mr: 2 }} />
          <InputBase
            placeholder="Search friends"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{
              color: "#E9EDEF",
              fontSize: "0.9375rem",
              "& ::placeholder": { color: "#8696A0", opacity: 1 },
            }}
          />
          {searchQuery && (
            <IconButton
              size="small"
              onClick={() => setSearchQuery("")}
              sx={{ color: "#AEBAC1", p: 0.5 }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Friends List */}
      <Box sx={{ flex: 1, overflow: "auto", py: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} sx={{ color: "#00A884" }} />
          </Box>
        ) : filteredFriends.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" sx={{ color: "#8696A0" }}>
              {friends.length === 0
                ? "No friends available to add"
                : "No friends found"}
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {filteredFriends.map((profile) => (
              <ListItem
                key={profile.uid}
                onClick={() => handleToggle(profile.uid)}
                sx={{
                  cursor: "pointer",
                  px: 2,
                  py: 1,
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                <Checkbox
                  checked={selectedUserIds.includes(profile.uid)}
                  sx={{
                    color: "#8696A0",
                    "&.Mui-checked": {
                      color: "#00A884",
                    },
                  }}
                />
                <ListItemAvatar>
                  <Avatar
                    src={profile.photoURL}
                    sx={{ width: 45, height: 45, bgcolor: "#6B7C85" }}
                  >
                    {profile.displayName?.[0] || "U"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{ color: "#E9EDEF" }}>
                      {profile.displayName}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Add Button */}
      <Box sx={{ p: 2, borderTop: "1px solid #2A3942" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleAdd}
          disabled={adding || selectedUserIds.length === 0}
          sx={{
            bgcolor: "#00A884",
            color: "#111B21",
            fontWeight: 600,
            py: 1.5,
            "&:hover": { bgcolor: "#00997A" },
            "&:disabled": { bgcolor: "#2A3942", color: "#8696A0" },
          }}
        >
          {adding
            ? "Adding..."
            : `Add ${
                selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ""
              }`}
        </Button>
      </Box>
    </Box>
  );
};
