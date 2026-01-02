"use client";

import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Checkbox,
  Chip,
} from "@mui/material";
import { UserProfile } from "@/lib/userService";
import { Friend } from "@/lib/friendService";

interface CreateGroupMembersProps {
  friends: Friend[];
  friendProfiles: Record<string, UserProfile>;
  selectedMembers: string[];
  onToggleMember: (userId: string) => void;
}

export const CreateGroupMembers: React.FC<CreateGroupMembersProps> = ({
  friends,
  friendProfiles,
  selectedMembers,
  onToggleMember,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Selected Members */}
      {selectedMembers.length > 0 && (
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #2A3942" }}>
          <Typography sx={{ color: "#00A884", fontSize: "0.875rem", mb: 1 }}>
            {selectedMembers.length} member{selectedMembers.length > 1 ? "s" : ""} selected
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selectedMembers.map((userId) => {
              const profile = friendProfiles[userId];
              return (
                <Chip
                  key={userId}
                  avatar={
                    <Avatar src={profile?.photoURL} sx={{ width: 24, height: 24 }}>
                      {profile?.displayName?.[0]}
                    </Avatar>
                  }
                  label={profile?.displayName || "Unknown"}
                  onDelete={() => onToggleMember(userId)}
                  size="small"
                  sx={{
                    bgcolor: "#00A884",
                    color: "#111B21",
                    "& .MuiChip-deleteIcon": {
                      color: "#111B21",
                      "&:hover": { color: "#333" },
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Friends List */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {friends.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, px: 3 }}>
            <Typography sx={{ color: "#8696A0", fontSize: "0.9375rem" }}>
              Add friends first to create a group
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {friends.map((friend) => {
              const profile = friendProfiles[friend.odUserId];
              const isSelected = selectedMembers.includes(friend.odUserId);

              return (
                <ListItemButton
                  key={friend.id}
                  onClick={() => onToggleMember(friend.odUserId)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid #222D34",
                    "&:hover": { bgcolor: "#202C33" },
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    sx={{
                      color: "#8696A0",
                      "&.Mui-checked": { color: "#00A884" },
                      mr: 1,
                    }}
                  />
                  <ListItemAvatar>
                    <Avatar
                      src={profile?.photoURL}
                      sx={{ width: 45, height: 45, bgcolor: "#6B7C85" }}
                    >
                      {profile?.displayName?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: "#E9EDEF", fontWeight: 400, fontSize: "1rem" }}>
                        {profile?.displayName || "Unknown User"}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: "#8696A0", fontSize: "0.875rem" }}>
                        {profile?.email}
                      </Typography>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};
