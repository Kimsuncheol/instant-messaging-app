"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Box,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { getFriends, Friend } from "@/lib/friendService";
import { getUserById } from "@/lib/userService";
import { useAuth } from "@/context/AuthContext";

interface AddParticipantsModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (userIds: string[]) => Promise<void>;
  currentParticipantIds: string[];
}

export const AddParticipantsModal: React.FC<AddParticipantsModalProps> = ({
  open,
  onClose,
  onAdd,
  currentParticipantIds,
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<Array<{ uid: string; displayName?: string; photoURL?: string }>>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!open || !user) return;

    const loadFriends = async () => {
      setLoading(true);
      try {
        const friendsList = await getFriends(user.uid);
        // Filter out friends who are already participants
        const availableFriends = friendsList.filter(
          (friend) => !currentParticipantIds.includes(friend.uid)
        );
        setFriends(availableFriends);
        
        // Load friend profiles
        const profiles = await Promise.all(
          availableFriends.map(async (friend) => {
            const profile = await getUserById(friend.uid);
            return {
              uid: friend.uid,
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
    setSelectedUserIds([]);
    setSearchQuery("");
  }, [open, user, currentParticipantIds]);

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
      alert(error instanceof Error ? error.message : "Failed to add participants");
    } finally {
      setAdding(false);
    }
  };

  const filteredFriends = friendProfiles.filter((profile) =>
    profile.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={() => !adding && onClose()}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#202C33",
          color: "#E9EDEF",
        },
      }}
    >
      <DialogTitle sx={{ color: "#E9EDEF" }}>Add Participants</DialogTitle>
      <DialogContent>
        {/* Search Field */}
        <TextField
          fullWidth
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiInputBase-root": {
              bgcolor: "#2A3942",
              color: "#E9EDEF",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2A3942",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#8696A0" }} />
              </InputAdornment>
            ),
          }}
        />

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
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {filteredFriends.map((profile) => (
              <ListItem
                key={profile.uid}
                onClick={() => handleToggle(profile.uid)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 1,
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
                    sx={{ width: 40, height: 40, bgcolor: "#6B7C85" }}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={adding} sx={{ color: "#8696A0" }}>
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          disabled={adding || selectedUserIds.length === 0}
          sx={{
            color: "#00A884",
            "&:disabled": {
              color: "#8696A0",
            },
          }}
        >
          {adding
            ? "Adding..."
            : `Add ${selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
